Object.defineProperty(Creep.prototype, "hello", {
    get: function () {
        if (!this._hello) {
            this._hello = "Hello"
        }

        return this._hello
    },
    set: function(newValue) {
        // We set the stored private variable so the next time the getter is called
        // it returns this new value
        this.hello = newValue;
    },

    enumerable: false,
    configurable: true
});

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
        if (!this.memory._harvestSpotOptimizer) {
            this.memory.harvestSpotOptimizer = [25, 25]
        }
        let x = this.memory.harvestSpotOptimizer[0]
        let y = this.memory.harvestSpotOptimizer[1]
        return new RoomPosition(x, y, this.name)
    },
    set: function(value) {
        this.memory.harvestSpotOptimizer = value
    },
    enumerable: false,
    configurable: true
})

