const Json = imports.gi.Json;
const Soup = imports.gi.Soup;

function Review(){
    this._init();
}
Review.prototype={
    _init: function(){
	return;
    },
    summary: function(){
	return this._summary;
    },
    url: function (){
	return this._url;
    },
    modified: function (){
	return this._modified;
    }
};


const Main = imports.ui.main;

function RBApi(settings){
    this._init(settings);
}
RBApi.prototype ={
    _init: function (settings){
	this._settings = settings;
	this.query = this._settings.getUrl()+"/api/review-requests/";
	this.reviews = undefined;
	this._last_update = {};
	this.subscribers = new Array();
    },
    subscribe: function (client){
	this.subscribers.push(client);
    },
    _notify: function (){
	for(let i=0;i<this.subscribers.length;++i){
	    this.subscribers[i].update();
	}
    },
    _load_json_async: function(url, fun) {
        let here = this;
	let _httpSession = new Soup.SessionAsync();
	Soup.Session.prototype.add_feature.call(_httpSession,
						new Soup.ProxyResolverDefault());
        let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(session, message) {
            let jp = new Json.Parser();
	    jp.load_from_data(message.response_body.data, -1);
            fun.call(here, jp.get_root().get_object());
        });
    },
    refresh: function(){
	this._load_json_async(this.query, this.parseJSON);
    },

    parseJSON: function(json){
	this.reviews = new Array();
	let req = json.get_array_member("review_requests").get_elements();
	for(let i=0; i < req.length; ++i){
	    let request = req[i].get_object();
	    let review = {
		"summary": request.get_string_member("summary"),
		"id": request.get_int_member("id"),
		"last_updated" : request.get_string_member("last_updated"),
		"branch": request.get_string_member("branch") 
	    }
	    review.url = this._settings.getUrl() + "/r/" + review.id 

	    review.modified = true;
	    let last_update = this._last_update[review.id];
	    if(last_update != undefined)
		if(last_update == review.last_updated)
		    review.modified = false;
	    this._last_update[review.id] = review.last_updated;
	    let br = this._settings.getBranch();
	    let rev = new Review();
	    rev._summary = review.summary;
	    rev._modified = review.modified;
	    rev._url = review.url;
	    this.reviews.push(rev);
	   
	}
	//Notify observers of new content
	this._notify();
    }
};

function IncomingRequests(settings){
    this._init(settings);
}
IncomingRequests.prototype ={
    __proto__ : RBApi.prototype,
    
    _init: function(settings){
	RBApi.prototype._init.call(this, settings);
    }
    
};

function MyRequests(settings){
    this._init(settings);
}
MyRequests.prototype={
    __proto__ : RBApi.prototype,
    
    _init: function(settings){
	RBApi.prototype._init.call(this, settings);
	this.query=settings.getUrl()+"/api/review-requests/?from-user="+settings.getUsername()
    }
};
