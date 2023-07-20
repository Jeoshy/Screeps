let task = require("task")

module.exports = {
    body: [WORK, WORK],

    run: function (creep) {
        if (!creep.memory.harvestSpot) {
            creep.memory.harvestSpot = creep.room.freeHarvestSpot
            return
        }

        let [x, y] = creep.memory.harvestSpot

        if (creep.memory.moved) {
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
    contract: function (roomName) {
        global.contract.call(this, roomName)
        this.performer = roomName
    },
    memory: function (room) {
        return {
            role: "harvester",
            harvestSpot: room.freeHarvestSpot,

        }
    }
}