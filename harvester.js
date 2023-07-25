let task = require("task")

module.exports = {
    body: [WORK, WORK],
    role: "harvester",

    contract: function (roomName) {
        global.contract.call(this, roomName)
        this.performer = roomName
    },
    create: function() {return global.create(this.role)},
    memory: function (room, name) {
        return {
            role: this.role,
            harvestSpot: room.freeHarvestSpot(name),
            roomName: room.name,
            level: room.controller.level
        }
    },
    run: function (creep) {
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

        if (x !== creep.pos.x && y !== creep.pos.y) {
            creep.room.addTask(new task.pull(creep.id, creep.memory.harvestSpot, 0))
            creep.memory.moved = true
        }
        else
        {
            creep.memory.moved = false
        }


    },
}