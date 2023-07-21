// Tasks are local, they are bound to the room
// Tasks have requirements, such as contract types

function pull (creep) {
    this.contractor = creep.id
    this.performer = undefined
    this.role = ["carrier", "puller"]
}

module.exports = {
    pull
}