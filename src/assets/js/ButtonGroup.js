import $ from 'jquery'

const ButtonGroup = ($ => {

    const NAME = 'btngroup'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initBtnGroup'

    const Selector = {
        BUTTON_GROUP: '.a-btn-group',
        ACTIVE: '.active',
        BUTTON: 'button[toggle-active="active"]',
        BGCOLOR: '.a-btn-group-bg'
    }

    const ClassName = {
        ACTIVE: 'active',
        BGCOLOR: 'a-btn-group-bg',
        BGFIRST: 'a-first-active',
        BGLAST: 'a-last-active'
    }

    const RenderDom = {
        BGCOLOR: `<i class=${ClassName.BGCOLOR}></i>`
    }

    const Event = {
        CLICK_BTN: 'click'
    }

    class Btnsgroup {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        init() {
            if (!$(this._element).find(Selector.BGCOLOR).length) {
                $(this._element).prepend(RenderDom.BGCOLOR);
            }
            let bgcolor = $(this._element).find(Selector.BGCOLOR);
            let current = $(this._element).children(Selector.ACTIVE);
            let currentIndex = current.index();
            let btnLength = $(this._element).find(Selector.BUTTON).length;
            bgcolor.removeClass(ClassName.BGLAST).removeClass(ClassName.BGFIRST);
            if (currentIndex <= 1) {
                bgcolor.addClass(ClassName.BGFIRST);
            }
            if (currentIndex === btnLength) {
                bgcolor.addClass(ClassName.BGLAST);
            }
            // eslint-disable-next-line no-console
            // console.log($(this._element).find("button").length)
            // console.log(current.index());
            let currentLeft = current.position().left;
            // eslint-disable-next-line no-console
            // console.log(currentLeft);
            let currentWidth = current.outerWidth(true);
            bgcolor.css({
                width: currentWidth + 'px',
                left: currentLeft + 'px'
            })

        }

        setActive(current) {
            $(this._element).children().removeClass(ClassName.ACTIVE);
            $(current).addClass(ClassName.ACTIVE);
            this.init();
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Btnsgroup(this);
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
        .on(Event.CLICK_BTN, Selector.BUTTON, event => {
            event.preventDefault()
            let button;
            if (!$(event.target).is(Selector.BUTTON)) {
                button = $(event.target).closest(Selector.BUTTON);
            } else {
                button = event.target;
            }

            if (!$(button).hasClass(ClassName.ACTIVE)) {
                let btngroup = $(button).closest(Selector.BUTTON_GROUP);
                Btnsgroup._jQueryInterface.call($(btngroup), {
                    current: button
                })
            }
        })
        .ready(() => {
            setTimeout(function () {
                let buttongroup = $(Selector.BUTTON_GROUP);
                Btnsgroup._jQueryInterface.call(buttongroup, {
                    init: true
                });
            })
        })

    $(window).resize(function () {
        let buttongroup = $(Selector.BUTTON_GROUP);
        Btnsgroup._jQueryInterface.call(buttongroup, {
            init: true
        });
    });

    $.fn[NAME] = Btnsgroup._jQueryInterface
    $.fn[NAME].Constructor = Btnsgroup
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Btnsgroup._jQueryInterface
    }

    return Btnsgroup
})($)

export default ButtonGroup
