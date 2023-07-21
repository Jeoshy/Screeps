// Contracts are global, any room can make a new contract
// TODO: Contracts can be taken up by any room, preferably closest
// TODO: Rooms can take up any contract based on the predicted economy
// Contracts have negative energy per hour
// Contracts can be temporary

global.contract = function (roomName) {
    this.contractor = roomName
    this.performer = undefined
    this.temporary = false
    this.NEPH = 0
}

global.create = function (role) {
    if (!Memory.creepCounts) {
        Memory.creepCounts = {}
    }
    if (!Memory.creepCounts.harvester) {
        Memory.creepCounts.harvester = 0
    }

    Memory.creepCounts.harvester += 1
    return [role, `${role}${Memory.creepCounts.harvester}`]
}