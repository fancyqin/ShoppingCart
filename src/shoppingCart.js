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
        /**
         * 增加数据 
         * 增加 cart.add(data); 
         * @param {Object} data 新增的数据项
         * 回调 cart.on('add',function(data){});
         * @param {Array} data 数据
        */
        add: noop,
        /**
         * 删除数据 
         * 删除 cart.delete(id); 
         * @param {String} id 删除的数据项id
         * 回调 cart.on('delete',function(data){});
         * @param {Array} data 数据
        */
        delete: noop,
        /**
         * 编辑数据 
         * 编辑 cart.edit(data); 
         * @param {Object} id 编辑的数据项
         * 回调 cart.on('edit',function(data){});
         * @param {Array} data 数据
        */
        edit: noop,
        /**
         * 清空数据 
         * 清空 cart.clean(); 
         * 回调 cart.on('clean',function(){});
        */
        clean: noop,
        error: noop,
        /**
         * 显示整个容器
         * cart.show(); 
        */
        show: noop,
        /**
         * 隐藏整个容器 
         * cart.hide(); 
        */
        hide: noop
    });

    // 默认配置
    var conf = {
        elems: {
            carrier:'.J-ShoppingCart',
        },
        txt:{
            DATA_KEY:'prods',
            LOCALKEY:'ShoppingCart',
            LOCAL_UPDATEFLAG:'udFlag'
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
                        _this.error();
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
                        _this.error();
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
            }else if (this.__flagLocalGet()){
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
                this.carrier = document.querySelectorAll(this.config.elems.carrier);
            }else{
                //IE67 兼容 todo
            }
            if(this.carrier.length === 0 ){
                return;
            }
            
            //todo
            this.carrier[0].innerHTML = JSON.stringify(this.cache);
            
        },
        add: function(data){
            var _this = this;
            this._update(function(){
                //todo add data 操作
                
                _this.__flagLocalSet(false);
                _this.fire('add',_this.cache);
                
                //默认dom add操作 todo

                _this._render();
            })
        },
        delete: function(id){
            var _this = this;
            this._update(function(){
                //todo delete data 操作
                
                _this.__flagLocalSet(false);
                _this.fire('delete',_this.cache);
                
                //默认dom delete todo
            })
        },
        edit: function(){
            var _this = this;
            this._update(function(){
                //todo edit data 操作
                
                _this.__flagLocalSet(false);
                _this.fire('edit',_this.cache);
                
                //默认dom edit todo
            })
        },
        clean: function(){
            var _this = this;
            this._update(function(){
                //todo add Clean 操作
                
                _this.__flagLocalSet(false);
                _this.fire('clean');

            })
        },
        error:function(code){
            win.console && console.error('error')
        },
        show: function(){

        },
        hide: function(){

        }
    })
    
    return ShoppingCart;

}))


var shop = new ShoppingCart({
    elems:{
        container:'.J-fef'
    },
    url:{
        getData:'/data.json'
    }
});




shop.on('clean',function(){
    console.log('clean over')
})