import jquery from 'jquery'

const FieldStep = ($ => {

    const NAME = 'stepper'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initAppkitStepper'

    const Selector = {
        STEPPER: '.a-stepper-fun',
        INPUT: '.a-text-input',
        ICON_UP: '.a-icon-up',
        ICON_DOWN: '.a-icon-down',
        CONTRL_ICON: '.a-icon'
    }

    const ClassName = {
        DISABLED: 'disabled'
    }

    const Attr = {
        MIN: 'minNum',
        MAX: 'maxNum'
    }

    const Event = {
        CLICK_BTN: 'click',
        PROPERTY_CHANGE: 'input propertychange'
    }

    class Stepper {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        init() {
            $(this._element).find(Selector.CONTRL_ICON).removeClass(ClassName.DISABLED);
            let iptval = parseFloat($(this._element).find(Selector.INPUT).val());
            let ifmax = $(this._element).find(Selector.INPUT).attr(Attr.MAX);
            let ifmin = $(this._element).find(Selector.INPUT).attr(Attr.MIN);
            let maxNum = ifmax ? parseFloat($(this._element).find(Selector.INPUT).attr(Attr.MAX)) : null;
            let minNum = ifmin ? parseFloat($(this._element).find(Selector.INPUT).attr(Attr.MIN)) : null;
            if (isNaN(iptval)) {
                $(this._element).find(Selector.INPUT).val(minNum);
                $(this._element).find(Selector.ICON_DOWN).addClass(ClassName.DISABLED)
            }
            if (ifmax && (iptval >= maxNum)) {
                $(this._element).find(Selector.INPUT).val(maxNum)
                $(this._element).find(Selector.ICON_UP).addClass(ClassName.DISABLED)
            }
            if (ifmin && (iptval <= minNum)) {
                $(this._element).find(Selector.INPUT).val(minNum);
                $(this._element).find(Selector.ICON_DOWN).addClass(ClassName.DISABLED)
            }
        }

        events() {
            let O = this;
            $(this._element).on(Event.CLICK_BTN, Selector.ICON_UP, event => {
                    event.preventDefault()
                    O.addNum();
                })
                .on(Event.CLICK_BTN, Selector.ICON_DOWN, event => {
                    event.preventDefault()
                    O.reduceNum();
                })
                .on(Event.PROPERTY_CHANGE, Selector.INPUT, event => {
                    event.preventDefault()
                    O.init();
                })
        }

        addNum() {
            const currentVal = parseFloat($(this._element).find(Selector.INPUT).val());
            $(this._element).find(Selector.INPUT).val(currentVal + 1);
            this.init();
        }

        reduceNum() {
            const currentVal = parseFloat($(this._element).find(Selector.INPUT).val());
            $(this._element).find(Selector.INPUT).val(currentVal - 1);
            this.init();
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Stepper(this);
                    $(this).data(DATA_KEY, data);
                    data.init();
                    data.events();
                }
            })
        }
    }

    $.fn[NAME] = Stepper._jQueryInterface
    $.fn[NAME].Constructor = Stepper
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Stepper._jQueryInterface
    }

    return Stepper
})(jquery)

export default FieldStep
