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

var defaultOptions = {
	name: "Html Logger",
	enabled: true,
	height: 420,
	animationDuration: 200,
	maxLogCount: 40,
	shortCuts: {
		toggle: "T",
		clean: "L"
	},
	captureWebKit: false, // captures logs from web kit
	bufferSize: 2, // 50 lines in buffer
	loggingFormat: "$TIME$ $LEVEL$ $MESSAGE$",
	loggingLevel: 1,
	argumentsSeparator: " "
};

var levels = {
	info: {
		color: "#fff",
		name: "INFO"
	},
	debug: {
		color: "#3377ff",
		name: "DEBUG"
	},
	error: {
		color: "#FF3E3E",
		name: "ERROR"
	},
	warning: {
		color: "#FFC53E",
		name: "WARNING"
	},
	success: {
		color: "#3EFF45",
		name: "SUCCESS"
	}
};
/**
 * VS Code icons extracted from github repository. kill.svg and arrow_down.svg
*/
var icons = {
	clean: "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 16 16\" style=\"enable-background:new 0 0 16 16;\" xml:space=\"preserve\">\n\t\t\t\t\t\t<path fill=\"#C5C5C5\" d=\"M10,3V2c0-0.6-0.4-1-1-1H6C5.4,1,5,1.4,5,2v1H2v1h1v10c0,0.6,0.4,1,1,1h7c0.6,0,1-0.4,1-1V4h1V3H10z M6,12H5V6 h1V12z M6,2h3v1H6V2z M8,12H7V6h1V12z M10,12H9V6h1V12z\"/>\n\t\t\t\t\t</svg>",
	close: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 11 11\">\n\t\t\t\t\t\t<path transform=\"rotate(-180 5.49045991897583,5.811500072479248)\" fill=\"#E8E8E8\" d=\"m9.48046,8.9615l1.26,-1.26l-5.04,-5.04l-5.46,5.04l1.26,1.26l4.2,-3.78l3.78,3.78z\"/>\n\t\t\t\t  </svg>"
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
			var _this = this;

			var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.initialized) return;
			if (!document || !document.createElement || !document.body || !document.body.appendChild) throw new Error("HtmlLogger not initialized");

			this.$.container = document.createElement("div");
			var containerStyle = "width:100%; height: " + this._options.height + "px;\n\t\t\t\t\tmargin:0; padding: 4px 0 0 4px;\n\t\t\t\t\tposition:fixed;\n\t\t\t\t\tleft:0;\n\t\t\t\t\tz-index: 9999;\n\t\t\t\t\tfont-family: monospace;\n\t\t\t\t\tbackground: rgba(0, 0, 0, 0.8);\n\t\t\t\t\tbottom: " + -this._options.height + "px"; // intially hidden
			this.$.container.setAttribute("style", containerStyle);

			this.$.log = document.createElement("div");
			this.$.log.setAttribute("style", "height: " + this._options.height + "px;");

			var span = document.createElement("span");
			span.style.color = "#afa";
			span.style.fontWeight = "bold";
			var title = "===== " + this._options.name + " - Logger started at " + new Date() + " =====";
			span.appendChild(document.createTextNode(title));

			var info = document.createElement('div');
			//info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ")
			info.appendChild(span);

			var domParser = new DOMParser();
			var imgStyle = "width:20px; cursor: pointer; position: absolute; margin: 4px;";
			var closeSvg = domParser.parseFromString(icons.close, 'application/xml');
			var close = info.ownerDocument.importNode(closeSvg.documentElement, true);
			close.setAttribute("style", imgStyle + " right:0;");
			close.onclick = this.hide.bind(this);
			info.appendChild(close);

			var cleanSvg = domParser.parseFromString(icons.clean, 'application/xml');
			var clean = info.ownerDocument.importNode(cleanSvg.documentElement, true);
			clean.setAttribute("style", imgStyle + " right:32px;");
			clean.onclick = this.clean.bind(this);
			info.appendChild(clean);

			info.appendChild(document.createElement("br"));
			info.appendChild(document.createElement("br"));

			this.$.container.appendChild(info);
			this.$.container.appendChild(this.$.log);
			document.body.appendChild(this.$.container);
			this.animationFrame = requestAnimationFrame();

			if (this._options.captureWebKit) {
				(function () {
					var webkitConsole = {
						log: console.log,
						warn: console.warn,
						error: console.error
					};

					console.log = function (args) {
						_this.info("[native]", args);
						webkitConsole.log(args);
					};

					console.error = function (args) {
						_this.error("[native]", args);
						webkitConsole.error(args);
					};
				})();
			}

			this.initialized = true;

			window.onkeydown = function (e) {
				if (e.keyCode == this._options.shortCuts.toggle.toUpperCase().charCodeAt(0) && e.ctrlKey) this.toggle();
				if (e.keyCode == this._options.shortCuts.clean.toUpperCase().charCodeAt(0) && e.ctrlKey) this.clean();
			}.bind(this);

			if (show) this.show();
		}
	}, {
		key: "show",
		value: function show() {
			var _this2 = this;

			if (!this.initialized || this.visible) return;

			this.$.log.style.visibility = "visible";
			var animationTime = Date.now();
			var slideUp = function slideUp() {
				var duration = Date.now() - animationTime;
				if (duration >= _this2._options.animationDuration) {
					_this2.$.container.style.bottom = 0;
					_this2.visible = true;
					return;
				}

				var y = Math.round(-_this2._options.height * (1 - 0.5 * (1 - Math.cos(Math.PI * duration / _this2._options.animationDuration))));
				_this2.$.container.style.bottom = y + "px";
				_this2.animationFrame(slideUp);
			};
			this.animationFrame(slideUp);
		}
	}, {
		key: "hide",
		value: function hide() {
			var _this3 = this;

			if (!this.initialized || !this.visible) return;

			var animationTime = Date.now();
			var slideDown = function slideDown() {
				var duration = Date.now() - animationTime;
				if (duration >= _this3._options.animationDuration) {
					_this3.$.container.style.bottom = -_this3._options.height + "px";
					_this3.$.log.style.visibility = "hidden";
					_this3.visible = false;
					return;
				}
				var y = Math.round(-_this3._options.height * 0.5 * (1 - Math.cos(Math.PI * duration / _this3._options.animationDuration)));
				_this3.$.container.style.bottom = y + "px";
				_this3.animationFrame(slideDown);
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
		key: "clean",
		value: function clean() {
			if (!this.initialized) return;

			while (this.$.log.firstChild) {
				this.$.log.removeChild(this.$.log.firstChild);
			}

			this._linesCount = 0;
			this.buffer = [];
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
				this.buffer.push(time + " " + level + " " + lines[i]);
				var msgContainer = document.createElement("div");
				msgContainer.setAttribute("style", "word-wrap:break-word;margin-left:6.0em;color: " + hexColor);
				msgContainer.appendChild(document.createTextNode(level + " " + lines[i].replace(/ /g, "\xA0")));

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

		// <levels>

	}, {
		key: "info",
		value: function info() {
			this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator));
		}
	}, {
		key: "debug",
		value: function debug() {
			this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.debug.color, levels.debug.name);
		}
	}, {
		key: "warning",
		value: function warning() {
			this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.warning.color, levels.warning.name);
		}
	}, {
		key: "success",
		value: function success() {
			this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.success.color, levels.success.name);
		}
	}, {
		key: "error",
		value: function error() {
			this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.error.color, levels.error.name);
		}
		// </levels>

	}, {
		key: "_getTime",
		value: function _getTime() {
			var now = new Date();
			var hours = "0" + now.getHours();
			hours = hours.substring(hours.length - 2);
			var minutes = "0" + now.getMinutes();
			minutes = minutes.substring(minutes.length - 2);
			var seconds = "0" + now.getSeconds();
			seconds = seconds.substring(seconds.length - 2);
			return hours + ":" + minutes + ":" + seconds;
		}
	}, {
		key: "_determineString",
		value: function _determineString(object) {
			switch (typeof object === "undefined" ? "undefined" : _typeof(object)) {
				default:
				case "object":
					return JSON.stringify(object);
				case "function":
					return object.toString();
				case "number":
				case "string":
					return object;
			}
		}
	}, {
		key: "bufferSize",
		get: function get() {
			return this.buffer.length;
		}
	}]);

	return HtmlLogger;
}();

exports.default = HtmlLogger;