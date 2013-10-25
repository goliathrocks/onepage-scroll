/* ===========================================================
 * jquery-onepage-scroll.js v1.2.0
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * https://github.com/peachananr/onepage-scroll
 *
 * License: GPL v3
 *
 * ========================================================== */

(function($, window, document, undefined){

  var pluginName, defaults;

  pluginName = 'onepage_scroll'
  defaults = {
    sectionContainer: "section",
    easing: "ease",
    animationTime: 1000,
    pagination: true,
    updateURL: false,
    keyboard: true,
    beforeMove: null,
    afterMove: null,
    afterInit: null,
    loop: false
  }

  function OnepageScroll(element, options) {
    this.el = element
    this.$el = $(element)
    this.settings = $.extend({}, defaults, options)
    this._defaults = defaults
    this._name = pluginName
    this.$sections = $(this.settings.sectionContainer, this.$el)
    this.lastAnimation = Date.now()
    this.init()
  }

  OnepageScroll.prototype.init = function() {
    // Prepare everything before binding wheel scroll
    var _this = this,
        settings = this.settings,
        topPos = 0

    this.$el.addClass("onepage-wrapper")

    if (settings.pagination) {
      this.paginationList = ""
    }

    this.$sections.each(function(i) {
      $(this).addClass("section").css('top', topPos + '%').attr("data-index", i+1);

      topPos += 100

      if(settings.pagination) {
        this.paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
      }
    });

    var $hammer = this.$el.hammer()

    $hammer.on("dragdown", function() {
      _this.move('up')
    })

    $hammer.on("dragup", function(){
      _this.move('down')
    });

    // Create Pagination and Display Them
    if (settings.pagination) {
      $("<ul class='onepage-pagination'>" + this.paginationList + "</ul>").prependTo("body");
      var posTop = (this.$el.find(".onepage-pagination").height() / 2) * -1;
      this.$el.find(".onepage-pagination").css("margin-top", posTop);
    }

    if (window.location.hash && window.location.hash !== "#1") {
      var initIndex =  window.location.hash.replace("#", "")
      this.$current = this.$sections.filter("[data-index='" + initIndex + "']")

      if(settings.pagination) {
        $(".onepage-pagination li a" + "[data-index='" + initIndex + "']").addClass("active");
      }

      this.transformPage(initIndex - 1);

    } else {
      this.$current = this.$sections.first()
      if (settings.pagination) {
        $(".onepage-pagination li a[data-index='1']").addClass("active");
      }
    }

    if (settings.pagination) {
      $(".onepage-pagination li a").on('click', function() {
        var $this = $(this)
        var pageIndex = $this.data("index");

        if (!$this.hasClass("active")) {
          _this.$current = this.$sections.filter("[data-index='" + (pageIndex) + "']")

          if (_this.$current) {
            $(".onepage-pagination li a.active").removeClass("active");
            $(".onepage-pagination li a[data-index='" + (pageIndex) + "']").addClass("active");
          }
          _this.transformPage(pageIndex - 1);
        }

        if (settings.updateURL) {
          return false;
        }
      });
    }

    $(document).on('mousewheel DOMMouseScroll', function(event) {
      event.preventDefault();
      var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
      if (delta < 0) {
        _this.move('down')
      } else {
        _this.move('up')
      }
    });

    if (settings.keyboard) {
      $(document).keydown(function(e) {
        var tag = e.target.tagName.toLowerCase();
        switch(e.which) {
        case 38:
          if (tag !== 'input' && tag !== 'textarea') {
            _this.move('up')
          }
          break;
        case 40:
          if (tag !== 'input' && tag !== 'textarea') {
            _this.move('down')
          }
          break;
        default:
          return;
        }
        e.preventDefault();
      });
    }

    if (typeof settings.afterInit === 'function') {
      settings.afterInit.call(this)
    }

  }

  OnepageScroll.prototype.move = function(direction) {
    var settings = this.settings,
        index, nextIndex, $next,
        minTime = settings.animationTime + 600

    if (Date.now() <= (this.lastAnimation + minTime)) {
      return
    }

    this.lastAnimation = Date.now()

    index = this.$current.index()

    if (direction === 'up') {
      $next = this.$current.prev()
      nextIndex = index - 1
    } else {
      $next = this.$current.next()
      nextIndex = index + 1
    }

    if (! $next.length) {
      if (!settings.loop) {
        return
      }

      if (direction === 'up') {
        $next = this.$sections.last()
        nextIndex = this.$sections.length - 1
      } else {
        $next = this.$sections.first()
        nextIndex = 0
      }
    }

    if (typeof settings.beforeMove === 'function') {
      settings.beforeMove(nextIndex);
    }

    this.$current = $next

    if (settings.pagination) {
      $(".onepage-pagination li a[data-index='" + index + "']").removeClass("active");
      $(".onepage-pagination li a[data-index='" + nextIndex + "']").addClass("active");
    }

    if (settings.updateURL) {
      window.location.hash = '#' + nextIndex
    }

    this.transformPage(nextIndex);
  }

  OnepageScroll.prototype.transformPage = function(index) {
    var settings = this.settings,
        pos = index * -100
    this.$el.css({
      "-webkit-transform": "translate3d(0, " + pos + "%, 0)",
      "-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
      "-moz-transform": "translate3d(0, " + pos + "%, 0)",
      "-moz-transition": "all " + settings.animationTime + "ms " + settings.easing,
      "-ms-transform": "translate3d(0, " + pos + "%, 0)",
      "-ms-transition": "all " + settings.animationTime + "ms " + settings.easing,
      "transform": "translate3d(0, " + pos + "%, 0)",
      "transition": "all " + settings.animationTime + "ms " + settings.easing
    });

    if (typeof settings.afterMove === 'function') {
      this.$el.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
        settings.afterMove(index);
      });
    }
  }

  $.fn[ pluginName ] = function ( options ) {
    return this.each(function() {
      if ( !$.data( this, "plugin_" + pluginName ) ) {
        $.data( this, "plugin_" + pluginName, new OnepageScroll( this, options ) );
      }
    });
  };
}(window.jQuery, window, document));

