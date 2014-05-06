// @class Editor for Tumblr widgets

function AposTumblrWidgetEditor(options) {
  var self = this;

  if (!options.messages) {
    options.messages = {};
  }
  if (!options.messages.missing) {
    options.messages.missing = 'Paste in a URL for your Tumblr first.';
  }
  if (!options.messages.incorrect) {
    options.messages.incorrect = 'The URL that you pasted is not a valid Tumblr.';
  }

  self.type = 'tumblr';
  options.template = '.apos-tumblr-editor';

  AposWidgetEditor.call(self, options);

  // What are these doing?
  self.preSave = getPosts;

  self.afterCreatingEl = function() {
    self.$url = self.$el.find('[name="tumblrUrl"]');
    self.$url.val(self.data.url);
    self.$limit = self.$el.find('[name="tumblrLimit"]');
    // N.B. Tumblr has a set limit of 10 posts on their RSS feed.
    // We live in a world of useful constraints. --Joel
    self.$limit.val(self.data.limit || 10);
    setTimeout(function() {
      self.$url.focus();
      self.$url.setSelection(0, 0);
    }, 500);
  };


  function getPosts(callback) {
    self.exists = !!self.$url.val();
    if (self.exists) {
      self.data.url = self.$url.val();
      self.data.limit = self.$limit.val();
    }
    if (!self.$url.val().match(/tumblr.com/)) {
      return alert(options.messages.incorrect);
    }
    return callback();
  }
}

AposTumblrWidgetEditor.label = 'Tumblr Feed';

apos.addWidgetType('tumblr');
