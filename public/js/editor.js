// @class Editor for Flickr Set widgets

function AposFlickrWidgetEditor(options) {
  var self = this;

  if (!options.messages) {
    options.messages = {};
  }
  if (!options.messages.missing) {
    options.messages.missing = 'Paste in a URL for your Flickr set first.';
  }
  if (!options.messages.incorrect) {
    options.messages.incorrect = 'The URL that you pasted is not a Flick Set URL.';
  }

  self.type = 'flickr';
  options.template = '.apos-flickr-editor';

  AposWidgetEditor.call(self, options);

  // What are these doing?
  self.preSave = getSet;

  self.afterCreatingEl = function() {
    self.$setUrl = self.$el.find('[name="set"]');
    self.$setUrl.val(self.data.setUrl);
    self.$limit = self.$el.find('[name="limit"]');
    self.$limit.val(self.data.limit || 10);
    setTimeout(function() {
      self.$setUrl.focus();
      self.$setUrl.setSelection(0, 0);
    }, 500);
  };

  console.log(self);

  function getSet(callback) {
    self.exists = !!self.$setUrl.val();
    if (self.exists) {
      self.data.setUrl = self.$setUrl.val();
      self.data.limit = self.$limit.val();
    }
    if (!self.$setUrl.val().match(/sets\/([0-9]+)/)) {
      return alert(options.messages.incorrect);
    }
    return callback();
  }
}

AposFlickrWidgetEditor.label = 'Flickr Gallery';

apos.addWidgetType('flickr');
