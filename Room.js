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

            this.memory.harvestSpots = harvestSpots
        }

        return this.memory.harvestSpots
    },
    configurable: true,
    enumerable: false
})

// Object.defineProperty(Room.prototype, "upgradeSpots", {
//     get: function () {
//         if (!this._upgradeSpots) {
//             if (!this.memory.upgradeSpots) {
//                 this.memory.upgradeSpots = {}
//                 let numberOfDroppoints = 2
//                 let upgradeSpots = 5
//                 let controller = this.controller
//
//                 this.lookForAtTarget(LOOK_TERRAIN, controller, 2, true)
//
//                 let droppoints = this.lookForAtTarget(LOOK_TERRAIN, controller.pos, 2, true)
//                 droppoints = droppoints.filter((droppoint) => (droppoint.terrain !== "wall"))
//
//                 droppoints = droppoints.filter((droppoint) => {
//                     let pos = this.getPositionAt(droppoint.x, droppoint.y)
//                     let tiles = this.lookForAtTarget(LOOK_TERRAIN, pos, 1, true)
//                     droppoint.tiles = tiles
//                     return tiles.filter((tile) => tile.terrain !== "wall").length === 9
//                 })
//
//                 droppoints.forEach((droppoint) => {
//                     droppoint.distance = controller.pos.getRangeTo(droppoint.x, droppoint.y)
//                 })
//
//                 droppoints.sort((a, b) => a.distance - b.distance)
//
//                 let x = 0
//                 let y = 0
//                 droppoints = droppoints.filter((droppoint) => {
//                     let pos = this.getPositionAt(x, y)
//
//                     if (pos.inRangeTo(droppoint.x, droppoint.y, 3)) {
//                         return false
//                     }
//                     x = droppoint.x
//                     y = droppoint.y
//                     return true
//                 })
//                 droppoints.length = numberOfDroppoints
//
//                 droppoints.forEach((droppoint) => {
//
//                     droppoint.tiles.forEach((tile) => {
//                         tile.distance = controller.pos.getRangeTo(tile.x, tile.y)
//                     })
//
//                     droppoint.tiles.sort((a, b) => a.distance - b.distance)
//
//                     droppoint.tiles.length = upgradeSpots
//
//                     let x = droppoint.x
//                     let y = droppoint.y
//                     let pos = this.getPositionAt(x, y)
//                     Game.map.visual.circle(pos)
//
//                     this.memory.upgradeSpots[`${x}x${y}`] = droppoint.tiles.reduce((accumulator, tile) => accumulator + `${tile.x}x${tile.y}s`, "")
//                 })
//             }
//         }
//
//         return this._upgradeSpots
//     },
//     enumerable: false,
//     configurable: true
// })

Object.defineProperty(Room.prototype, "upgradeSpots", {
    get: function () {
        if (!this.memory.upgradeSpots || true) {
            let controller = this.controller
            let [x, y] = [controller.pos.x, controller.pos.y]
            let coordinates = [
                [x-2, y-2],[x-1, y-2],[x, y-2],[x+1, y-2],[x+2, y-2],
                [x-2, y-1],                               [x+2, y-1],
                [x-2, y+0],                               [x+2, y+0],
                [x-2, y+1],                               [x+2, y+1],
                [x-2, y+2],[x-1, y+2],[x, y+2],[x+1, y+2],[x+2, y+2],
            ].map((pos) => this.getPositionAt(pos[0], pos[1]))

            coordinates.forEach((pos) => Game.map.visual.circle(pos))

            let terrain = this.getTerrain()
            coordinates = coordinates.filter((pos) => terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL)
            let spawn = this.spawns[0]
            coordinates.sort((a, b) => a.getRangeTo(spawn) - b.getRangeTo(spawn))

            // coordinates.forEach((pos) => {
            //     let tiles = this.lookForAtTarget(LOOK_TERRAIN, pos, 1, true)
            //     if (tiles.filter((tile) => tile.terrain !== "wall").length === 9) {
            //         Game.map.visual.circle(pos, {fill: "#008000"})
            //         coordinates = coordinates.filter((pos2) => pos.getRangeTo(pos2) > 1 || pos.getRangeTo(pos2) === 0)
            //     }
            // })

            let droppoints = []
            coordinates.forEach((pos) => {
                let tiles = this.lookForAtTarget(LOOK_TERRAIN, pos, 1, true)

                if (
                    tiles.filter((tile) => tile.terrain !== "wall").length === 9
                    &&
                    droppoints.filter((droppoint) => tiles.filter((tile) => droppoint.getRangeTo(tile.x, tile.y) === 0).length > 0).length === 0
                ) {
                    Game.map.visual.circle(pos, {fill: "#008000"})
                    droppoints.push(pos)
                }

            })
        }
    },
    enumerable: false,
    configurable: true
})

Room.prototype.lookForAtTarget = function (LOOK_CONSTANT, pos, range, asArray) {
    let x = pos.x
    let y = pos.y

    return this.lookForAtArea(LOOK_CONSTANT, y - range, x - range, y + range, x + range, asArray)
}

Room.prototype.hello = function () {
    console.log("hello")
}

Room.prototype.energySpot = function (creep) {
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

    if (!this.accessNumber === undefined) {
        this.accessNumber = this.energySpots.length
    }

    if (this.ENERGYDROPPED <= this.accessNumber) {
        creep.memory.method = "pickup"
    }
    else
    {
        creep.memory.method = "withdraw"
    }

    if (this.accessNumber > 0) {
        this.accessNumber -= 1
    }
    else
    {
        this.accessNumber = this.energySpots.length -1
    }

    let energySpot = this.energySpots[this.accessNumber]
    if (!energySpot) {
        return undefined
    }

    return energySpot.id
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

