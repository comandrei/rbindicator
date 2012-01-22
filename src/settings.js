
const Gio = imports.gi.Gio;

const RB_SCHEMA = "org.gnome.shell.extensions.rbindicator";
const RB_URL ="url";
const RB_USER = "username";
const RB_PASS = "password";
const RB_NOTIFY = "notifications"
const RB_BRANCH = "branch";

function RBSettings(){
    this._init();
}

RBSettings.prototype = {
    _init : function(){
	this._settings = this._getSettings(RB_SCHEMA);
	this._loadSettings();
	this._watch(RB_NOTIFY);
    },
    _getSettings : function (schema) {
	if(Gio.Settings.list_schemas().indexOf(schema) == -1) {
	    throw ("Schema \"%s\" not found").format(schema);
	}
	return new Gio.Settings({ schema: schema });
    },
    _loadSettings : function() {
	this._url = this._settings.get_string(RB_URL);
	this._username = this._settings.get_string(RB_USER);
	this._password = this._settings.get_string(RB_PASS);
	this._notifications = this._settings.get_boolean(RB_NOTIFY);
	this._branch = this._settings.get_string(RB_BRANCH);
    },
    _watch: function(setting) {
	this._settings.connect('changed::'+setting, this._loadSettings);
    },
    set_notifications: function (state) {
	this._notifications = state;
	this._settings.set_boolean(RB_NOTIFY, this._notifications);
    },
    //Interface
    getUsername : function() {
	return this._username;
    },
    getNotifications : function() {
	return this._notifications;
    },
    getUrl: function(){
	return this._url;
    },
    getBranch: function (){
	return this._branch;
    },
    getRefresh: function (){
	return 30;
    }
};
