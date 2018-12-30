import jquery from 'jquery'

const Sumoselect = ($ => {

    const NAME = 'sumoSelect'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initSumoSelect'
    // const SOURCE_DATA = 'selectData'

    const Selector = {
        SEARCHER: '.a-searcher',
    }

    const Settings = {
        placeholder: 'Select here', // Dont change it here.
        csvDispCount: 2, // display no. of items in multiselect. 0 to display all.
        captionFormat: '{0} items selected', // format of caption text. you can set your locale.
        captionFormatAllSelected: 'All selected!', // format of caption text when all elements are selected. set null to use captionFormat. It will not work if there are disabled elements in select.
        floatWidth: 400, // Screen width of device at which the list is rendered in floating popup fashion.
        forceCustomRendering: false, // force the custom modal on all devices below floatWidth resolution.
        nativeOnDevice: ['Android', 'BlackBerry', 'iPhone', 'iPad', 'iPod', 'Opera Mini', 'IEMobile', 'Silk'], //
        outputAsCSV: false, // true to POST data as csv ( false for Html control array ie. default select )
        csvSepChar: ',', // separation char in csv mode
        okCancelInMulti: false, // display ok cancel buttons in desktop mode multiselect also.
        isClickAwayOk: false, // for okCancelInMulti=true. sets whether click outside will trigger Ok or Cancel (default is cancel).
        triggerChangeCombined: true, // im multi select mode whether to trigger change event on individual selection or combined selection.
        selectAll: false, // to display select all button in multiselect mode.|| also select all will not be available on mobile devices.

        search: false, // to display input for filtering content. selectAlltext will be input text placeholder
        searchText: 'Search...', // placeholder for search input
        searchFn: function (haystack, needle) { // search function
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) < 0;
        },
        noMatch: 'No matches for "{0}"',
        prefix: '', // some prefix usually the field name. eg. '<b>Hello</b>'
        locale: ['OK', 'Cancel', 'Select All'], // all text that is used. don't change the index.
        up: false, // set true to open upside.
        showTitle: false
    }

    class Sumoselect {
        constructor(element, config) {
            this._element = element;
            this.enabled = true;
            this.E = $(this._element); //the jquery object of original select element.
            this.is_multi = $(this._element).attr('multiple'); //if its a multiple select
            this.large = $(this._element).hasClass('a-lg');
            this.has_class_select = $(this._element).hasClass('a-select');
            this.has_class_search = $(this._element).hasClass('a-search');
            this.select = '';
            this.caption = '';
            this.placeholder = '';
            this.optDiv = '';
            this.CaptionCont = '';
            this.ul = '';
            this.is_floating = false;
            this.is_opened = false;
            //backdrop: '',
            this.mob = false; // if to open device default select
            this.Pstate = [];
            this.lastUnselected = null;
            this._config = this._getConfig(config)
        }

        static get VERSION() {
            return VERSION
        }
        _getConfig(config) {
            config = {
                ...Settings,
                ...config
            }

            return config
        }
        createElems() {
            let O = this;
            O.E.wrap('<div class="SumoSelect" tabindex="0" role="button" aria-expanded="false">');
            O.select = O.E.parent();
            if (O.large) {
                O.select.addClass('a-lg');
            }
            if (O.has_class_select) {
                O.select.addClass('a-select');
            }
            if (O.has_class_search) {
                O.select.addClass('a-search');
            }
            if (O._config.searchInPanel) {
                O.select.addClass('a-search-in-panel');
            }
            O.caption = $('<span>');
            if (O._config.removeDropdownIcon) {
                O.CaptionCont = $('<p class="CaptionCont SelectBox" ><label></label></p>')
                    .attr('style', O.E.attr('style'))
                    .prepend(O.caption);
            } else {
                O.CaptionCont = $('<p class="CaptionCont SelectBox" ><i class="appkiticon icon-down-chevron-fill"></i></p>')
                    .attr('style', O.E.attr('style'))
                    .prepend(O.caption);
            }

            if (O._config.tagRst) {
                O.badgeResult = $('<div class="badge-result"></div>');
                O.CaptionCont.prepend(O.badgeResult).addClass('tag-select-caption');
            }

            O.select.append(O.CaptionCont);

            // default turn off if no multiselect
            if (!O.is_multi) O._config.okCancelInMulti = false

            if (O.E.attr('disabled'))
                O.select.addClass('disabled').removeAttr('tabindex');

            //if output as csv and is a multiselect.
            if (O._config.outputAsCSV && O.is_multi && O.E.attr('name')) {
                //create a hidden field to store csv value.
                O.select.append($('<input class="HEMANT123" type="hidden" />').attr('name', O.E.attr('name')).val(O.getSelStr()));

                // so it can not post the original select.
                O.E.removeAttr('name');
            }

            //break for mobile rendring.. if forceCustomRendering is false
            if (O.isMobile() && !O._config.forceCustomRendering) {
                O.setNativeMobile();
                return;
            }

            // if there is a name attr in select add a class to container div
            if (O.E.attr('name')) O.select.addClass('sumo_' + O.E.attr('name').replace(/\[\]/, ''))

            //hide original select
            O.E.addClass('SumoUnder').attr('tabindex', '-1');

            //## Creating the list...
            O.optDiv = $('<div class="optWrapper ' + (O._config.up ? 'up' : '') + '">');

            //branch for floating list in low res devices.
            O.floatingList();

            //Creating the markup for the available options
            O.ul = $('<ul class="options">');
            O.optDiv.append(O.ul);

            // Select all functionality
            if (O._config.selectAll && O.is_multi) O.SelAll();

            // search functionality
            if (O._config.search) O.Search();


            // console.log(O.E.children());
            O.ul.append(O.prepItems(O.E.children()));


            //if multiple then add the class multiple and add OK / CANCEL button
            if (O.is_multi) O.multiSelelect();

            O.select.append(O.optDiv);
            if (O._config.groupSelectall && O.is_multi) {
                O.select.find(".select-all").click(function () {
                    $(this).toggleClass('selected');
                    O.onGroupSelectAll($(this))
                });
            }
            O.basicEvents();
            O.selAllState();
            O.groupSelAllState();
        }

        prepItems(opts, d) {
            var lis = [],
                O = this;
            if (O._config.groupSelectall && O.is_multi) {
                let groupSelectallDom = '<p class="select-all group-select-all"><span class="a-search-checkbox"><i class="appkiticon icon-check-mark-fill"></i></span><label>' + O._config.locale[2] + '<span class="selected-count"></span></label></p>';
                $(opts).each(function (i, opt) { // parsing options to li
                    opt = $(opt);
                    lis.push(opt.is('optgroup') ?
                        $('<li class="group ' + (opt[0].disabled ? 'disabled' : '') + '"><label>' + opt.attr('label') + '</label>' + groupSelectallDom + '<ul></ul></li>')
                        .find('ul')
                        .append(O.prepItems(opt.children(), opt[0].disabled))
                        .end() :
                        O.createLi(opt, d)
                    );
                });
            } else {
                $(opts).each(function (i, opt) { // parsing options to li
                    opt = $(opt);
                    lis.push(opt.is('optgroup') ?
                        $('<li class="group ' + (opt[0].disabled ? 'disabled' : '') + '"><label>' + opt.attr('label') + '</label><ul></ul></li>')
                        .find('ul')
                        .append(O.prepItems(opt.children(), opt[0].disabled))
                        .end() :
                        O.createLi(opt, d)
                    );
                });
            }

            return lis;
        }

        //## Creates a LI element from a given option and binds events to it
        //## returns the jquery instance of li (not inserted in dom)
        createLi(opt, d) {
            var O = this;

            if (!opt.attr('value')) opt.attr('value', opt.val());
            let li = '';
            if (O._config.customizedOpt) {
                li = $(`<li class="opt">
                    <label>
                        ${O._config.customizedOpt(opt)}
                    </label>
                </li>`);
            } else {
                li = $(`<li class="opt">
                    <label>
                        <div class="opt-val">${opt.text()}</div>
                    </label>
                </li>`);
            }

            li.data('opt', opt); // store a direct reference to option.
            opt.data('li', li); // store a direct reference to list item.

            if (O.is_multi && !O._config.tagRst) li.prepend('<span class="a-search-checkbox"><i class="appkiticon icon-check-mark-fill"></i></span>');
            if (O._config.tagRst) li.addClass('badge-li');
            if (opt.attr('data-comments')) {
                let commentClass = opt.attr('data-comments-class') ? opt.attr('data-comments-class') : ''
                li.find('label').append(`<div class="a-comments ${commentClass}">${opt.attr('data-comments')}</div>`);
            }
            if (opt.attr('data-marks')) {
                li.find('.opt-val').append(`<div class="a-badge a-badge-info">${opt.attr('data-marks')}</div>`);
            }

            if (opt[0].disabled || d)
                li = li.addClass('disabled');

            if (O.is_multi && O._config.tagRst) {
                let badgeTrigger = $(`
                <div class='add-trigger'>
                    <div class='add'>ADD</div>
                    <div class='added'>ADDED</div>
                </div> `)
                if (opt.attr('data-bages')) {
                    li.append(badgeTrigger);
                    O.onAddClick(li);
                }
            } else {
                O.onOptClick(li);
            }

            if (opt[0].selected) {
                li.addClass('selected');
            }

            if (opt.attr('class'))
                li.addClass(opt.attr('class'));

            if (opt.attr('title'))
                li.attr('title', opt.attr('title'));

            return li;
        }

        //## Returns the selected items as string in a Multiselect.
        getSelStr() {
            // get the pre selected items.
            var sopt = [];
            this.E.find('option:selected').each(function () {
                sopt.push($(this).val());
            });
            return sopt.join(this._config.csvSepChar);
        }

        //## THOSE OK/CANCEL BUTTONS ON MULTIPLE SELECT.
        multiSelelect() {
            var O = this;
            O.optDiv.addClass('multiple');
            O.okbtn = $('<p tabindex="0" class="btnOk">' + O._config.locale[0] + '</p>').click(function () {
                //if combined change event is set.
                O._okbtn();
                O.hideOpts();
            });
            O.cancelBtn = $('<p tabindex="0" class="btnCancel">' + O._config.locale[1] + '</p>').click(function () {
                O._cnbtn();
                O.hideOpts();
            });
            var btns = O.okbtn.add(O.cancelBtn);
            O.optDiv.append($('<div class="MultiControls">').append(btns));

            // handling keyboard navigation on ok cancel buttons.
            btns.on('keydown.sumo', function (e) {
                var el = $(this);
                switch (e.which) {
                    case 32: // space
                    case 13: // enter
                        el.trigger('click');
                        break;

                    case 9: //tab
                        if (el.hasClass('btnOk')) return;
                    case 27: // esc
                        O._cnbtn();
                        O.hideOpts();
                        return;
                }
                e.stopPropagation();
                e.preventDefault();
            });
        }

        _okbtn() {
            var O = this,
                cg = 0;
            //if combined change event is set.
            if (O._config.triggerChangeCombined) {
                //check for a change in the selection.
                if (O.E.find('option:selected').length !== O.Pstate.length) {
                    cg = 1;
                } else {
                    O.E.find('option').each(function (i, e) {
                        if (e.selected && O.Pstate.indexOf(i) < 0) cg = 1;
                    });
                }

                if (cg) {
                    O.callChange();
                    O.setText();
                }
            }
        }

        _cnbtn() {
            let O = this;
            //remove all selections
            O.E.find('option:selected').each(function () {
                this.selected = false;
            });
            O.optDiv.find('li.selected').removeClass('selected')

            //restore selections from saved state.
            for (let i = 0; i < O.Pstate.length; i++) {
                O.E.find('option')[O.Pstate[i]].selected = true;
                O.ul.find('li.opt').eq(O.Pstate[i]).addClass('selected').find('input').prop('checked', true);
            }
            O.selAllState();
            O.groupSelAllState();
        }

        SelAll() {
            let O = this;
            if (!O.is_multi) return;
            // O.selAll = $('<p class="select-all"><span><i></i></span><label>' + O._config.locale[2] + '</label></p>');
            O.selAll = $('<p class="select-all"><span class="a-search-checkbox"><i class="appkiticon icon-check-mark-fill"></i></span><label>' + O._config.locale[2] + '<span class="selected-count"></span></label></p>');

            O.optDiv.addClass('selall');
            if (O._config.groupSelectall) {
                return;
            } else {
                O.selAll.on('click', function () {
                    O.selAll.toggleClass('selected');
                    O.toggSelAll(O.selAll.hasClass('selected'), 1);
                    //O.selAllState();
                });

                O.optDiv.prepend(O.selAll);
            }

        }

        // search module (can be removed if not required.)
        Search() {
            let O = this,
                cc = O.CaptionCont.addClass('search'),
                P = $('<p class="no-match">'),
                fn = (O._config.searchFn && typeof O._config.searchFn == 'function') ? O._config.searchFn : Settings.searchFn;

            O.ftxt = $('<input type="text" class="search-txt" value="" placeholder="' + O._config.searchText + '">')
                .on('click', function (e) {
                    e.stopPropagation();
                });
            O.searchIcon = $(`<i class="appkiticon icon-search-fill"></i>`).on('click', function (e) {
                e.stopPropagation();
            });

            if (O._config.searchInPanel) {
                O.ftxt.addClass('a-panel-search-ipt')
                O.optDiv.prepend(O.ftxt);
            } else {
                cc.append(O.ftxt);
            }
            cc.append(O.searchIcon);
            O.optDiv.children('ul').after(P);

            O.ftxt.on('keyup.sumo', function () {
                let hid = O.optDiv.find('ul.options li.opt').each(function (ix, item) {
                    let e = $(item),
                        opt = e.data('opt')[0];
                    opt.hidden = fn(e.children('label').text(), O.ftxt.val());
                    if (O._config.searchHighlight) {
                        let innerhtml = O.removeHiliter(e.children('label').html());
                        e.children('label').html(innerhtml);
                        if (O.ftxt.val().length > 0) {
                            let highlightHtml = O.hiliter(O.ftxt.val(), e.children('label').html())
                            e.children('label').html(highlightHtml);
                        }
                    }
                    e.toggleClass('hidden', opt.hidden);
                }).not('.hidden');
                P.html(O._config.noMatch.replace(/\{0\}/g, '<em></em>')).toggle(!hid.length);
                P.find('em').text(O.ftxt.val());
                O.selAllState();
                O.groupSelAllState();
            });
        }

        removeHiliter(value) {
            return value.replace(/\<b class="highlight"\>(.+)\<\/b\>/g, "$1")
        }

        hiliter(word, element) {
            var rgxp = new RegExp("(\>.*)(" + encodeURI(word) + ")(.*\<)", 'gi');
            var repl = '$1<b class="highlight">$2</b>$3';
            return element.replace(rgxp, repl);
        }

        selAllState() {
            let O = this;
            if (O._config.selectAll && O.is_multi) {
                let sc = 0,
                    vc = 0;
                O.optDiv.find('li.opt').not('.hidden').each(function (ix, e) {
                    if ($(e).hasClass('selected')) sc++;
                    if (!$(e).hasClass('disabled')) vc++;
                });
                //select all checkbox state change.
                O.optDiv.find(".selected-count").text(`(${sc})`);
                if (sc === vc) O.selAll.removeClass('partial').addClass('selected');
                else if (sc === 0) O.selAll.removeClass('selected partial');
                else O.selAll.removeClass('selected').addClass('partial') //.removeClass('selected');
            }
        }

        groupSelAllState() {
            let O = this;
            if (O._config.groupSelectall && O.is_multi) {
                O.optDiv.find('.group').each(function (index, groupsel) {
                    let sc = 0,
                        vc = 0;
                    $(groupsel).find('li.opt').not('.hidden').each(function (ix, e) {
                        if ($(e).hasClass('selected')) sc++;
                        if (!$(e).hasClass('disabled')) vc++;
                    });
                    //select all checkbox state change.
                    $(groupsel).find(".selected-count").text(`(${sc})`);
                    if (sc === vc) $(groupsel).find('.group-select-all').removeClass('partial').addClass('selected');
                    else if (sc === 0) $(groupsel).find('.group-select-all').removeClass('selected partial');
                    else $(groupsel).find('.group-select-all').removeClass('selected').addClass('partial') //.removeClass('selected');
                })
            }
        }

        showOpts() {
            let O = this;
            if (O.E.attr('disabled')) return; // if select is disabled then retrun
            O.E.trigger('sumo:opening', O);
            O.is_opened = true;
            O.select.addClass('open').attr('aria-expanded', 'true');
            O.E.trigger('sumo:opened', O);

            if (O.ftxt && !O._config.searchInPanel) O.ftxt.focus();
            else O.select.focus();

            // hide options on click outside.
            $(document).on('click.sumo', function (e) {
                if (!O.select.is(e.target) // if the target of the click isn't the container...
                    &&
                    O.select.has(e.target).length === 0) { // ... nor a descendant of the container
                    if (!O.is_opened) return;
                    O.hideOpts();
                    if (O._config.okCancelInMulti) {
                        if (O._config.isClickAwayOk)
                            O._okbtn();
                        else
                            O._cnbtn();
                    }
                }
            });

            if (O.is_floating) {
                let H = O.optDiv.children('ul').outerHeight() + 2; // +2 is clear fix
                if (O.is_multi) H = H + parseInt(O.optDiv.css('padding-bottom'));
                O.optDiv.css('height', H);
                $('body').addClass('sumoStopScroll');
            }

            O.setPstate();
        }

        //maintain state when ok/cancel buttons are available storing the indexes.
        setPstate() {
            let O = this;
            if (O.is_multi && (O.is_floating || O._config.okCancelInMulti)) {
                O.Pstate = [];
                // assuming that find returns elements in tree order
                O.E.find('option').each(function (i, e) {
                    if (e.selected) O.Pstate.push(i);
                });
            }
        }

        callChange() {
            this.E.trigger('change').trigger('click');
        }

        hideOpts() {
            let O = this;
            if (O.is_opened) {
                O.E.trigger('sumo:closing', O);
                O.is_opened = false;
                O.select.removeClass('open').attr('aria-expanded', 'true').find('ul li.sel').removeClass('sel');
                O.E.trigger('sumo:closed', O);
                $(document).off('click.sumo');
                O.select.focus();
                $('body').removeClass('sumoStopScroll');

                // clear the search
                if (O._config.search) {
                    O.ftxt.val('');
                    O.ftxt.trigger('keyup.sumo');
                }

            }
        }

        setOnOpen() {
            let O = this,
                li = O.optDiv.find('li.opt:not(.hidden)').eq(O._config.search ? 0 : O.E[0].selectedIndex);
            if (li.hasClass('disabled')) {
                li = li.next(':not(disabled)')
                if (!li.length) return;
            }
            O.optDiv.find('li.sel').removeClass('sel');
            li.addClass('sel');
            O.showOpts();
        }

        nav(up) {
            let O = this,
                c,
                s = O.ul.find('li.opt:not(.disabled, .hidden)'),
                sel = O.ul.find('li.opt.sel:not(.hidden)'),
                idx = s.index(sel);
            if (O.is_opened && sel.length) {

                if (up && idx > 0)
                    c = s.eq(idx - 1);
                else if (!up && idx < s.length - 1 && idx > -1)
                    c = s.eq(idx + 1);
                else return; // if no items before or after

                sel.removeClass('sel');
                sel = c.addClass('sel');

                // setting sel item to visible view.
                let ul = O.ul,
                    st = ul.scrollTop(),
                    t = sel.position().top + st;
                if (t >= st + ul.height() - sel.outerHeight())
                    ul.scrollTop(t - ul.height() + sel.outerHeight());
                if (t < st)
                    ul.scrollTop(t);

            } else
                O.setOnOpen();
        }

        basicEvents() {
            let O = this;
            O.CaptionCont.click(function (evt) {
                O.E.trigger('click');
                if (O.is_opened) O.hideOpts();
                else O.showOpts();
                evt.stopPropagation();
            });

            O.select.on('keydown.sumo', function (e) {
                switch (e.which) {
                    case 38: // up
                        O.nav(true);
                        break;

                    case 40: // down
                        O.nav(false);
                        break;

                    case 65: // shortcut ctrl + a to select all and ctrl + shift + a to unselect all.
                        if (O.is_multi && e.ctrlKey) {
                            O.toggSelAll(!e.shiftKey, 1);
                            break;
                        } else
                            return;

                    case 32: // space
                        if (O._config.search && O.ftxt.is(e.target)) return;
                    case 13: // enter
                        if (O.is_opened)
                            O.optDiv.find('ul li.sel').trigger('click');
                        else
                            O.setOnOpen();
                        break;
                    case 9: //tab
                        if (!O._config.okCancelInMulti)
                            O.hideOpts();
                        return;
                    case 27: // esc
                        if (O._config.okCancelInMulti) O._cnbtn();
                        O.hideOpts();
                        return;

                    default:
                        return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });

            $(window).on('resize.sumo', function () {
                O.floatingList();
            });
        }

        onOptClick(li) {
            let O = this;
            li.click(function (e) {
                e.stopPropagation();
                let li = $(this);
                if (li.hasClass('disabled')) return;
                let txt = "";
                if (O.is_multi) {
                    li.toggleClass('selected');
                    li.data('opt')[0].selected = li.hasClass('selected');
                    if (li.data('opt')[0].selected === false) {
                        O.lastUnselected = li.data('opt')[0].textContent;
                    }
                    O.selAllState();
                    O.groupSelAllState();
                } else {
                    li.closest('.optWrapper').find('li.selected').removeClass('selected'); //if not multiselect then remove all selections from this list
                    li.toggleClass('selected');
                    li.data('opt')[0].selected = true;
                }

                //branch for combined change event.
                if (!(O.is_multi && O._config.triggerChangeCombined && (O.is_floating || O._config.okCancelInMulti))) {
                    O.setText();
                    O.callChange();
                }

                if (!O.is_multi) O.hideOpts(); //if its not a multiselect then hide on single select.
            });
        }

        onAddClick(li) {
            let O = this;
            li.on('click', '.add-trigger', function (e) {
                if (li.hasClass('disabled')) return;
                if (li.hasClass('selected')) return;
                li.toggleClass('selected');
                li.data('opt')[0].selected = li.hasClass('selected');
                O.selAllState();
                O.groupSelAllState();
                //branch for combined change event.
                if (!(O.is_multi && O._config.triggerChangeCombined && (O.is_floating || O._config.okCancelInMulti))) {
                    O.setText();
                    O.callChange();
                }

                if (!O.is_multi) O.hideOpts(); //if its not a multiselect then hide on single select.
            });
        }

        onClickTagClose(tag) {
            let O = this;
            tag.on('click', '.icon-close-fill', function (event) {
                event.stopPropagation();
                tag.data('opt').selected = false;
                $($(tag.data('opt')).data('li')).removeClass('selected').removeClass('withoutfilter');
                tag.remove();
                let sels = O.E.find(':selected').not(':disabled'); //selected options.
                O.badgeResult.removeClass('has-length');
                if (sels.length > 0) {
                    O.badgeResult.addClass('has-length');
                }
            })
        }

        onClickTagToggle(tag) {
            let O = this;
            tag.find(".a-toggle").click(function (e) {
                e.stopPropagation();
            })
            tag.find("input[type=checkbox]").bind('change', function (event) {
                $($(tag.data('opt')).data('li')).removeClass('withoutfilter');
                if (!$(this).is(':checked')) {
                    $($(tag.data('opt')).data('li')).addClass('withoutfilter');
                }
            })
        }

        // fixed some variables that were not explicitly typed (michc)
        setText() {
            let O = this;
            O.placeholder = "";
            if (O.is_multi) {
                if (O._config.tagRst) {
                    O.badgeResult.html('');
                    let sels = O.E.find(':selected').not(':disabled'); //selected options.
                    O.badgeResult.removeClass('has-length');
                    if (sels.length > 0) {
                        O.badgeResult.addClass('has-length');
                    }
                    sels.each(function (ix, e) {
                        let badgeDom = O._config.tagtoggle ?
                            $(`<div class="a-tag a-tag-pl ${$(e).attr("data-bages-class")}">
                                <label class="a-toggle a-toggle-small a-mr-10 ${$(e).attr("data-toggle-class")}">
                                    <input checked="" type="checkbox">
                                    <div class="a-toggle-mark">
                                        <span class="on"></span>
                                        <span class="off"></span>
                                        <span class="switch"></span>
                                    </div>
                                </label>
                                <span class="a-mr-10">${$(e).text()}</span>
                                <i class="a-icon appkiticon icon-close-fill"></i>
                            </div>`) :
                            $(`<div class="a-tag ${$(e).attr("data-bages-class")}">
                                <span class="a-mr-10">${$(e).text()}</span>
                                <i class="a-icon appkiticon icon-close-fill"></i>
                            </div>`);
                        badgeDom.data('opt', e);
                        $(e).data('tag', badgeDom);
                        O.badgeResult.append(badgeDom);
                        if ($(e).data('li').hasClass('withoutfilter')) {
                            badgeDom.find("input[type = checkbox]").prop('checked', false);
                        }
                        O.onClickTagClose(badgeDom);
                        O.onClickTagToggle(badgeDom);
                    });
                } else {
                    let sels = O.E.find(':selected').not(':disabled'); //selected options.
                    for (let i = 0; i < sels.length; i++) {
                        if (i + 1 >= O._config.csvDispCount && O._config.csvDispCount) {
                            if (sels.length === O.E.find('option').length && O._config.captionFormatAllSelected) {
                                O.placeholder = O._config.captionFormatAllSelected.replace(/\{0\}/g, sels.length) + ',';
                            } else {
                                O.placeholder = O._config.captionFormat.replace(/\{0\}/g, sels.length) + ',';
                            }

                            break;
                        } else O.placeholder += $(sels[i]).text() + ", ";
                    }
                    O.placeholder = O.placeholder.replace(/,([^,]*)$/, '$1'); //remove unexpected "," from last.
                }
            } else {
                if (O._config.customizeRst) {
                    if (O.E.find(':selected').not(':disabled').attr('data-comments')) {
                        O.placeholder = `${O.E.find(':selected').not(':disabled').text()}<span class="a-rst-comment">, ${O.E.find(':selected').not(':disabled').attr('data-comments')}</span>`
                    } else {
                        O.placeholder = O.E.find(':selected').not(':disabled').text();
                    }
                } else {
                    O.placeholder = O.E.find(':selected').not(':disabled').text();
                }
            }

            let is_placeholder = false;

            if (!O.placeholder) {

                is_placeholder = true;

                O.placeholder = O.E.attr('placeholder');
                if (!O.placeholder) //if placeholder is there then set it
                    O.placeholder = O.E.find('option:disabled:selected').text();
            }

            O.placeholder = O.placeholder ? (O._config.prefix + ' ' + O.placeholder) : O._config.placeholder

            //set display text
            O.caption.html(O.placeholder);
            if (O._config.showTitle) O.CaptionCont.attr('title', O.placeholder);

            //set the hidden field if post as csv is true.
            let csvField = O.select.find('input.HEMANT123');
            if (csvField.length) csvField.val(O.getSelStr());

            //add class placeholder if its a placeholder text.
            if (is_placeholder) O.caption.addClass('placeholder');
            else O.caption.removeClass('placeholder');
            return O.placeholder;
        }

        isMobile() {
            // Adapted from http://www.detectmobilebrowsers.com
            let ua = navigator.userAgent || navigator.vendor || window.opera;

            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            for (let i = 0; i < this._config.nativeOnDevice.length; i++)
                if (ua.toString().toLowerCase().indexOf(this._config.nativeOnDevice[i].toLowerCase()) > 0) return this._config.nativeOnDevice[i];
            return false;
        }

        setNativeMobile() {
            let O = this;
            O.E.addClass('SelectClass') //.css('height', O.select.outerHeight());
            O.mob = true;
            O.E.change(function () {
                O.setText();
            });
        }

        floatingList() {
            let O = this;
            //called on init and also on resize.
            //O.is_floating = true if window width is < specified float width
            O.is_floating = $(window).width() <= O._config.floatWidth;

            //set class isFloating
            O.optDiv.toggleClass('isFloating', O.is_floating);

            //remove height if not floating
            if (!O.is_floating) O.optDiv.css('height', '');

            //toggle class according to okCancelInMulti flag only when it is not floating
            O.optDiv.toggleClass('okCancelInMulti', O._config.okCancelInMulti && !O.is_floating);
        }

        //HELPERS FOR OUTSIDERS
        // validates range of given item operations
        vRange(i) {
            let O = this;
            let opts = O.E.find('option');
            if (opts.length <= i || i < 0) throw "index out of bounds"
            return O;
        }

        //toggles selection on c as boolean.
        toggSel(c, i) {
            let O = this;
            let opt;
            if (typeof (i) === "number") {
                O.vRange(i);
                opt = O.E.find('option')[i];
            } else {
                opt = O.E.find('option[value="' + i + '"]')[0] || 0;
            }
            if (!opt || opt.disabled)
                return;

            if (opt.selected !== c) {
                opt.selected = c;
                if (!O.mob) $(opt).data('li').toggleClass('selected', c);

                O.callChange();
                O.setPstate();
                O.setText();
                O.selAllState();
                O.groupSelAllState();
            }
        }

        //toggles disabled on c as boolean.
        toggDis(c, i) {
            var O = this.vRange(i);
            O.E.find('option')[i].disabled = c;
            if (c) O.E.find('option')[i].selected = false;
            if (!O.mob) O.optDiv.find('ul.options li').eq(i).toggleClass('disabled', c).removeClass('selected');
            O.setText();
        }

        // toggle disable/enable on complete select control
        toggSumo(val) {
            var O = this;
            O.enabled = val;
            O.select.toggleClass('disabled', val);

            if (val) {
                O.E.attr('disabled', 'disabled');
                O.select.removeAttr('tabindex');
            } else {
                O.E.removeAttr('disabled');
                O.select.attr('tabindex', '0');
            }

            return O;
        }

        // toggles all option on c as boolean.
        // set direct=false/0 bypasses okCancelInMulti behaviour.
        toggSelAll(c, direct) {
            var O = this;
            O.E.find('option:not(:disabled,:hidden)')
                .each(function (ix, e) {
                    var is_selected = e.selected,
                        e = $(e).data('li');
                    if (e.hasClass('hidden')) return;
                    // console.log(!!c);
                    if (!!c) {
                        if (!is_selected) e.trigger('click');
                    } else {
                        if (is_selected) e.trigger('click');
                    }
                });

            if (!direct) {
                if (!O.mob && O.selAll) O.selAll.removeClass('partial').toggleClass('selected', !!c);
                O.callChange();
                O.setText();
                O.setPstate();
            }
        }

        onGroupSelectAll(target) {
            var O = this;
            let c = target.hasClass('selected');
            let index = target.parent("li.group").index();
            O.E.find('optgroup').eq(index).find('option:not(:disabled,:hidden)')
                .each(function (ix, e) {
                    var is_selected = e.selected,
                        e = $(e).data('li');
                    if (e.hasClass('hidden')) return;
                    // console.log(!!c);
                    if (!!c) {
                        if (!is_selected) e.trigger('click');
                    } else {
                        if (is_selected) e.trigger('click');
                    }
                });

            // if (!direct) {
            //     if (!O.mob && O.selAll) O.selAll.removeClass('partial').toggleClass('selected', !!c);
            //     O.callChange();
            //     O.setText();
            //     O.setPstate();
            // }
        }

        /* outside accessibility options
         which can be accessed from the element instance.
         */
        reload() {
            var elm = this.unload();
            return $(elm).SumoSelect(O._config);
        }

        unload() {
            let selObj = this;
            var O = this;
            O.select.before(O.E);
            O.E.show();

            if (O._config.outputAsCSV && O.is_multi && O.select.find('input.HEMANT123').length) {
                O.E.attr('name', O.select.find('input.HEMANT123').attr('name')); // restore the name;
            }
            O.select.remove();
            delete selObj.sumo;
            return selObj;
        }

        //## add a new option to select at a given index.
        add(val, txt, i) {
            let selObj = this;
            if (typeof val === "undefined") throw "No value to add"

            var O = this;
            var opts = O.E.find('option')
            if (typeof txt === "number") {
                i = txt;
                txt = val;
            }
            if (typeof txt === "undefined") {
                txt = val;
            }

            var opt = $("<option></option>").val(val).html(txt);

            if (opts.length < i) throw "index out of bounds"

            if (typeof i === "undefined" || opts.length === i) { // add it to the last if given index is last no or no index provides.
                O.E.append(opt);
                if (!O.mob) O.ul.append(O.createLi(opt));
            } else {
                opts.eq(i).before(opt);
                if (!O.mob) O.ul.find('li.opt').eq(i).before(O.createLi(opt));
            }

            return selObj;
        }

        //## removes an item at a given index.
        remove(i) {
            var O = this.vRange(i);
            O.E.find('option').eq(i).remove();
            if (!O.mob) O.optDiv.find('ul.options li').eq(i).remove();
            O.setText();
        }

        // removes all but the selected one
        removeAll() {
            var O = this;
            var options = O.E.find('option');

            for (var x = (options.length - 1); x >= 0; x--) {
                if (options[x].selected !== true) {
                    O.remove(x);
                }
            }
        }


        find(val) {
            var O = this;
            var options = O.E.find('option');
            for (var x in options) {
                if (options[x].value === val) {
                    return parseInt(x);
                }
            }
            return -1;
        }

        //## Select an item at a given index.
        selectItem(i) {
            this.toggSel(true, i);
        }

        //## UnSelect an iten at a given index.
        unSelectItem(i) {
            this.toggSel(false, i);
        }

        //## Select all items  of the select.
        selectAll() {
            this.toggSelAll(true);
        }

        //## UnSelect all items of the select.
        unSelectAll() {
            this.toggSelAll(false);
        }

        //## Disable an iten at a given index.
        disableItem(i) {
            this.toggDis(true, i)
        }

        //## Removes disabled an iten at a given index.
        enableItem(i) {
            this.toggDis(false, i)
        }

        //## New simple methods as getter and setter are not working fine in ie8-
        //## variable to check state of control if enabled or disabled.
        // enabled: true,
        //## Enables the control
        enable() {
            return this.toggSumo(false)
        }

        //## Disables the control
        disable() {
            return this.toggSumo(true)
        }


        init() {
            var O = this;
            O.createElems();
            O.setText();
            return O
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                const _config = {
                    ...Settings,
                    ...$(this).data(),
                    ...typeof config === 'object' && config ? config : {}
                }

                if (!data) {
                    data = new Sumoselect(this, _config);
                    $(this).data(DATA_KEY, data);
                    data.init();
                }
            })
        }
    }


    $.fn[NAME] = Sumoselect._jQueryInterface
    $.fn[NAME].Constructor = Sumoselect
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Sumoselect._jQueryInterface
    }

    return Sumoselect
})(jquery)

export default Sumoselect
