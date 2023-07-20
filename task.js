// Tasks are local, they are bound to the room
// Tasks have requirements, such as contract types

function pull (creep) {
    global.contract.call(this, creep.id)
    this.temporary = true
    this.role = ["carrier", "puller"]
}

module.exports = {
    pull
}