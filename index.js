var feedparser = require('feedparser');
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
  var self = this;
  self._apos = apos;
  self._app = app;
  var lifetime = options.lifetime ? options.lifetime : 60000;

  self._apos.mixinModuleAssets(self, 'tumblr', __dirname, options);

  // This widget should be part of the default set of widgets for areas
  // (this isn't mandatory)
  apos.defaultControls.push('tumblr');

  // Include our editor template in the markup when aposTemplates is called
  self.pushAsset('template', 'tumblrEditor', { when: 'user' });
  //self.pushAsset('template', 'tumblr', { when: 'always' });

  // Make sure that aposScripts and aposStylesheets summon our assets

  // We need the editor for RSS feeds. (TODO: consider separate script lists for
  // resources needed also by non-editing users.)
  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'content', { when: 'always' });

  self.widget = true;
  self.label = options.label || 'Tumblr Feed';
  self.css = options.css || 'tumblr';
  self.icon = options.icon || 'icon-tumblr';

  self.sanitize = function(item) {
    if (!item.url.match(/^https?\:\/\//)) {
      item.url = 'http://' + item.url;
    }
    item.limit = parseInt(item.limit, 10);
  };

  self.renderWidget = function(data) {
    return self.render('tumblr', data);
  };

  self.load = function(req, item, callback) {


    item._entries = [];

    var now = new Date();
    // Take all properties into account, not just the feed, so the cache
    // doesn't prevent us from seeing a change in the limit property right away
    var key = JSON.stringify({ feed: item.url, limit: item.limit });
    if (cache.hasOwnProperty(key) && ((cache[key].when + lifetime) > now.getTime())) {
      item._entries = cache[key].data;
      return callback();
    }

    // N.B. Tumblr has a set limit of 10 posts on their RSS feed.
    // We live in a world of useful constraints. --Joel

    feedparser.parseUrl(item.url+'/rss').on('complete', function(meta, articles) {
      articles = articles.slice(0, item.limit);

      // map is native in node
      item._entries = articles.map(function(article) {

        return {
          title: article.title,
          body: article.description,
          date: article.pubDate,
          link: article.link
        };
      });
      // Cache for fast access later
      cache[key] = { when: now.getTime(), data: item._entries };
      return callback();
    }).on('error', function(error) {
      item._failed = true;
      return callback();
    });
  };

  self._apos.addWidgetType('tumblr', self);

  return setImmediate(function() { return callback(null); });
}
