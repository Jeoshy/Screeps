var role = require("creep")
const {harvester} = require("./creep");

Object.defineProperty(Room.prototype, "creeps", {
    get: function () {
        let list = []
        let check = function (roleCreep) {
            if (!this.counts) {
                this.counts = {}
            }
            if (!this.counts[roleCreep]) {
                this.counts[roleCreep] = 0
                // TODO: Takes in account who are alive, but not who are in the queue. Create a more elegant way
                this.memory.queue = this.memory.queue.filter((c) => !(c[0] === roleCreep))
            }

            if (!this.oldCreeps) {
                this.oldCreeps = {}
            }
            if (!this.oldCreeps[roleCreep]) {
                this.oldCreeps[roleCreep] = this.find(FIND_MY_CREEPS, {
                    filter: function (c) {
                        return c.memory.role === roleCreep
                    }
                })
            }

            let creep = undefined
            if (this.oldCreeps[roleCreep].length > this.counts[roleCreep]) {
                this.oldCreeps[roleCreep][this.counts[roleCreep]].memory.level = this.memory.level
            }
            else
            {
                creep = role[roleCreep].create()
            }

            this.counts[roleCreep] += 1
            return creep
        }

        switch(this.memory.level) {
            case(1):
                console.log(Object.keys(this.harvestSpots).length)
                _.times(Object.keys(this.harvestSpots).length, () => {
                    console.log("action?")
                    list = list.concat([
                        check.call(this, "upgrader")
                    ])
                })

                _.times(Object.keys(this.harvestSpots).length, () => {
                    list = list.concat([
                        check.call(this, "harvester"),
                        check.call(this, "carrier"),
                        check.call(this, "carrier"),
                    ])
                })

                return list.filter((c) => c)
            case(2):
                _.times(Object.keys(this.harvestSpots).length, () => {
                    list = list.concat([
                        check.call(this, "upgrader"),
                    ])
                })

                _.times(Object.keys(this.harvestSpots).length, () => {
                    list = list.concat([
                        check.call(this, "harvester"),
                        check.call(this, "carrier"),
                    ])
                })

                return list.filter((c) => c)
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
        // TODO: Add something when spawn is undefined
        if (!this._spawns) {
            if (!this.memory.spawns) {
                this.memory.spawns = this.find(FIND_MY_SPAWNS).map(s => s.id)
            }

            this._spawns = this.memory.spawns.map(s_id => Game.getObjectById(s_id))
        }

        let index = 0
        global.debugMODE ? this._spawns.forEach((spawn) => global.debugtext(`spawns[${index++}]`, spawn.pos)): false

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

            this.memory.harvestSpots = harvestSpots
        }

        return this.memory.harvestSpots
    },
    configurable: true,
    enumerable: false
})

