let task = require("task")
let {creepMODES} = require("constants")
const {pull} = require("./task");


module.exports = {
    body: [CARRY, MOVE],
    role: "carrier",
    respawn: true,

    contract: function (roomName) {
        global.contract.call(this, roomName)
    },
    create: function () {return global.create(this.role)},
    memory: function (room, name) {
        return {
            role: this.role,
            task: room.freeTask(),
            mode: creepMODES.PULL,
            roomName: room.name,
            level: room.controller.level
        }
    },
    run: function (creep) {
        if (!creep.memory.task && !creep.memory.full) {
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
                    console.log(`${creep.name} reports: Pulled creep doesn't exist`)
                    creep.done()
                    break;
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
                if (creep.memory.full) {
                    // TODO: NEEDS TO BE DYNAMIC
                    let target = creep.room.spawns[0]
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target)
                        break;
                    }

                    if (creep.store[RESOURCE_ENERGY] === 0) {
                        creep.memory.full = false
                    }
                    else
                    {
                        break;
                    }
                }

                if (!creep.memory.energySpot) {
                    creep.memory.energySpot = creep.room.energySpot(creep)
                }
                let energySpot = Game.getObjectById(creep.memory.energySpot)
                console.log(energySpot)

                if (!energySpot) {
                    creep.memory.energySpot = undefined
                    break;
                }

                if (creep[creep.memory.method](energySpot, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(energySpot)
                    break;
                }

                if (creep.store[RESOURCE_ENERGY] > 0) {
                    creep.memory.full = true
                    creep.memory.energySpot = undefined
                    this.run(creep)
                }

                break;
        }
    },

}
