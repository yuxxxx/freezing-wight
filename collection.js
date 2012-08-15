//コレクションのクラス。CirclesとSquaresの親クラス
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
    function OnMoveComplete(id, index) {
        return this.MovingTables[id][index];
    }
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
