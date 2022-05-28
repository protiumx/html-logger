const requestAnimationFrame = (frameTime = 16) => {
	const animationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame

	if (animationFrame) return function (callback) { return animationFrame(callback) }
	else return function (callback) { return setTimeout(callback, frameTime) }
}

const shortCutsKeys = ["shift", "alt", "ctrl"]

const levels = {
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
}

const defaultOptions = {
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
	loggingFormat: "[LEVEL] [MESSAGE]",
	argumentsSeparator: " ",
	utcTime: false,
	level: 0,
	showLogScroll: true
}

// Babel.io Object.assign
var _extend = function _extend(target) {
	var sources = [].slice.call(arguments, 1);

	sources.forEach(function (source) {
		for (var prop in source) {
			target[prop] = source[prop];
		}
	});

	return target;
};

export default class HtmlLogger {
	constructor(options) {
		this.options = _extend({}, defaultOptions, options || {})
		this.options.height += 48
		this.linesCount = 0
		this.$ = {}
		this.buffer = []
		this.initialized = false
	}

	init(show = false) {
		if (this.initialized) return
		if (!document || !document.createElement || !document.body || !document.body.appendChild)
			throw new Error("HtmlLogger not initialized")

		this.$.container = document.createElement("div")
		const containerStyle = `width:100%; height: ${this.options.height}px;
					margin:0; padding: 6px;
					position:fixed;
					left:0;
					z-index: 9999;
					font-family: monospace;
					background: rgba(0, 0, 0, 0.8);
					overflow: hidden;
					bottom: ${-this.options.height}px` // intially hidden
		this.$.container.setAttribute("style", containerStyle)

		this.$.log = document.createElement("div")
		this.$.log.setAttribute("style", `height: ${this.options.height - 48}px; overflow: hidden; overflow-y: ${(this.options.showLogScroll == true) ? 'scroll': 'hidden'}`)

		const span = document.createElement("span")
		span.style.color = "#afa"
		span.style.fontWeight = "bold"
		const title = `===== ${this.options.name} - Logger started at ${this.options.utcTime ? new Date().toUTCString() : new Date()} =====`
		span.appendChild(document.createTextNode(title))

		const info = document.createElement('div')
		//info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ")
		info.appendChild(span)


		info.appendChild(document.createElement("br"))
		info.appendChild(document.createElement("br"))

		this.$.container.appendChild(info)
		this.$.container.appendChild(this.$.log)
		document.body.appendChild(this.$.container)
		this.animationFrame = requestAnimationFrame()

		this._setKeyboardEvent()
		this._captureNativeLog()

		this.initialized = true
		if (show) this.show()
	}

	setLevel(level) {
		this.options.level = level
	}

	show() {
		if (!this.initialized || this.visible) return

		this.$.log.style.visibility = "visible"
		let animationTime = Date.now()
		const slideUp = () => {
			const duration = Date.now() - animationTime
			if (duration >= this.options.animationDuration) {
				this.$.container.style.bottom = 0
				this.visible = true
				return
			}

			const y = Math.round(-this.options.height * (1 - 0.5 * (1 - Math.cos(Math.PI * duration / this.options.animationDuration))))
			this.$.container.style.bottom = `${y}px`
			this.animationFrame(slideUp)
		}
		this.animationFrame(slideUp)
	}

	hide() {
		if (!this.initialized || !this.visible) return

		let animationTime = Date.now()
		const slideDown = () => {
			const duration = Date.now() - animationTime
			if (duration >= this.options.animationDuration) {
				this.$.container.style.bottom = `${-this.options.height - 58}px`
				this.$.log.style.visibility = "hidden"
				this.visible = false
				return
			}
			const y = Math.round((-this.options.height) * 0.5 * (1 - Math.cos(Math.PI * duration / this.options.animationDuration)))
			this.$.container.style.bottom = `${y}px`
			this.animationFrame(slideDown)
		}
		this.animationFrame(slideDown)
	}

	toggle() {
		if (this.visible) this.hide()
		else this.show()
	}

	setEnable(enable = true) {
		if (!this.initialized) return

		this.options.enabled = enable
		this.$.log.style.color = enable ? "#fff" : "#444"
	}

	setLevel(level) {
		this.options.level = level
	}

	/**
	 * Removes all lines from the view 
	 * @memberOf HtmlLogger
	 */
	clean() {
		if (!this.initialized) return

		while (this.$.log.firstChild) {
			this.$.log.removeChild(this.$.log.firstChild);
		}

		this.linesCount = 0
	}


