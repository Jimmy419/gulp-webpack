import jquery from 'jquery';

const Alert = ($ => {
    const NAME = 'alert';
    const VERSION = '0.0.1';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const DATA_KEY = 'a.alert';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Event = {
        CLOSE: `close${EVENT_KEY}`,
        CLOSED: `closed${EVENT_KEY}`,
        SHOW: `show${EVENT_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    }

    const ClassName = {
        NOTIFICATION: 'a-alert',
        AUTO: 'a-auto-close',
        SHOW: 'a-alert-show',
        HIDE: 'a-alert-hide',
        COUNTDOWN: 'a-countdown',
        ANIMATED: 'animated',
        NONE: 'd-none',
    }

    const AttrName = {
        DISMISS: 'data-dismiss',
        HIDE: 'data-hide',
        TARGET: 'data-target',
    }

    const Selector = {
        //SHOW/HIDE and DISMISS is to control alert
        SHOW: '[data-show="a-alert"]',
        HIDE: '[data-hide="a-alert"]',
        DISMISS: '[data-dismiss="a-alert"]',
    }
    /*
     * Class definition of Alert
     */
    class Alert {
        constructor(ele) {
            this._ele = ele;
        }

        static get VERSION() {
            return VERSION
        }

        // public 
        dismiss(ele) {
            const rootEle = this._getParent(ele);

            const timer = this._getTransitionDuration(rootEle);
            this.hide(ele);

            setTimeout(() => {
                rootEle.remove();
            }, timer);
        }
        /*
         * show(ele), hide(ele) accept one varieble, can be event trigger or alert element
         * SHOW/HIDE - control opacity of elements, users can set transition on opacity
         * NONE - control display, after animation is end, will set elements to display none
         *      opacity = 0 will has effect on page, so need to set to NONE after animation
         */
        show(ele) {
            ele = this._getParent(ele);
            $(ele).addClass(ClassName.SHOW)
                .addClass(ClassName.ANIMATED)
                .removeClass(ClassName.NONE);
            $(ele).removeClass(ClassName.HIDE);
            this._handleAutoCloseStart(ele);
        }

        hide(ele) {
            const o = this;
            ele = o._getParent(ele);
            const timer = this._getTransitionDuration(ele);
            $(ele).removeClass(ClassName.ANIMATED);
            setTimeout(() => {
                $(ele).removeClass(ClassName.SHOW);
                $(ele).addClass(ClassName.HIDE);
                setTimeout(() => {
                    $(ele).addClass(ClassName.NONE);
                }, timer);
            }, 50);
            o._handleAutoCloseEnd(ele);
        }
        startcd(ele) {
            this._handleAutoCloseStart(ele);
        }
        endcd(ele) {
            this._handleAutoCloseEnd(ele);
        }
        // private
        _getParent(ele) {
            const target = $(ele).attr(AttrName.TARGET);
            if ($(ele).hasClass(ClassName.Alert)) {
                return ele;
            } else if (target) {
                return $('#' + target);
            }
            return $(ele).closest('.' + ClassName.NOTIFICATION);
        }
        _getTransitionDuration(ele) {
            if ($(ele).length === 0) {
                return 0;
            }
            const duration = $(ele).css('transition-duration').trim().split(',')[0];
            if (duration.indexOf('ms') !== -1) {
                return parseFloat(duration);
            } else if (duration.indexOf('s') !== -1) {
                return parseFloat(duration) * 1000;
            } else {
                return 0;
            }
        }
        _handleAutoCloseStart(ele) {
            const dismiss = $(ele).attr(AttrName.DISMISS);
            const hide = $(ele).attr(AttrName.HIDE);
            $(ele).find('.' + ClassName.COUNTDOWN).addClass(ClassName.ANIMATED);
            const o = this;
            if (dismiss) {
                this._timeoutID = setTimeout(() => {
                    o.dismiss(ele);
                }, parseFloat(dismiss) * 1000);
            } else if (hide) {
                this._timeoutID = setTimeout(() => {
                    o.hide(ele);
                }, parseFloat(hide) * 1000);
            }
        }
        _handleAutoCloseEnd(ele) {
            $(ele).find('.' + ClassName.COUNTDOWN).removeClass(ClassName.ANIMATED);

            if (this._timeoutID) {
                clearTimeout(this._timeoutID);
            }
        }
        static _jQueryInterface(config) {
            return this.each(function () {
                const $element = $(this)
                let data = $element.data(DATA_KEY)

                if (!data) {
                    data = new Alert(this)
                    $element.data(DATA_KEY, data)
                }

                if (data[config]) {
                    data[config](this)
                }
            })
        }
        static _handleShow(alertInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                alertInstance.show(this)
            }
        }

        static _handleHide(alertInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                alertInstance.hide(this)
            }
        }

        static _handleDismiss(alertInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                alertInstance.dismiss(this)
            }
        }
    }

    $(document).on(
        Event.CLICK_DATA_API,
        Selector.SHOW,
        Alert._handleShow(new Alert())
    ).on(
        Event.CLICK_DATA_API,
        Selector.HIDE,
        Alert._handleHide(new Alert())
    ).on(
        Event.CLICK_DATA_API,
        Selector.DISMISS,
        Alert._handleDismiss(new Alert())
    );

    $.fn[NAME] = Alert._jQueryInterface
    $.fn[NAME].Constructor = Alert
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Alert._jQueryInterface
    }

})(jquery);

export default Alert;
