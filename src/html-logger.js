const requestAnimationFrame = (frameTime = 16) => {
	const animationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame

	if (animationFrame) return function (callback) { return animationFrame(callback) }
	else return function (callback) { return setTimeout(callback, frameTime) }
}

const defaultOptions = {
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
}

const levels = {
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
}
/**
 * VS Code icons extracted from github repository. kill.svg and arrow_down.svg
*/
const icons = {
	clean: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve">
						<path fill="#C5C5C5" d="M10,3V2c0-0.6-0.4-1-1-1H6C5.4,1,5,1.4,5,2v1H2v1h1v10c0,0.6,0.4,1,1,1h7c0.6,0,1-0.4,1-1V4h1V3H10z M6,12H5V6 h1V12z M6,2h3v1H6V2z M8,12H7V6h1V12z M10,12H9V6h1V12z"/>
					</svg>`,
	close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">
						<path transform="rotate(-180 5.49045991897583,5.811500072479248)" fill="#E8E8E8" d="m9.48046,8.9615l1.26,-1.26l-5.04,-5.04l-5.46,5.04l1.26,1.26l4.2,-3.78l3.78,3.78z"/>
				  </svg>`
}

export default class HtmlLogger {
	constructor(options) {
		this._options = Object.assign({}, defaultOptions, options || {})
		this._linesCount = 0
		this.$ = {}
		this.buffer = []
		this.initialized = false
	}

	init(show = false) {
		if (this.initialized) return
		if (!document || !document.createElement || !document.body || !document.body.appendChild)
			throw new Error("HtmlLogger not initialized")

		this.$.container = document.createElement("div")
		const containerStyle = `width:100%; height: ${this._options.height}px;
					margin:0; padding: 4px 0 0 4px;
					position:fixed;
					left:0;
					z-index: 9999;
					font-family: monospace;
					background: rgba(0, 0, 0, 0.8);
					bottom: ${-this._options.height}px` // intially hidden
		this.$.container.setAttribute("style", containerStyle)

		this.$.log = document.createElement("div")
		this.$.log.setAttribute("style", `height: ${this._options.height}px;`)

		const span = document.createElement("span")
		span.style.color = "#afa"
		span.style.fontWeight = "bold"
		const title = `===== ${this._options.name} - Logger started at ${new Date()} =====`
		span.appendChild(document.createTextNode(title))

		const info = document.createElement('div')
		//info.setAttribute('style', "background:rgba(0, 0, 0, 0.8) ")
		info.appendChild(span)


		const domParser = new DOMParser()
		const imgStyle = `width:20px; cursor: pointer; position: absolute; margin: 4px;`
		const closeSvg = domParser.parseFromString(icons.close, 'application/xml')
		const close = info.ownerDocument.importNode(closeSvg.documentElement, true)
		close.setAttribute("style", `${imgStyle} right:0;`)
		close.onclick = this.hide.bind(this)
		info.appendChild(close)

		const cleanSvg = domParser.parseFromString(icons.clean, 'application/xml')
		const clean = info.ownerDocument.importNode(cleanSvg.documentElement, true)
		clean.setAttribute("style", `${imgStyle} right:32px;`)
		clean.onclick = this.clean.bind(this)
		info.appendChild(clean)

		info.appendChild(document.createElement("br"))
		info.appendChild(document.createElement("br"))

		this.$.container.appendChild(info)
		this.$.container.appendChild(this.$.log)
		document.body.appendChild(this.$.container)
		this.animationFrame = requestAnimationFrame()

		if (this._options.captureWebKit) {
			const webkitConsole = {
				log: console.log,
				warn: console.warn,
				error: console.error
			}

			console.log = (args) => {
				this.info("[native]", args)
				webkitConsole.log(args)				
			}

			console.error = (args) => {
				this.error("[native]", args)
				webkitConsole.error(args)
			}
		}

		this.initialized = true

		window.onkeydown = (function (e) {
			if (e.keyCode == this._options.shortCuts.toggle.toUpperCase().charCodeAt(0) && e.ctrlKey) this.toggle()
			if (e.keyCode == this._options.shortCuts.clean.toUpperCase().charCodeAt(0) && e.ctrlKey) this.clean()
		}).bind(this)

		if (show) this.show()
	}

