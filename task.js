// Tasks are local, they are bound to the room
// Tasks have requirements, such as contract types

const {creepMODES} = require("./constants");

function pull (id, spot, range) {
    console.log(`New task created by ${id} - ${Game.getObjectById(id).name}`)
    this.contractor = id
    this.performer = undefined
    this.type = creepMODES.PULL
    this.spot = spot
    this.range = range
    this.role = ["carrier", "puller"]
}

module.exports = {
    pull
}