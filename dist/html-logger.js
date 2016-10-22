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
	height: 720,
	animationDuration: 200,
	maxLogCount: 40,
	shortCuts: {
		toggle: "T",
		clean: "L"
	}
};

var levels = {
	info: {
		color: "#fff",
		name: "info"
	},
	debug: {
		color: "#3377ff",
		name: "debug"
	},
	error: {
		color: "#FF3E3E",
		name: "error"
	},
	warning: {
		color: "#FFC53E",
		name: "warning"
	},
	success: {
		color: "#3EFF45",
		name: "success"
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
		this.initialized = false;
	}

	_createClass(HtmlLogger, [{
		key: "init",
		value: function init() {
			var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

			if (this.$.container) return true;
			if (!document || !document.createElement || !document.body || !document.body.appendChild) throw new Error("HtmlLogger not initialized");

			this.$.container = document.createElement("div");
			var containerStyle = "width:100%; height: " + this._options.height + "px;\n                   margin:0; padding:0;\n                   position:fixed;\n                   left:0;\n                   z-index: 9999;\n\t\t\t\t\t\t\t\t\t font-family: monospace;\n\t\t\t\t\t\t\t\t\t bottom: " + -this._options.height + "px"; // intially hidden
			this.$.container.setAttribute("style", containerStyle);

			this.$.log = document.createElement("div");
			this.$.log.setAttribute("style", "height: " + this._options.height + "px; background:rgba(0, 0, 0, 0.8);");

			var span = document.createElement("span");
			span.style.color = "#afa";
			span.style.fontWeight = "bold";
			var title = "===== " + this._options.name + " Logger started at " + new Date() + " =====";
			span.appendChild(document.createTextNode(title));

			var info = document.createElement('div');
			info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ");
			info.appendChild(span);

			var imgStyle = "width:20px; cursor: pointer; position: absolute; margin: 4px;";
			var closeSvg = new DOMParser().parseFromString(icons.close, 'application/xml');
			var close = info.ownerDocument.importNode(closeSvg.documentElement, true);
			close.setAttribute("style", imgStyle + " right:0;");
			close.onclick = this.hide.bind(this);
			info.appendChild(close);

			var cleanSvg = new DOMParser().parseFromString(icons.clean, 'application/xml');
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
					_this2.$.container.style.bottom = -_this2._options.height + "px";
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
		key: "clean",
		value: function clean() {
			if (!this.initialized) return;

			while (this.$.log.firstChild) {
				this.$.log.removeChild(this.$.log.firstChild);
			}

			this._linesCount = 0;
		}
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
				var time = document.createElement("div");
				time.setAttribute("style", "color:#999;float:left;");
				time.appendChild(document.createTextNode(this._getTime() + "\xA0"));

				var msgContainer = document.createElement("div");
				msgContainer.setAttribute("style", "word-wrap:break-word;margin-left:6.0em;color: " + hexColor);
				msgContainer.appendChild(document.createTextNode("[" + level + "] " + lines[i].replace(/ /g, "\xA0")));

				var newLineDiv = document.createElement("div");
				newLineDiv.setAttribute("style", "clear:both;");

				var lineContainer = document.createElement("div");
				lineContainer.appendChild(time);
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
		key: "info",
		value: function info() {
			this.print([].map.call(arguments, this._determineString).join(", "));
		}
	}, {
		key: "debug",
		value: function debug() {
			this.print([].map.call(arguments, this._determineString).join(", "), levels.debug.color, levels.debug.name);
		}
	}, {
		key: "warning",
		value: function warning() {
			this.print([].map.call(arguments, this._determineString).join(", "), levels.warning.color, levels.warning.name);
		}
	}, {
		key: "success",
		value: function success() {
			this.print([].map.call(arguments, this._determineString).join(", "), levels.success.color, levels.success.name);
		}
	}, {
		key: "error",
		value: function error() {
			this.print([].map.call(arguments, this._determineString).join(", "), levels.error.color, levels.error.name);
		}
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
	}]);

	return HtmlLogger;
}();

exports.default = HtmlLogger;