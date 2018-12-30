import jquery from 'jquery'

const Dropdown = ($ => {

    const NAME = 'dropdown'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initAppkitDrop'

    const Selector = {
        DROPDOWN: '.a-dropdown',
        DROPDOWN_TOGGLE: '.a-dropdown-toggle',
        DROPDOWN_MENU: '.a-dropdown-menu',
        DROPDOWN_ITEM: '.a-dropdown-item',
        DROPDOWN_TEXT: '.a-choosen-text'
    }

    const ClassName = {
        SHOW: 'a-show',
        ACTIVE: 'active'
    }

    const Event = {
        CLICK: 'click'
    }

    class Dropdown {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        setActive(current) {
            $(this._element).find(Selector.DROPDOWN_ITEM).removeClass(ClassName.ACTIVE);
            $(current).addClass(ClassName.ACTIVE);
            $(this._element).removeClass(ClassName.SHOW);
            const currentVal = $(current).text();
            $(this._element).find(Selector.DROPDOWN_TEXT).html(currentVal);
        }

        toggle() {
            if ($(this._element).hasClass(ClassName.SHOW)) {
                $(this._element).removeClass(ClassName.SHOW)
            } else {
                $(this._element).addClass(ClassName.SHOW)
            }
        }

        hide() {
            $(this._element).removeClass(ClassName.SHOW);
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Dropdown(this);
                    $(this).data(DATA_KEY, data);
                }

                if (config) {
                    if (config.current) {
                        data.setActive(config.current);
                    }
                    if (config.toggle) {
                        data.toggle();
                    }
                    if (config.hide) {
                        data.hide();
                    }
                }
            })
        }
    }


    $(document)
        .on(Event.CLICK, Selector.DROPDOWN_ITEM, event => {
            event.preventDefault()
            event.stopPropagation();
            let clickedMenu;
            if (!$(event.target).is(Selector.DROPDOWN_ITEM)) {
                clickedMenu = $(event.target).closest(Selector.DROPDOWN_ITEM);
            } else {
                clickedMenu = event.target;
            }

            if (!$(clickedMenu).hasClass(ClassName.ACTIVE)) {
                let dropdown = $(clickedMenu).closest(Selector.DROPDOWN);
                Dropdown._jQueryInterface.call($(dropdown), {
                    current: clickedMenu
                })
            }
        })
        .on(Event.CLICK, Selector.DROPDOWN_TOGGLE, event => {
            event.preventDefault();
            event.stopPropagation();
            let dropdown = $(event.target).closest(Selector.DROPDOWN);
            Dropdown._jQueryInterface.call($(dropdown), {
                toggle: true
            })
        })

    $(window).click(function () {
        Dropdown._jQueryInterface.call($(Selector.DROPDOWN), {
            hide: true
        })
    })

    $.fn[NAME] = Dropdown._jQueryInterface
    $.fn[NAME].Constructor = Dropdown
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Dropdown._jQueryInterface
    }

    return Dropdown
})(jquery)

export default Dropdown
