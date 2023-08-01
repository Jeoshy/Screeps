let getContract = require("Contract")
const {creepROLES} = require("./constants");


module.exports = {
    [creepROLES.HARVESTER]: require("harvester"),
    [creepROLES.CARRIER]: require("carrier"),
    [creepROLES.UPGRADER]: require("upgrader"),
    dead: function (creepMemory) {
        let name = creepMemory.name
        let role = creepMemory.role
        let level = creepMemory.level
        let room = Game.rooms[creepMemory.roomName]

        console.log(`${name} died`)

        if (!room) {
            return OK
        }

        room.freeCreepPosition(role)

        delete Memory.creeps[name]

        return OK
    }
}

Object.defineProperty(Creep.prototype, "role", {
    get: function () {
        if (!this.memory.role) {
            this.memory.role = undefined
        }

        return this.memory.role
    },
    set: function (role) {
        this.memory.role = role
    },
    enumerable: false,
    configurable: true
})

Creep.prototype.done = function () {
    console.log(`${this.name} finished its task`)

    this.room.removeTask(this.memory.task.id)

    this.memory.task = undefined
}

// Creep.prototype.registerSource = function (sourceID) {
//     Game.getObjectById(sourceID).registerCreep(this.id)
// }
//
// Creep.prototype.removeSource = function (sourceID) {
//     Game.getObjectById(sourceID).removeCreep(this.id)
// }
