;
(function (global, undefined) { //该定义方式保证了变量定义前置，使得外部的同名变量不干扰内部
    'use strict' //使用严格模式
    var _global;
    var options = {
        baseUrl: '',
        contentType: 'application/x-protobuf',
        type: 'GET',
        accept: 'application/x-protobuf',
        responseType: 'arraybuffer'
    }
    // 对象合并
    function extend(o, n, override) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                o[key] = n[key];
            }
        }
        return o;
    }
    /**
     * 构造方法
     * @param {*} opts 
     */
    function AjaxSender(opts) {
        console.log("创建AjaxSender对象")
        this._initial(opts)
    }

    AjaxSender.prototype.test = function () {
        console.log("调用测试方法")
    }
    AjaxSender.prototype = {
        constructor: this,
        test1: function () {
            console.log(111111)
        },
        _initial: function(opt){
            options = extend(options,opt,true)
        },
        /**
         * @typedef SendOptions
         * @type {Object}
         * @property {string} [contentType] default content-type = application/x-protobuf
         * @property {string} [accept] default accept = application/x-protobuf
         * @property {string} [responseType] default responseType = arraybuffer
         * @property {string} [protoFile] 提供的.proto文件
         * @property {string} [requestType] 请求需要封装的proto类型
         * @property {string} [replyType] 返回值的proto类型
         */
        /**
         * 创建一个异步请求对象，需要提供一个回调方法和protobuffer type
         * @param {SendOptions} opt
         * @param {function callback} callback 
         */
        send:function(opt,callback){
            if(!opt){
                opt = {};
            }
            var xhr = new XMLHttpRequest();
            xhr.open(opt.type || options.type,options.baseUrl + opt.url);
            xhr.setRequestHeader("Content-Type",opt.contentType || options.contentType);
            xhr.setRequestHeader("Accept", opt.accept || options.accept);
            if ("overrideMimeType" in xhr){			 
                   xhr.overrideMimeType("text/plain; charset=x-user-defined");
                }
            xhr.responseType = opt.responseType || options.responseType;
            xhr.onreadystatechange = function fetchOnReadyStateChange() {
                if (xhr.readyState !== 4){
                    return undefined;
                }
                if (xhr.status !== 0 && xhr.status !== 200){
                    return callback(Error("status " + xhr.status));
                }
                var buffer = xhr.response;
                if(!buffer){
                    return undefined;
                }
                var dataResp = new Uint8Array(buffer);
                var resObj = opt.protoType.decode(dataResp);
                if(opt.type == 'json'){
                    return JSON.stringify(resObj)
                }
                return resObj;
            }
            xhr.send(opt.data)
        }
    }
    _global = (function () {
        return this || (0, eval)('this')
    }());

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AjaxSender
    } else if (typeof define == 'function' && define.amd) {
        define(function () {
            return AjaxSender
        })
    } else {
        !('AjaxSender' in _global) && (_global.AjaxSender = AjaxSender)
    }
}())