	show() {
		if (!this.initialized || this.visible) return

		this.$.log.style.visibility = "visible"
		let animationTime = Date.now()
		const slideUp = () => {
			const duration = Date.now() - animationTime
			if (duration >= this._options.animationDuration) {
				this.$.container.style.bottom = 0
				this.visible = true
				return
			}

			const y = Math.round(-this._options.height * (1 - 0.5 * (1 - Math.cos(Math.PI * duration / this._options.animationDuration))))
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
			if (duration >= this._options.animationDuration) {
				this.$.container.style.bottom = `${-this._options.height}px`
				this.$.log.style.visibility = "hidden"
				this.visible = false
				return
			}
			const y = Math.round(-this._options.height * 0.5 * (1 - Math.cos(Math.PI * duration / this._options.animationDuration)))
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

		this._options.enabled = enable
		this.$.log.style.color = enable ? "#fff" : "#444"
	}

	clean() {
		if (!this.initialized) return

		while (this.$.log.firstChild) {
			this.$.log.removeChild(this.$.log.firstChild);
		}

		this._linesCount = 0
		this.buffer = []
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
		if (!this.initialized || !this._options.enabled) return

		let message = ""
		if (msg == undefined) message = "undefined"
		else if (msg == null) message = "null"
		else message = this._determineString(msg)

		if (!message.length) message = "[empty]"

		const lines = message.split(/\r\n|\r|\n/)
		for (let i = 0; i < lines.length; i++) {
			let timeElement = document.createElement("div")
			timeElement.setAttribute("style", "color:#999;float:left;")
			let time = this._getTime()
			timeElement.appendChild(document.createTextNode(`${time}\u00a0`))

			if (this.buffer.length >= this._options.bufferSize) this.buffer.shift()
			this.buffer.push(`${time} ${level} ${lines[i]}`)
			let msgContainer = document.createElement("div")
			msgContainer.setAttribute("style", `word-wrap:break-word;margin-left:6.0em;color: ${hexColor}`)
			msgContainer.appendChild(document.createTextNode(`${level} ${lines[i].replace(/ /g, "\u00a0")}`))

			let newLineDiv = document.createElement("div")
			newLineDiv.setAttribute("style", "clear:both;")

			var lineContainer = document.createElement("div")
			lineContainer.appendChild(timeElement)
			lineContainer.appendChild(msgContainer)
			lineContainer.appendChild(newLineDiv)

			this.$.log.appendChild(lineContainer)
			this._linesCount++

			if (this._linesCount > this._options.maxLogCount) {
				this.$.log.childNodes[0].remove()
			}
			this.$.log.scrollTop = this.$.log.scrollHeight
		}

	}

	get bufferSize() {
		return this.buffer.length
	}

	getBuffer() {
		const buf = this.buffer
		this.buffer = []
		return buf
	}

	// <levels>
	info() {
		this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator))
	}

	debug() {
		this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.debug.color, levels.debug.name)
	}

	warning() {
		this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.warning.color, levels.warning.name)
	}

	success() {
		this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.success.color, levels.success.name)
	}

	error() {
		this.print([].map.call(arguments, this._determineString).join(this._options.argumentsSeparator), levels.error.color, levels.error.name)
	}
	// </levels>
	_getTime() {
		let now = new Date()
		let hours = "0" + now.getHours()
		hours = hours.substring(hours.length - 2)
		let minutes = "0" + now.getMinutes()
		minutes = minutes.substring(minutes.length - 2)
		let seconds = "0" + now.getSeconds()
		seconds = seconds.substring(seconds.length - 2)
		return `${hours}:${minutes}:${seconds}`
	}

	_determineString(object) {
		switch (typeof object) {
			default:
			case "object": return JSON.stringify(object)
			case "function": return object.toString()
			case "number":
			case "string": return object
		}
	}

}