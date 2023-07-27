let task = require("task")
let {creepMODES} = require("constants")
const {pull} = require("./task");

module.exports = {
    body: [WORK, WORK, CARRY, CARRY],
    role: "upgrader",

    create: function () {return global.create(this.role)},
    memory: function (room, name) {
        return {
            role: this.role,
            roomName: room.name,
            level: room.controller.level,
            upgradeSpot: room.freeUpgradeSpot(name)
        }
    },
    debug: function () {
        
    },
    run: function () {
        if (!creep.memory.upgradeSpot) {
            creep.memory.upgradeSpot = creep.room.freeUpgradeSpot(creep.name)
        }

        if (!creep.memory.upgradeSpot) {
            return
        }

        if (creep.memory.moved) {
            creep.upgradeController(creep.room.controller)

            if (creep.memory.full) {
                return
            }

            let container = Game.getObjectById(creep.memory.container)
            if (!container) {
                let energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0]
                if (!energy && creep.pickup(energy) === OK) {
                    creep.memory.full = true
                    this.run(creep)
                    return
                }

                // TODO: Make build requests


            }
            else
            {

            }
            return
        }

        let [x, y] = creep.memory.upgradeSpot.split("x")

        if (x !== creep.pos.x && y !== creep.pos.y) {
            creep.room.addTask(new task.pull(creep.id, creep.memory.upgradeSpot, 0))
            creep.memory.moved = true
        }
        else
        {
            creep.memory.moved = false
        }
    }
}