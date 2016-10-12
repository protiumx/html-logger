
html-logger
===========
simple html logger that appends it self to a page's body. based on [http://www.songho.ca/misc/logger/files/Logger.js](http://www.songho.ca/misc/logger/files/Logger.js).
written with ES6 syntax and transpiled with **babel.io**

this logger is usefull when you have to debug on enviroments without web-tools

install
=======
## npm
```
npm install html-logger
```

## bower
```
bower i html-logger
```

usage
=====
## html
add a simple script refence to **dist/html-logger.bundle.js** and initialize the logger
```js
let logger = new HtmlLogger()
logger.init() // appends the logger
logger.show()
```

## node
```js
// preload.js
import HtmlLogger from 'html-logger'
window.onload = () => {
    const logger = new HtmlLogger({name: "Test App"})
    logger.init({show: true})
    global.logger = logger
}
```

the logger toggles by default with `ctrl+t` keys combination

features
========
* Log levels: info, success, warning, error, debug
* Prints strings, objects and functions
* Log all the arguments. Example: `logger.info("test", { test: true}, "test2")`

api
===
## options
* `name`: [string] the app name to show on the logger title. default `Html Logger`
* `show`: [boolean] if true the logger shows after init. default `false`  
* `enabled`: [boolean] indicates if logger is enabled. logger prints only when it is enabled. default `true`
* `height`: [number] indicates the logger container height
* `animationDuration`: [number] the animation durations in milli seconds
* `maxLogCount`: [number] the maximun number of lines to persist in the logger.
* `shortcuts`: [object] ctrl/command shortcuts
    * `toggle`: [char] toggles the logger. default `T`
    * `clean`: [char] clean the logger. default `L`

## methods
* `constructor([object] options)`: initialize the object. parameter `options` is optional
* `init()`: initializes the logger.
* `show(), hide(), toggle()`: display methods
* `print([object] msg, [string - a valid hex color] hexColor, [string] level)`: append message lines into the logger.

develop
=======
### install dependencies
```
npm install -g gulp
npm install
``` 
### run gulp
run default tasks
`gulp`
