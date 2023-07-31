let {DEBUG} = require("constants")

// let functions = [
//     "line",
//     "circle",
//     "rect",
//     "poly",
//     "text",
// ]
// functions.forEach((func) => {
//     global[`debug${func}`] = function () {
//         if (global.debugMODE === DEBUG) {
//             args = arguments
//             args.shift()
//             this.visual[func].apply(this, args)
//         }
//     }
// })

global.debug = function (string) {
    if (global.debugMODE === DEBUG) {
        eval(string)
    }
}