import jquery from 'jquery'

const Accordion = ($ => {
    const NAME = 'accordion';
    const VERSION = '0.0.1';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const DATA_KEY = 'a.accordion';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Event = {
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    }
    const ClassName = {
        EXTOGGLE: 'accordion-title',
        CONTENT: 'accordion-content',
        APPKITICON: 'appkiticon',

    }
    const Selector = {
        toggleClass: '[data-toggle="accordion-title"]',
    }
    class Accordion {
        constructor(ele) {
            this.ele = ele;
        }
        static get VERSION() {
            return VERSION
        }

        toggle(ele) {
            if ($(ele).next().hasClass('show')) {
                $(ele).next().removeClass('show')
                    .slideUp(350);
                $(ele).parent().find('.' + ClassName.APPKITICON).toggleClass('icon-up-chevron-fill icon-down-chevron-fill');

            } else {
                // $(ele).parent().parent().find('.' + ClassName.CONTENT).removeClass('show');
                $(ele).parent().find('.' + ClassName.APPKITICON).toggleClass('icon-up-chevron-fill icon-down-chevron-fill');
                $(ele).parent().find('.' + ClassName.CONTENT).slideUp(350);
                $(ele).next().toggleClass('show')
                    .slideToggle(350);
            }
        };

        static _jQueryInterface(config) {
            return this.each(function () {
                const $element = $(this)
                let data = $element.data(DATA_KEY)

                if (!data) {
                    data = new Accordion(this)
                    $element.data(DATA_KEY, data)
                }

                if (data[config]) {
                    data[config](this)
                }
            })
        }

        static _handleToggle(accordionInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }
                accordionInstance.toggle(this)
            }
        }
    }
    $(document).on(
        Event.CLICK_DATA_API,
        Selector.toggleClass,
        Accordion._handleToggle(new Accordion())
    )

    $.fn[NAME] = Accordion._jQueryInterface
    $.fn[NAME].Constructor = Accordion
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Accordion._jQueryInterface
    }

})(jquery);
export default Accordion;
