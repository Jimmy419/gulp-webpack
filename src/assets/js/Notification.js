import jquery from 'jquery';

const Notification = ($ => {
    const NAME = 'notification';
    const VERSION = '0.0.1';
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const DATA_KEY = 'a.notification';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Event = {
        CLOSE: `close${EVENT_KEY}`,
        CLOSED: `closed${EVENT_KEY}`,
        SHOW: `show${EVENT_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    }

    const ClassName = {
        NOTIFICATION: 'a-notification',
        AUTO: 'a-auto-close',
        SHOW: 'a-notification-show',
        HIDE: 'a-notification-hide',
        COUNTDOWN: 'a-countdown',
        ANIMATED: 'animated',
        OPEN: 'open',
        EXPAND: 'expandable',
        EXTOGGLE: 'a-expand-toggle',
        UPCHEV: 'icon-up-chevron-fill',
        DOWNCHEV: 'icon-down-chevron-fill',
    }

    const AttrName = {
        DISMISS: 'data-dismiss',
        HIDE: 'data-hide',
        TARGET: 'data-target',
    }

    const Selector = {
        //SHOW/HIDE and DISMISS is to control notification
        SHOW: '[data-show="a-notification"]',
        HIDE: '[data-hide="a-notification"]',
        DISMISS: '[data-dismiss="a-notification"]',
        //OPEN and TOGGLE is to control expanded content
        OPEN: '[data-show="a-expand"]',
        TOGGLE: '[data-toggle="a-expand"]',
        /* 
         * EXPAND is used to select expanded content 
         * In case users rewrite the whole expanded content, don't use class as selector
         */
        EXPAND: '[data-content="a-expand"]',
    }
    /*
     * Class definition of Notification
     */
    class Notification {
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

        show(ele) {
            ele = this._getParent(ele);
            $(ele).addClass(ClassName.SHOW);
            $(ele).removeClass(ClassName.HIDE);
            this._handleAutoCloseStart(ele);
        }

        hide(ele) {
            const o = this;
            ele = o._getParent(ele);
            const expand = $(ele).find(Selector.EXPAND),
                expandTime = o._getTransitionDuration(expand),
                isOpen = $(ele).hasClass(ClassName.OPEN) && $(ele).hasClass(ClassName.EXPAND);
            if (isOpen) {
                /* 
                 * For notifications with expanded list
                 * Close list first wait until animation ends if it has
                 * handleAutoCloseEnd is to remove countdown timer and clear timeout
                 **/
                $(ele).removeClass(ClassName.OPEN);
                setTimeout(() => {
                    $(ele).addClass(ClassName.HIDE);
                    $(ele).removeClass(ClassName.SHOW);
                    o._handleAutoCloseEnd(ele);
                }, expandTime);
            } else {
                /* 
                 * For notifications without expanded list
                 * Close nofitication directly
                 * handleAutoCloseEnd is to remove countdown timer and clear timeout
                 **/
                $(ele).addClass(ClassName.HIDE);
                $(ele).removeClass(ClassName.SHOW);
                o._handleAutoCloseEnd(ele);
            }


        }

        open(ele) {
            ele = this._getParent(ele);
            $(ele).addClass(ClassName.OPEN);
            $(ele).find('.' + ClassName.EXTOGGLE).addClass(ClassName.DOWNCHEV).removeClass(ClassName.UPCHEV);
        }

        toggle(ele) {
            ele = this._getParent(ele);
            $(ele).toggleClass(ClassName.OPEN);
            $(ele).find('.' + ClassName.EXTOGGLE).toggleClass(ClassName.UPCHEV).toggleClass(ClassName.DOWNCHEV);
        }

        startcd(ele) {
            this._handleAutoCloseStart(ele);
        }

        endcd(ele) {
            this._handleAutoCloseStart(ele);
        }

        // private
        _getParent(ele) {
            const target = $(ele).attr(AttrName.TARGET);
            if ($(ele).hasClass(ClassName.Notification)) {
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
            const o = this;
            if (dismiss) {
                $(ele).find('.' + ClassName.COUNTDOWN).addClass(ClassName.ANIMATED);
                this._timeoutID = setTimeout(() => {
                    o.dismiss(ele);
                }, parseFloat(dismiss) * 1000);
            } else if (hide) {
                $(ele).find('.' + ClassName.COUNTDOWN).addClass(ClassName.ANIMATED);
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
                    data = new Notification(this)
                    $element.data(DATA_KEY, data)
                }

                if (data[config]) {
                    data[config](this)
                }
            })
        }
        static _handleShow(notificationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                notificationInstance.show(this)
            }
        }

        static _handleHide(notificationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                notificationInstance.hide(this)
            }
        }

        static _handleDismiss(notificationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                notificationInstance.dismiss(this)
            }
        }

        static _handleOpen(notificationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                notificationInstance.open(this)
            }
        }

        static _handleToggle(notificationInstance) {
            return function (event) {
                if (event) {
                    event.preventDefault()
                }

                notificationInstance.toggle(this)
            }
        }
    }

    $(document).on(
        Event.CLICK_DATA_API,
        Selector.SHOW,
        Notification._handleShow(new Notification())
    ).on(
        Event.CLICK_DATA_API,
        Selector.HIDE,
        Notification._handleHide(new Notification())
    ).on(
        Event.CLICK_DATA_API,
        Selector.DISMISS,
        Notification._handleDismiss(new Notification())
    ).on(
        Event.CLICK_DATA_API,
        Selector.OPEN,
        Notification._handleOpen(new Notification())
    ).on(
        Event.CLICK_DATA_API,
        Selector.TOGGLE,
        Notification._handleToggle(new Notification())
    );

    $.fn[NAME] = Notification._jQueryInterface
    $.fn[NAME].Constructor = Notification
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Notification._jQueryInterface
    }

})(jquery);

export default Notification;
