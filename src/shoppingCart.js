// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview
 * @author qinfan@made-in-china.com
 * @version v1.0
 */

/**
 * @name ShoppingCart
 * @class Shopping Cart 
 * @requires Clazz
 * @constructor ShoppingCart
 * @param {Object} config 组件配置
 * @example 示例文档
 * @description 描述
 */

;(function(root, factory){
    if (typeof module !== 'undefined' && module.exports) {// CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {// AMD / RequireJS
        define(factory);
    } else {
        root.ShoppingCart = factory.call(root);
    }
}(this,function(){

    'use strict';

    var noop = function(){};
    //单例
    var singleton = null;

    var cache;
    var win = window;
    var store = win.localStorage;

    //接口
    var IShoppingCart = new Abstract({
        add: noop,
        delete: noop,
        edit: noop,
        clean: noop,
        error: noop,
        show: noop,
        hide: noop
    });

    // 默认配置
    var conf = {
        el: '.J-shoppingCart',
        txt:{
            LOCALKEY:'ShoppingCart',
            LOCAL_UPDATEFLAG:'udFlag'
        },
        url:{
            getData:'/getData',
            postData:'/postData'
        },
        cb:{//增、删、改、清空数据修改之后回调,代替默认add操作 function(data){} ; data为操作之后的数据
            afterAdd: null,
            afterDelete:null,
            afterEdit: null,
            afterClean: null
        }
    };


    var ShoppingCart = new Clazz(IShoppingCart,{config: conf,inherit: Component},function(conf){
        if(singleton){
            return singleton;
        }
        this.setConfig(conf);
        this.cache = cache;
        this.__init();
        
        singleton = this;
    });

    function isFunc (fn){
        return (Object.prototype.toString.call(fn) === '[object Function]')
    }

    //API
    ShoppingCart.extend({
        __init: function(){
            var _this = this;
            this.__getAjaxData(function(){
                _this._render();
            });
        },
        __getAjaxData: function(cb){
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.config.url.getData, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var resp = this.responseText;
                        var rData = JSON.parse(resp);
                        
                        _this.cache = rData;
                        if (store){
                            _this.__localSet(rData);
                            _this.__flagLocalSet(true);
                        }
                        if(isFunc(cb)){
                            cb(rData);
                        }
                        
                    } else {
                        // Error :(
                        //todo 
                    }
                }
            };
            xhr.send();

        },
        __postAjaxData: function(){
            //todo post
            var formData = new FormData();
            formData.append('data',this.cache);
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', this.config.url.postData, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var resp = this.responseText;
                        //todo
                    } else {
                        // Error :(
                        //todo 
                    }
                }
            };
            xhr.send(formData);
            
        },
        __localGet: function(){
            this.cache = JSON.parse(store.getItem(this.config.txt.LOCALKEY));
        },
        __localSet: function(){ 
            store.setItem(this.config.txt.LOCALKEY, JSON.stringify(this.cache));
        },
        __flagLocalSet: function(bol){
            store.setItem(this.config.txt.LOCAL_UPDATEFLAG, bol)
        },
        __flagLocalGet: function(){
            return store.getItem(this.config.txt.LOCAL_UPDATEFLAG);
        },
        _update: function(cb){
            if(!store){
                this.__getAjaxData(cb);
            }else if (__flagLocalGet()){
                cb();
            }else{
                this.__localGet();
                cb();
            }
        },
        _render: function(){
            //render DOM
            if(!this.cache){
                return;
            }
            if(document.querySelector){
                this.el = document.querySelectorAll(this.config.el);
            }else{
                //IE67 兼容 todo
            }
            if(this.el.length === 0 ){
                return;
            }
            
            //todo
            this.el[0].innerHTML = JSON.stringify(this.cache);
            
        },
        add: function(data){
            var _this = this;
            this._update(function(){
                //todo add data 操作
                
                _this.__flagLocalSet(false);
                if(isFunc(_this.config.cb.afterAdd)){
                    _this.config.cb.afterAdd(_this.cache);
                    return;
                }
                
                //默认dom add操作 todo
            })
        },
        delete: function(){
            var _this = this;
            this._update(function(){
                //todo delete data 操作
                
                _this.__flagLocalSet(false);
                if(isFunc(_this.config.cb.afterDelete)){
                    _this.config.cb.afterDelete(_this.cache);
                    return;
                }
                
                //默认dom delete todo
            })
        },
        edit: function(){
            var _this = this;
            this._update(function(){
                //todo edit data 操作
                
                _this.__flagLocalSet(false);
                if(isFunc(_this.config.cb.afterEdit)){
                    _this.config.cb.afterEdit(_this.cache);
                    return;
                }
                
                //默认dom edit todo
            })
        },
        clean: function(){
            var _this = this;
            this._update(function(){
                //todo add Clean 操作
                
                _this.__flagLocalSet(false);
                if(isFunc(_this.config.cb.afterClean)){
                    _this.config.cb.afterClean(_this.cache);
                    return;
                }
                
                //默认dom Clean todo
            })
        },
        error:function(code){
            win.console && console.error()
        },
        show: function(){

        },
        hide: function(){

        }
    })
    
    return ShoppingCart;
}))