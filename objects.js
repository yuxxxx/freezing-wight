
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
var Square = function(x, y, width, dx, dy, color, item, id, count) {
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
    this.id = id;
    this.index = 0
    this.count = count;
    //移動
    this.move = function() {
        this.cx = this.cx + this.dx;
        this.cy = this.cy + this.dy;
        this.x = this.cx + this.width / 2;
        this.y = this.cy + this.width / 2;
        this.count--;
        if (this.count < 0) {
            var next = this.moveComplete(this.id, this.index++);
            this.dx = next['x'];
            this.dy = next['y'];
            this.count = next['count'];
        }
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
