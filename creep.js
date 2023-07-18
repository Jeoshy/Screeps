let getContract = require("Contract")

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

Object.defineProperty(Creep.prototype, "contract", {
    get: function () {
        if (!this.memory.contractID) {
            for (let contractID in Memory.contracts) {
                let contractMemory = Memory.contracts[contractID]
                if (contractMemory.occupied) {
                    continue
                }

                let contract = new getContract[contractMemory.type](contractMemory.roomName)

                if (contract.requirements(this)) {
                    contractMemory.occupied = true
                    this.memory.contractID = contractID
                    break;
                }
            }

            if (!this.memory.contractID) {
                return undefined
            }
        }

        return Memory.contracts[this.memory.contractID]
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