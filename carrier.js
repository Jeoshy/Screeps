let task = require("task")
let {creepMODES} = require("constants")
const {pull} = require("./task");
const {creepROLES} = require("./constants");


module.exports = {
    body: [CARRY, MOVE],
    role: creepROLES.CARRIER,

    create: function () {return global.create(this.role)},
    memory: function (room, name) {
        return {
            task: room.freeTask(),
            role: this.role,
            roomName: room.name,
            level: room.controller.level
        }
    },
    debug: function (creep) {
        if (!creep.memory.task){
            creep.room.debugtext(creep.memory.method, creep.pos)

            let energySpot = Game.getObjectById(creep.memory.energySpot)
            energySpot ? creep.room.debugline(creep.pos, energySpot.pos, {opacity: 1, color: "#008000"}) : false

            let target = Game.getObjectById(creep.memory.target)
            target ? creep.room.debugline(creep.pos, target.pos, {opacity: 1, color: "#ff0000"}) : false

        }

        if (creep.memory.task) {
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
            creep.memory.task = creep.room.freeTask(creep.name, creep.role)
        }
        
        if (creep.memory.task) {
            task[creep.memory.task.type].run(creep)
            return
        }

        // TODO: Transform this into default task carry

        if (creep.memory.full) {
            // TODO: BUGGED WITH METHOD NOT CORRECT
            creep.memory.method = "transfer"
            if (!creep.memory.target) {
                creep.memory.target = creep.room.energyTarget(creep)
            }
            let target = Game.getObjectById(creep.memory.target)

            if (!target) {
                creep.memory.target = undefined
                return
            }
            let feedback = creep[creep.memory.method](target, RESOURCE_ENERGY)

            if (feedback === ERR_NOT_IN_RANGE) {
                creep.moveTo(target)
                return
            }

            let targetCapacity = target.store.getFreeCapacity(RESOURCE_ENERGY)
            let energy = creep.store[RESOURCE_ENERGY]

            creep.memory.target = undefined
            creep.memory.full = energy > targetCapacity

            if (!creep.memory.full) {
                creep.memory.target = undefined
                this.run(creep)
            }
            else
            {
                return
            }
        }

        if (!creep.memory.energySpot) {
            creep.memory.energySpot = creep.room.energySpot(creep)
        }
        let energySpot = Game.getObjectById(creep.memory.energySpot)

        if (!energySpot) {
            creep.memory.energySpot = undefined
            return
        }

        let feedback = creep[creep.memory.method](energySpot, RESOURCE_ENERGY)
        if (feedback !== OK) {
            creep.moveTo(energySpot)
            return
        }

        creep.memory.full = energySpot.amount > 0
        if (creep.memory.full) {
            creep.memory.full = true
            creep.memory.energySpot = undefined
            this.run(creep)
        }
    },

}
