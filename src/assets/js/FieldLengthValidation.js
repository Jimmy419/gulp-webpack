import jquery from 'jquery'

const FieldLengthValidation = ($ => {

    const NAME = 'fieldLengthValidate'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initFieldLengthValidate'

    const Selector = {
        FIELD_VALIDATION_BOX: '.a-field-length-validation',
        CURRENT_LENGTH: '.a-current-length',
        MAX_LENGTH: '.a-max-length',
        FIELD: '.a-text-field'
    }

    const ClassName = {
        LENGTH_OVERFLOW: 'a-error-overflow',
    }

    const Attr = {
        MAX_LENGTH: 'max-length'
    }

    const Event = {
        PROPERTY_CHANGE: 'input propertychange'
    }

    class LengthValidation {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        init() {
            $(this._element).removeClass(ClassName.LENGTH_OVERFLOW);
            const textLength = $(this._element).find(Selector.FIELD).val().length;
            const maxLength = parseFloat($(this._element).find(Selector.FIELD).attr(Attr.MAX_LENGTH));
            $(this._element).find(Selector.CURRENT_LENGTH).text(textLength);
            if (textLength > maxLength) {
                $(this._element).addClass(ClassName.LENGTH_OVERFLOW)
            }
        }

        static _jQueryInterface() {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)
                if (!data) {
                    data = new LengthValidation(this);
                    $(this).data(DATA_KEY, data);
                }
                data.init();
            })
        }
    }


    $(document)
        .on(Event.PROPERTY_CHANGE, Selector.FIELD, event => {
            event.preventDefault()
            let field = event.target
            let validateBox = $(field).closest(Selector.FIELD_VALIDATION_BOX);
            // eslint-disable-next-line no-console
            // console.log(btngroup);
            LengthValidation._jQueryInterface.call($(validateBox))
        })
        .ready(() => {
            let validatebox = $(Selector.FIELD_VALIDATION_BOX);
            LengthValidation._jQueryInterface.call(validatebox);
        })

    $.fn[NAME] = LengthValidation._jQueryInterface
    $.fn[NAME].Constructor = LengthValidation
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return LengthValidation._jQueryInterface
    }

    return LengthValidation
})(jquery)

export default FieldLengthValidation
