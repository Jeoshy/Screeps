let task = require("task")
let role = "harvester"

module.exports = {
    body: [WORK, WORK],

    contract: function (roomName) {
        global.contract.call(this, roomName)
        this.performer = roomName
    },
    create: function() {return global.create(role)},
    memory: function (room, name) {
        return {
            role: role,
            harvestSpot: room.freeHarvestSpot(name),
        }
    },
    run: function (creep) {
        if (!creep.memory.harvestSpot) {
            creep.memory.harvestSpot = creep.room.freeHarvestSpot
            return
        }

        let [x, y] = creep.memory.harvestSpot.split("x")

        if (creep.memory.moved && false) {
            return

        }

        if (x !== creep.pos.x && y !== creep.pos.y) {
            creep.room.addTask(new task.pull(creep))
            creep.memory.moved = true
        }
        else
        {
            creep.memory.moved = false
        }


    },
}