
html-logger
===========
simple html logger that appends it self to a page's body. based on [http://www.songho.ca/misc/logger/files/Logger.js](http://www.songho.ca/misc/logger/files/Logger.js).
written with ES6 syntax and transpiled with **babel.io**

![demo](https://github.com/b1tdust/html-logger/blob/master/demo/demo.gif?raw=true)

this logger is usefull when you have to debug on enviroments without web-tools

current release: [v0.1.2](https://github.com/b1tdust/html-logger/releases/tag/v0.1.2)

install
=======
## npm
```
npm install html-logger
```

```
bower i html-logger
```

usage
=====
## html
add the script refence to **dist/html-logger.bundle.js** and initialize the logger
```js
let logger = new HtmlLogger({name: "Test App"})
logger.init(true) // appends the logger
logger.debug({object: 1})
console.log({obj: ""}) // works with `captureNative` option
```

## node | electron.io
```js
// preload.js
import HtmlLogger from 'html-logger'
window.onload = () => {
    const logger = new HtmlLogger({name: "Test App"})
    logger.init(true)
    global.logger = logger
}
```

the logger toggles by default with `shift+t` keys combination

features
========
* Log levels: info, success, warning, error, debug
* Prints strings, objects and functions
* Log all the arguments. Example: `logger.info("test", { test: true}, "test2")`
* Captures `window.console` messages.

api
===
## options
* `name`: [string] the app name to show on the logger title. **default** `Html Logger`
* `enabled`: [boolean] indicates if logger is enabled. logger prints only when it is enabled. **default** `true`
* `height`: [number] indicates the logger container height. **default** `420`
* `animationDuration`: [number] the animation durations in milli seconds. **default** `200`
* `maxLogCount`: [number] the maximun number of lines to persist in the logger view. **default** `40`.
* `shortcuts`: [object] ctrl/command shortcuts
    * `toggle`: [char] toggles the logger. **default** `shift+T`
    * `clean`: [char] clean the logger. **default** `shift+L`
* `captureNative`: [boolean] captures `window.console` messages. **default** `false`
```
console.log -> logger.debug
console.warn -> logger.warning
console.error -> logger.error
console.info -> logger.info
```
* `bufferSize`: [number] set the buffer length. **default** 100. This is usefull to get the messages lines and save them to a file.
* `argumentsSeparator`: [string] separator for the messages. **default** `" "`
* `debug`: [boolean] show debug messages on the logger. **default** `false`. `console.log` messages appear on `logger.debug`
* `utcTime`: [boolean] the time stamp uses UTC time. **default** `true`
* `loggingFormat`: [string] format the log message using the keywords [TIME], [LEVEL] and [MESSAGE]. **default** `"[TIME] [LEVEL] [MESSAGE]"`. e.g
```
logger.debug("test")
// result: 18:00:00 DEBUG test"
```

## methods
* `constructor([object] options)`: initialize the object.
* `init(Boolean show = false)`: initializes the logger. throws exception if **document** node == null
* `show(), hide(), toggle()`: display methods
* `print([object] msg, [string - a valid hex color] hexColor, [string] level)`: append message lines into the logger.
* `toggleDebug()`: toggles debug options
* `setEnableCaptureNativeLog(Boolean enabled)`: capture the `window.console` messages
* `getBuffer()`: returns and clean the buffer

develop
=======
### install dependencies
```
npm install -g gulp
npm install
``` 
### run gulp
run default tasks
```
gulp
```
run `develop` task (watch files)
```
gulp develop
```

testing
======

use jasmine. see **spec/html-logger_spec.js**
```
npm test
```