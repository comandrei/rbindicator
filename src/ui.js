const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;


function DualActionButton(menuAlignment) {
    this._init(menuAlignment);
}

DualActionButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,
 
    _init: function(menuAlignment) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                               can_focus: true,
                                               track_hover: true });
 
        this.actor.connect('button-press-event', Lang.bind(this,
							   this._onButtonPress));
        this.actor.connect('key-press-event', Lang.bind(this,
							this._onSourceKeyPress));
 
        this.menuL = new PopupMenu.PopupMenu(this.actor,
					     menuAlignment, St.Side.TOP);
        this.menuL.actor.add_style_class_name('panel-menu');
        this.menuL.connect('open-state-changed',
			   Lang.bind(this,
				     this._onOpenStateChanged));
        this.menuL.actor.connect('key-press-event',
				 Lang.bind(this, this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuL.actor);
        this.menuL.actor.hide();
 
        this.menuR = new PopupMenu.PopupMenu(this.actor,
					     menuAlignment, St.Side.TOP);
        this.menuR.actor.add_style_class_name('panel-menu');
        this.menuR.connect('open-state-changed',
			   Lang.bind(this,
				     this._onOpenStateChanged));
        this.menuR.actor.connect('key-press-event',
				 Lang.bind(this,
					   this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuR.actor);
        this.menuR.actor.hide();
    },
    _onButtonPress: function(actor, event) {
        let button = event.get_button();
        if (button == 1) {
            if (this.menuL.isOpen) {
                this.menuL.close();
            } else {
                if (this.menuR.isOpen)
                    this.menuR.close();
                this.menuL.open();
            }
        } else if (button == 3) {
            if (this.menuR.isOpen) {
                this.menuR.close();
            } else {
                if (this.menuL.isOpen)
                    this.menuL.close();
                this.menuR.open();
            }
        }
    },
 
    _onSourceKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
            if (this.menuL.isOpen) {
                this.menuL.close();
            } else if (this.menuR.isOpen) {
                this.menuR.close();
            }
            return true;
        } else if (symbol == Clutter.KEY_Escape) {
            if (this.menuL.isOpen)
                this.menuL.close();
            if (this.menuR.isOpen)
                this.menuR.close();
            return true;
        } else
            return false;
    },
 
    _onMenuKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_Left || symbol == Clutter.KEY_Right) {
            let focusManager = St.FocusManager.get_for_stage(global.stage);
            let group = focusManager.get_group(this.actor);
            if (group) {
                let direction = (symbol == Clutter.KEY_Left) ? Gtk.DirectionType.LEFT : Gtk.DirectionType.RIGHT;
                group.navigate_focus(this.actor, direction, false);
                return true;
            }
        }
        return false;
    },
 
    _onOpenStateChanged: function(menu, open) {
        if (open)
            this.actor.add_style_pseudo_class('active');
        else
            this.actor.remove_style_pseudo_class('active');
    },
 
    destroy: function() {
        this.actor._delegate = null;
        this.menuL.destroy();
        this.menuR.destroy();
        this.actor.destroy();
        this.emit('destroy');
    },
 
};

function ReviewRequestMenuItem(review){
    this._init(review);
}

ReviewRequestMenuItem.prototype ={
    __proto__ : PopupMenu.PopupBaseMenuItem.prototype,

    _init: function (review, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);
	this._review = review;
	let icon = 'rb';
	if(this._review.modified())
	    icon = 'rb-mod';
	this._icon = new St.Icon({icon_name: icon,
				  icon_type: St.IconType.FULLCOLOR,
				  icon_size:16
				 })
        this.label = new St.Label({ text: this._review.summary() });
        this.addActor(this.label);
	this.addActor(this._icon, {expand:false});
    },

    activate: function (event) {
	Util.spawn(["firefox", this._review.url()]);
    }
};
function ReviewMenu(text, rbapi){
    this._init(text, rbapi);
}
ReviewMenu.prototype ={
    __proto__ : PopupMenu.PopupSubMenuMenuItem.prototype,

    _init: function(text, rbapi){
	PopupMenu.PopupSubMenuMenuItem.prototype._init.call(this, text);
	this._rbapi = rbapi;
	this._rbapi.subscribe(this);
    },
    _refresh: function(){
	this.menu.removeAll();
	let reviews = this._rbapi.reviews;
	if(reviews != undefined && reviews.length){
	    let modified = 0;
	    for(let i=0; i<reviews.length; ++i){
		let rr = new ReviewRequestMenuItem(reviews[i]);
		if(reviews[i].modified())
		    ++modified;
		this.menu.addMenuItem(rr);
	    }

	}
	else{
	    this.menu.addMenuItem(new PopupMenu.PopupMenuItem("No reviews"));
	}
    },
    update: function() {
	this._refresh();
    }
};
