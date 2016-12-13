apos.widgetPlayers.tumblr = function($el) {
  var data = apos.getWidgetData($el);


  var sanitizeUrl = function(url) {
    if (!url.match(/^https?\:\/\//)) {
      url = 'https://' + url;
    }
    return url;
  };

  var limit = data.limit;
  var url = sanitizeUrl(data.url);

  $.ajax({
    dataType: "json",
    url: '/apos-tumblr/feed',
    data: {url: url, limit: limit},
    success: function(posts){

      //Define our photos object as well as the template and loader.
      var $posts = $el.find('[data-apos-tumblr-posts]'),
          $postTemplate = $posts.find('[data-template]'),
          $loader = $posts.find('[data-apos-tumblr-loader]');

      if (!posts.length) {
        $el.trigger('aposTumblrNull');
        return;
      }

      function init(){
        generatePostMarkup(posts);
      }

      function removeTemplate(){
        $postTemplate.remove();
      };

      function buildTemplate($template){
        $template.$title = $template.find('[data-apos-tumblr-title]');
        $template.$date = $template.find('[data-apos-tumblr-date]');
        $template.$body = $template.find('[data-apos-tumblr-body]');
        $template.$link = $template.find('[data-apos-tumblr-link]');
        return $template;
      }

      function cloneTemplate($obj){
        $clone = $obj.clone();
        $clone.removeAttr('data-template');
        clone = buildTemplate($clone);
        return clone;
      }

      function getTumblrDate(date){
        var postDate = new Date(date),
            postMonth = postDate.getMonth() + 1,
            postDay = postDate.getDate(),
            postYear = postDate.getFullYear(),
            thisYear = new Date().getFullYear();

        return ((postYear != thisYear ) ? postMonth +"/"+postDay+"/"+postYear: postMonth +"/"+postDay);
      }

      function generatePostMarkup(posts){
        _.each(posts, function(post){
          //Clone our Template
          var $post = cloneTemplate($postTemplate);

          if(post.title){
            $post.$title.text(post.title);
          } else {
            $post.$title.remove();
          }

          //Add Link href
          if(post.link){
            $post.$link.attr('href', post.link);
          }

          //Add Date
          if(post.date){
            var postDate = getTumblrDate(post.date);
            $post.$date.text(postDate);
          } else {
            $post.$date.remove();
          }

          //Add Body
          if (post.body) {
            $post.$body.html(post.body);
          } else {
            $post.$body.remove();
          }

          //If there's still a loader, kill it.
          $loader.remove();

          //Add That to the List
          $posts.append($post);
        });
        removeTemplate();

        //Need to add a hook in here to create project-specific galleries.
        apos.widgetPlayers.tumblr.afterLoad($el);
      };


      init();
    }
  });
}

apos.widgetPlayers.tumblr.afterLoad = function($el) {

}
