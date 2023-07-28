let getContract = require("Contract")

module.exports = {
    harvester: require("harvester"),
    carrier: require("carrier"),
    upgrader: require("upgrader"),
    dead: function (creep) {
        console.log(`${creep.name} died`)
        let room = Game.rooms[creep.roomName]

        if (!room) {
            return OK
        }

        if (room.controller.level === creep.level) {
            room.requestCreeps([
                this[creep.role].create()
            ])
        }

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

Creep.prototype.registerSource = function (sourceID) {
    Game.getObjectById(sourceID).registerCreep(this.id)
}

Creep.prototype.removeSource = function (sourceID) {
    Game.getObjectById(sourceID).removeCreep(this.id)
}

Creep.prototype.done = function () {
    console.log(`${this.name} finished its task`)
    this.memory.task = undefined
}

