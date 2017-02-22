
function SteamUser(main, opts) {
    this._main = main;

    this._steam_id = opts.id;
    this._localpart = opts.localpart;
    this._display_name = opts.display_name;
    this._avatar_url = opts.avatar_url;

    this._presentInRooms = new Set();
    this._ispresent = false;
    this._ghost = null;

    this._atime = null;
}

SteamUser.fromEntry = function(main, entry) {
    return new SteamUser(main, {
        id: entry.id,
        localpart: entry.data.localpart,
        display_name: entry.data.display_name,
        avatar_url: entry.data.avatar_url,
    });
};

SteamUser.prototype.toEntry = function() {
    return {
        type: 'remote',
        id: this._steam_id,
        data: {
            localpart: this._localpart,
            display_name: this._display_name,
            avatar_url: this._avatar_url,
        }
    };
};

SteamUser.prototype.getSteamID = function() {
    return this._steam_id;
};
SteamUser.prototype.GetDisplayName = function() {
    return this._display_name;
};

SteamUser.prototype.getMatrixGhost = function() {
    var localpart = this._localpart ||
        this._main.userLocalpartFromSteamID(this._steam_id);
    this._ghost = this._ghost ||
        this._main.getBridge().getIntentFromLocalpart(localpart);
    return this._ghost;
};
SteamUser.prototype.sendMessage = function(room_id, msg) {
    return this.getMatrixGhost().sendMessage(room_id, msg);
};
