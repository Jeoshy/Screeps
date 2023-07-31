const {creepROLES, taskTYPES} = require("./constants");
module.exports = {
    create: function (id, spot, range) {
        console.log(`New task created by ${id} - ${Game.getObjectById(id).name}`)
        this.id = undefined
        this.performer = undefined
        this.type = taskTYPES.PULL
        this.role = [creepROLES.CARRIER]
        this.spot = spot
        this.range = range
        this.contractor = id

        return this
    },
    run: function (creep) {
        // TODO: MAKE MORE ELEGANT DROP THINGY
        creep.drop(RESOURCE_ENERGY)

        // TODO: make system for paths be stored in a string and parsed to creep
        let {contractor: pulledCreepID, attached: attached, spot: spot, range: range} = creep.memory.task
        let pulledCreep = Game.getObjectById(pulledCreepID)

        if (!pulledCreep) {
            console.log(`${creep.name} reports: Pulled creep doesn't exist`)
            creep.done()
            return
        }

        if (attached) {
            let index = creep.pull(pulledCreep)
            if (index === ERR_NOT_IN_RANGE) {
                creep.memory.task.attached = false
                this.run(creep)
                return
            }

            let [x, y] = spot.split("x")
            // console.log(index, creep.pos.getRangeTo(parseInt(x), parseInt(y)), range, x, y)
            if (creep.pos.getRangeTo(parseInt(x), parseInt(y)) <= range) {
                if (creep.moveTo(pulledCreep) === OK) {
                    creep.done()
                }
                pulledCreep.move(creep)
                return
            }

            creep.moveTo(parseInt(x), parseInt(y))
            pulledCreep.move(creep)
            return
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
                return
            }

            creep.memory.task.attached = true
            this.run(creep)
        }
    }
}