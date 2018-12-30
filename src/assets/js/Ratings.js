import $ from 'jquery';

const Ratings = ($ => {
    const NAME = 'ratings'
    const VERSION = '0.0.1'
    const JOURNEY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initRating'

    const Selector = {
        RATING: '.ratings',
        RATINGOBJ: '.a-star-ratings',
        ACTIVERATING: '.active'
    }

    const ClassName = {
        RATINGS: 'a-star-ratings',
        ACTIVE: 'active',
        HOVER: 'hover',
    }

    const Event = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover'
    }

    class Ratings {
        constructor(element) {
            this.element = element;
        }

        static get VERSION() {
            return VERSION
        }

        setRating(item) {
            const Divs = $(this.element).children(Selector.RATING);
            const index = $(item).index();
            const activeLength = $(this.element).find(Selector.ACTIVERATING).length - 1;

            if (index < activeLength) {
                Divs.each(function (divIndex, val) {
                    if (divIndex > index) {
                        $(val).removeClass(ClassName.ACTIVE);
                    }
                });
            } else if (index > activeLength) {
                Divs.each(function (divIndex, val) {
                    if (divIndex <= index) {
                        $(val).addClass(ClassName.ACTIVE);
                    }
                })
            } else {
                Divs.removeClass(ClassName.ACTIVE);
                Divs.removeClass(ClassName.HOVER);
            }
        }

        setMouseover(item) {
            const Divs = $(this.element).children(Selector.RATING);
            const index = $(item).index();
            Divs.removeClass(ClassName.HOVER);
            Divs.each(function (divIndex, val) {
                if (divIndex <= index) {
                    $(val).addClass(ClassName.HOVER);
                }
            });
        }

        setMouseout() {
            const Divs = $(this.element).children(Selector.RATING);
            Divs.removeClass(ClassName.HOVER);
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Ratings(this);
                    $(this).data(DATA_KEY, data);
                }

                if (config) {
                    if (config.setRating) {
                        data.setRating(config.setRating);
                    }
                    if(config.setMouseover) {
                        data.setMouseover(config.setMouseover);
                    }
                    if(config.setMouseout) {
                        data.setMouseout();
                    }
                }
            })
        }
    }

    $(document)
        .on(Event.CLICK, Selector.RATING, event => {
            event.stopPropagation();
            let item = event.target;
            let ratingObj = $(item).closest(Selector.RATINGOBJ);
            Ratings._jQueryInterface.call($(ratingObj), {
                setRating: item
            })
        })
        .on(Event.MOUSEOVER, Selector.RATING, event => {
            event.stopPropagation();
            let item = event.target;
            let ratingObj = $(item).closest(Selector.RATINGOBJ);
            Ratings._jQueryInterface.call($(ratingObj), {
                setMouseover: item
            })
        })
        .mouseout(event => {
            let item = event.target;
            let ratingObj = $(item).closest(Selector.RATINGOBJ);
            Ratings._jQueryInterface.call($(ratingObj), {
                setMouseout: item
            });
        })

    $.fn[NAME] = Ratings._jQueryInterface
    $.fn[NAME].constructor = Ratings
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JOURNEY_NO_CONFLICT
        return Ratings._jQueryInterface
    }

    return Ratings
})($);

export default Ratings;