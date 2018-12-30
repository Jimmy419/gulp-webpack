import jquery from 'jquery'
const DefaultTab = (function ($) {

    const NAME = 'tab'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initTab'

    const Selector = {
        TAB: '.a-tab-fun',
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
        TAB_TARGETS: 'a-tab-targets',
        BGFIRST: 'a-first-active',
        BGLAST: 'a-last-active'
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
            if ($(this._element).find(Selector.ACTIVE_TAB).length === 0) {
                $(this._element).find(Selector.TAB_ITEM).eq(0).addClass(ClassName.ACTIVE);
            }
            let activeTabWidth = $(this._element).find(Selector.ACTIVE_TAB).outerWidth();
            let activeTabLeft = $(this._element).find(Selector.ACTIVE_TAB).position().left;
            let currentIndex = $(this._element).find(Selector.ACTIVE_TAB).index();
            let itemLength = $(this._element).find(Selector.TAB_ITEM).length;
            let bgcolor = $(this._element).find(Selector.ACTIVE_ANIMATER);
            //set position of active bar
            $(this._element).find(Selector.ACTIVE_ANIMATER).css({
                'left': activeTabLeft + "px",
                'width': activeTabWidth + "px"
            });

            //show/hide content if tab content is needed
            if ($(this._element).parent().hasClass(ClassName.TAB_CONT) && $(this._element).next().hasClass(ClassName.TAB_TARGETS)) {
                $(this._element).next().find(Selector.TAB_TARGET_ITEM).removeClass(ClassName.ACTIVE);
                const targetId = $(this._element).find(Selector.ACTIVE_TAB).attr(Attr.TARGET);
                $(this._element).next().find(targetId).addClass(ClassName.ACTIVE);
            }

            //add class to active bar for setting border radius
            bgcolor.removeClass(ClassName.BGLAST).removeClass(ClassName.BGFIRST);
            if (currentIndex <= 1) {
                bgcolor.addClass(ClassName.BGFIRST);
            }
            if (currentIndex === itemLength) {
                bgcolor.addClass(ClassName.BGLAST);
            }
        }

        events() {
            let O = this;
            $(this._element)
                .on(Event.CLICK, Selector.TAB_ITEM, event => {
                    event.preventDefault()
                    let clickedTab;
                    if (!$(event.target).is(Selector.TAB_ITEM)) {
                        clickedTab = $(event.target).closest(Selector.TAB_ITEM);
                    } else {
                        clickedTab = event.target;
                    }

                    if (!$(clickedTab).hasClass(ClassName.ACTIVE)) {
                        O.setActive(clickedTab);
                    }
                })
                .ready(() => {
                    O.init();
                })

            $(window).resize(function () {
                O.init();
            });
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
                    data.events();
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
        .ready(() => {
            setTimeout(function () {
                let defaultTabs = $(Selector.TAB);
                DefaultTab._jQueryInterface.call(defaultTabs, {
                    init: true
                });
            })
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
