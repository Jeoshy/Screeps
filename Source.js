Object.defineProperty(Source.prototype, "memory", {
    configurable:true,
    get: function () {
        if (_.isUndefined(Memory.sources)) {
            Memory.sources = {}
        }
        if (!_.isObject(Memory.sources)) {
            return undefined
        }

        return Memory.sources[this.id] = Memory.sources[this.id] || {}
    },
    set: function(value) {
        if (_.isUndefined(Memory.sources)) {
            Memory.sources = {}
        }
        if (!_.isObject(Memory.sources)) {
            throw new Error('Could not set source memory');
        }

        Memory.sources[this.id] = value
    }
})

Object.defineProperty(Source.prototype, "creepsHarvesting", {
    get: function () {
        if (!this.memory.creeps) {
            this.memory.creeps = []
        }

        return this.memory.creeps.length
    },
    enumerable: false,
    configurable: true
})

// TODO: Remove spotToSource and replace it with giving creeps directly the source
Object.defineProperty(Source.prototype, "harvestSpots", {
    get: function () {
        if (!this.memory.harvestSpots || true) {
            this.memory.harvestSpots = ""
            let x = this.pos.x
            let y = this.pos.y

            let tiles = this.room.lookAtArea(y - 1, x - 1, y + 1, x + 1, true)
            let harvestSpotOptimizer = this.room.harvestSpotOptimizer
            tiles = tiles.filter((tile) => (tile.type === "terrain" && tile.terrain !== "wall"))

            tiles.forEach((tile) => {
                tile.distance = harvestSpotOptimizer.getRangeTo(tile.x, tile.y)
            })

            tiles.sort((a, b) => a.distance - b.distance)

            tiles.forEach((tile) => [
                this.memory.harvestSpots += `${tile.x}x${tile.y}s`
            ])
            this.memory.harvestSpots = this.memory.harvestSpots.slice(0, -1)
        }

        return this.memory.harvestSpots.split("s")
    },
    enumerable: true,
    configurable: true
})

Source.prototype.registerCreep = function (creepID) {
    this.memory.creeps.push(creepID)
}

Source.prototype.removeCreep = function (creepID) {
    this.memory.creeps.pop(creepID)
}