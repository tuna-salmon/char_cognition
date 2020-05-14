var can;/*canvasオブジェクト*/
var ct;/*canvasに描画するオブジェクト*/
var ox = 0, oy = 0, x = 0, y = 0;
var mf = false;/*操作が開始されたらTrue*/
var rows=[];/*結果の表の行*/
var cells;/*結果の表のセル*/
var table = document.createElement('table');/*表の作成*/

function mam_draw_init() {/*初期化処理*/
    can = document.getElementById("can");/*引数で指定したidから要素を取得する。*/
    console.log(can, "canの中身");       /*canの中身は<canvas id="can" width="280px" height="280px">がまんま入っている*/
    /*****↓マウス用↓***********/
    can.addEventListener("mousedown", onMouseDown, false);
    can.addEventListener("mousemove", onMouseMove, false);
    can.addEventListener("mouseup", onMouseUp, false);
    /*****↑マウス用↑***********/
    ct = can.getContext("2d");/*描画機能を有効にする*/
    ct.strokeStyle = "#FFFFFF";/*描画する線の色*/
    ct.lineWidth = 20;/*線の幅*/
    ct.lineJoin = "round";/*連続する線のつなぎ目*/
    ct.lineCap = "round";/*線の端*/
    createTable();/*行目へ*/
    clearCan();/*↓69行目へ*/
}
function createTable() {/*表を作る*/
    var count=0;
    var cellid=0;
    rows.push(table.insertRow(-1));/*行を1つ追加*/
    cells = rows[0].insertCell(-1);/*[0]の行にセルを追加*/
    cells.appendChild(document.createTextNode('数字'));/*セルに子ノードを追加*/
    cells = rows[0].insertCell(-1);/*セルを追加*/
    cells.appendChild(document.createTextNode('精度'));
    cells = rows[0].insertCell(-1);/*セルを追加*/
    cells.appendChild(document.createTextNode('数字'));
    cells = rows[0].insertCell(-1);/*セルを追加*/
    cells.appendChild(document.createTextNode('精度'));
    for(i=1; i<6; i++){
        rows.push(table.insertRow(-1));/*1行追加*/
        for(j=0; j<4; j++) {
            if(j%2 == 0) {
                cells = rows[i].insertCell(-1);/*セルを追加*/
                cells.appendChild(document.createTextNode(count));
                count = count+1;
            }
            else{
                cells = rows[i].insertCell(-1);
                cells.id = cellid;
                cellid = cellid + 1;
            }
        }
    document.getElementById("table").appendChild(table);
    }
}
function onMouseDown(event) {
    ox = event.clientX - event.target.getBoundingClientRect().left;
    oy = event.clientY - event.target.getBoundingClientRect().top;
    mf = true;
}
function onMouseMove(event) {
    if (mf) {
        x = event.clientX - event.target.getBoundingClientRect().left;
        y = event.clientY - event.target.getBoundingClientRect().top;
        drawLine();
        ox = x;
        oy = y;
    }
}
function onMouseUp(event) {
    mf = false;
}
function drawLine() {/*直線を描画する関数(調べたら出てきたテンプレのまんま)*/
    ct.beginPath();/*現在のパスをリセットする*/
    ct.moveTo(ox, oy);/*パスの開始座標を指定する*/
    ct.lineTo(x, y);/*座標を指定してラインを引く*/
    ct.stroke();/*現在のパスを輪郭表示する*/
}
function clearCan() {/*キャンバスを初期化する関数*/
    ct.fillStyle = "rgb(0, 0, 0)";/*黒で塗りつぶし*/
    ct.fillRect(0, 0, can.getBoundingClientRect().width, can.getBoundingClientRect().height);/*塗りつぶしの四角形を描画*/
}

function sendImage() {/*canvasの画像を取得してリクエストオブジェクトに送る。*/
    var img = document.getElementById("can").toDataURL('image/png');/*キャンバスの画像のURLを格納*/
    img = img.replace('image/png', 'image/octet-stream');/*引数で指定したものを置換する(置き換えたい正規表現オブジェクト, 置換する文字)*/
    $.ajax({/*ajaxによってapp.pyと同時並行できる*/
        type: "POST",/*通信方式*/
        url: "http://localhost:8080",/*リクエストを送信する先のURL*/
        data: {/*サーバーに送信する値。GETリクエストとして付加される*/
            "img": img/*キー: 値(画像のURL)がセットでリクエストオブジェクトに送信される。*/
        }
    })
    /*ajaxリクエストが成功したとき発動する*/
    .done( (data) => {
        var count = 0;/*各数字*/
        for(i=1; i<6; i++){/*行数*/
            for(j=0; j<4; j++) {/*列数*/
                if(j%2 != 0) {/*奇数列は教師ラベルなので、偶数列に受け取った精度を表示する*/
                    var accid = document.getElementById(count);/*数字に対応する精度が入るセルのIDの要素*/
                    table.rows[i].cells[j] = document.createTextNode($(accid).html(data['acc'][count]+'%'));/*i行j列目のセルにaccuracyを入れる*/
                    count = count + 1;/*次の教師ラベルの数字*/
                }
            }
        }
        $('#answer').html('答えは<span class="answer">'+data['ans']+'</span>です')/*app.pyがリクエスト(画像データ)を受け取り結果を予測してansに返しているからそれを受け取って表示*/
    });
}