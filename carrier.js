let task = require("task")
let {creepMODES} = require("constants")
const {pull} = require("./task");


module.exports = {
    body: [CARRY, MOVE],
    role: "carrier",

    create: function () {return global.create(this.role)},
    memory: function (room, name) {
        return {
            task: room.freeTask(),
            mode: creepMODES.PULL,
            role: this.role,
            roomName: room.name,
            level: room.controller.level
        }
    },
    debug: function (creep) {
        if (creep.memory.mode === creepMODES.DEFAULT){
            creep.room.debugtext(creep.memory.method, creep.pos)

            let energySpot = Game.getObjectById(creep.memory.energySpot)
            energySpot ? creep.room.debugline(creep.pos, energySpot.pos, {opacity: 1, color: "#008000"}) : false

            let target = Game.getObjectById(creep.memory.target)
            target ? creep.room.debugline(creep.pos, target.pos, {opacity: 1, color: "#ff0000"}) : false

        }

        if (creep.memory.mode === creepMODES.PULL) {
            creep.room.debugtext("pulling", creep.pos)


            if (creep.memory.task) {
                let {contractor: pulledCreepID, attached: attached, spot: spot, range: range} = creep.memory.task
                let pulledCreep = Game.getObjectById(pulledCreepID)

                pulledCreep ? creep.room.debugline(creep.pos, pulledCreep.pos, {color: "#0000ff"}) : false
            }
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
                // TODO: MAKE MORE ELEGANT DROP THINGY
                creep.drop(RESOURCE_ENERGY)

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
                    // TODO: MAKE A MORE BEAUTIFUL STRING PARSER
                    let [x, y] = spot.split("x")
                    if (pulledCreep.pos.x === parseInt(x) && pulledCreep.pos.y === parseInt(y)) {
                        console.log("Pulled creep is already on its place wtf")
                        creep.done()
                    }

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
                    // TODO: BUGGED WITH METHOD NOT CORRECT
                    creep.memory.method = "transfer"
                    if (!creep.memory.target) {
                        creep.memory.target = creep.room.energyTarget(creep)
                    }

                    let target = Game.getObjectById(creep.memory.target)
                    if (!target) {
                        creep.memory.target = undefined
                        break;
                    }

                    let feedback = creep[creep.memory.method](target, RESOURCE_ENERGY)
                    if (feedback !== OK && feedback !== ERR_FULL) {
                        creep.moveTo(target)
                        break;
                    }

                    let targetCapacity = target.store.getFreeCapacity(RESOURCE_ENERGY)
                    let energy = creep.store[RESOURCE_ENERGY]

                    creep.memory.target = undefined
                    creep.memory.full = energy > targetCapacity

                    // TODO: CREEP.MEMORY.FULL is not correct

                    if (!creep.memory.full) {
                        creep.memory.full = false
                        creep.memory.target = undefined
                        this.run(creep)
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

                if (!energySpot) {
                    creep.memory.energySpot = undefined
                    break;
                }

                let feedback = creep[creep.memory.method](energySpot, RESOURCE_ENERGY)
                if (feedback !== OK) {
                    creep.moveTo(energySpot)
                    break;
                }

                creep.memory.full = energySpot.amount > 0
                if (creep.memory.full) {
                    creep.memory.full = true
                    creep.memory.energySpot = undefined
                    this.run(creep)
                }

                break;
        }
    },

}
