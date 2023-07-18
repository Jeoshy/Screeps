// Contracts are global, any creep from any room can take the job
// Contracts are essentially roles, but are permanent thus can be switched
// Contracts have requirements. Creeps can apply, but can be rejected by the contract

function contract (roomName) {
    this.roomName = roomName
    this.occupied = false
}

let harvester = function (roomName) {
    contract.call(this, roomName)
    this.type = "harvester"

    return this
}

harvester.prototype.hello = function () {
    console.log("hello")
}

harvester.prototype.requirements = function (creep) {
    if (!creep || !creep.id) {
        return false
    }

    for (let part of creep.body) {
        if (part.type !== WORK) {
            console.log(`Rejected {creep.name}`)
            return false
        }
    }

    return true
}

module.exports = {
    harvester
}