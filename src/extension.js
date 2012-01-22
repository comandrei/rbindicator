
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Shell = imports.gi.Shell;
const Signals = imports.signals;

const Extension = imports.ui.extensionSystem.extensions["rbindicator@comandrei.gmail.com"];
const RBSettings = Extension.settings.RBSettings;
const DualActionButton = Extension.ui.DualActionButton;
const MyRequests = Extension.model.MyRequests;
const IncomingRequests = Extension.model.IncomingRequests;
const ReviewMenu = Extension.ui.ReviewMenu

Signals.addSignalMethods(DualActionButton.prototype);


function RBButton() {
   this._init();
}
 
RBButton.prototype = {
    __proto__: DualActionButton.prototype,
 
    _init: function() {
	
	this.settings = new RBSettings();
	this.myrequests = new MyRequests(this.settings);
	this.incomingrequests = new IncomingRequests(this.settings);

	this.apis = [this.myrequests, this.incomingrequests];


        DualActionButton.prototype._init.call(this, 0.0);
 
	this._setIcon();
	
        /*
	  Left click menu
	*/
	let item = new ReviewMenu(_("My Reviews"), this.myrequests);
        this.menuL.addMenuItem(item);

        item = new ReviewMenu(_("Incoming Reviews"),this.incomingrequests);
        this.menuL.addMenuItem(item);
	/*
	  Right click menu
	*/
        let item = new PopupMenu.PopupSwitchMenuItem(_("Notifications"),
						 this.settings.getNotifications())
	item.connect('activate', Lang.bind(this,
					   this.toggleNotifications));
	this.menuR.addMenuItem(item);


	item = new PopupMenu.PopupMenuItem(_("Refresh"));
	item.connect('activate', Lang.bind(this, this.refresh));

        this.menuR.addMenuItem(item);
	
	Mainloop.timeout_add_seconds(3, Lang.bind(this, function() {
            this.refresh();
        }));
    },
    _setIcon: function() {
	this._iconActor = new St.Icon({ icon_name: 'rb',
                                        icon_type: St.IconType.FULLCOLOR,
                                        icon_size: 16 });
        this.actor.add_actor(this._iconActor);
    },
    
    refresh: function (){
	
	for(let i=0;i<this.apis.length;++i){
	    this.apis[i].refresh();
	}
	Mainloop.timeout_add_seconds(this._settings.getRefresh(),
				     Lang.bind(this, function() {
					 this.refresh();
				     }));
    },
    toggleNotifications : function (item, event) {
	this.settings.set_notifications(item.state);
    },

    _notify : function(text) {
	if(this.settings.getNotifications())
	    Main.notify(text);
    },    
    enable: function() {
        Main.panel._rightBox.insert_actor(this.actor, 0);
        Main.panel._menus.addMenu(this.menuL);
        Main.panel._menus.addMenu(this.menuR);
    },
 
    disable: function() {
        Main.panel._rightBox.remove_actor(this.actor);
        Main.panel._menus.removeMenu(this.menuL);
        Main.panel._menus.removeMenu(this.menuR);
    }
};
 
function init() {
    return new RBButton();
}