Object.defineProperty(Room.prototype, "upgradeSpots", {
    get: function () {
        // TODO: DEBUG BASED ON MEMORY

        if (!this.memory.upgradeSpots) {
            let controller = this.controller
            this.memory.upgradeSpots = {}
            let [x, y] = [controller.pos.x, controller.pos.y]
            this.coordinates = [
                [x-2, y-2],[x-1, y-2],[x, y-2],[x+1, y-2],[x+2, y-2],
                [x-2, y-1],                               [x+2, y-1],
                [x-2, y+0],                               [x+2, y+0],
                [x-2, y+1],                               [x+2, y+1],
                [x-2, y+2],[x-1, y+2],[x, y+2],[x+1, y+2],[x+2, y+2],
            ].map((pos) => this.getPositionAt(pos[0], pos[1]))

            global.debug.call(this, 'this.coordinates.forEach((pos) => Game.map.visual.circle(pos, {fill: "#ff0000"}))')

            let terrain = this.getTerrain()
            this.coordinates = this.coordinates.filter((pos) => terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL)

            global.debug.call(this, 'this.coordinates.forEach((pos) => Game.map.visual.circle(pos))')

            let spawn = this.spawns[0]
            this.coordinates.sort((a, b) => a.getRangeTo(spawn) - b.getRangeTo(spawn))

            let droppoints = []
            this.coordinates.forEach((pos) => {
                this.tiles = this.lookForAtTarget(LOOK_TERRAIN, pos, 1, true)

                if (
                    this.tiles.filter((tile) => tile.terrain !== "wall").length === 9
                    &&
                    droppoints.filter((droppoint) => droppoint.getRangeTo(pos) <= 2).length === 0
                ) {
                    global.debugcircle(pos, {fill: "#008000", opacity: 1})
                    droppoints.push(pos)

                    // Removes the middle one
                    this.tiles.splice(4, 1)
                    this.tiles.sort((a, b) => this.dictPos(b).getRangeTo(spawn) - this.dictPos(a).getRangeTo(spawn))
                    this.tiles.length = 5

                    global.debug.call(this, 'this.tiles.forEach((dict) => Game.map.visual.circle(this.dictPos(dict), {opacity: 1}))')

                    this.memory.upgradeSpots[`${pos.x}x${pos.y}`] = Object.fromEntries(this.tiles.map(tile => [`${tile.x}x${tile.y}`, false]))
                    this.memory.droppoints = droppoints.map((pos) => `${pos.x}x${pos.y}`)
                }

            })
        }

        return this.memory.upgradeSpots
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, "droppoints", {
    get: function () {
        if (!this.memory.droppoints) {
            this.upgradeSpots
        }

        return this.memory.droppoints
    },
    enumerable: true,
    configurable: true,
})

Room.prototype.dictPos = function (dict) {
    if (dict.x !== undefined && dict.y !== undefined) {
        return this.getPositionAt(dict.x, dict.y)
    }

    return undefined
}

Room.prototype.lookForAtTarget = function (LOOK_CONSTANT, pos, range, asArray) {
    let x = pos.x
    let y = pos.y

    return this.lookForAtArea(LOOK_CONSTANT, y - range, x - range, y + range, x + range, asArray)
}

Room.prototype.energySpot = function (creep) {
    // TODO: Try to find energySpot otherwise return from container list
    if (!this.energySpots) {
        this.energySpots = []
        // for (let h in this.harvestSpots) {
        //     let [x, y] = h.split("x")
        //     let found = this.lookForAt(LOOK_STRUCTURES, x, y)
        //
        //     this.energySpots.push(found[0])
        // }
        this.ENERGYDROPPED = this.energySpots.length
        this.energySpots = this.energySpots.concat(this.find(FIND_DROPPED_RESOURCES))
    }

    if (this.energySpots.length === 0) {
        return undefined
    }

    if (this.memory.accessNumber === undefined) {
        this.memory.accessNumber = this.energySpots.length
    }

    if (this.ENERGYDROPPED <= this.memory.accessNumber) {
        creep.memory.method = "pickup"
    }
    else
    {
        creep.memory.method = "withdraw"
    }

    if (this.memory.accessNumber > 0) {
        this.memory.accessNumber -= 1
    }
    else
    {
        this.memory.accessNumber = this.energySpots.length -1
    }

    let energySpot = this.energySpots[this.memory.accessNumber]
    if (!energySpot) {
        return undefined
    }

    return energySpot.id
}

Room.prototype.energyTarget = function (creep) {
    if (!this.energyTargets) {
        this.energyTargets = []
        let upgraders = this.find(FIND_MY_CREEPS, {
            filter: function (creep) {
                return creep.memory.role === "upgrader"
            }
        })
        this.energyTargets = this.energyTargets.concat(upgraders)
        let notFullSpawns = this.spawns.filter((spawn) => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
        let N = upgraders.length / 2 + 1
        _.times(N, () => {this.energyTargets = this.energyTargets.concat(notFullSpawns)})
    }

    if (!this.energyTargets.length === 0) {
        return undefined
    }

    if (this.memory.accessNumber2 === undefined) {
        this.memory.accessNumber2 = this.energyTargets.length
    }

    creep.memory.method = "transfer"

    if (this.memory.accessNumber2 > 0) {
        this.memory.accessNumber2 -= 1
    }
    else
    {
        this.memory.accessNumber2 = this.energyTargets.length -1
    }

    let energyTarget = this.energyTargets[this.memory.accessNumber2]
    if (!energyTarget) {
        return undefined
    }

    return energyTarget.id

    // TODO: When target decided look whether it has capacity or not
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

Room.prototype.freeHarvestSpot = function (creepName) {
    for (let harvestSpot in this.harvestSpots) {
        // if (!this.harvestSpots[harvestSpot]) {
        //     this.harvestSpots[harvestSpot] = creepName
        //     return harvestSpot
        // }
        if (!Game.creeps[this.harvestSpots[harvestSpot]]) {
            this.harvestSpots[harvestSpot] = creepName
            return harvestSpot
        }

    }

    return undefined
}

Room.prototype.freeUpgradeSpot = function (creepName) {
    for (let dropSpot in this.upgradeSpots) {
        let upgradeSpots = this.upgradeSpots[dropSpot]
        for (let upgradeSpot in upgradeSpots) {
            // if (!upgradeSpots[upgradeSpot]) {
            //     console.log(upgradeSpots[upgradeSpot])
            //     upgradeSpots[upgradeSpot] = creepName
            //     console.log(upgradeSpots[upgradeSpot])
            //     return upgradeSpot
            // }
            if (!Game.creeps[upgradeSpots[upgradeSpot]]) {
                upgradeSpots[upgradeSpot] = creepName
                return upgradeSpot
            }
        }

    }

    return undefined
}

Room.prototype.freeTask = function (creepName) {
    for (let freeTask in this.memory.tasks) {
        let task = this.memory.tasks[freeTask]
        if (!Game.getObjectById(task.contractor)) {
            this.memory.tasks.splice(freeTask, 1)
            continue;
        }

        if (!Game.creeps[task.performer]) {
            task.performer = creepName
            return task
        }
    }
}
