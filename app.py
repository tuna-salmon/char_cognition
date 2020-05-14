from datetime import datetime
import cv2
import re
import base64

from PIL import Image
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
# noinspection PyUnresolvedReferences
from cnn import predict

app = Flask(__name__)  # 初期化
CORS(app)  # 初期化


@app.route('/', methods=['GET', 'POST'])  # 最初の画面(app.jsと同時並行)
def index():
    """
    ブラウザとのやり取り
    :return: methods==POST: 出力結果
    :return: methods==GET: 最初に表示するページ
    """
    if request.method == 'POST':  # 形式がPOSTだった場合(認識ボタンを押した時)
        acc, ans = get_answer(request)  # 送信された情報を渡し、出力結果を返す。
        acc = acc.tolist()  # ndarrayをtolist()でpythonのリストに変換
        print(['{:.2f}'.format(n) for n in acc])    # accの表示形式を、小数点以下2桁にする
        return jsonify({'acc': ['{:.2f}'.format(n) for n in acc], 'ans': ans})  # 出力結果をjsonファイルに変換して返す。{キー:値}
    else:  # 形式がGETだった場合(実行したら最初に1度だけ通る)
        return render_template('index.html')  # ページを表示する。


def get_answer(req):
    # データの取得
    img_str = re.search(r'base64,(.*)', req.form['img']).group(1)  # 画像データを1つ取得する(画像の画素値がbase64のエンコード方式で表されている状態)
    # データの変換
    nparr = np.fromstring(base64.b64decode(img_str), np.uint8)  # img_strをデコードしてバイナリデータにしたものがstringなので符号なしのintに変換する
    img_src = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # 圧縮された画像を復元する(8ビットint型の画像データ, ファイルのカラータイプ)
    img_gray = cv2.cvtColor(img_src, cv2.COLOR_BGR2GRAY)  # グレースケール変換 ※ここまで画像のサイズはcanvasのサイズと同じ420×420
    img_resize = cv2.resize(img_gray, (20, 20))  # 画像のリサイズ。(画像データ, (縦×横))
    # 重心を求めてその座標を中心とし28×28の画像にして食わせる。 #
    # 重心の座標の計算
    mu = cv2.moments(img_resize, False)
    x, y = int(mu["m10"] / mu["m00"]), int(mu["m01"] / mu["m00"])
    print(x, y)
    # 移動とサイズ変更
    im2 = cv2.warpAffine(img_resize, np.float32([[1, 0, 14-x], [0, 1, 14-y]]), (28, 28))  # 画像を動かす(file名, 動かす距離, im2のサイズ)
    # 画像からモデルを使って予測し、結果を格納する
    acc, ans = predict.result(im2)  # 予測結果を格納
    # 画像を書き出す
    cv2.imwrite(f"images/{datetime.now().strftime('%H-%M-%S')}_{ans}.jpg", im2)  # 画像を書き出す = ファイルの作成(ファイル名, 画像データ)
    return acc, ans


if __name__ == "__main__":
    app.run(port=8080, debug=True, threaded=True)  # flaskを実行する