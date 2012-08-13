//プレイヤークラス。得点やゲーム進行の管理も兼ねる
var Player = function() {
    var extend = 10000;
    this.score;
    this.dmax;
    this.dmove = 1;
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
    var p = this;
    this.moving = {
        1 : function(canvas) {
            if (p.x > p.itemRadius) {
                p.x = p.x - p.dmove;
            }
        },
        2 : function(canvas) {
            if (p.y > p.itemRadius) {
                p.y = p.y - p.dmove;
            }
        },
        4 : function(canvas) {
            if (p.x < canvas.width - p.itemRadius) {
                p.x = p.x + p.dmove;
            }
        },
        8 : function(canvas) {
            if (p.y < canvas.height - p.itemRadius) {
                p.y = p.y + p.dmove;
            }
        }
    };
    // 移動する
    this.nextFrame = function(canvas) {
        for (var i = 0; i < 4; i++) {
            if ((this.direction & 1 << i) != 0) {
                this.moving[(1 << i).toString()](canvas);
            }
        }
    };
    // 移動方向を変える
    this.changeDirection = function(direction, isMove) {
        this.direction = isMove ? (this.direction | direction) : (this.direction ^ direction);
        console.log(this.direction + ":" + direction + "(" + isMove);
    };
    // 移動方向をリセットする
    this.resetDirection = function() {
        this.direction = 0
    };
    this.toString = function() {
        return "stock:" + this.stock + "score:" + this.score + "next-extend:" +  this.nextExtend;
    };
};
