// forked from nozikaba's "徐々に大きくなる円" http://jsdo.it/nozikaba/z5yO



//描画とか判定とか
onload = function() {
    var canvas = document.getElementById('world');
    var ctx = canvas.getContext('2d');
    var circles = new Circles();
    var squares = new Squares();
    var player = new Player();
    var playTimer = new Timer(0);
    var items = new Items(player, playTimer);
    var timers = [undefined, undefined, undefined]; //タイマー
    //連鎖表示の更新
    circles.chainUpdate = function(chain) {
        $('#chain').text("chain:" + chain);
        var mc = document.getElementById('maxchain');
        if (mc.getAttribute('data-maxchain') < chain) {
            mc.setAttribute('data-maxchain', chain);
        }
    };
    //連鎖開始
    player.startChain = function(x, y) { circles.add(x, y); };
    //連鎖終了
    circles.endChain = function(chain) { player.endChain(chain); };
    //残機がなくなることによるゲームオーバー
    player.gameOver = function() {
        stopTimer();
        playTimer.stop();
        disablePause();
        $('#result-chain').text("最大連鎖:" + $('#maxchain').attr('data-maxchain'));
        $('#result-score').text("スコア:" + player.score);
        $('#result').show();
    };
    //時間切れによるゲームオーバー
    playTimer.timeup = player.gameOver;
    //■を打ち出す
    var enemy = function() {
        //時間が増えるアイテムをドロップする敵
        squares.add(0, 130, 10, 1, 0, "#ff0000", 'time');
        //得点が増えるアイテムをドロップする敵
        squares.add(130, 0, 10, 0, 1, "#00ff00", 'score');
        //ただの敵
        squares.add(400, 270, 10, -1, 0, "#0000ff", undefined);
    };
    //衝突判定はここに書く
    var collisionDetect = function() {
        //■と円
        for (var i in circles.collection) {
            var c = circles.collection[i];
            for (var j in squares.collection) {
                var s = squares.collection[j];
                if (((c.x - s.x) * (c.x - s.x) + (c.y - s.y) * (c.y - s.y)) <= (c.r + s.r) * (c.r + s.r)) {
                   // var dropItem = s.bomb(player);
                    squares.remove(j);
                    circles.add(s.x, s.y);
                    if (s.itemType) {
                        items.add(s.x, s.y, 10, s.dx * 0.1, s.dy * 0.1, s.color, s.itemType);
                    }
                    player.addScore(false, circles.chain); //得点
                }
            }
        }
        //■とプレイヤー
        for (var i in squares.collection) {
            var s = squares.collection[i];
            var x = player.x - s.x;
            var y = player.y - s.y;
            var r = player.enemyRadius + s.r;
            if (!player.isDead && ((x * x + y * y) <= r * r)) {
                player.killed();
                break;
            }
        }
        //プレイヤーとアイテム
        for (var i in items.collection) {
            var s = items.collection[i];
            var x = player.x - s.x;
            var y = player.y - s.y;
            var r = player.itemRadius + s.r;
            if (!player.isDead && ((x * x + y * y) <= r * r * 1.2)) {
                s.touch();
                items.remove(i);
            }
        }
    };
    //プログラムのメインはここ
    var main = function() {
        //Canvasのクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //描画
        circles.draw(ctx);
        squares.draw(ctx);
        items.draw(ctx);
        player.draw(ctx);
        //衝突判定
        collisionDetect();
        //次フレームの計算
        circles.nextFrame();
        squares.nextFrame(canvas);
        items.nextFrame(canvas);
        player.nextFrame(canvas)
        //チェーンの計算
        circles.chainCalc();
        //デバッグ用表示
        $('#squares').text("squares:" + squares);
        $('#circles').text("circles:" + circles);
        $('#player').text("player:" + player);
        $('#timer').text("time remain:" + playTimer);
    };
    //タイマーの設定はここ
    function startTimer(){
        var functions = [
            main,
            enemy,
            function(){ player.countupScore(); }
        ]; //呼び出す関数
        var intervals = [1000 / 60, 1500, 5]; //呼び出し間隔
        for (i = 0; i < 3; i++) {
            if (!timers[i]) {
                timers[i] = setInterval(functions[i], intervals[i]);
            }
        }
        $("#pause").hide();
    }
    //タイマーの停止
    function stopTimer() {
        for(var i in timers) {
            clearInterval(timers[i]);
            timers[i] = undefined;
        }
    }
    //初期化
    function init() {
        circles.init();
        squares.init();
        player.init();
        items.init();
        playTimer.reset(180);
        $('#maxchain').attr('data-maxchain', 0);
    }
    //ポーズを有効にする
    function enablePause() {
        //画面からフォーカスが外れた時。
        //タイマーを解除しポーズ画面を表示。移動方向もリセット
        $(window).blur(function() {
            stopTimer();
            playTimer.stop();
            $('#pause').show();
            player.resetDirection();
        });
        //画面にフォーカスたあたった時。
        $(window).focus(function() {
            startTimer();
            playTimer.start();
        });
    }
    //ポーズを無効にする
    function disablePause() {
        $(window).unbind('blur').unbind('focus');
    }
    //スタート画面をクリック
    $('#start').mousedown(function() {
        $(this).hide();
        init();
        startTimer();
        playTimer.start();
        enablePause();
    });
    //結果画面をクリック
    $('#result').mousedown(function() {
        $(this).hide();
        $('#start').show();
    });
    //キーボード関連の処理
    $(window).keydown(function(e) {
        console.log("keydown: " + e.keyCode);
        switch (e.keyCode){
        case 87:
        case 37:
        case 100:
            //左方向
            player.changeDirection(1<<0, true);
            break;
        case 68:
        case 38:
        case 104:
            //上方向
            player.changeDirection(1<<1, true);
            break;
        case 65:
        case 39:
        case 102:
            //右方向
            player.changeDirection(1<<2, true);
            break;
        case 83:
        case 40:
        case 98:
            //下方向
            player.changeDirection(1<<3, true);
            break;
        default:
            break;
        }
    }).keyup(function(e) {
        console.log("keyup: " + e.keyCode);
        switch(e.keyCode) {
        case 74:
        case 32:
        case 96:
            //自爆
            player.bomb();
            break;
        case 87:
        case 37:
        case 100:
            //左方向
            player.changeDirection(1<<0, false);
            break;
        case 68:
        case 38:
        case 104:
            //上方向
            player.changeDirection(1<<1, false);
            break;
        case 65:
        case 39:
        case 102:
            //右方向
            player.changeDirection(1<<2, false);
            break;
        case 83:
        case 40:
        case 98:
            //下方向
            player.changeDirection(1<<3, false);
            break;
        default:
            break;
        }
    });
    $(".page").hide();
    $('#start').show();
};
