// Copyright 2014 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview ie && ff 3.5 support placeholder
 * @author sheny@made-in-china.com
 * @version v1.3
 */

//todo textarea暗注释自动换行，取消拖动变化大小

/**
 * @name Placeholder
 * @class ie6,7,8,9 && ff 3.5 input|textarea support placeholder
 * @requires Clazz
 * @constructor initialize
 * @param {Object} config 组件配置
 * @param {Element|Array} config.carrier <font color=red>*</font> 对象载体或者载体数组
 * @param {Object} config.control 显示控制层
 * @param {Boolean} config.control.unifieddisplay, 是否统一浏览器显示
 * @example
    var p = new Placeholder({
        carrier : {Element}|[Element],
        control : { unifieddisplay : false },
        style : { color : 'red', fontFamily : 'Arial' }
    });

    p.onchange(function() {
        // something
    });

    p.show();
    p.hide();
    p.setPlaceholder('tester placeholder');

    // 这里会返回所有带placeholder的input和textarea对象的一个集合
    Placeholer.initPage({
        control : { unifieddisplay : false }
    })
 */

;(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {// CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {// AMD / RequireJS
        define(factory);
    } else {
        root.Placeholder = factory.call(root);
    }
}(this, function() {
    'use strict';

    var win = window;
    var IPlaceholder = new Abstract(/** @lends Placeholder */{
        /**
         * reset placeholder value
         * @param {String} content
         */
        setPlaceholder : function(content) {},
        /**
         * 控制placeholder的input或textarea对象的显示
         */
        show : function() {},
        /**
         * 控制placeholder的input或textarea对象的隐藏
         */
        hide : function() {},
        hideLabel : function() {},
        /**
         * initialize all the placeholder form elements(静态方法)
         * @param {Config} config
         */
        initPage : function(config) {},
        /**
         * 暗注释值改变事件(仅当值发生改变时才会触发)
         * @param {Function} callback
         */
        onchange : function(callback) {}
    });

    var c = /** @lends Placeholder.prototype */{
        /**
         * 对象载体或者载体数组
         * @type Element|Array
         * @default null
         */
        carrier : null,
        /**
         * 显示控制层
         * @type Object control
         * @default : null
         */
        control : /** @memberOf control*/{
            /**
             * 是否统一所有浏览器显示，
             * 默认支持placeholder浏览器使用浏览器自带暗注释功能
             * 不支持placeholder的浏览器才进行模拟显示
             * @type Config.control.unifieddisplay
             * @default false
             */
            unifieddisplay : false,
            /**
             * 暗注释的获得焦点之后的展现形式
             * 默认为获得焦点自后暗注释自动消失。
             * Explicit and implicit methods(显隐方式) 支持属性有 [focus|input]
             * @type Config.control.emMethod
             * @default 'focus'
             */
            emMethod : 'focus'
        },
        /**
         * 是否启用label.for来控制 label的显隐
         * @default true
         */
        isFor : true,
        /**
         * 自定义label样式
         */
        style : /** @memberOf control */{
            /**
             * 显示的placeholder颜色
             * @type Config.style.color
             * @default #BBB
             */
            color : '#BBB'
        }
    };

    var Placeholder = new Clazz(IPlaceholder, { config : c, inherit : Component }, function(c) {
        this.setConfig(c);
        this._.support = 'placeholder' in document.createElement('input');
        this._.placeholder = null;

        return this.__init();
    });

    // static method
    Placeholder.initPage = function(config) {
        var ps = [], items, i, l;
        if (document.querySelectorAll) {
            items = document.querySelectorAll('input[placeholder]');
            for (i = 0, l = items.length; i < l; i++) {
                ps.push(items[i]);
            }

            items = document.querySelectorAll('textarea[placeholder]');
            for (i = 0, l = items.length; i < l; i++) {
                ps.push(items[i]);
            }
        } else {
            items = document.getElementsByTagName('input');
            for(i = 0, l = items.length; i < l; i++) {
                if (items[i].placeholder) {
                    ps.push(items[i]);
                }
            }

            items = document.getElementsByTagName('textarea');
            for(i = 0, l = items.length; i < l; i++) {
                if (items[i].placeholder) {
                    ps.push(items[i]);
                }
            }
        }

        if (!ps.length) return;

        return new Placeholder(_Extend({ carrier : ps }, config, false));
    };

    Placeholder.extend({
        // 初始化校验config, 初始化默认参数
        __init : function() {
            var carrier = this.config.carrier,
                placeholder = '',
                initFlag = false;

            // check array carriers
            if (Object.prototype.toString.call(carrier) === '[object Array]') {
                var list = [], i, l, item;
                for (i = 0, l = carrier.length; i < l; i++) {
                    item = carrier[i];
                    if (!!(item && item.nodeType === 1)) {
                        list.push(new Placeholder(_Extend({ carrier : item }, this.config, false)));
                    }
                }

                return list;
            }

            try {
                /*
                 * check input has placeholder attribute
                 * fixed IE7 getAttribute bug
                 */
                placeholder = carrier.getAttributeNode('placeholder');
                initFlag = !!carrier.getAttributeNode('data-placeholder');
                if (!carrier) throw 'Placeholder init error:carrier must not be null.';
                if (!placeholder && initFlag) throw 'repeat initialize.';
                if (!placeholder) throw 'element not has placeholder attribute.';
            } catch (err) {
                if (err && win.console) {
                    win.console.log('input.' + (carrier.name || carrier.id) + ' initError : '+ err);
                    return;
                }
            }

            if (initFlag) { return; }

            this._reRenderColor();
            this.elems.carrier = carrier;
            this._.placeholder = placeholder.value;
            this._.name = carrier.name || '';
            this._.id = 'p_'+ new Date().getTime();

            if (this.config.control.unifieddisplay) {
                carrier.removeAttribute('placeholder');
                this._.support = false;
            }
            carrier.setAttribute('data-placeholder', (new Date().getTime()).toString(32) + ((1+Math.random() * 65536)|0).toString(16).substring(1));
            if (this._.support) return;

            // 启用 label for
            if (this.config.isFor) {
                if (!carrier.id) {
                    carrier.id = this._.id;
                } else {
                    this._.id = carrier.id;
                }
            }

            this.elems.label = this._createLabel(carrier);

            if (carrier.value === '') {
                this.elems.label.innerHTML = this._.placeholder;
            }
            var container = document.createElement('div');
            container.style.cssText = 'position:relative; display:inline-block; *display:inline; *zoom:1;';
            container.appendChild(this.elems.label);
            carrier.parentNode.insertBefore(container, carrier);
            if (carrier.style.display  === 'none' || carrier.value !== '' ) {
                this.elems.label.style.display = 'none';
            }
            container.appendChild(carrier);
            this.__events();
        },
        /**
         * create label & style
         * @param {Element} el
         * @return {Element}
         * @private
         */
        _createLabel : function(el) {
            var customStyle;
            var label = document.createElement('label'),
                padding = getStyle(el, 'padding'),
                margin = getStyle(el, 'margin'),
                fontSize = getStyle(el, 'fontSize'),
                pl = this.__formatNumber(getStyle(el, 'paddingLeft')),
                pr = this.__formatNumber(getStyle(el, 'paddingRight')),
                bt = this.__formatNumber(getStyle(el, 'borderTopWidth')),
                bl = this.__formatNumber(getStyle(el, 'borderLeftWidth')),
                mt = this.__formatNumber(getStyle(el, 'marginTop'));

            label.htmlFor = this._.id;

            // FF3.6 has not value of margin if not write margin only marginTop
            if (!margin) {
                margin = getComputedStyle(el, null).marginTop + ' 0';
            }
            // end
            // FF can't get padding
            if (!padding) {
                padding = getStyle(el, 'paddingTop') + ' ' + pr + 'px ' +
                    getStyle(el, 'paddingBottom') + ' ' + pl + 'px';
            }
            //end

            if (this.config.style) {
                var s, w;
                customStyle = '';
                for (s in this.config.style) {
                    customStyle += s + ':' + this.config.style[s] + ';';
                }
                if (el.nodeName.toLowerCase() === 'input') {
                    w = getStyle(el, 'width');
                    customStyle += 'white-space:nowrap;overflow:hidden;';
                    if (w === 'auto') {
                        w = el.offsetWidth - pl - pr;
                    }
                    if (w === '100%') {
                        customStyle += 'width:100%;';
                    } else {
                        customStyle += 'width:'+ (parseInt(w) - 2) + 'px;';
                    }
                }
            }

            label.style.cssText = 'position:absolute; cursor:text; padding:' + padding +'; padding-left:'+ (pl + bl) +
                'px; margin:' + margin +'; margin-top:' + (mt + bt + 1) +'px; font-size:' + fontSize + ';' + customStyle;

            return label;
        },
        __formatNumber : function(num) {
            return (isNaN(parseInt(num)) ? 0 : parseInt(num, 10));
        },
        __events : function() {
            var self = this,
                carrier = this.elems.carrier;

            carrier.onblur = function() {
                self._blur();
            };

            //if (this.config.control.emMethod === 'input') {
                // IE & W3C
                if (document.attachEvent) {
                    carrier.attachEvent('onpropertychange', function() {
                        self._blur();
                    });
                }

                carrier.oninput = function() {
                    self._blur();
                };
            /*} else {
                carrier.onfocus = function() {
                    self._focus();
                };
            }*/

            if (!this.config.isFor) {
                this.elems.label.onclick = function() {
                    carrier.focus();
                };
            }
        },
        _focus : function() {
            this.elems.label.innerHTML = '';
            this.elems.label.style.display = 'none';
        },
        _blur : function() {
            var lb = this.elems.label;
            if (this.elems.carrier.value === '') {
                lb.innerHTML = this._.placeholder;
                this.elems.label.style.display = '';
            } else {
                lb.innerHTML = '';
            }
        },
        _reRenderColor : function() {
            if (document.getElementById('placeholderFixed')) return;

            var head = document.getElementsByTagName("head")[0],
                styleEl,
                color = this.config.style.color,
                cssCode = ':-moz-placeholder{color:'+ color +'; }';

            cssCode += '::-moz-placeholder{color:'+ color +';}';
            cssCode += '::-webkit-input-placeholder{color:'+ color +';}';
            cssCode += ':-ms-input-placeholder{color:'+ color + '!important;}';

            styleEl = document.createElement('style');
            styleEl.type = 'text/css';
            styleEl.id ='placeholderFixed';
            head.appendChild(styleEl);

            if (styleEl.styleSheet) {    //ie
                styleEl.styleSheet.cssText = cssCode;
            } else if (document.getBoxObjectFor) {
                styleEl.innerHTML += cssCode;//火狐支持直接innerHTML添加样式表字串
            } else {
                styleEl.appendChild(document.createTextNode(cssCode));
            }
        },
        setPlaceholder : function(con) {
            var isChange = (con !== this._.placeholder);
            this._.placeholder = con;
            if (!this.config.control.unifieddisplay) {
                this.elems.carrier.setAttribute('placeholder', con);
            }

            if (!this._.support && this.elems.carrier.value === '') {
                this.elems.label.innerHTML = con;
            }

            if (isChange) {
                this.fire('change');
            }
        },
        show : function() {
            if (this.elems.label) {
                this.elems.label.style.display = '';
                this._blur();
            }

            this.elems.carrier.style.display = '';
        },
        hide : function() {
            if (this.elems.label) {
                this.elems.label.style.display = 'none';
            }

            this.elems.carrier.style.display = 'none';
        },
        hideLabel : function() {
            if (this.elems.label) {
                this.elems.label.style.display = 'none';
            }
        },
        onchange : function(callback) {
            if (callback) {
                this.on('change', callback);
            }
        }
    });

    /**
     * get Style of Element
     * @param {Element} el
     * @param {String} name
     * @return {*}
     * @private
     */
    function getStyle(el, name) {
        return el.currentStyle ? el.currentStyle[name] : win.getComputedStyle(el, null)[name];
    }

    /**
     * simple extend override destination
     * @param destination {Object} 目标对象
     * @param source {Object} 源对象
     * @param override {Boolean} 是否覆盖目标对象同名属性
     * @return {Object}
     * @private
     */
    function _Extend(destination, source, override) {
        if (typeof override === "undefined") override = true;
        for (var property in source) {
            if (Object.prototype.toString.call(source[property]) === 'Object') {
                _Extend(destination, source[property]);
            } else {
                if (!destination[property] || override) {
                    destination[property] = source[property];
                }
            }
        }

        return destination;
    }

    return Placeholder;
}));