;
(function (undefined) { //该定义方式保证了变量定义前置，使得外部的同名变量不干扰内部
    'use strict' //使用严格模式
    var _global;
    var typeCache;
    var rootCache;
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
    
    var typeCacheManager = {
    		add:function(protoName,typeName,protoType){
    			return typeCache.set(protoName + '_' + typeName,protoType);
    		},
    		remove:function(protoName,typeName){
    			return typeCache.delete(protoName + '_' + typeName);
    		},
    		get:function(protoName,typeName){
    			return typeCache.get(protoName + '_' + typeName);
    		},
    }
    var rootCacheManager = {
    		add:function(protoName,root){
    			return rootCache.set(protoName,root);
    		},
    		remove:function(protoName){
    			return rootCache.delete(protoName);
    		},
    		get:function(protoName){
    			return rootCache.get(protoName);
    		}
    }
    /**
     * 构造方法
     * @param {*} opts 
     */
    function AjaxSender(opts) {
        this._initial(opts)
    }

    function _initProtoType(root,opt){
    	opt.requestType = root.lookupType(opt.requestTypeName);
		opt.replyType = root.lookupType(opt.replyTypeName);
		typeCacheManager.add(opt.protoFile,opt.requestTypeName,opt.requestType);
		typeCacheManager.add(opt.protoFile,opt.replyTypeName,opt.replyType);
		return opt;
    }
    
    function _sendXhr(opt,callback){
        //创建xhr请求
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
            var resObj = opt.replyType.decode(dataResp);
            if(opt.type == 'json'){
                return callback(JSON.stringify(resObj))
            }
            return callback(resObj);
        }
        if(opt.data){
        	//序列化
        	var requestData = opt.requestType.create(opt.data);
        	var requestBuffer = opt.requestType.encode(requestData).finish();
        	xhr.send(requestBuffer);
        }else{
        	xhr.send();
        }
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
            options = extend(options,opt,true);
            if(!typeCache){
            	typeCache = new Map();
            }
            if(!rootCache){
            	rootCache = new Map();
            }
        },
        /**
         * @typedef SendOptions
         * @type {Object}
         * @property {string} [contentType] default content-type = application/x-protobuf
         * @property {string} [accept] default accept = application/x-protobuf
         * @property {string} [responseType] default responseType = arraybuffer
         * @property {string} [protoFile] 提供的.proto文件
         * @property {string} [requestTypeName] 请求需要封装的proto类型
         * @property {string} [replyTypeName] 返回值的proto类型
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
            //获取protoType
            //先从cache中获取
            opt.requestType = typeCacheManager.get(opt.protoFile,opt.requestTypeName);
            opt.replyType = typeCacheManager.get(opt.protoFile,opt.replyTypeName);
            if(!(opt.requestType && opt.replyType)){
            	//看下是不是已经缓存了root
            	var rootTmp = rootCacheManager.get(opt.protoFile);
            	if(rootTmp){
            		_initProtoType(rootTmp,opt);
            		_sendXhr(opt,callback)
            	}else{            		
            		protobuf.load(opt.protoFile, function(err, root) {
            			_initProtoType(root,opt);
            			rootCacheManager.add(opt.protoFile,root);
            			_sendXhr(opt,callback);
            		})
            	}
            }
        },
        sendData:function(opt){
        	return new Promise((resolve, reject)=>{
        			this.send(opt,function(res){
        			if(res.name === 'Error'){
        				reject(res);
        			}else{        				
        				resolve(res);
        			}
            	})
        	})
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