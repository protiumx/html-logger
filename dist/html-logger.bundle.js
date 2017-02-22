(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.HtmlLogger = require('./html-logger').default;

},{"./html-logger":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestAnimationFrame = function requestAnimationFrame() {
	var frameTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;

	var animationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame;

	if (animationFrame) return function (callback) {
		return animationFrame(callback);
	};else return function (callback) {
		return setTimeout(callback, frameTime);
	};
};

var shortCutsKeys = ["shift", "alt", "ctrl"];

var levels = {
	info: {
		color: "#fff",
		name: "INFO",
		level: 1
	},
	debug: {
		color: "#3377ff",
		name: "DEBUG",
		level: 0
	},
	fatal: {
		color: "#FF3E3E",
		name: "ERROR",
		level: 4
	},
	warning: {
		color: "#FFC53E",
		name: "WARNING",
		level: 3
	},
	success: {
		color: "#3EFF45",
		name: "SUCCESS",
		level: 2
	}
};

var defaultOptions = {
	name: "Html Logger",
	enabled: true,
	height: 420,
	animationDuration: 200,
	maxLogCount: 40,
	shortCuts: {
		toggle: "shift+T",
		clean: "shift+L"
	},
	captureNative: false, // captures logs from web kit
	bufferSize: 100, // keep 100 lines in memory
	loggingFormat: "[TIME] [LEVEL] [MESSAGE]",
	argumentsSeparator: " ",
	utcTime: true,
	level: 1
};

var HtmlLogger = function () {
	function HtmlLogger(options) {
		_classCallCheck(this, HtmlLogger);

		this._options = Object.assign({}, defaultOptions, options || {});
		this._linesCount = 0;
		this.$ = {};
		this.buffer = [];
		this.initialized = false;
	}

	_createClass(HtmlLogger, [{
		key: "init",
		value: function init() {
			var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.initialized) return;
			if (!document || !document.createElement || !document.body || !document.body.appendChild) throw new Error("HtmlLogger not initialized");

			this.$.container = document.createElement("div");
			var containerStyle = "width:100%; height: " + (this._options.height + 40) + "px;\n\t\t\t\t\tmargin:0; padding: 6px;\n\t\t\t\t\tposition:fixed;\n\t\t\t\t\tleft:0;\n\t\t\t\t\tz-index: 9999;\n\t\t\t\t\tfont-family: monospace;\n\t\t\t\t\tbackground: rgba(0, 0, 0, 0.8);\n\t\t\t\t\toverflow: hidden;\n\t\t\t\t\tbottom: " + -this._options.height + "px"; // intially hidden
			this.$.container.setAttribute("style", containerStyle);

			this.$.log = document.createElement("div");
			this.$.log.setAttribute("style", "height: " + this._options.height + "px; overflow: hidden");

			var span = document.createElement("span");
			span.style.color = "#afa";
			span.style.fontWeight = "bold";
			var title = "===== " + this._options.name + " - Logger started at " + (this._options.utcTime ? new Date().toUTCString() : new Date()) + " =====";
			span.appendChild(document.createTextNode(title));

			var info = document.createElement('div');
			//info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ")
			info.appendChild(span);

			info.appendChild(document.createElement("br"));
			info.appendChild(document.createElement("br"));

			this.$.container.appendChild(info);
			this.$.container.appendChild(this.$.log);
			document.body.appendChild(this.$.container);
			this.animationFrame = requestAnimationFrame();

			this._setKeyboardEvent();
			this._captureNativeLog();

			this.initialized = true;
			if (show) this.show();
		}
	}, {
		key: "show",
		value: function show() {
			var _this = this;

			if (!this.initialized || this.visible) return;

			this.$.log.style.visibility = "visible";
			var animationTime = Date.now();
			var slideUp = function slideUp() {
				var duration = Date.now() - animationTime;
				if (duration >= _this._options.animationDuration) {
					_this.$.container.style.bottom = 0;
					_this.visible = true;
					return;
				}

				var y = Math.round(-_this._options.height * (1 - 0.5 * (1 - Math.cos(Math.PI * duration / _this._options.animationDuration))));
				_this.$.container.style.bottom = y + "px";
				_this.animationFrame(slideUp);
			};
			this.animationFrame(slideUp);
		}
	}, {
		key: "hide",
		value: function hide() {
			var _this2 = this;

			if (!this.initialized || !this.visible) return;

			var animationTime = Date.now();
			var slideDown = function slideDown() {
				var duration = Date.now() - animationTime;
				if (duration >= _this2._options.animationDuration) {
					_this2.$.container.style.bottom = -_this2._options.height - 58 + "px";
					_this2.$.log.style.visibility = "hidden";
					_this2.visible = false;
					return;
				}
				var y = Math.round(-_this2._options.height * 0.5 * (1 - Math.cos(Math.PI * duration / _this2._options.animationDuration)));
				_this2.$.container.style.bottom = y + "px";
				_this2.animationFrame(slideDown);
			};
			this.animationFrame(slideDown);
		}
	}, {
		key: "toggle",
		value: function toggle() {
			if (this.visible) this.hide();else this.show();
		}
	}, {
		key: "setEnable",
		value: function setEnable() {
			var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			if (!this.initialized) return;

			this._options.enabled = enable;
			this.$.log.style.color = enable ? "#fff" : "#444";
		}
	}, {
		key: "setLevel",
		value: function setLevel(level) {
			this._options.level = level;
		}

		/**
   * Removes all lines from the view 
   * @memberOf HtmlLogger
   */

	}, {
		key: "clean",
		value: function clean() {
			if (!this.initialized) return;

			while (this.$.log.firstChild) {
				this.$.log.removeChild(this.$.log.firstChild);
			}

			this._linesCount = 0;
		}

		/**
   * prints message. default level is [info].
   * @param {String} msg - message to print
   * @param {String} [hexColor=levels.info.color] - hexcolor text
   * @param {String} [level=levels.info.name] - level suffix
   * 
   * @memberOf HtmlLogger
   */

	}, {
		key: "print",
		value: function print(msg) {
			var hexColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : levels.info.color;
			var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : levels.info.name;

			if (!this.initialized || !this._options.enabled) return;

			var message = "";
			if (msg == undefined) message = "undefined";else if (msg == null) message = "null";else message = this._determineString(msg);

			if (!message.length) message = "[empty]";

			var lines = message.split(/\r\n|\r|\n/);
			for (var i = 0; i < lines.length; i++) {
				var timeElement = document.createElement("div");
				timeElement.setAttribute("style", "color:#999;float:left;");
				var time = this._getTime();
				timeElement.appendChild(document.createTextNode(time + "\xA0"));

				if (this.buffer.length >= this._options.bufferSize) this.buffer.shift();
				var messageLine = this._options.loggingFormat.replace("[TIME]", time).replace("[LEVEL]", level).replace("[MESSAGE]", lines[i]); // `${time} ${level} ${lines[i]}`) 
				this.buffer.push(messageLine);
				var msgContainer = document.createElement("div");
				msgContainer.setAttribute("style", "word-wrap:break-word;margin-left:6.0em;color: " + hexColor);
				msgContainer.appendChild(document.createTextNode(messageLine));

				var newLineDiv = document.createElement("div");
				newLineDiv.setAttribute("style", "clear:both;");

				var lineContainer = document.createElement("div");
				lineContainer.appendChild(timeElement);
				lineContainer.appendChild(msgContainer);
				lineContainer.appendChild(newLineDiv);

				this.$.log.appendChild(lineContainer);
				this._linesCount++;

				if (this._linesCount > this._options.maxLogCount) {
					this.$.log.childNodes[0].remove();
				}

				this.$.log.scrollTop = this.$.log.scrollHeight;
			}
		}
	}, {
		key: "getBuffer",
		value: function getBuffer() {
			var buf = this.buffer;
			this.buffer = [];
			return buf;
		}
	}, {
		key: "info",
		value: function info() {
			if (this._options.level <= levels.info.level) this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator));
		}
	}, {
		key: "debug",
		value: function debug() {
			if (this._options.level <= levels.debug.level) this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.debug.color, levels.debug.name);
		}
	}, {
		key: "warning",
		value: function warning() {
			if (this._options.level <= levels.warning.level) this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.warning.color, levels.warning.name);
		}
	}, {
		key: "success",
		value: function success() {
			if (this._options.level <= levels.success.level) this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.success.color, levels.success.name);
		}
	}, {
		key: "error",
		value: function error() {
			if (this._options.level <= levels.fatal.level) this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.fatal.color, levels.fatal.name);
		}
	}, {
		key: "setEnableCaptureNativeLog",
		value: function setEnableCaptureNativeLog(enabled) {
			if (enabled) this._captureNativeLog();else {
				console.log = this._nativeConsole.log;
				console.warn = this._nativeConsole.warn;
				console.error = this._nativeConsole.error;
				this._nativeConsole = null;
			}
		}
	}, {
		key: "_processShortCuts",
		value: function _processShortCuts() {
			var toggleKeys = this._options.shortCuts.toggle.split("+");
			var cleanKeys = this._options.shortCuts.clean.split("+");
			this._shortCuts = {
				toggle: {
					first: toggleKeys[1] ? toggleKeys[0] : null,
					second: toggleKeys[1] || toggleKeys[0]
				},
				clean: {
					first: cleanKeys[1] ? cleanKeys[0] : null,
					second: cleanKeys[1] || cleanKeys[0]
				}
			};

			this._shortCuts.toggle.second = this._shortCuts.toggle.second.toUpperCase();
			this._shortCuts.clean.second = this._shortCuts.clean.second.toUpperCase();
		}
	}, {
		key: "_captureNativeLog",
		value: function _captureNativeLog() {
			var _this3 = this;

			var prefix = "[NATIVE]";
			if (!this._options.captureNative) return;
			if (this._nativeConsole) return;
			this._nativeConsole = {
				log: console.log,
				warn: console.warn,
				error: console.error,
				info: console.info
			};

			console.log = function (args) {
				_this3.debug(prefix, args);
				_this3._nativeConsole.log(args);
			};

			console.info = function (args) {
				_this3.info(prefix, args);
				_this3._nativeConsole.info(args);
			};

			console.warn = function (args) {
				_this3.warning(prefix, args);
				_this3._nativeConsole.warn(args);
			};

			console.error = function (args) {
				_this3.error(prefix, args);
				_this3._nativeConsole.error(args);
			};
		}
	}, {
		key: "_setKeyboardEvent",
		value: function _setKeyboardEvent() {
			this._processShortCuts();
			window.onkeydown = function (e) {
				var toggleCombination = false;
				if (this._shortCuts.toggle.first) {
					switch (this._shortCuts.toggle.first) {
						case "shift":
							toggleCombination = e.shiftKey;
							break;
						case "alt":
							toggleCombination = e.altKey;
							break;
						case "ctrl":
							toggleCombination = e.ctrlKey;
							break;
					}
				} else toggleCombination = true;

				var cleanCombination = false;
				if (this._shortCuts.clean.first) {
					switch (this._shortCuts.clean.first) {
						case "shift":
							cleanCombination = e.shiftKey;
							break;
						case "alt":
							cleanCombination = e.altKey;
							break;
						case "ctrl":
							cleanCombination = e.ctrlKey;
							break;
					}
				} else cleanCombination = true;

				if (e.keyCode == this._shortCuts.toggle.second.charCodeAt(0) && toggleCombination) this.toggle();
				if (e.keyCode == this._shortCuts.clean.second.charCodeAt(0) && cleanCombination) this.clean();
			}.bind(this);
		}
	}, {
		key: "_getTime",
		value: function _getTime() {
			return (this._options.utcTime ? new Date().toUTCString() : new Date().toString()).match(/([01]?[0-9]|2[03]):[0-5][0-9]:[0-5][0-9]/)[0];
		}
	}, {
		key: "_determineString",
		value: function _determineString(object) {
			switch (typeof object === "undefined" ? "undefined" : _typeof(object)) {
				default:
				case "object":
					return object.toString() + " -> " + JSON.stringify(object);
				case "function":
					return object.toString();
				case "number":
				case "string":
					return object;
			}
		}
	}]);

	return HtmlLogger;
}();

exports.default = HtmlLogger;

},{}]},{},[1]);
