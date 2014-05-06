var Flickr = require('node-flickr');
var extend = require('extend');
var _ = require('lodash');
var cache = {};

module.exports = function(options, callback) {
  return new Construct(options, callback);
};

module.exports.Construct = Construct;

function Construct(options, callback) {
  var apos = options.apos;
  var app = options.app;
  var flickr = new Flickr({"api_key": options.flickrKey});
  var self = this;
  self._apos = apos;
  self._app = app;
  var lifetime = options.lifetime ? options.lifetime : (60000*20);

  self._apos.mixinModuleAssets(self, 'flickr', __dirname, options);

  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  apos.defaultControls.push('flickr');

  // Include our editor template in the markup when aposTemplates is called
  self.pushAsset('template', 'flickrEditor', { when: 'user' });
  //self.pushAsset('template', 'flickr', { when: 'always' });

  // Make sure that aposScripts and aposStylesheets summon our assets

  // We need the editor for RSS feeds. (TODO: consider separate script lists for
  // resources needed also by non-editing users.)
  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'content', { when: 'always' });

  self.widget = true;
  self.label = options.label || 'Flickr Gallery';
  self.css = options.css || 'flickr';
  self.icon = options.icon || 'flickr';

  self.sanitize = function(item) {
    // Check here for Flickery-ness of the url.
    if (!item.setUrl.match(/^https?\:\/\//)) {
      item.setUrl = 'http://' + item.setUrl;
    }
    item.limit = parseInt(item.limit, 10);
  };

  self.renderWidget = function(data) {
    return self.render('flickr', data);
  };

  self.load = function(req, item, callback) {
    // (1) Figure out the setId number
    // (2) Load photos based on that set.

    item._photos = [];

    //Why does my regex suck?
    // TODO: check for bad stuff happening here.

    var tempIdString = item.setUrl.match(/sets\/([0-9]+)/);
    if (!tempIdString) {
      item._failed = true;
      return callback();
    }
    item.setId = tempIdString[1];

    //console.log("Cache is", cache);

    var now = new Date();
    // Take all properties into account, not just the feed, so the cache
    // doesn't prevent us from seeing a change in the limit property right away
    var key = JSON.stringify({ setUrl: item.setUrl, limit: item.limit });
    if (cache.hasOwnProperty(key) && ((cache[key].when + lifetime) > now.getTime())) {
      item._photos = cache[key].data;
      return callback();
    }

    flickr.get("photosets.getPhotos", {"photoset_id": item.setId, "extras": "url_l", "privacy_filter": "1", "per_page": item.limit}, function(result){
      _.each(result.photoset.photo, function(photo){
        var photoUrlString = (photo.url_l || "http://farm"+photo.farm+".staticflickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+".jpg")
        item._photos.push(photoUrlString);
      })
      cache[key] = { when: now.getTime(), data: item._photos };
      return callback();
    });

  };

  self._apos.addWidgetType('flickr', self);

  return setImmediate(function() { return callback(null); });
}
