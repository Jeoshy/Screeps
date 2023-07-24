let task = require("task")
let {creepMODES} = require("constants")
const {pull} = require("./task");


module.exports = {
    body: [CARRY, MOVE],
    role: "carrier",

    contract: function (roomName) {
        global.contract.call(this, roomName)
    },
    create: function () {return global.create(this.role)},
    memory: function (room, name) {
        return {
            role: this.role,
            task: room.freeTask(),
            mode: creepMODES.PULL
        }
    },
    run: function (creep) {
        if (!creep.memory.task) {
            creep.memory.task = creep.room.freeTask(creep.name)
        }

        if (!creep.memory.task) {
            creep.memory.mode = creepMODES.DEFAULT
        }
        else
        {
            creep.memory.mode = creep.memory.task.type
        }

        switch(creep.memory.mode) {
            case creepMODES.PULL:
                // TODO: make system for paths be stored in a string and parsed to creep
                let {contractor: pulledCreepID, attached: attached, spot: spot, range: range} = creep.memory.task
                let pulledCreep = Game.getObjectById(pulledCreepID)

                if (!pulledCreep) {
                    creep.done()
                }

                if (attached) {
                    let index = creep.pull(pulledCreep)
                    if (index === ERR_NOT_IN_RANGE) {
                        creep.memory.task.attached = false
                        this.run(creep)
                        break;
                    }

                    let [x, y] = spot.split("x")
                    // console.log(index, creep.pos.getRangeTo(parseInt(x), parseInt(y)), range, x, y)
                    if (creep.pos.getRangeTo(parseInt(x), parseInt(y)) <= range) {
                        if (creep.moveTo(pulledCreep) === OK) {
                            creep.done()
                        }
                        pulledCreep.move(creep)
                        break;
                    }

                    creep.moveTo(parseInt(x), parseInt(y))
                    pulledCreep.move(creep)
                    break;
                }

                if (creep.pos.getRangeTo(pulledCreep) > 1) {
                    creep.moveTo(pulledCreep)
                }
                else
                {
                    if (pulledCreep.move(creep) !== OK) {
                        break;
                    }

                    creep.memory.task.attached = true
                    this.run(creep)
                    break;
                }

                break;
            case creepMODES.DEFAULT:

                break;
            case undefined:
                creep.memory.mode = creepMODES.PULL
                break;
        }
    },

}
