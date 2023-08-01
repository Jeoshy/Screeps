var role = require("creep")
let task = require("task")
const {harvester} = require("./creep");
const {DEBUG, taskTYPES, creepROLES} = require("./constants");

Object.defineProperty(Room.prototype, "creeps", {
    get: function () {
        let list = []
        let maxHarvester = 0
        let maxCarrier = 0
        let maxUpgrader = 0

        switch(this.memory.level) {
            case(1):
                maxHarvester = Object.keys(this.harvestSpots).length
                maxCarrier = maxHarvester
                maxUpgrader = maxHarvester

                _.times(maxUpgrader, () => {
                    list = list.concat([
                        creepROLES.UPGRADER
                    ])
                })

                _.times(maxHarvester, () => {
                    list = list.concat([
                        creepROLES.HARVESTER,
                        creepROLES.CARRIER
                    ])
                })

                break;
            case(2):
                maxHarvester = Object.keys(this.harvestSpots).length
                // TODO: Depends on how much energy there is in the room - it isn't now
                maxCarrier = maxHarvester * 2
                maxUpgrader = maxHarvester

                _.times(maxUpgrader, () => {
                    list = list.concat([
                        creepROLES.UPGRADER
                    ])
                })

                _.times(maxHarvester, () => {
                    list = list.concat([
                        creepROLES.HARVESTER,
                        creepROLES.CARRIER
                    ])
                })

                break;
        }

        this.createCreepPositions(maxHarvester, creepROLES.HARVESTER)
        this.createCreepPositions(maxCarrier, creepROLES.CARRIER)
        this.createCreepPositions(maxUpgrader, creepROLES.UPGRADER)
        list.forEach((l) => this.freeCreepPosition(l))
    },
    enumerable: false,
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
        global.debugMODE ? this._spawns.forEach((spawn) => this.debugtext(`spawns[${index++}]`, spawn.pos)): false

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

Object.defineProperty(Room.prototype, "tasks", {
    get: function () {
        if (!this.memory.tasks) {
            this.memory.tasks = {}
            this.memory.taskId = 0
        }

        return this.memory.tasks
    },
    enumerable: false,
    configurable: true,
})

Object.defineProperty(Room.prototype, "positions", {
    get: function () {
        if (!this.memory.positions) {
            this.memory.positions = {}
        }

        return this.memory.positions
    },
    enumerable: false,
    configurable: true
})

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
            let maxHarvestSpots = 3

            for (let i = 0; i < maxHarvestSpots; i++) {
                this.sources.forEach((source) => {
                    let h = source.harvestSpots[i]
                    if (h) {
                        harvestSpots[h] = false
                    }

                })
            }

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

            global.debug.call(this, 'this.coordinates.forEach((pos) => this.debugcircle(pos, {fill: "#ff0000"}))')

            let terrain = this.getTerrain()
            this.coordinates = this.coordinates.filter((pos) => terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL)

            global.debug.call(this, 'this.coordinates.forEach((pos) => this.debugcircle(pos))')

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
                    this.debugcircle(pos, {fill: "#008000", opacity: 1})
                    droppoints.push(pos)

                    // Removes the middle one
                    this.tiles.splice(4, 1)
                    this.tiles.sort((a, b) => this.dictPos(b).getRangeTo(spawn) - this.dictPos(a).getRangeTo(spawn))
                    this.tiles.length = 5

                    global.debug.call(this, 'this.tiles.forEach((dict) => this.debugcircle(this.dictPos(dict), {opacity: 1}))')

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

Object.defineProperty(Room.prototype, "depth", {
    get : function () {
        if (!this._depth) {
            if (!this.memory.depth) {
                this.memory.depth = this.createDepthCostMatrix()
            }

            let matrix = PathFinder.CostMatrix.deserialize(this.memory.depth)
            if (global.debugMODE){
                let visual = new RoomVisual(this.name)
                let colors = ['#40004b','#762a83','#9970ab','#c2a5cf','#e7d4e8','#f7f7f7','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b']
                colors = ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000', '#000000'].reverse()
                for(let y = 0; y < 50; y++) {
                    for (let x = 0; x < 50; x++) {
                        let tile = this.getPositionAt(x, y)
                        let weight = matrix.get(x, y)
                        this.debugcircle(tile, {fill: colors[weight]})
                        // this.debugtext(weight, tile, {color: colors[weight]})
                    }
                }
            }

            this._depth = matrix
        }

        return this._depth
    },
    enumerable: false,
    configurable: true,
})

Object.defineProperty(Room.prototype, "constructionSites", {
    get: function () {
        if (!this.memory.constructionSites) {
            this.memory.constructionSites = {}
        }

        return this.memory.constructionSites
    },
    enumerable: false,
    configurable: true
})

let functions = [
    "line",
    "circle",
    "rect",
    "poly",
    "text",
]
functions.forEach((func) => {
    Room.prototype[`debug${func}`] = function () {
        if (global.debugMODE === DEBUG) {
            this.visual[func].apply(this, arguments)
        }
    }
})

// 15 times cheaper than createDepthLayers
Room.prototype.createDepthCostMatrix = function () {
    let matrix = new PathFinder.CostMatrix
    let terrain = this.getTerrain()
    let fudge = []
    let initialValue = 0

    for(let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            let tile = terrain.get(x, y)
            let pos = this.getPositionAt(x, y)
            if (tile === TERRAIN_MASK_WALL) {
                matrix.set(x, y, initialValue)
                continue;
            }
            matrix.set(x, y, 99)
            fudge.push(pos)
        }
    }

    let pos = this.getPositionAt(0, 0)
    let near = this.positionsInRange(pos, 1)


    // ALWAYS WORKS
    // let iter = 0
    // let maxIter = 2
    // while (fudge.length > 0 && iter <= maxIter) {
    //     for (let index in fudge) {
    //         let tile = fudge[index]
    //         let near = this.positionsInRange(tile, 1)
    //         let weights = near.map((t) => matrix.get(t.x, t.y))
    //         let lowestWeight = weights.sort((a, b) => a - b)[0]
    //         let currentValue = matrix.get(tile.x, tile.y)
    //
    //         if (lowestWeight < currentValue) {
    //             matrix.set(tile.x, tile.y, lowestWeight + 1)
    //             if (currentValue > maxIter) {
    //                 maxIter = currentValue
    //             }
    //         }
    //         else
    //         {
    //             fudge.splice(index, 1)
    //         }
    //     }
    //     iter += 1
    // }

    // NOT SURE IF THIS ONE ALWAYS WORKS
    let iter = 0
    let maxIter = 2
    while (iter < maxIter) {
        for (let index in fudge) {
            let tile = fudge[index]
            let near = this.positionsInRange(tile, 1)
            let weights = near.map((t) => matrix.get(t.x, t.y))
            let lowestWeight = weights.sort((a, b) => a - b)[0]
            let currentValue = matrix.get(tile.x, tile.y)

            if (lowestWeight < currentValue) {
                matrix.set(tile.x, tile.y, lowestWeight + 1)
                maxIter = lowestWeight + 1
            }
        }
        fudge.reverse()
        iter += 1
    }

    return matrix.serialize()

}

Room.prototype.createPositions = function (number, type) {
    if (!this.positions[type]) {
        this.positions[type] = []
    }

    let length = this.positions[type].length
    let diff = length - number

    diff > 0 ? this.positions[type].splice(number, diff) : _.times(diff * -1, () => {this.positions[type].push(false)})
}

Room.prototype.createCreepPositions = function (number, type) {
    this.createPositions(number, type)
}

Room.prototype.createTaskPositions = function (number, taskType) {
    this.createPositions(number, taskType)
}

Room.prototype.dictPos = function (dict) {
    if (dict.x !== undefined && dict.y !== undefined) {
        return this.getPositionAt(dict.x, dict.y)
    }

    return undefined
}

Room.prototype.positionsInRange = function (pos, range) {
    if (pos.x < 0) {
        raise(`Error: cannot be lower than 0 - x: ${pos.x}`)
    }
    if (pos.y < 0) {
        raise(`Error: cannot be lower than 0 - y: ${pos.x}`)
    }
    if (pos.x > 49) {
        raise(`Error: cannot be bigger than 49 - x: ${pos.x}`)
    }
    if (pos.y > 49) {
        raise(`Error: cannot be bigger than 49 - y: ${pos.x}`)
    }

    let positions = []
    for (let x = range * -1; x <= range; x++) {
        for (let y = range * -1; y <= range; y++) {
            let offsetX = pos.x + x
            let offsetY = pos.y + y
            if (offsetX < 0 || offsetX > 49 || offsetY < 0 || offsetY > 49) {
                continue;
            }

            positions.push(this.getPositionAt(offsetX, offsetY))
        }
    }

    return positions
}

Room.prototype.lookForAtTarget = function (LOOK_CONSTANT, pos, range, asArray) {
    let x = pos.x
    let y = pos.y

    return this.lookForAtArea(LOOK_CONSTANT, y - range, x - range, y + range, x + range, asArray)
}

Room.prototype.whatToBuild = function () {
    let constructionsSites = this.find(FIND_CONSTRUCTION_SITES)
    let maxBuildTasks = 2
    this.createTaskPositions(maxBuildTasks, taskTYPES.BUILD)

    constructionsSites.forEach((c) => {
        if (!this.constructionSites[c.id]) {
            this.constructionSites[c.id] = false
        }
    })

    for (let id in this.constructionSites) {
        if (!Game.getObjectById(id)) {
            delete this.constructionSites[id]
            continue;
        }

        if (!this.constructionSites[id] && this.freeBuildPosition(id)) {
            this.constructionSites[id] = true
        }
    }
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
    // TODO: Make this a data driven way, creeps can register here and buildings too
    // TODO: Make a building register just like construction register
    if (!this.energyTargets) {
        this.energyTargets = []
        let upgraders = this.find(FIND_MY_CREEPS, {
            filter: function (creep) {
                return creep.memory.role === "upgrader" && creep.store.energy < 50 * creep.body.filter((b) => b.type === WORK).length
            }
        })
        // TODO: Make it drop for those upgrading and transfer directly to those who are building
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

}

Room.prototype.addTask = function (taskType, args) {
    this.tasks[this.memory.taskId] = task[taskType].create.apply({}, args)
    this.memory.taskId++
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

Room.prototype.removeTask = function (taskId) {
    let task = this.tasks[taskId]

    if (task) {
        delete this.tasks[taskId]
    }

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
            if (!Game.creeps[upgradeSpots[upgradeSpot]]) {
                upgradeSpots[upgradeSpot] = creepName
                return upgradeSpot
            }
        }

    }

    return undefined
}

Room.prototype.freeBuildPosition = function (newId) {
    let taskType = taskTYPES.BUILD
    for (let index in this.positions[taskType]) {
        let id = this.positions[taskType][index]
        if (!Game.getObjectById(id)) {
            this.positions[taskType][index] = newId
            this.addTask(taskType, [newId, 3])
            return OK
        }
    }

    return ERR_FULL
}

Room.prototype.freeCreepPosition = function (creepRole) {
    if (!this.positions[creepRole]) {
        // TODO: Maybe create better code for mercenaries
        this.queue.push(role[creepRole].create())
    }

    for (let index in this.positions[creepRole]) {
        let position = this.positions[creepRole][index]
        if (!Game.creeps[position] && !this.queue.some((c) => c[1] === position)) {
            let [creep, name] = role[creepRole].create()
            this.positions[creepRole][index] = name
            this.queue.push([creep, name])
            // TODO: Sort queue from least important to most

            return OK
        }
    }
}

Room.prototype.freeTask = function (creepName, role) {
    for (let freeTask in this.tasks) {
        let task = this.tasks[freeTask]
        if (!Game.creeps[task.performer] && (task.role === role || task.role.includes(role))) {
            task.performer = creepName
            task.id = freeTask
            return task
        }
    }

    return undefined
}

// Room.prototype.requestCreeps = function (creepArray) {
//     // Extend array
//     this.memory.queue = this.queue.concat(creepArray)
//
//
//
//
// }

// Room.prototype.addContract = function (contract) {
//     if (!Memory.contracts) {
//         Memory.contracts = {}
//         Memory.contractTracker = 0
//     }
//
//     Memory.contractTracker += 1
//     Memory.contracts[Memory.contractTracker] = contract
// }

// Room.prototype.createDepthLayers = function () {
//     let terrain = this.getTerrain()
//     let layer = 0
//     let depth = {}
//     depth[layer] = []
//
//     for(let y = 0; y < 50; y++) {
//         for (let x = 0; x < 50; x++) {
//             let tile = terrain.get(x, y)
//             if (tile === TERRAIN_MASK_WALL) {
//                 depth[layer].push(this.getPositionAt(x, y))
//             }
//         }
//     }
//
//     while (true) {
//         let previousTiles = depth[layer -1]
//         let tiles = depth[layer]
//         depth[layer + 1] = []
//         let futureTiles = depth[layer + 1]
//
//         for (let tile of tiles) {
//             let newTiles = this.lookForAtTarget(LOOK_TERRAIN, tile, 1, true)
//
//             for (let newTile of newTiles) {
//                 let boolean1 = true
//                 let boolean2 = true
//                 let boolean3 = true
//
//                 if (newTile.x < 0 || newTile.x > 49 || newTile.y < 0 || newTile.y > 49) {
//                     continue;
//                 }
//
//                 if (previousTiles) {
//                     boolean1 = !(previousTiles.some((pos) => (newTile.x === pos.x && newTile.y === pos.y)))
//                 }
//
//                 if (tiles) {
//                     boolean2 = !(tiles.some((pos) => (newTile.x === pos.x && newTile.y === pos.y)))
//                 }
//
//                 if (futureTiles.length > 0) {
//                     boolean3 = !(futureTiles.some((pos) => (newTile.x === pos.x && newTile.y === pos.y)))
//                 }
//
//                 (boolean1 && boolean2 && boolean3) ? futureTiles.push(this.getPositionAt(newTile.x, newTile.y)) : false
//             }
//         }
//         layer += 1
//
//         if (futureTiles.length === 0) {
//             break;
//         }
//     }
//
//     return depth
// }

// Room.prototype.createDepthCostMatrix2 = function () {
//     let matrix = new PathFinder.CostMatrix
//     let terrain = this.getTerrain()
//     let initialValue = 0
//     let walls = []
//     let fudge = []
//
//     for(let y = 0; y < 50; y++) {
//         for (let x = 0; x < 50; x++) {
//             let tile = terrain.get(x, y)
//             let pos = this.getPositionAt(x, y)
//             if (tile === TERRAIN_MASK_WALL) {
//                 matrix.set(x, y, initialValue)
//                 walls.push(pos)
//                 continue;
//             }
//             fudge.push(pos)
//         }
//     }
//
//     for (let index in fudge) {
//         let tile = fudge[index]
//         let distances = walls.map((w) => w.getRangeTo(tile))
//         let lowestDistance = distances.sort((a, b) => a - b)[0]
//         matrix.set(tile.x, tile.y, lowestDistance)
//     }
//
//     return matrix.serialize()
//
// }

// Object.defineProperty(Room.prototype, "creeps", {
//     get: function () {
//         let list = []
//         // let check = function (roleCreep) {
//         //     if (!this.counts) {
//         //         this.counts = {}
//         //     }
//         //     if (!this.counts[roleCreep]) {
//         //         this.counts[roleCreep] = 0
//         //
//         //         this.memory.queue = this.queue.filter((c) => !(c[0] === roleCreep))
//         //     }
//         //
//         //     if (!this.oldCreeps) {
//         //         this.oldCreeps = {}
//         //     }
//         //     if (!this.oldCreeps[roleCreep]) {
//         //         this.oldCreeps[roleCreep] = this.find(FIND_MY_CREEPS, {
//         //             filter: function (c) {
//         //                 return c.memory.role === roleCreep
//         //             }
//         //         })
//         //     }
//         //
//         //     let creep = undefined
//         //     if (this.oldCreeps[roleCreep].length > this.counts[roleCreep]) {
//         //         this.oldCreeps[roleCreep][this.counts[roleCreep]].memory.level = this.memory.level
//         //     }
//         //     else
//         //     {
//         //         creep = role[roleCreep].create()
//         //     }
//         //
//         //     this.counts[roleCreep] += 1
//         //     return creep
//         // }
//
//         switch(this.memory.level) {
//             case(1):
//                 _.times(Object.keys(this.harvestSpots).length, () => {
//                     list = list.concat([
//                         check.call(this, "upgrader")
//                     ])
//                 })
//
//                 _.times(Object.keys(this.harvestSpots).length, () => {
//                     list = list.concat([
//                         check.call(this, "harvester"),
//                         check.call(this, "carrier"),
//                     ])
//                 })
//
//                 return list.filter((c) => c)
//             case(2):
//                 _.times(Object.keys(this.harvestSpots).length, () => {
//                     list = list.concat([
//                         check.call(this, "upgrader"),
//                     ])
//                 })
//
//                 _.times(Object.keys(this.harvestSpots).length, () => {
//                     list = list.concat([
//                         check.call(this, "harvester"),
//                         check.call(this, "carrier"),
//                         check.call(this, "carrier"),
//                     ])
//                 })
//
//                 return list.filter((c) => c)
//         }
//
//         list.forEach((l) => this.freePosition(l))
//     },
//     enumerable: false,
//     configurable: true
// })