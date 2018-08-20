import jquery from 'jquery'
const DefaultTab = (function ($) {

  const NAME = 'defaultTab'
  const VERSION = '0.0.1'
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  const DATA_KEY = 'initTab'

  const Selector = {
    TAB: '.a-tab',
    ACTIVE_TAB: '.a-tab-item.active',
    ACTIVE_TARGET: '.a-tab-target-item.active',
    TAB_ITEM: '.a-tab-item',
    ACTIVE_ANIMATER: '.a-active-bar',
    TAB_CONT: '.a-tab-container',
    TAB_TARGET_ITEM: '.a-tab-target-item'
  }

  const ClassName = {
    ACTIVE: 'active',
    ACTIVE_ANIMATER: 'a-active-bar',
    TAB_CONT: 'a-tab-container',
    TAB_TARGETS: 'a-tab-targets'
  }

  const Attr = {
    TARGET: 'target'
  }

  const RenderDom = {
    BGCOLOR: `<i class=${ClassName.ACTIVE_ANIMATER}></i>`
  }

  const Event = {
    CLICK: 'click'
  }

  class DefaultTab {
    constructor(element) {
      this._element = element
    }

    static get VERSION() {
      return VERSION
    }

    init() {
      if ($(this._element).find(Selector.ACTIVE_ANIMATER).length === 0) {
        $(this._element).prepend(RenderDom.BGCOLOR);
      }
      let activeTabWidth = $(this._element).find(Selector.ACTIVE_TAB).width();
      let activeTabLeft = $(this._element).find(Selector.ACTIVE_TAB).position().left;
      $(this._element).find(Selector.ACTIVE_ANIMATER).css({
        'left': activeTabLeft + "px",
        'width': activeTabWidth + "px"
      });
      if ($(this._element).parent().hasClass(ClassName.TAB_CONT) && $(this._element).next().hasClass(ClassName.TAB_TARGETS)) {
        $(this._element).next().find(Selector.TAB_TARGET_ITEM).removeClass(ClassName.ACTIVE);
        const targetId = $(this._element).find(Selector.ACTIVE_TAB).attr(Attr.TARGET);
        $(this._element).next().find(targetId).addClass(ClassName.ACTIVE);
      }
    }

    setActive(obj) {
      $(this._element).find(Selector.TAB_ITEM).removeClass(ClassName.ACTIVE);
      $(obj).addClass(ClassName.ACTIVE);
      this.init();
    }

    static _jQueryInterface(config) {
      return this.each(function () {
        let data = $(this).data(DATA_KEY)

        if (!data) {
          data = new DefaultTab(this);
          $(this).data(DATA_KEY, data);
          data.init();
        }

        if (config) {
          if (config.current) {
            data.setActive(config.current);
          }
          if (config.init) {
            data.init();
          }
        }
      })
    }
  }

  $(document)
    .on(Event.CLICK, Selector.TAB_ITEM, event => {
      event.preventDefault()
      let item = event.target
      if (!$(item).hasClass(ClassName.ACTIVE)) {
        let parentTab = $(item).closest(Selector.TAB);
        DefaultTab._jQueryInterface.call($(parentTab), {
          current: item
        })
      }
    })
    .ready(() => {
      let defaultTabs = $(Selector.TAB);
      DefaultTab._jQueryInterface.call(defaultTabs);
    })

  $.fn[NAME] = DefaultTab._jQueryInterface;
  $.fn[NAME].Constructor = DefaultTab;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return DefaultTab._jQueryInterface
  }

  return DefaultTab

})(jquery);

export default DefaultTab
