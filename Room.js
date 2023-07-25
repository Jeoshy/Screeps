var role = require("creep")
const {harvester} = require("./creep");


Object.defineProperty(Room.prototype, "creeps", {
    get: function () {
        let list = []
        switch(this.memory.level) {
            case(1):
                for (let h in this.harvestSpots) {
                    list = list.concat([
                        role.harvester.create(),
                        role.carrier.create(),
                    ])
                }

                return list
            case(2):
                for (let h in this.harvestSpots) {
                    list.concat([
                        role.harvester.create(),
                        role.carrier.create(),
                    ])
                }

                return list
        }
    },
    configurable: true
})

Object.defineProperty(Room.prototype, "queue", {
    get: function () {
        if (!this.memory.queue) {
            this.memory.queue = []
        }

        return this.memory.queue
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, "spawns", {
    get: function () {
        if (!this._spawns) {
            if (!this.memory.spawns) {
                this.memory.spawns = this.find(FIND_MY_SPAWNS).map(s => s.id)
            }

            this._spawns = this.memory.spawns.map(s_id => Game.getObjectById(s_id))
        }

        return this._spawns
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, 'sources', {
    get: function() {
        if (!this._sources) {
            if (!this.memory.sources) {
                this.memory.sources = this.find(FIND_SOURCES).map(s => s.id);
            }

            this._sources = this.memory.sources.map(s_id => Game.getObjectById(s_id))
        }

        return this._sources;
    },
    set: function(newValue) {
        console.log("Hah that is funny. You don't want to set this to another value ;)")
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "harvestSpotOptimizer", {
    get: function () {
        if (!this.memory.harvestSpotOptimizer) {
            this.memory.harvestSpotOptimizer = "25x25"
        }

        let [x, y] = this.memory.harvestSpotOptimizer.split("x")
        return new RoomPosition(x, y, this.name)
    },
    set: function(value) {
        this.memory.harvestSpotOptimizer = value
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, "spotToSource", {
    get: function () {
        if (!this._spotToSource) {
            if (!this.memory.spotToSource) {
                this.memory.spotToSource = {}
                this.sources.forEach((source) => {
                    let harvestSpots = source.harvestSpots
                    harvestSpots.length = 3
                    harvestSpots.forEach((h) => {
                        this.memory.spotToSource[h] = source.id
                    })
                })
            }

            this._spotToSource = {}
            for (let index in this.memory.spotToSource) {
                let id = this.memory.spotToSource[index]
                this._spotToSource[index] = Game.getObjectById(id)
            }
        }

        return this._spotToSource
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, "harvestSpots", {
    get: function () {
        if (!this.memory.harvestSpots) {
            let harvestSpots = {}
            this.sources.forEach((source) => {
                let hs = source.harvestSpots
                hs.length = 3

                // TODO: FROM XXXOOO to XOXOXO
                hs.forEach((h) => {
                    harvestSpots[h] = false
                })
            })

            // TODO: sort harvestSpots based on distance

            this.memory.harvestSpots = harvestSpots
        }

        return this.memory.harvestSpots
    },
    enumerable: false,
    configurable: true
})

Room.prototype.energySpot = function (creep) {
    if (!this.accessNumber) {
        this.accessNumber = 0
    }

    if (!this.energySpots) {
        this.energySpots = this.find(FIND_DROPPED_RESOURCES)
        this.ENERGYDROPPED = this.energySpots.length
        for (let h in this.harvestSpots) {
            let [x, y] = h.split("x")
            let found = this.lookForAt(LOOK_STRUCTURES, x, y)
            this.energySpots.push(found[0])
        }
    }

    if (this.ENERGYDROPPED > this.accessNumber) {
        creep.memory.method = "pickup"
    }
    else
    {
        creep.memory.method = "withdraw"
    }

    return this.energySpots[this.accessNumber]

    if (this.energySpots.length > this.accessNumber) {
        this.accessNumber += 1
    }
}

Room.prototype.freeHarvestSpot = function (creepName) {
    for (let harvestSpot in this.harvestSpots) {
        if (!this.harvestSpots[harvestSpot]) {
            this.harvestSpots[harvestSpot] = creepName
            return harvestSpot
        }
    }

    if (!this.checkDead) {
        this.checkDead = true
        for (let harvestSpot in this.harvestSpots) {
            if (!Game.creeps[this.harvestSpots[harvestSpot]]) {
                this.harvestSpots[harvestSpot] = creepName
                return harvestSpot
            }
        }
    }

    return undefined
}

Room.prototype.freeTask = function () {
    for (let freeTask in this.memory.tasks) {
        let task = Object.assign({}, this.memory.tasks[freeTask])
        if (!task.performer) {
            this.memory.tasks.pop(freeTask)
            return task
        }
    }
}

Room.prototype.addTask = function (task) {
    if (!this.memory.tasks) {
        this.memory.tasks = []
    }

    this.memory.tasks.push(task)
}

Room.prototype.addContract = function (contract) {
    if (!Memory.contracts) {
        Memory.contracts = {}
        Memory.contractTracker = 0
    }

    Memory.contractTracker += 1
    Memory.contracts[Memory.contractTracker] = contract
}

Room.prototype.getCreep = function () {
    // Get the last one
    let [creep, name] = this.memory.queue[this.memory.queue.length - 1]

    return [role[creep], name]
}

Room.prototype.removeLastCreep = function () {
    // Pop the last one
    this.memory.queue.pop()
}

Room.prototype.requestCreeps = function (creepArray) {
    // Extend array
    this.memory.queue = this.queue.concat(creepArray)

    // TODO: Sort from least important to most


}

Room.prototype.checkLevel = function () {
    if (this.controller.level !== this.memory.level) {
        this.memory.level = this.controller.level
        return true
    }

    return false
}

