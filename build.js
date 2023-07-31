const {taskTYPES, creepROLES} = require("./constants");
module.exports = {
    create: function (constructionId, range) {
        console.log(`New task created for ${constructionId} - ${Game.getObjectById(constructionId).name}`)
        this.id = undefined
        this.performer = undefined
        this.type = taskTYPES.BUILD
        this.role = [creepROLES.UPGRADER]
        this.range = range
        this.constructionId = constructionId

        return this
    },
    run: function (creep) {
        let {constructionId: cId} = creep.memory.task
        let target = Game.getObjectById(cId)

        if (!target) {
            creep.done()
            return
        }

        if (creep.memory.moved2) {
            creep.build(target)
            return
        }

        let spot = `${target.pos.x}x${target.pos.y}`
        creep.room.addTask(taskTYPES.PULL, [creep.id, spot, 3])
        creep.memory.moved2 = true
    }
}