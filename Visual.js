let {DEBUG} = require("constants")

let functions = [
    "line",
    "circle",
    "rect",
    "poly",
    "text",
]
functions.forEach((func) => {
    global[`debug${func}`] = function (pos, style = {}, backup) {
        if (global.debugMODE === DEBUG) {
            if (func === "line") {
                Game.map.visual[func](pos, style, backup)
            }

            Game.map.visual[func](pos, style)
        }
    }
})

global.debug = function (string) {
    if (global.debugMODE === DEBUG) {
        eval(string)
    }
}