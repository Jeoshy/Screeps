// Tasks are local, they are bound to the room
// Tasks have requirements, such as contract types

const {taskTYPES} = require("./constants");

module.exports = {
    [taskTYPES.PULL]: require("pull"),
    [taskTYPES.BUILD]: require("build")
}