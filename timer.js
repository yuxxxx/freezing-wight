//プレイ時間を管理するタイマーのクラス。これだけ他のタイマーと別枠なのはどうかと思うが…
var Timer = function(time, interval) {
    var defaultTime = time;
    this.time = time;
    this.interval = interval ? interval : 1000;
    this.timer = undefined;
    //開始
    this.start = function() {
        if (this.timer) {
             clearInterval(this.timer);   
        }
        var t = this;
        this.timer = setInterval(function() {
            t.countdown();
        }, this.interval);
        console.log(this);
        console.log(arguments.callee);
    };
    //カウントダウンする
    this.countdown = function() {
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
    this.reset = function(time) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = undefined;
        this.time = time ? time : defaultTime;
    };
    this.toString = function() {
        var t = new Date(this.time * this.interval);
        return t.getMinutes() + ":" + ("0" + t.getSeconds()).slice(-2);
    };
};
