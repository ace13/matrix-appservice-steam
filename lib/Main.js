
function Main(config) {
    var self = this;

    this._config = config;

    this.homeserver = config.matrix_homeserver;
    
    // Lookup tables
    this._steamRoomsByGroupID = {};
    this._steamRoomsByMatrixID = {};
    this._steamUsersByID = {};
    this._matrixUsersByID = {};

    var bridge = new Bridge({
        homeserverUrl: config.matrix_homeserver,
        domain: config.matrix_user_domain,
        registration: 'steam-registration.yaml',

        controller: {
            onUserQuery: function(queried) {
                return {}; // Need to set this later
            },

            onEvent: this.onEvent.bind(this)
        }
    });

    this._bridge = bridge;

    this.username_template = new MatrixIdTemplate(
        '@', config.username_template, config.matrix_user_domain
    );
    if (!this.username_template.hasField("SID")) {
        throw new Error("Expects the 'username_template' to contain the string ${SID}");
    }
}

Main.prototype.getOrCreateSteamRoom = function() {
};
Main.prototype.getSteamUser = function(id, opts) {
    if (!opts) opts = {};

    var u = this._steamUsersByID[id];
    if (u) return Promise.resolve(u);

    return this.getUserStore().select({ id: id })
        .then(function(entries) {
            var u = this._steamUsersByID[id];
            if (u) return u;

            if (entries.length)
            {
            }

            if (!opts.create) return null;

            u = this._steamUsersByID[id] = new SteamUser(this, {
                id: id,
                localpart: this.userLocalpartFromSteamID(id),
                username: opts.username
            });
            return this.putSteamUser(u).then(function() { return u; });
        });
};
Main.prototype.putSteamUser = function(user) {
    var entry = user.toEntry();
    return this.getUserStore().upsert({ id: entry.id }, entry);
};

Main.prototype.userLocalpartFromSteamID = function(SteamID) {
    return this.username_template.expandLocalpart({ SID: long.fromString(SteamID).toString(36) });
};
Main.prototype.userMXIDFromSteamID = function(SteamID) {
    return this.username_template.expandId({ SID: long.fromString(SteamID).toString(36) });
};
Main.prototype.userSteamIDFromMXID = function(MatrixID) {
    var data = this.username_template.matchId(MatrixID);
    return data ? long.fromString(data.SID, 36).toString() : null;
};


Main.prototype.getBridge = function() {
    return this._bridge;
};
Main.prototype.getBotIntent = function() {
    return this._bridge.getIntent();
};
Main.prototype.getRoomStore = function() {
    return this._bridge.getRoomStore();
};
Main.prototype.getUserStore = function() {
    return this._bridge.getUserStore();
};

module.exports = Main;
