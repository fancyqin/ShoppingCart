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
            LOCALKEY:'ShoppingCart'
        },
        url:{
            getData:'/getData',
            postData:'/postData'
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

    //API
    ShoppingCart.extend({
        __init: function(){
            this.__getAjaxData();
        },
        __getAjaxData: function(){
            var _this = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.config.url.getData, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var resp = this.responseText;
                        
                        _this.cache = JSON.parse(resp);
                        _this.__localSet(JSON.parse(resp));
                        _this._render();
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
            if(!win.localStorage){
                return;
            }
            this.cache = JSON.parse(win.localStorage.getItem(this.config.txt.LOCALKEY));
        },
        __localSet: function(){
            if(!win.localStorage){
                return;
            }
            win.localStorage.setItem(this.config.txt.LOCALKEY, JSON.stringify(this.cache));
        },
        _update: function(){
            
            
            //有问题
            if(!win.localStorage){
                //异步
                this.__getAjaxData();
            }else{
                this.__localGet();
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
            //add DOM
        },
        delete: function(){
            
        },
        edit: function(){

        },
        clean: function(){

        },
        error:function(){
            
        },
        show: function(){

        },
        hide: function(){

        }
    })
    
    return ShoppingCart;
}))