	/**
	 * prints message. default level is [info].
	 * @param {String} msg - message to print
	 * @param {String} [hexColor=levels.info.color] - hexcolor text
	 * @param {String} [level=levels.info.name] - level suffix
	 * 
	 * @memberOf HtmlLogger
	 */
	print(msg, hexColor = levels.info.color, level = levels.info.name) {
		if (!this.initialized || !this.options.enabled) return

		let message = msg.length ? msg : "[empty]"

		const lines = message.split(/\r\n|\r|\n/)
		for (let i = 0; i < lines.length; i++) {
			let timeElement = document.createElement("div")
			timeElement.setAttribute("style", "color:#999;float:left;")
			let time = this._getTime()
			timeElement.appendChild(document.createTextNode(`${time}\u00a0`))

			if (this.buffer.length >= this.options.bufferSize) this.buffer.shift()
			let messageLine = this.options.loggingFormat
				.replace("[LEVEL]", level)
				.replace("[MESSAGE]", lines[i])// `${time} ${level} ${lines[i]}`) 
			this.buffer.push(`${time} ${messageLine}`)
			let msgContainer = document.createElement("div")
			msgContainer.setAttribute("style", `word-wrap:break-word;margin-left:6.0em;color: ${hexColor}`)
			msgContainer.appendChild(document.createTextNode(messageLine))

			let newLineDiv = document.createElement("div")
			newLineDiv.setAttribute("style", "clear:both;")

			var lineContainer = document.createElement("div")
			lineContainer.appendChild(timeElement)
			lineContainer.appendChild(msgContainer)
			lineContainer.appendChild(newLineDiv)

			this.$.log.appendChild(lineContainer)
			this.linesCount++

			if (this.linesCount > this.options.maxLogCount) {
				this.$.log.childNodes[0].remove()
			}

			this.$.log.scrollTop = this.$.log.scrollHeight
		}

	}

	getBuffer() {
		const buf = this.buffer
		this.buffer = []
		return buf
	}

	info() {
		if (this.options.level <= levels.info.level)
			this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator))
	}

	debug() {
		if (this.options.level <= levels.debug.level)
			this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.debug.color, levels.debug.name)
	}

	warning() {
		if (this.options.level <= levels.warning.level)
			this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.warning.color, levels.warning.name)
	}

	success() {
		if (this.options.level <= levels.success.level)
			this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.success.color, levels.success.name)
	}

	error() {
		if (this.options.level <= levels.fatal.level)
			this.print([].map.call(arguments, this._determineString).join(this.options.argumentsSeparator), levels.fatal.color, levels.fatal.name)
	}

	setEnableCaptureNativeLog(enabled) {
		if (enabled) this._captureNativeLog()
		else {
			console.log = this._nativeConsole.log
			console.warn = this._nativeConsole.warn
			console.error = this._nativeConsole.error
			console.info = this._nativeConsole.error
			this._nativeConsole = null
		}
	}

	_processShortCuts() {
		const toggleKeys = this.options.shortCuts.toggle.split("+")
		const cleanKeys = this.options.shortCuts.clean.split("+")
		this._shortCuts = {
			toggle: {
				first: toggleKeys[1] ? toggleKeys[0] : null,
				second: toggleKeys[1] || toggleKeys[0]
			},
			clean: {
				first: cleanKeys[1] ? cleanKeys[0] : null,
				second: cleanKeys[1] || cleanKeys[0]
			}
		}

		this._shortCuts.toggle.second = this._shortCuts.toggle.second.toUpperCase()
		this._shortCuts.clean.second = this._shortCuts.clean.second.toUpperCase()
	}

	_captureNativeLog() {
		const prefix = "[NATIVE]"
		if (!this.options.captureNative) return
		if (this._nativeConsole) return
		this._nativeConsole = {
			log: console.log,
			warn: console.warn,
			error: console.error,
			info: console.info
		}

		console.log = (args) => {
			this.debug(prefix, args)
			this._nativeConsole.log(args)
		}

		console.info = (args) => {
			this.info(prefix, args)
			this._nativeConsole.info(args)
		}

		console.warn = (args) => {
			this.warning(prefix, args)
			this._nativeConsole.warn(args)
		}

		console.error = (args) => {
			this.error(prefix, args)
			this._nativeConsole.error(args)
		}

		console.info = (args) => {
			this.info(prefix, args)
			this._nativeConsole.error(args)
		}
	}

	_setKeyboardEvent() {
		this._processShortCuts()
		window.onkeydown = (function (e) {
			let toggleCombination = false
			if (this._shortCuts.toggle.first) {
				switch (this._shortCuts.toggle.first) {
					case "shift":
						toggleCombination = e.shiftKey
						break;
					case "alt":
						toggleCombination = e.altKey
						break;
					case "ctrl":
						toggleCombination = e.ctrlKey
						break;
				}
			} else toggleCombination = true

			let cleanCombination = false
			if (this._shortCuts.clean.first) {
				switch (this._shortCuts.clean.first) {
					case "shift":
						cleanCombination = e.shiftKey
						break;
					case "alt":
						cleanCombination = e.altKey
						break;
					case "ctrl":
						cleanCombination = e.ctrlKey
						break;
				}
			} else cleanCombination = true

			if (e.keyCode == this._shortCuts.toggle.second.charCodeAt(0) && toggleCombination) this.toggle()
			if (e.keyCode == this._shortCuts.clean.second.charCodeAt(0) && cleanCombination) this.clean()
		}).bind(this)
	}

	_getTime() {
		return (this.options.utcTime ? new Date().toUTCString() : new Date().toString()).match(/([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/)[0]
	}

	_determineString(object) {
		if (object === undefined) return "undefined"
		if (object === null) return "null"
		switch (typeof object) {
			default:
			case "object": return `${object.constructor ? object.constructor.name : object.toString()} -> ${JSON.stringify(object)}`
			case "function": return object.name || '[function]'
			case "number":
			case "string": return object
		}
	}

}