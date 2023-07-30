let {DEBUG} = require("constants")

let functions = [
    "line",
    "circle",
    "rect",
    "poly",
    "text",
]
functions.forEach((func) => {
    global[`debug${func}`] = function () {
        if (global.debugMODE === DEBUG) {
            Game.map.visual[func].apply(this, arguments)
        }
    }
})

global.debug = function (string) {
    if (global.debugMODE === DEBUG) {
        eval(string)
    }
}