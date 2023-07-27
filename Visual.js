let {DEBUG} = require("constants")

let functions = [
    "line",
    "circle",
    "rect",
    "poly",
    "text",
]
functions.forEach((func) => {
    global[`debug${func}`] = function (pos, style = {}) {
        if (global.debugMODE === DEBUG) {
            Game.map.visual[func](pos, style)
        }
    }
})

global.debug = function (func) {
    return function(args) {
        if (global.debugMODE !== DEBUG) {
            return
        }

        return func(args)
    }
}