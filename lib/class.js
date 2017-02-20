/**
* @name Clazz
* @version 0.3.2
*/
var Lass = window.Lass || {};
/**
* util
* @requires Namespace Lass
*/
;void function(){
	var util = this.util = (this.util || {});
	
	/**
	* type
	*/
	util.type = function(o){
		var _type;
		var r_native = /\{\s*\[native\s*code\]\s*\}/i;
		
		if(o === null){
			//for IE, use toString, it's '[object Object]'
			//for FF/Opera, it's '[object Window]'
			_type = 'null';
		}else if(typeof o === 'undefined'){
			//for IE, use toString, it's '[object Object]'
			//for FF/Opera, it's '[object Window]'
			_type = 'undefined';
		}else{
			_type = Object.prototype.toString.call(o).match(/\w+/g)[1].toLowerCase();
			
			//IE native function
			if(_type === 'object' && r_native.test(o + '')){
				_type = 'function';
			}
		}
		
		return _type;
	};
	
	/*
	* trim
	*/
	util.trim = function(str){
		return (str + '').replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');
	};
	
	/**
	* extend
	*/
	util.extend = function(){
		var me = arguments.callee;
		var start, override;

		if(util.type(arguments[0]) !== 'object'){
			start = 1;
			override = !!arguments[0];
		}else{
			start = 0;
			override = false;
		}

		var tar = arguments[start] || {};
		var args = [].slice.call(arguments, start + 1);
		
		var tmp;
		var type;
		while(args.length){
			tmp = args.shift();
			if(util.type(tmp) !== 'object'){
				continue;
			}
			
			var t;
			for(var key in tmp){
				t = tmp[key];
				
				if(util.type(t) === 'object'){
					if(t == window || t == document || ('childNodes' in t && 'nextSibling' in t && 'nodeType' in t)){
						if(!(!override && (key in tar))){ //window, dom in IE, do not deep copy these.
							tar[key] = t;
						}
						
						continue;
					}
					
					if(t.jquery && /^[\d\.]+$/.test(t.jquery)){
						tar[key] = t;
						continue;
					}
					
					/*if('length' in t && t.length >= 0){
						var isFakeArray = true;
						for(var m = 0; m < t.length; m++){
							if(!(m.toString() in t)){
								isFakeArray = false;
								break;
							}
						}
						
						if(isFakeArray){
							//TODO: deep copy each element in fake array
							for(var m = 0; m < t.length; m++){
								if(!(!override && (key in tar))){
									tar[key] = t;
								}
							}
							
							continue;
						}
					}*/
					
					type = util.type(tar[key]);
					if(!(key in tar) || type === 'undefined' || type === 'null'){
						tar[key] = {};
					}
					
					if(util.type(tar[key]) === 'object'){
						me(override, tar[key], t);
					}
				}else if(!(!override && (key in tar))){
					tar[key] = t;
				}
				
			}
		}
		
		return tar;
	};
	
	/*
	* log4js
	*/
	util.console = util.console || function(console){
		var logStat = true;

		var _loger = {
			turn: function(stat){
				logStat = !!stat;
			},
			warn: function(){}
		};
		
		if(!console){
			return _loger;
		}
		
		return util.extend(true, _loger, {
			warn: function(msg){
				if(logStat){
					console.warn(msg);
				}
			}
		});
	}.call(window, window.console);
	
	/*
	* indexOf
	*/
	util.indexOf = function(items, value, start){
		/*if(items.indexOf){
			return items.indexOf(value, start);
		}*/
		
		var ret = -1;
		var i = ((util.type(start) === 'number' ? start : -1) + 1), len = items.length;
		for(; i < len; i++){
			if(items[i] === value){
				ret = i;
				break;
			}
		}
		
		return ret;
	};

	return util;
}.call(Lass);
;void function(){
	var util = this.util;
	var noop = function(){};
	var IS_METHOD = '__IS_ABSTRACT_METHOD__';
	
	var __CLASS_PROTO__ = /** @lends Clazz.prototype */{
		impl: function(apiname, fn){
			util.type(fn) === 'function' && (this[apiname] = fn);
		},
		mix: function(){
			util.extend.apply(null, [true, this].concat([].slice.call(arguments)));
		}/*,
		__getDefaultConfig: function(){
			return defaultConfig;
		}*/
	};

	// 
	var getObjExceptAtrrs = function(obj, attrs){
		attrs = attrs || "impl,super,mix,__getDefaultConfig,__proto__,toString,valueOf".split(',');
		var ret = util.extend(true, {}, obj);
		
		try{
			for(var i = 0; i < attrs.length; i++){
				delete ret[attrs[i]];
			}
		}catch(ex){ }
		
		return ret;
	};
	
	/**
	* override vitual method
	* @private
	* @param proto
	* @param obj
	*/
	var specialExtend = function(proto, obj){
		var ret = {};
		var p = getObjExceptAtrrs(proto);
		for(var key in p){
			if((key in obj) && util.type(obj[key]) === 'function'){
				ret[key] = obj[key];
			}
		}
		
		return ret;
	};
	
	/**
	* class generation
	* @class
	* @constructor
	* @name Clazz
	* @param {Abstract} [IAbstract] declaration {@link Abstract}
	* @param {JSON} [config]
	* @param {Clazz} [config.inherit] inherit class
	* @param {JSON|JSON[]} [config.mix] mix in instance
	* @param {config} [config.config] default config in class
	* @param {Function} [initilize]
	*/
	var _Clazz = function(){
		//match params: abstract, config, constructor
		var ARGS_LENGTH = 3;
		
		var IAbstract;
		var config;
		var initilize;
		
		var types = [];
		for(var i = 0; i < ARGS_LENGTH; i++){
			types.push(util.type(arguments[i]));
		}
		
		var index;
		
		//constructor
		index = util.indexOf(types, 'function');
		initilize = (index === -1 ? noop : arguments[index]);
		
		index = -1;
		while((index = util.indexOf(types, 'object', index)) !== -1){
			if(!IAbstract && arguments[index].constructor === _Abstract){ //abstract class
				IAbstract = arguments[index];
			}else if(!config){ //configuration
				config = arguments[index];
			}
			
			if(IAbstract && config){
				break;
			}
		};
		
		if(!IAbstract){
			IAbstract = {};
		}
		
		if(!config){
			config = {};
		}
		
		///////////// end of match params
		
		//initialization
		var defaultConfig = config.config || {};
		var mix = [];
		var inherit = config.inherit || noop;
		//wrap mix
		var _mix = config.mix || [{}];
		var t_mix = util.type(_mix);
		if(t_mix === 'object'){
			_mix = [_mix];
		}else if(t_mix !== 'array'){
			_mix = [{}];
		}
		
		for(var i = 0; i < _mix.length; i++){
			if(util.type(_mix[i]) === 'object'){
				mix.push(_mix[i]);
			}
		}
		
		_mix = null;
		
		var constructor = function(){
			/*this._ = {};
			this.elems = {};
			
			this.cfg = util.extend(true, {}, defaultConfig);*/

			//super
			var overrideVisualMethod = specialExtend(inherit.prototype, this);
			
			this['super'] = util.extend(true, {}, inherit.prototype, overrideVisualMethod);
			inherit.apply(this['super'], [].slice.call(arguments));
			
			//inherit super
			var inheritedObject = getObjExceptAtrrs(this['super']);
			
			util.extend(true, this, inheritedObject, {
				__getDefaultConfig: function(){
					return defaultConfig;
				}
			});
			
			//mix
			this.mix.apply(this, mix);
			
			//add static method 'impl/implement' on abstract method
			for(var key in IAbstract){
				if(util.type(this[key]) === 'function' && this[key][IS_METHOD]){
					this[key] = function(key){
						var fn = function(){
							IAbstract[key]();
						};
						
						fn[IS_METHOD] = IAbstract[key][IS_METHOD];
						
						var _this = this;
						fn.impl = fn.implement = function(fn){
							_this.impl(key, fn);
						};
						
						return fn;
					}.call(this, key);
				}
			}
			
			this.constructor = arguments.callee;
			var ret = initilize.apply(this, [].slice.call(arguments));
			
			//log unimplement method
			for(var key in IAbstract){
				if(util.type(this[key]) === 'function' && this[key][IS_METHOD]){
					IAbstract[key]();
				}
			}
			
			if(typeof ret === 'object' && ret !== null){
				return ret;
			}
		};
		
		constructor.prototype = util.extend(true, {}, __CLASS_PROTO__, IAbstract);
		constructor.extend = function(proto){
			var toExtend = util.extend.apply(null, [true, {}].concat([].slice.call(arguments)));
			/*var exclude = '__getDefaultConfig,super,_,elems,config,__proto__,constructor';
			exclude.replace(/(\w+)/g, function($1){
				try{
					delete toExtend[$1];
				}catch(ex){ }
			});*/
			
			util.extend.call(null, true, constructor.prototype, toExtend);
		};

		return constructor;
	};
	
	/**
	* empty class
	* @class
	* @constructor
	* @name Empty
	*/
	var Empty = this.Empty = new _Clazz();
	
	/**
	* abstract base class
	* @class
	* @constructor
	* @name Abstract
	* @param {JSON} declaration declaration of methods or attributes
	* @param {Boolean} [debug] whether warn not implemented methods
	*/
	var _Abstract = new _Clazz({inherit: Empty}, function(declaration, debug){
		var type;
		
		for(var key in declaration){
			type = util.type(declaration[key]);
			if(type === 'function'){
				this[key] = function(key, debug){
					return function(){
						debug && util.console.warn(key + ' method is not implement.');
					};
				}.call(this, key, debug);
				
				this[key][IS_METHOD] = true;
			}else if(type === 'object'){
				this[key] = util.extend(true, {}, declaration[key]);
			}else{
				this[key] = declaration[key];
			}
			
			//TODO: other referencation type
		}
	});
	
	///// initialization
	var toExtends = {
		Clazz: _Clazz,
		Abstract: _Abstract
	};
	
	util.extend(true, this, toExtends);
	util.extend(true, window, toExtends);
}.call(Lass);
;void function(){
	var util = this.util;
	
	/**
	* event listener
	* @private
	*/
	var Listener = function(handle, once, data){
		this.handle = handle;
		this.once = !!once;
		this.data = data || {};
	};
	
	/**
	* event object
	* @class
	* @constructor
	* @name Event
	* @param {String} type event type
	* @param {JSON} [data] event data
	*/
	var Event = function(type, data){
		this.type = type;
		this.data = data;
	};
	
	/**
	* Events
	* @class
	* @constructor
	* @name Events
	*/
	var Events = function(){
		if(!this._){
			this._ = {};
		}

		this._.events = {};
	};
	
	// extend Events.prototype
	Events.prototype = /** @lends Events.prototype */{
		/**
		* @private
		*/
		__initEvent: function(type){
			if(!this._.events[type]){
				this._.events[type] = [];
			}
			
			return this._.events[type];
		},
		/**
		* @private
		*/
		__eventParams: function(data, handle){
			var t_data = util.type(data);
			if(t_data === 'function'){
				handle = [data];
			}else if(t_data === 'array'){
				handle = data;
			}else if(t_data !== 'object'){
				data = {};
			}
			
			var t_handle = util.type(handle);
			if(t_handle === 'function'){
				handle = [handle];
			}else if(t_handle !== 'array'){
				handle = [];
			}
			
			return {
				data: data,
				handle: handle
			};
		},
		/**
		* @private
		*/
		__bindEvent: function(type, data, handle, one){
			type = util.trim(type);
			var events = this.__initEvent(type);
			var params = this.__eventParams(data, handle);
			
			for(var i = 0; i < params.handle.length; i++){
				if(util.type(params.handle[i]) === 'function'){
					events.push(new Listener(params.handle[i], !!one, util.extend(true, {}, params.data)));
				}
			}
		},
		/**
		* @private
		* search event
		*/
		__search: function(events, handle){
			var ret = -1;
			for(var i = 0; i < events.length; i++){
				if(events[i].handle === handle){
					ret = i;
					break;
				}
			}
			
			return ret;
		},
		/**
		* bind event
		* @param {String} type event type
		* @param {JSON} [data] event data
		* @param {Function|Function[]} handle event handle
		*/
		on: function(type, data, handle){
			this.__bindEvent(type, data, handle, false);
			return this;
		},
		/**
		* bind once excuted event
		* @param {String} type event type
		* @param {JSON} [data] event data
		* @param {Function|Function[]} handle event handle
		*/
		one: function(type, data, handle){
			this.__bindEvent(type, data, handle, true);
			return this;
		},
		/**
		* unbind event
		* @param {String} type event type
		* @param {Function|Function[]} [handle] event handle.if no this param, remove all handles with this type of events
		*/
		off: function(type, handle){
			type = util.trim(type);
			
			if(util.type(handle) === 'function'){
				handle = [handle];
			}
			
			if(util.type(handle) === 'array'){
				var events = this.__initEvent(type);
				var index;
				for(var i = 0; i < handle.length; i++){
					if(util.type(handle[i]) === 'function'){
						index = this.__search(events, handle[i]);
						if(index !== -1){
							events.splice(index, 1);
						}
					}
				}
			}else{
				this._.events[type] = [];
			}

			return this;
		},
		/**
		* trigger event
		* @param {String} type event type
		* @param {JSON} [data] event data
		* @example
		* 	this.on('xx', function(e){
		* 		//e {@link Event}
		* 		console.log(e);
		* 	});
		*/
		fire: function(type, data){
			type = util.trim(type);
			data = (util.type(data) === 'object' && data) || {};
			
			var events = this.__initEvent(type);
			var once = [];
			var event;
			
			for(var i = 0; i < events.length; i++){
				event = events[i];
				event.handle.call(this, new Event(type, util.extend(true, {}, event.data, data)));
				if(event.once){
					once.push(event.handle);
				}
			}
			
			this.off(type, once);

			return this;
		}
	};
	
	this.Events = Events;
}.call(Lass);
;void function(){
	var util = this.util;
	var Clazz = this.Clazz;
	var Events = this.Events;
	var Empty = this.Empty;
	var __COMPONENT_PROTO__ = /** @lends Component.prototype */{
		_: {},
		elems: {},
		config: {},
		setConfig: function(config){
			return this.config = util.extend(true, {}, this.__getDefaultConfig(), this.config, config);
		}
	};
	
	/**
	* Component Base class
	* @class
	* @constructor
	* @name Component
	* @param [cfg] configuration
	*/
	var _Component = new Clazz({ mix: __COMPONENT_PROTO__, inherit: Empty });
	_Component.extend(new Events());
	
	window.Component = this.Component = _Component;
}.call(Lass);
