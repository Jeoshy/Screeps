let role = require("creep")

Object.defineProperty(Room.prototype, 'sources', {
    get: function() {
        if (!this.memory.sources) {
            if (!this._sources) {
                this._sources = this.find(FIND_SOURCES).map(s => s.id);
            }

            this.memory.sources = this._sources
        }

        return this.memory.sources.map(s_id => Game.getObjectById(s_id));
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

Object.defineProperty(Room.prototype, "harvestSpots", {
    get: function () {
        if (!this.memory.harvestSpots) {
            let harvestSpots = {}
            this.sources.forEach((source) => {
                let hs = source.harvestSpots
                hs.length = 3
                hs.forEach((h) => {
                    harvestSpots[h] = false

                    // Creates contracts for the harvestSpots
                    this.addContract(new role.harvester.contract(this.name))
                })
            })

            this.memory.harvestSpots = harvestSpots
        }

        return this.memory.harvestSpots
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, "freeHarvestSpot", {
    get: function () {
        for (let harvestSpot in this.harvestSpots) {
            if (!this.harvestSpots[harvestSpot]) {
                this.harvestSpots[harvestSpot] = true
                return harvestSpot
            }
        }
    },
    enumerable: false,
    configurable: true
})

Room.prototype.addContract = function (contract) {
    if (!Memory.contracts) {
        Memory.contracts = {}
        Memory.contractTracker = 0
    }

    Memory.contractTracker += 1
    Memory.contracts[Memory.contractTracker] = contract
}

