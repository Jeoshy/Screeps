Object.defineProperty(Creep.prototype, "role", {
    get: function () {
        if (!this.memory.role) {
            this.memory.role = undefined
        }

        return this.memory.role
    },
    set: function (role) {
        this.memory.role = role
    },
    enumerable: false,
    configurable: true
})

Creep.prototype.registerSource = function (sourceID) {
    Game.getObjectById(sourceID).registerCreep(this.id)
}

Creep.prototype.removeSource = function (sourceID) {
    Game.getObjectById(sourceID).removeCreep(this.id)
}