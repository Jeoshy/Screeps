let task = require("task")
let {creepMODES} = require("constants")

let role = "carrier"

module.exports = {
    body: [CARRY, MOVE],

    contract: function (roomName) {
        global.contract.call(this, roomName)
    },
    create: function () {return global.create(role)},
    memory: function (room, name) {
        return {
            role: role,
            task: room.freeTask(),
            mode: creepMODES.PULL
        }
    },
    run: function (creep) {
        if (!creep.memory.task) {
            creep.memory.task = creep.room.freeTask()
            creep.memory.mode = creepMODES.PULL
        }

        switch(creep.memory.mode) {
            case creepMODES.PULL:

                break;
            case creepMODES.DEFAULT:

                break;
            case undefined:
                creep.memory.mode = creepMODES.PULL
                break;
        }
    },

}
