module.exports = {
    run: function (creep) {
        if (!creep.memory.harvestSpot) {
            creep.memory.harvestSpot = creep.room.freeHarvestSpot
        }
    },
    contract: function (roomName) {
        global.contract.call(this, roomName)
    },
    body: [WORK, WORK],
    memory: function (room) {
        return {
            role: "harvester",
            harvestSpot: room.freeHarvestSpot
        }
    }
}