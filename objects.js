
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
