import numpy as np
import cv2
from keras.models import load_model
from keras import backend as K
import os
# noinspection PyUnresolvedReferences
from cnn import train

def result(x):
    K.clear_session()
    model = load_model(os.path.abspath(os.path.dirname(__file__)) + '\\mnist_model.h5')  # モデルのロード
    x = np.expand_dims(x, axis=0)  # 配列xの中で、axisで指定した位置を軸として次元を増やす？？？
    x = x.reshape(x.shape[0], 28, 28, 1)  # 画像をreshapeする？
    # 予測値を格納する
    acc = model.predict(x)[0]   # 各数字のaccuracyを受け取る
    acc = acc * 100 # %表示にするために100倍する。
    #print(acc)  #確認
    ans = np.argmax(acc)    # 回答とする数字
    return acc, int(ans)