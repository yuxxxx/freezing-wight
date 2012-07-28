// forked from nozikaba's "徐々に大きくなる円" http://jsdo.it/nozikaba/z5yO
//コレクションのクラス。CirclesとSquaresの親クラスになる予定
var Collection = function() {
    this.add = function(member) {
        this.collection.unshift(member);
    };
    //次フレームの計算
    this.nextFrame = function(canvas) {
        for (var i in this.collection) {
            var c = this.collection[i];
            c.move();
            if (c.isRemove(canvas)) {
                this.collection.splice(i, 1);
            }
        }
    };
    //描画
    this.draw = function(ctx) {
        for (var i in this.collection) {
            var c = this.collection[i];
            c.draw(ctx);
        }
    };
};
//円のクラス
var Circle = function(x, y, max, color) {
    this.dd = 2; //円の変化量増分
    this.x = x;
    this.y = y;
    this.r = 0;
    this.d = 0; //角度(大きくなったり小さくなったりに三角関数を使っているので)
    this.max = max; //最大半径
    this.color = color;
    //移動する(大きくなったり小さくなったりする)
    this.move = function() {
        this.d = this.d + this.dd;
        this.r = (this.max * Math.sin(this.d * Math.PI / 180));
    };
    //削除するかの判定
    this.isRemove = function(canvas) {
        return this.d >= 180;
    };
    this.toString = function() {
        return "x:" + this.x + " y:" + this.y + " r:" + this.r;
    };
    this.draw = function(ctx) {
    var exStroke  = ctx.strokeStyle;
    var exFill = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.fill();
        ctx.strokeStyle = exStroke;
        ctx.fillStyle = exFill;
    };
};
//円を管理するクラス
var Circles = function() {
    this.prototype = new Collection();
    this.collection = [];
    this.chain = -1; //連鎖数
    //初期化
    this.init = function() {
        this.collection = [];
        this.chain = -1;
    };
    //連鎖数の更新イベント
    this.chainUpdate = function(chain) { };
    //連鎖数を1増やす
    this.addChain = function() {
        this.chain = this.chain + 1;
        this.chainUpdate(this.chain);
    };
    //円の追加
    this.add = function(x,y) {
        this.collection.unshift(new Circle(x, y, 60, "rgba(256, 256, 256, 0.5)"));
        this.addChain();
    };
    this.draw = this.prototype.draw;
    this.nextFrame = this.prototype.nextFrame;
    
    //連鎖数の計算
    this.chainCalc = function() {
        //連鎖数リセット
        if (this.collection.length == 0) {
            if (this.chain >= 0) {
                this.endChain(this.chain);
            }
            this.chain = -1;
            this.chainUpdate(this.chain);
        }   
    };
    this.toString = function() {
        var str = this.collection.length.toString();
        for (var i in this.collection) {
            var c = this.collection[i];
            str = str + " / " + c.toString();
        }
        return str;
    };
};
//正方形のクラス(長方形にするなら変数かえるけどさ…)
var Square = function(x, y, width, dx, dy, color, item) {
    this.cx = x;//左上角の座標
    this.cy = y;
    this.width = width;
    this.color = color;
    this.x = x + width / 2;//こっちは中心の座標
    this.y = y + width / 2;
    this.r = width * 0.5;
    this.dx = dx;
    this.dy = dy;
    this.itemType = item;
    //移動
    this.move = function() {
        this.cx = this.cx + this.dx;
        this.cy = this.cy + this.dy;
        this.x = this.cx + this.width / 2;
        this.y = this.cy + this.width / 2;
    };
    //描画
    this.draw = function(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.cx, this.cy, this.width, this.width);
    };
    //削除するかの判定
    this.isRemove = function(canvas) {
        var margin = -20;
        return this.y > canvas.height - margin || this.x > canvas.width - margin || this.x < margin || this.y < margin
    };
    this.toString = function() {
        return "x:" + this.x + " y:" + this.y;
    };
};
//四角を管理するクラス
var Squares = function() {
    this.prototype = new Collection();
    this.collection = [];
    this.movingTables = [];
    //要素の追加
    this.add = function(x, y, w, dx, dy, c, i) {
        this.collection.unshift(new Square(x, y, w, dx, dy, c, i));
    };
    //次に動く位置をあらかじめ計算する
    this.addMovingTable = function(points) {
        var beats = points.map(function(point) {
            return point.beat * 64;
        });
        var ret = [];
        for (var beat in beats) {
            var interval = beats[(beat + 1) % beat.length] - beats[beat];
            var moves = {
                x: frames[beat + 1].x - frames[beat].x,
                y: frames[beat + 1].y - frames[beat].y
            };
            var ddeg = Math.PI / interval;
            for (var i = 0; i < length; i++) {
                ret[beats[beat] + i] = {
                    frame: beats[beat] + i,
                    x: points[beat / 64].x - moves.x * (Math.sin(ddeg * i) + 1) / 2,
                    y: points[beat / 64].y - moves.y * (Math.sin(ddeg * i) + 1) / 2
                };
                    
                }
            }
        }
    };
    
    //初期化
    this.init = function() {
        this.collection = [];
    };
    this.draw = this.prototype.draw;
    this.nextFrame = this.prototype.nextFrame;

    //コレクションからメンバーを削除
    this.remove = function(i) {
        delete this.collection[i];
    };
    
    this.toString = function() {
        var str = this.collection.length.toString();
        for (var i in this.collection) {
            var s = this.collection[i];
            str = str + " / " + s.toString();
        }
        return str;
    };
};
//アイテムのクラス
var Item = function(x, y, radius, dx, dy, color, effect) {
    this.prototype = new Square();
    this.x = x;//左上角の座標
    this.y = y;
    this.color = color;
    this.r = radius;
    this.dx = dx;
    this.dy = dy;
    this.effect = effect; //効果

    //アイテムに触る
    this.touch = function() {
        this.effect();
    };
    //移動
    this.move = function() {
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
    };
    this.isRemove = this.prototype.isRemove;
    this.draw = function(ctx) {
       var exStroke = ctx.strokeStyle;
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
       ctx.closePath();
       ctx.strokeStyle = color;
       ctx.stroke();
        ctx.strokeStyle = exStroke;
    }
};
//アイテムを管理するクラス。効果を追加するときはここのeffectsプロパティにハッシュを増やす
var Items = function(player, timer) {
    this.prototype = new Squares();
    this.collection = [];
    this.effects = {
        score: function() { player.addScore(true, null); },
        time: function() { timer.timeExtend(10); },
    };
    //要素の追加
    this.add = function(x, y, r, dx, dy, c, e) {
        this.collection.unshift(new Item(x, y, r, dx, dy, c, this.effects[e]));
    };
    this.init = this.prototype.init;
    this.draw = this.prototype.draw;
    this.nextFrame = this.prototype.nextFrame;
    this.remove = this.prototype.remove;
    this.toString = this.prototype.toString;
};
//プレイ時間を管理するタイマーのクラス。これだけ他のタイマーと別枠なのはどうかと思うが…
var PlayTimer = function(second) {
    this.time = second;
    this.timer = undefined;
    //開始
    this.start = function() {
        if (this.timer) {
             clearInterval(this.timer);   
        }
        var t = this;
        this.timer = setInterval(function() { t.countdown(); }, 1000);
        console.log(this);
        console.log(arguments.callee);
    };
    //カウントダウンする
    this.countdown = function() {
        console.log(this);
        if (this.time == 0) {
            this.timeup();
        } else {
            this.time--;
        }
    };
    //ストップ
    this.stop = function() {
        clearInterval(this.timer);
        this.timer = undefined;
    };
    //時間切れイベント
    this.timeup = function() { };
    //時間追加
    this.timeExtend = function(second) {
        this.time = this.time + second;
    };
    //リセット
    this.reset = function(second) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = undefined;
        this.time = second;
    }
    this.toString = function() {
        var date = new Date(this.time * 1000);
        return date.getMinutes() + ":" + ("0" + date.getSeconds()).slice(-2);
    };
};
//プレイヤークラス。得点やゲーム進行の管理も兼ねる
var Player = function() {
    var extend = 10000;
    this.score;
    this.dmax;
    this.nextExtend;
    this.stock;
    this.x;
    this.y;
    this.enemyRadius = 15; //■との当たり判定半径
    this.itemRadius = 25; //アイテムとの当たり判定半径
    this.isDead = false; //trueなら復帰中
    //初期化する
    this.init = function() {
        this.score = 0;
        this.dmax = 0;
        this.stock = 5;
        this.x = 200;
        this.y = 200;
        this.isDead = false;
        this.nextExtend = extend;
    };
    //復帰する
    this.recover = function() {
        if (this.stock > 0) {
            this.isDead = false;
            this.stock = this.stock - 1;
        } else {
            this.gameOver();
        }
    };
    //自爆した時のイベント
    this.bomb = function() {
        if (!this.isDead) {
            this.startChain(this.x,this.y);
            this.isDead = true;
        }
    };
    //連鎖が終了した時のイベント
    this.endChain = function(chain) {
        if (this.stock >= 0) {
            this.recover();
        } else {
            this.gameOver();
        }
    };
    //敵機や敵弾と接触したときのイベント(敵弾？なにそれおいｓ()
    this.killed = function() {
        this.isDead = true;
        t = this;
        f = function() {
            if (t.isDead) {
                t.recover();
            }
        };
        setTimeout(function() { f(); }, 1000);
    };
    //ゲームオーバー
    this.gameOver = function() { };
    //スコアが増える
    this.addScore = function(isItem, num) {
        if (isItem) {
            this.dmax += 100;
        } else {
            this.dmax += Math.round(num * 0.5) * 100;
        }
    };
    //得点のカウントアップ
    this.countupScore = function() {
        if (this.dmax > 0) {
            this.score = this.score + 10;
            this.dmax = this.dmax - 10;
            this.nextExtend = this.nextExtend - 10;
            if (this.nextExtend == 0) {
                this.stockExtend();
            }
        }
    };
    //残機増加
    this.stockExtend = function() {
        this.stock = this.stock + 1;
        this.nextExtend = extend;
    };
    //描画
    this.draw = function(ctx) {
        if (!this.isDead) {
            ctx.beginPath();
            ctx.moveTo(this.x - 25, this.y);
            ctx.lineTo(this.x, this.y -25);
            ctx.lineTo(this.x + 25, this.y);
            ctx.lineTo(this.x, this.y + 25);
            ctx.closePath();
            ctx.stroke();
        }
        //このへんは判定をわかりやすく描いてるだけ
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.enemyRadius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.itemRadius, 0, 2 * Math.PI, true);
        ctx.stroke();
    };
    this.toString = function() {
        return "stock:" + this.stock + "score:" + this.score + "next-extend:" +  this.nextExtend;
    };
};
//描画とか判定とか
onload = function() {
    var canvas = document.getElementById('world');
    var ctx = canvas.getContext('2d');
    var circles = new Circles();
    var squares = new Squares();
    var player = new Player();
    var playTimer = new PlayTimer(0);
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
        //タイマーを解除しポーズ画面を表示
        $(window).blur(function() {
            stopTimer();
            playTimer.stop();
            $('#pause').show();
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
        var dmove = 1; //移動量
        var playerLimit = 25; //プレイヤーがこれ以上画面端ににいけないドット数
        switch (e.keyCode){
        case 37:
        case 100:
            if (player.x > playerLimit) {
                player.x = player.x - dmove;
            }
            break;
        case 38:
        case 104:
            if (player.y > playerLimit) {
                player.y = player.y - dmove;
            }
            break;
        case 39:
        case 102:
            if (player.x < canvas.width - playerLimit) {
                player.x = player.x + dmove;
            }
            break;
        case 40:
        case 98:
            if (player.y < canvas.height - playerLimit) {
                player.y = player.y + dmove;
            }    
            break;
        default:
            break;
        }
    }).keyup(function(e) {
        switch(e.keyCode) {
        case 32:
        case 96:
            player.bomb();
            break;
        default:
            break;
        }
    });
    $(".page").hide();
    $('#start').show();
};
