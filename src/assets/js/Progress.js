import jquery from 'jquery'

const Progress = ($ => {

    const NAME = 'progress'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initProgress'
    const MT = 20

    const Selector = {
        VERTICAL_PROGRESS: '.a-progress-fun',
        PROGRESS_TEXT: '.a-progress-text',
        PROGRESS_DONE: '.a-progress-done',
        INDICATOR: '.a-indicator',
        PROGRESS_BAR: '.a-progress-bar',
        PROGRESS: '.a-progress',
        VERTICAL: '.a-vertical-progress',
        PARENT_INDICATOR: '.a-parent-indicator',
        CHILD_ITEM: '.show .a-child-indicator-item',
        CHILD_INDICATOR: '.a-child-indicator'
    }

    const ClassName = {
        VERTICAL: 'a-vertical-progress',
        SHOW: 'show'
    }

    class Progress {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        init() {
            if ($(this._element).find(Selector.VERTICAL).length > 0) {
                $(this._element).find(Selector.PROGRESS).css('height', 0);
                $(this._element).find(Selector.PROGRESS_BAR).css('height', 0);
                const indicator = $(this._element).find(Selector.PROGRESS_DONE).last().closest(Selector.INDICATOR);
                const itop = indicator.position().top;
                const iheight = indicator.height();
                const top = $(this._element).find(Selector.PROGRESS_DONE).last().position().top;
                const pt = $(this._element).find(Selector.PARENT_INDICATOR).first().height() / 2;
                const ht = $(this._element).find(Selector.CHILD_ITEM).height() / 2;
                $(this._element).find(Selector.PROGRESS).css({
                    "margin-top": pt + 'px',
                    "height": `calc(100% - ${pt}px)`
                })
                if (indicator.children(Selector.CHILD_INDICATOR).hasClass(ClassName.SHOW)) {
                    $(this._element).find(Selector.PROGRESS_BAR).css('height', top - pt + ht + MT + 'px');
                } else {
                    $(this._element).find(Selector.PROGRESS_BAR).css('height', itop - pt + iheight / 2 + 'px');
                }
            } else {
                const leftDis = $(this._element).find(Selector.PROGRESS_DONE).last().position().left + $(this._element).find(Selector.PROGRESS_DONE).last().outerWidth() / 2;
                const paddingLeft = $(this._element).find(Selector.INDICATOR).first().outerWidth() / 2;
                const paddingRight = $(this._element).find(Selector.INDICATOR).last().outerWidth() / 2;
                $(this._element).find(Selector.PROGRESS).css({
                    "margin-left": paddingLeft + 'px',
                    "margin-right": paddingRight + 'px'
                })
                $(this._element).find(Selector.PROGRESS_BAR).css('width', leftDis - paddingLeft + 'px');
            }
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Progress(this);
                    $(this).data(DATA_KEY, data);
                    data.init();
                }

                if (config) {
                    if (config.init) {
                        data.init();
                    }
                }
            })
        }
    }


    $(document)
        .ready(() => {
            let progress = $(Selector.VERTICAL_PROGRESS);
            Progress._jQueryInterface.call(progress, {
                init: true
            });
        })

    $(window).resize(function () {
        let progress = $(Selector.VERTICAL_PROGRESS);
        Progress._jQueryInterface.call(progress, {
            init: true
        });
    });

    $.fn[NAME] = Progress._jQueryInterface
    $.fn[NAME].Constructor = Progress
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Progress._jQueryInterface
    }

    return Progress
})(jquery)

export default Progress
