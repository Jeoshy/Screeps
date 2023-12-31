let task = require("task")
const {creepROLES, taskTYPES} = require("./constants");

module.exports = {
    body: [WORK, WORK],
    role: creepROLES.HARVESTER,

    create: function() {return global.create(this.role)},
    memory: function (room, name) {
        // TODO: Make the harvester have the memory of source
        // let memory = creep.initializeMemory(this, room)
        // room.freeHarvestSpot.call(memory)

        return {
            harvestSpot: room.freeHarvestSpot(name),
            role: this.role,
            roomName: room.name,
            level: room.controller.level
        }
    },
    debug: function (creep) {
        if (creep.memory.harvestSpot) {
            let [x, y] = creep.memory.harvestSpot.split("x")
            creep.room.debugline(creep.pos, creep.room.getPositionAt(x, y))
        }
    },
    run: function (creep) {
        // TODO: Transform this into default task harvest
        if (!creep.memory.harvestSpot) {
            creep.memory.harvestSpot = creep.room.freeHarvestSpot(creep.name)
        }

        if (!creep.memory.harvestSpot) {
            return
        }

        if (creep.memory.moved) {
            // TODO: IDLE HARVEST WHEN SOURCE IS EMPTY
            creep.harvest(creep.room.spotToSource[creep.memory.harvestSpot])
            return
        }

        let [x, y] = creep.memory.harvestSpot.split("x")
        creep.room.addTask(taskTYPES.PULL, [creep.id, creep.memory.harvestSpot, 0])
        creep.memory.moved = true
    },
}