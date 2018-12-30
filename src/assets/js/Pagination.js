import $ from 'jquery';

const Pagination = (($) => {
    const NAME = 'pagination';
    const VERSION = '0.0.1';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const DATA_KEY = 'a.pagination';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Event = {
        PREV: `prev${EVENT_KEY}`,
        NEXT: `next${EVENT_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
        CHANGE_DATA_API: `change${EVENT_KEY}${DATA_API_KEY}`,
    }

    const ClassName = {
        PAGINATION: 'a-pagination',
        CURRENT: 'a-current-page',
        DISABLE: 'disabled',
    }

    const Selector = {
        PREV: '[data-control="prev"]',
        NEXT: '[data-control="next"]',
        INPUTNUMBER: 'input[type="number"]',
    }

    const AttrName = {
        TARGET: 'data-target',
        STEP: 'data-step',
    }

    class Pagination {
        constructor(ele) {
            this._ele = ele;
            const current = this._getCurrent(ele);
            const prev = ele;
            const next = this._getNext(ele);
            const step = parseInt(current.attr('data-step')) || 1;
            const min = current.attr('min');
            const max = current.attr('max');
            // Check if prev can be execute
            if (current.val() - step < min) {
                prev.addClass(ClassName.DISABLE);
                return;
            }
            if (current.val() + step > max) {
                next.addClass(ClassName.DISABLE);
                return;
            }
        }

        static get VERSION() {
            return VERSION
        }

        next(ele) {
            if ($(ele).hasClass(ClassName.DISABLE)) {
                return
            }
            const current = this._getCurrent(ele);
            const step = parseInt(current.attr('data-step')) || 1;

            current.val(parseInt(current.val()) + step);
            this.handleChange(ele);
            this._getParent(ele).trigger(Event.NEXT);
        }

        prev(ele) {
            if ($(ele).hasClass(ClassName.DISABLE)) {
                return
            }
            const current = this._getCurrent(ele);
            const step = parseInt(current.attr('data-step')) || 1;

            current.val(parseInt(current.val()) - step);
            this.handleChange(ele);
            this._getParent(ele).trigger(Event.PREV);

        }

        /* 
         * Called after input value changed 
         * prevent illegal value
         * Add disabled class to prev/next button if cannot be clicked 
         */
        handleChange(ele) {

            const current = this._getCurrent(ele); // input box
            const prev = this._getNext(ele); // prev button
            const next = this._getNext(ele); // next button
            const step = parseInt(current.attr('data-step')) || 1; // increment/decrement by every click, is 1 if user not specified
            const min = parseInt(current.attr('min')); // min value of the page number
            const max = parseInt(current.attr('max')); // max value of the page number
            const val = parseInt(current.val()); //current page number

            // prevent empty value
            // prevent illegal value
            // larger than max or smaller than min
            if (isNaN(val)) {
                current.val(min);
            }
            if (val > max) {
                current.val(max);
            }
            if (val < min) {
                current.val(min);
            }

            // Deal with buttons, to decide if it is clickable after the value change
            if (val - step < min) {
                prev.addClass(ClassName.DISABLE);
            } else {
                prev.removeClass(ClassName.DISABLE);

            }
            if (val + step > max) {
                next.addClass(ClassName.DISABLE);
            } else {
                next.removeClass(ClassName.DISABLE);
            }
        }

        // private
        _getParent(ele) {
            const target = $(ele).attr(AttrName.TARGET);

            if ($(ele).hasClass(ClassName.PAGINATION)) {
                return ele;
            } else if (target) {
                return $('#' + target);
            }
            return $(ele).closest('.' + ClassName.PAGINATION);
        }

        _getCurrent(ele) {
            ele = this._getParent(ele);
            return $(ele.find('.' + ClassName.CURRENT)[0] || ele.find(Selector.INPUTNUMBER)[0])
        }

        _getNext(ele) {
            ele = this._getParent(ele);
            return ele.find(Selector.NEXT);
        }

        _getPrev(ele) {
            ele = this._getParent(ele);
            return ele.find(Selector.PREV);
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                const $element = $(this)
                let data = $element.data(DATA_KEY)

                if (!data) {
                    data = new Pagination(this)
                    $element.data(DATA_KEY, data)
                }

                if (data[config]) {
                    data[config](this)
                }
            })
        }
        static _handleNext(paginationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                paginationInstance.next(this)
            }
        }
        static _handlePrev(paginationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                paginationInstance.prev(this)
            }
        }
        static _handleChange(paginationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                paginationInstance.handleChange(this)
            }
        }
    }
    $(document).on(
        Event.CLICK_DATA_API,
        Selector.PREV,
        Pagination._handlePrev(new Pagination())
    ).on(
        Event.CLICK_DATA_API,
        Selector.NEXT,
        Pagination._handleNext(new Pagination())
    ).on(
        Event.CHANGE_DATA_API,
        Selector.INPUTNUMBER,
        Pagination._handleChange(new Pagination())
    );

    $.fn[NAME] = Pagination._jQueryInterface;
    $.fn[NAME].Constructor = Pagination;
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Pagination._jQueryInterface
    }
})($);

export default Pagination;
