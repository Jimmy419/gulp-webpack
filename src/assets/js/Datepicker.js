import jquery from 'jquery';
import './date-picker/js/air-datepicker';
import './date-picker/js/i18n/datepicker.en';


const Datepicker = (($) => {
    const NAME = "datepicker";
    const VERSION = "0.0.1";
    const JQUERY_NO_CONFLICT = $.fn[NAME];
    const DATA_KEY = 'a.datepicker';
    const EVENT_KEY = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Event = {

    };

    const ClassName = {
        DATEPICKER: 'a-datepicker',
        AIRPICKER: 'air-picker',
    }

    class Datepicker {
        constructor(ele) {
            this._ele = ele;
        }

        static _handleConfig(config) {
            switch (config.type) {
                case "pair":
                    break;
                default:
                    config.classes = (config.classes ? config.classes + ' ' : '') + ClassName.AIRPICKER;
                    if (!config.prevHtml) {
                        config.prevHtml = '<i class="appkiticon icon-left-chevron-fill"></i>';
                    }
                    if (!config.nextHtml) {
                        config.nextHtml = '<i class="appkiticon icon-right-chevron-fill"></i>';
                    }
            }
            return config;
        }
        static get version() {
            return VERSION;
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                const $element = $(this);
                let data = $element.data(DATA_KEY);

                if (!data) {
                    data = new Datepicker(this);
                    $element.data(DATA_KEY, data);
                }

                if (data[config]) {
                    data[config](this);
                } else {
                    config = Datepicker._handleConfig(config);
                }

                /*
                 * config.type (string) 'single' 'pair' 'custom'
                 * decide type of datepicker, and which jqueryInterface should be called
                 * single: airdatepicker (default value)
                 */
                // if (config.type) {
                switch (config.type) {
                    case "pair":
                        break;
                    default:
                        $element.airdatepicker(config);
                }
                // }
            })
        }
    }

    $.fn[NAME] = Datepicker._jQueryInterface
    $.fn[NAME].Constructor = Datepicker
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Datepicker._jQueryInterface
    }
})(jquery);

export default Datepicker;
