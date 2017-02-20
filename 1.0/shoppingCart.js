// todo sth


;(function(root, factory){
    if (typeof module !== 'undefined' && module.exports) {// CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {// AMD / RequireJS
        define(factory);
    } else {
        root.ShoppingCart = factory.call(root);
    }
}(this,function(){

    //todo 单例模式 

    'use strict';
    var win = window;

    //接口
    var IShoppingCart = new Abstract({
        show: function(){},
        hide: function(){},
        add: function(prodData){},
        delete: function(prodData){},
        edit: function(){},
        clean: function(){}
    });

    // 默认配置
    var conf = {};

    var ShoppingCart = new Clazz(IShoppingCart,{config: conf,inherit: Component},function(conf){
        this.setConfig(conf);
        this.__init();
    });

    //API
    ShoppingCart.extend({
        __init: function(){
            this.data.__getAjaxData();
        },
        data:{
            __getAjaxData: function(){},
            __postAjaxData: function(){},
            __localGet: function(){},
            __localSet: function(){},
            _update: function(){
                
            },
            add: function(){},
            delete: function(){},
            edit: function(){},
            clean: function(){},
        },
        view:{
            show: function(){},
            hide: function(){},
            add: function(){},
            delete: function(){},
            edit: function(){},
            clean: function(){},
        },
        error:function(){

        },
    })
    
    
}))