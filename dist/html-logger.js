"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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
    color: "#fff",
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
  captureNative: false,
  // captures logs from web kit
  bufferSize: 100,
  // keep 100 lines in memory
  loggingFormat: "[LEVEL] [MESSAGE]",
  argumentsSeparator: " ",
  utcTime: false,
  level: 0,
  showLogScroll: true
}; // Babel.io Object.assign

var _extend = function _extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });
  return target;
};

var HtmlLogger = /*#__PURE__*/function () {
  function HtmlLogger(options) {
    _classCallCheck(this, HtmlLogger);

    this.options = _extend({}, defaultOptions, options || {});
    this.options.height += 48;
    this.linesCount = 0;
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
      var containerStyle = "width:100%; height: ".concat(this.options.height, "px;\n\t\t\t\t\tmargin:0; padding: 6px;\n\t\t\t\t\tposition:fixed;\n\t\t\t\t\tleft:0;\n\t\t\t\t\tz-index: 9999;\n\t\t\t\t\tfont-family: monospace;\n\t\t\t\t\tbackground: rgba(0, 0, 0, 0.8);\n\t\t\t\t\toverflow: hidden;\n\t\t\t\t\tbottom: ").concat(-this.options.height, "px"); // intially hidden

      this.$.container.setAttribute("style", containerStyle);
      this.$.log = document.createElement("div");
      this.$.log.setAttribute("style", "height: ".concat(this.options.height - 48, "px; overflow: hidden; overflow-y: ").concat(this.options.showLogScroll == true ? 'scroll' : 'hidden'));
      var span = document.createElement("span");
      span.style.color = "#afa";
      span.style.fontWeight = "bold";
      var title = "===== ".concat(this.options.name, " - Logger started at ").concat(this.options.utcTime ? new Date().toUTCString() : new Date(), " =====");
      span.appendChild(document.createTextNode(title));
      var info = document.createElement('div'); //info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ")

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
    key: "setLevel",
    value: function setLevel(level) {
      this.options.level = level;
    }
    /**
     * Removes all lines from the view 
     * @memberOf HtmlLogger
     */

  }, {
    key: "show",
    value: function show() {
      var _this = this;

      if (!this.initialized || this.visible) return;
      this.$.log.style.visibility = "visible";
      var animationTime = Date.now();

      var slideUp = function slideUp() {
        var duration = Date.now() - animationTime;

        if (duration >= _this.options.animationDuration) {
          _this.$.container.style.bottom = 0;
          _this.visible = true;
          return;
        }

        var y = Math.round(-_this.options.height * (1 - 0.5 * (1 - Math.cos(Math.PI * duration / _this.options.animationDuration))));
        _this.$.container.style.bottom = "".concat(y, "px");

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

        if (duration >= _this2.options.animationDuration) {
          _this2.$.container.style.bottom = "".concat(-_this2.options.height - 58, "px");
          _this2.$.log.style.visibility = "hidden";
          _this2.visible = false;
          return;
        }

        var y = Math.round(-_this2.options.height * 0.5 * (1 - Math.cos(Math.PI * duration / _this2.options.animationDuration)));
        _this2.$.container.style.bottom = "".concat(y, "px");

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
      this.options.enabled = enable;
      this.$.log.style.color = enable ? "#fff" : "#444";
    }
  }, {
    key: "clean",
    value: function clean() {
      if (!this.initialized) return;

      while (this.$.log.firstChild) {
        this.$.log.removeChild(this.$.log.firstChild);
      }

      this.linesCount = 0;
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
      if (!this.initialized || !this.options.enabled) return;
      var message = msg.length ? msg : "[empty]";
      var lines = message.split(/\r\n|\r|\n/);

      for (var i = 0; i < lines.length; i++) {
        var timeElement = document.createElement("div");
        timeElement.setAttribute("style", "color:#999;float:left;");

        var time = this._getTime();

        timeElement.appendChild(document.createTextNode("".concat(time, "\xA0")));
        if (this.buffer.length >= this.options.bufferSize) this.buffer.shift();
        var messageLine = this.options.loggingFormat.replace("[LEVEL]", level).replace("[MESSAGE]", lines[i]); // `${time} ${level} ${lines[i]}`) 

        this.buffer.push("".concat(time, " ").concat(messageLine));
        var msgContainer = document.createElement("div");
        msgContainer.setAttribute("style", "word-wrap:break-word;margin-left:6.0em;color: ".concat(hexColor));
        msgContainer.appendChild(document.createTextNode(messageLine));
        var newLineDiv = document.createElement("div");
        newLineDiv.setAttribute("style", "clear:both;");
        var lineContainer = document.createElement("div");
        lineContainer.appendChild(timeElement);
        lineContainer.appendChild(msgContainer);
        lineContainer.appendChild(newLineDiv);
        this.$.log.appendChild(lineContainer);
        this.linesCount++;

        if (this.linesCount > this.options.maxLogCount) {
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
      if (this.options.level <= levels.info.level) this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator));
    }
  }, {
    key: "debug",
    value: function debug() {
      if (this.options.level <= levels.debug.level) this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.debug.color, levels.debug.name);
    }
  }, {
    key: "warning",
    value: function warning() {
      if (this.options.level <= levels.warning.level) this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.warning.color, levels.warning.name);
    }
  }, {
    key: "success",
    value: function success() {
      if (this.options.level <= levels.success.level) this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.success.color, levels.success.name);
    }
  }, {
    key: "error",
    value: function error() {
      if (this.options.level <= levels.fatal.level) this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.fatal.color, levels.fatal.name);
    }
  }, {
    key: "setEnableCaptureNativeLog",
    value: function setEnableCaptureNativeLog(enabled) {
      if (enabled) this._captureNativeLog();else {
        console.log = this._nativeConsole.log;
        console.warn = this._nativeConsole.warn;
        console.error = this._nativeConsole.error;
        console.info = this._nativeConsole.error;
        this._nativeConsole = null;
      }
    }
  }, {
    key: "_processShortCuts",
    value: function _processShortCuts() {
      var toggleKeys = this.options.shortCuts.toggle.split("+");
      var cleanKeys = this.options.shortCuts.clean.split("+");
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
      if (!this.options.captureNative) return;
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

      console.info = function (args) {
        _this3.info(prefix, args);

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
      return (this.options.utcTime ? new Date().toUTCString() : new Date().toString()).match(/([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/)[0];
    }
  }, {
    key: "_determineString",
    value: function _determineString(object) {
      if (object === undefined) return "undefined";
      if (object === null) return "null";

      switch (_typeof(object)) {
        default:
        case "object":
          return "".concat(object.constructor ? object.constructor.name : object.toString(), " -> ").concat(JSON.stringify(object));

        case "function":
          return object.name || '[function]';

        case "number":
        case "string":
          return object;
      }
    }
  }]);

  return HtmlLogger;
}();

exports["default"] = HtmlLogger;