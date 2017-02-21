

(function(){

    'use strict';

    var noop = function(){};
    //单例
    var singleton = null;

    var cache;
    var win = window;


    // 默认配置
    var conf = {
        txt:{
            LOCALKEY:'ShoppingCart'
        }
    };


    var ShoppingCart = function(){
        if(singleton){
            return singleton;
        }
        this.__init();
        
        singleton = this;
    };

    //API
    ShoppingCart.prototype = {
        __init: function(){
            console.log(this);
            // this.data.__getAjaxData();
        },
        show: function(){},
        hide: function(){},
        add: function(){},
        delete: function(){},
        edit: function(){},
        clean: function(){},
        error:function(){
            
        }
    };
    ShoppingCart.data = function(){}
    ShoppingCart.data.prototype = {
        __getAjaxData: function(){
            console.log(this);
        }
    }
    
    win.ShoppingCart = ShoppingCart;
})();