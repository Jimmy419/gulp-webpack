import jquery from 'jquery'
const ResponsiveTab = (function ($) {

    const NAME = 'responsiveTab'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initTab'

    const Selector = {
        RESPONSIVETAB: '.a-responsive-tab',
        TABITEM: '.tab-item',
        TABPANE: '.tab-pane',
        MOVECTRL: '.move-ctrl',
        TOLEFT: '.to-left',
        TORIGHT: '.to-right',
        MOVEBOX: '.move-box',
        SCROLLHOLDER: '.scroll-holder',
        TABHEADER: '.a-tab-header',
        ACTIVE_TABITEM: '.tab-item.active'
    }

    const ClassName = {
        ACTIVE: 'active',
        FLOAT_LEFT: 'float-left'
    }

    const Event = {
        CLICK: 'click'
    }

    class ResponsiveTab {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        setMinWidth() {
            const TabItem = $(this._element).find(Selector.TABITEM);
            let arr = [];
            $.each(TabItem, function () {
                arr.push($(this).width());
            });
            const maxWidth = Math.max.apply(null, arr);
            $(this._element).css("min-width", maxWidth + this.moveCtrlWidth + 'px');
        }

        resetTab() {
            const TabItem = $(this._element).find(Selector.TABITEM);
            const TabPane = $(this._element).find(Selector.TABPANE);
            TabItem.removeClass("active");
            TabPane.removeClass("active").removeClass("in");
        }

        showAlways() {
            const TabItem = $(this._element).find(Selector.TABITEM);
            const iJson = this;
            TabItem.each(function () {
                if ($(this).hasClass("active")) {
                    const obj = $(this);
                    iJson.moveCurrentShow(obj);
                }
            });
            iJson.init();
        }

        init() {
            const MoveCtrl = $(this._element).find(Selector.MOVECTRL);
            const TabItem = $(this._element).find(Selector.TABITEM);
            const TabPane = $(this._element).find(Selector.TABPANE);
            const ToLeft = $(this._element).find(Selector.TOLEFT);
            const ToRight = $(this._element).find(Selector.TORIGHT);
            const MoveBox = $(this._element).find(Selector.MOVEBOX);
            const ScrollHolder = $(this._element).find(Selector.SCROLLHOLDER);
            const TabHeader = $(this._element).find(Selector.TABHEADER);

            MoveCtrl.hide();
            let wi = 0;

            $.each(TabItem, function () {
                wi += $(this).outerWidth();
            });

            ScrollHolder.css("width", Math.ceil(wi) + 'px');

            if (wi + this.headerPadding * 2 >= $(this._element).width()) {
                if (!MoveBox.hasClass(ClassName.FLOAT_LEFT)) {
                    MoveBox.addClass(ClassName.FLOAT_LEFT);
                }
                TabHeader.css({
                    "padding-left": 0,
                    "padding-right": 0
                })
                MoveCtrl.show();
                MoveBox.css("width", parseInt($(this._element).width() - this.moveCtrlWidth, 0) + "px");
            } else {
                if (MoveBox.hasClass(ClassName.FLOAT_LEFT)) {
                    MoveBox.removeClass(ClassName.FLOAT_LEFT);
                }
                MoveBox.css("width", wi + "px");
                TabHeader.css({
                    "padding-left": this.headerPadding + "px",
                    "padding-right": this.headerPadding + "px"
                })
            }

            const disRight = ScrollHolder.outerWidth() + ScrollHolder.position().left - MoveBox.outerWidth();
            if (disRight <= 2) {
                ScrollHolder.css({
                    left: "auto",
                    right: '0'
                });
            }

            const posLeft = $(this._element).find(".tab-item.active").position().left;
            const activewidth = $(this._element).find(".tab-item.active").width();
            const activebar = $(this._element).find('.active-bar');
            activebar.css({
                'left': posLeft + 'px',
                'width': activewidth + 'px'
            });

            this.disabledCtr();
        }

        events() {
            let O = this;
            $(this._element)
                .on(Event.CLICK, Selector.TABITEM, event => {
                    event.preventDefault()
                    let clickedTab;
                    if (!$(event.target).is(Selector.TABITEM)) {
                        clickedTab = $(event.target).closest(Selector.TABITEM);
                    } else {
                        clickedTab = event.target;
                    }

                    if (!$(clickedTab).hasClass(ClassName.ACTIVE)) {
                        O.clickTab(clickedTab)
                    }
                })
                .on(Event.CLICK, Selector.TOLEFT, event => {
                    event.preventDefault()
                    O.toLeft()
                })
                .on(Event.CLICK, Selector.TORIGHT, event => {
                    event.preventDefault()
                    O.toRight()
                })
                .ready(() => {
                    O.init();
                })

            $(window).resize(function () {
                O.showAlways();
            });
        }

        disabledCtr() {
            const MoveCtrl = $(this._element).find(Selector.MOVECTRL);
            const MoveBox = $(this._element).find(Selector.MOVEBOX);
            const ScrollHolder = $(this._element).find(Selector.SCROLLHOLDER);
            const ToLeft = $(this._element).find(Selector.TOLEFT);
            const ToRight = $(this._element).find(Selector.TORIGHT);
            MoveCtrl.removeClass('disabled');
            if (ScrollHolder.position().left >= -2) {
                ToLeft.addClass("disabled");
            }
            const disRight = ScrollHolder.outerWidth() + ScrollHolder.position().left - MoveBox.outerWidth();
            if (disRight <= 2) {
                ToRight.addClass("disabled");
            }
        }

        moveCurrentShow(obj) {
            const ScrollHolder = $(this._element).find(Selector.SCROLLHOLDER);
            const posLeft = $(obj).position().left;
            const parentLeft = $(obj).parent().position().left;
            const scrollBoxWidth = $(obj).parents(".move-box").width();
            const setRight = posLeft + $(obj).outerWidth(true) - scrollBoxWidth;
            if (0 - parentLeft + scrollBoxWidth < posLeft + $(obj).outerWidth(true)) {
                ScrollHolder.css({
                    "left": "-" + setRight + "px",
                    "right": "auto"
                });
            }
            if (0 - parentLeft > posLeft) {
                ScrollHolder.css({
                    "left": "-" + posLeft + "px",
                    "right": "auto"
                });
            };
        }

        clickTab(obj) {
            const TabPane = $(this._element).find(Selector.TABPANE);
            const inx = $(obj).index() - 1;
            if ($(obj).hasClass("active")) {
                return;
            }
            this.resetTab();
            $(obj).addClass("active");
            TabPane.eq(inx).addClass("active in");
            this.moveCurrentShow(obj);
            this.init();
        }

        toLeft() {
            const TabItem = $(this._element).find(Selector.TABITEM);
            const ScrollHolder = $(this._element).find(Selector.SCROLLHOLDER);
            var iJson = this;
            const speed = this.speed ? this.speed : (ScrollHolder.width() / TabItem.length);
            const leftMove = speed + ScrollHolder.position().left;
            if (leftMove >= 0) {
                ScrollHolder.stop().animate({
                    'left': "0",
                    "right": "auto"
                }, function () {
                    iJson.disabledCtr();
                });
            } else {
                ScrollHolder.stop().animate({
                    left: leftMove + "px",
                    right: 'auto'
                }, function () {
                    iJson.disabledCtr();
                });
            }
        }

        toRight() {
            const TabItem = $(this._element).find(Selector.TABITEM);
            const ScrollHolder = $(this._element).find(Selector.SCROLLHOLDER);
            const MoveBox = $(this._element).find(Selector.MOVEBOX);
            var iJson = this;
            const speed = this.speed ? this.speed : (ScrollHolder.width() / TabItem.length);
            const rightMove = ScrollHolder.position().left - speed;
            if (rightMove - MoveBox.width() <= (0 - ScrollHolder.width())) {
                const leftVal = MoveBox.width() - ScrollHolder.width();
                ScrollHolder.stop().animate({
                    left: leftVal + "px",
                    right: 'auto'
                }, function () {
                    iJson.disabledCtr();
                });
            } else {
                ScrollHolder.stop().animate({
                    left: rightMove + "px",
                    right: 'auto'
                }, function () {
                    iJson.disabledCtr();
                });
            }
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new ResponsiveTab(this);
                    data.moveCtrlWidth = 72;
                    data.headerPadding = 0
                    $(this).data(DATA_KEY, data);
                    data.init();
                    data.setMinWidth();
                    data.events();
                }

                if (config) {
                    if (config.moveCtrlWidth) {
                        data.moveCtrlWidth = config.moveCtrlWidth
                    }
                    if (config.headerPadding) {
                        data.headerPadding = config.headerPadding
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
            let restab = $(Selector.RESPONSIVETAB);
            ResponsiveTab._jQueryInterface.call(restab);
        })

    $.fn[NAME] = ResponsiveTab._jQueryInterface;
    $.fn[NAME].Constructor = ResponsiveTab;
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return ResponsiveTab._jQueryInterface
    }

    return ResponsiveTab

})(jquery);

export default ResponsiveTab
