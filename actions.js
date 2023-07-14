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
        if (!this._sources) {
            this._sources = this.find(FIND_SOURCES);
        }
        return this._sources;
    },
    set: function(newValue) {
        // We set the stored private variable so the next time the getter is called
        // it returns this new value
        this._sources = newValue;
    },
    enumerable: false,
    configurable: true
});