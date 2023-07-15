// Contracts are global, any creep from any room can take the job
// Contracts are essentially roles, but are permanent thus can be switched
// Contracts have requirements. Creeps can apply, but can be rejected by the contract

function contract (roomName) {
    this.roomName = roomName
}

let harvester = function (roomName) {
    contract.call(this, roomName)
    this.roleRequirements = ["harvester"]

    return this
}

harvester.prototype.requirements = function (creep) {
    if (!creep || !creep.id) {
        return false
    }

    if (!this.roleRequirements.includes(creep.memory.role)) {
        return false
    }

    return true
}

module.exports = {
    harvester
}