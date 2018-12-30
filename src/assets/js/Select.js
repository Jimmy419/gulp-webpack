import jquery from 'jquery'

const Select = ($ => {

    const NAME = 'select'
    const VERSION = '0.0.1'
    const JQUERY_NO_CONFLICT = $.fn[NAME]
    const DATA_KEY = 'initAppkitSelect'
    const SOURCE_DATA = 'selectData'

    const Selector = {
        SELECT: '.a-selector',
        DROPDOWN_TOGGLE: '.a-dropdown-toggle',
        DROPDOWN_MENU: '.a-dropdown-menu',
        DROPDOWN_ITEM: '.a-dropdown-item',
        DROPDOWN_TEXT: '.a-choosen-text',
        DROPDOWN_GROUP: '.a-dropdown-group',
        SEARCH_IPT: '.a-search-ipt',
        TAB_NAV: '.a-tab-fun',
        TAB_CONT: '.a-tab-targets',
        TAB_TARGET_ITEM: '.a-tab-target-item',
        TBB_CONT_ACTIVE: '.a-tab-target-item.active',
        DROPDOWN_ITEM_ACTIVE: '.a-dropdown-item.active',
        DROPDOWN_GROUP_CONTENT: '.a-group-content'
    }

    const ClassName = {
        SHOW: 'a-show',
        ACTIVE: 'active',
        MULTIPLE: 'a-multiple',
        GROUP: 'a-group',
        GROUP_MULTIPLE: 'a-group-multiple',
        TOGGLE_SEARCH: 'a-toggle-search',
        HIDDEN: 'a-hidden',
        TAB_SELECT: 'a-tab-select',
        TAB_MULTI_SELECT: 'a-tab-multi-select',
        GRAY_TAB: 'a-tab-gray',
        DROPDOWN_ITEM: 'a-dropdown-item',
        DROPDOWN_GROUP_CONTENT: 'a-group-content'
    }

    const AttrName = {
        TID: 'tid',
        GID: 'gid',
        SID: 'sid'
    }

    // const RenderDom = {
    //     BGCOLOR: `<i class=${ClassName.BGCOLOR}></i>`
    // }

    const Event = {
        CLICK: 'click',
        PROPERTY_CHANGE: 'input propertychange'
    }

    class Select {
        constructor(element) {
            this._element = element
        }

        static get VERSION() {
            return VERSION
        }

        init() {
            this.clearDropdownMenu();
            if ($(this._element).hasClass(ClassName.MULTIPLE)) {
                this.renderMultiple();
            } else if ($(this._element).hasClass(ClassName.GROUP)) {
                this.renderGroup();
            } else if ($(this._element).hasClass(ClassName.GROUP_MULTIPLE)) {
                this.renderGroupMultiple();
            } else if ($(this._element).hasClass(ClassName.TAB_SELECT)) {
                this.renderTab();
            } else if ($(this._element).hasClass(ClassName.TAB_MULTI_SELECT)) {
                this.renderTabMultiple();
            } else {
                this.renderPrimarySelect();
            }
            this.search();
        }

        /**clear dropdown menu doms */
        clearDropdownMenu() {
            $(this._element).find(Selector.DROPDOWN_GROUP).remove();
            $(this._element).find(Selector.DROPDOWN_ITEM).remove();
            $(this._element).find(Selector.TAB_CONT).remove();
            $(this._element).find(Selector.TAB_NAV).remove();
        }

        /**default single select render function */
        renderPrimarySelect() {
            let _this = this;
            this.data.forEach(element => {
                let dropdownitem = '';
                if (_this.markcomment) {
                    let markdom = ""
                    if (element.mark) {
                        markdom = `<div class="a-badge a-badge-info">${element.mark}</div>`
                    }
                    dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${element.id}>${element.value}
                        ${markdom}
                        <span class="a-comment">${element.comment}</span>
                    </div>`
                    if (element.active) {
                        dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${element.id}>${element.value}
                            ${markdom}
                            <span class="a-comment">${element.comment}</span>
                        </div>`
                        $(_this._element).find(Selector.DROPDOWN_TEXT).html(`${element.value}<span class="a-comment">, ${element.comment}</span>`);
                    }
                } else {
                    dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${element.id}>${element.value}</div>`
                    if (element.active) {
                        dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${element.id}>${element.value}</div>`
                        $(_this._element).find(Selector.DROPDOWN_TEXT).html(element.value);
                    }
                }
                $(_this._element).find(Selector.DROPDOWN_MENU).append(dropdownitem);
            });
        }

        /**multiple select render function */
        renderMultiple() {
            let _this = this;
            let count = 0;
            this.data.forEach(element => {
                let dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${element.id}><label class="a-checkbox">
                    <input type="checkbox">
                    <span class="a-checkbox-mark">
                        <span class="appkiticon icon-check-mark-fill"></span>
                    </span>
                    <span class="a-checkbox-text">${element.value}</span>
                </label></div>`
                if (element.active) {
                    dropdownitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${element.id}><label class="a-checkbox">
                        <input type="checkbox" checked>
                        <span class="a-checkbox-mark">
                            <span class="appkiticon icon-check-mark-fill"></span>
                        </span>
                        <span class="a-checkbox-text">${element.value}</span>
                    </label></div>`
                    count++;
                }
                $(_this._element).find(Selector.DROPDOWN_MENU).append(dropdownitem);
            });
            this.setMultiSelectShowText(count);
        }

        /**group single select render function */
        renderGroup() {
            let _this = this;
            this.data.forEach(gitem => {
                let dropdownGroup = $(`
                    <div class="a-dropdown-group" gid=${gitem.gid}>
                        <div class="a-group-title">${gitem.val}</div>
                        <ul class="${ClassName.DROPDOWN_GROUP_CONTENT}">
                        </ul>
                    </div>
                `)
                gitem.data.forEach(item => {
                    let dropdownlistitem = '';
                    if (_this.markcomment) {
                        let markdom = ""
                        if (item.mark) {
                            markdom = `<div class="a-badge a-badge-info">${item.mark}</div>`
                        }
                        dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${item.id}>${item.value}
                            ${markdom}
                            <span class="a-comment">${item.comment}</span>
                        </div>`
                        if (item.active) {
                            dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${item.id}>${item.value}
                                ${markdom}
                                <span class="a-comment">${item.comment}</span>
                            </div>`
                            $(_this._element).find(Selector.DROPDOWN_TEXT).html(`${item.value}<span class="a-comment">, ${item.comment}</span>`);
                        }
                    } else {
                        dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${item.id}>${item.value}</div>`
                        if (item.active) {
                            dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${item.id}>${item.value}</div>`
                            $(_this._element).find(Selector.DROPDOWN_TEXT).html(item.value);
                        }
                    }
                    dropdownGroup.find(Selector.DROPDOWN_GROUP_CONTENT).append(dropdownlistitem);
                })
                $(_this._element).find(Selector.DROPDOWN_MENU).append(dropdownGroup);
            });
        }

        /**group multiple select render function */
        renderGroupMultiple() {
            let _this = this;
            let count = 0;
            this.data.forEach(gitem => {
                let dropdownGroup = $(`
                    <div class="a-dropdown-group" gid=${gitem.gid}>
                        <div class="a-group-title">${gitem.val}</div>
                        <ul class="${ClassName.DROPDOWN_GROUP_CONTENT}">
                        </ul>
                    </div>
                `)
                gitem.data.forEach(item => {
                    let dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM}" sid=${item.id}>
                        <label class="a-checkbox">
                            <input type="checkbox">
                            <span class="a-checkbox-mark">
                                <span class="appkiticon icon-check-mark-fill"></span>
                            </span>
                            <span class="a-checkbox-text">${item.value}</span>
                        </label>
                    </div>`
                    if (item.active) {
                        dropdownlistitem = `<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${item.id}>
                            <label class="a-checkbox">
                                <input type="checkbox" checked>
                                <span class="a-checkbox-mark">
                                    <span class="appkiticon icon-check-mark-fill"></span>
                                </span>
                                <span class="a-checkbox-text">${item.value}</span>
                            </label>
                        </div>`
                        count++;
                    }
                    dropdownGroup.find(Selector.DROPDOWN_GROUP_CONTENT).append(dropdownlistitem);
                })
                $(_this._element).find(Selector.DROPDOWN_MENU).append(dropdownGroup);
            });
            this.setMultiSelectShowText(count);
        }

        /** tab single select render function */
        renderTab() {
            let _this = this;
            let tabDom = $(`<ul class="a-btn-tab ${this.tabclass}"></ul><div class="a-tab-targets"></div>`);
            $(this._element).find(Selector.DROPDOWN_MENU).append(tabDom);
            for (let i = 0; i < this.data.length; i++) {
                let tabItem = $(`<li class="a-tab-item" tid=${this.data[i].tid} target="#target${this.data[i].tid}">${this.data[i].val}</li>`)
                if (i === 0) {
                    tabItem = $(`<li class="a-tab-item active" tid=${this.data[i].tid} target="#target${this.data[i].tid}">${this.data[i].val}</li>`)
                }
                $(this._element).find(".a-btn-tab").append(tabItem);
                let contItem = $(`<div class="a-tab-target-item" tid=${this.data[i].tid} id="target${this.data[i].tid}"></div>`)
                this.data[i].data.forEach(G => {
                    let group = $(`<div class="a-dropdown-group" gid=${G.gid}>
                        <div class="a-group-title">${G.val}</div>
                        <ul class="a-group-content"></ul></div>
                            `)
                    G.data.forEach(I => {
                        let item = $(`<div class="${ClassName.DROPDOWN_ITEM}" sid=${I.id}>${I.value}</div>`)
                        if (I.active) {
                            item = $(`<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${I.id}>${I.value}</div>`)
                        }
                        group.find(".a-group-content").append(item);
                    })
                    contItem.append(group)
                })
                $(this._element).find('.a-tab-targets').append(contItem);
                $(this._element).find('.a-btn-tab').addClass("a-tab-fun");
            }
            let selectedtext = $(this._element).find(Selector.DROPDOWN_ITEM_ACTIVE).text();
            if (selectedtext) {
                $(this._element).find(Selector.DROPDOWN_TEXT).html(selectedtext);
            }
        }

        /** tab multiple select render function */
        renderTabMultiple() {
            let _this = this;
            let tabDom = $(`<ul class="a-btn-tab ${this.tabclass}"></ul><div class="a-tab-targets"></div>`);
            $(this._element).find(Selector.DROPDOWN_MENU).append(tabDom);
            for (let i = 0; i < this.data.length; i++) {
                let tabItem = $(`<li class="a-tab-item" tid=${this.data[i].tid} target="#target${this.data[i].tid}">${this.data[i].val}</li>`)
                if (i === 0) {
                    tabItem = $(`<li class="a-tab-item active" tid=${this.data[i].tid} target="#target${this.data[i].tid}">${this.data[i].val}</li>`)
                }
                $(this._element).find(".a-btn-tab").append(tabItem);
                let contItem = $(`<div class="a-tab-target-item" tid=${this.data[i].tid} id="target${this.data[i].tid}"></div>`)
                this.data[i].data.forEach(G => {
                    let group = $(`<div class="a-dropdown-group" gid=${G.gid}>
                        <div class="a-group-title">${G.val}</div>
                        <ul class="a-group-content"></ul></div>
                            `)
                    G.data.forEach(I => {
                        let item = $(`<div class="${ClassName.DROPDOWN_ITEM}" sid=${I.id}><label class="a-checkbox">
                            <input type="checkbox">
                            <span class="a-checkbox-mark">
                                <span class="appkiticon icon-check-mark-fill"></span>
                            </span>
                            <span class="a-checkbox-text">${I.value}</span>
                        </label></div>`)
                        if (I.active) {
                            item = $(`<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${I.id}><label class="a-checkbox">
                                <input type="checkbox" checked>
                                <span class="a-checkbox-mark">
                                    <span class="appkiticon icon-check-mark-fill"></span>
                                </span>
                                <span class="a-checkbox-text">${I.value}</span>
                            </label></div>`)
                        }
                        group.find(".a-group-content").append(item);
                    })
                    contItem.append(group)
                })
                $(this._element).find('.a-tab-targets').append(contItem);
                $(this._element).find('.a-btn-tab').addClass("a-tab-fun");
            }
            let count = $(this._element).find(Selector.TBB_CONT_ACTIVE).find(Selector.DROPDOWN_ITEM_ACTIVE).length;
            this.setMultiSelectShowText(count);
        }

        /**multiple select selected show text setting function*/
        setMultiSelectShowText(count) {
            if (count > 1) {
                $(this._element).find(Selector.DROPDOWN_TEXT).html(count + ' items selected');
            } else if (count === 1) {
                $(this._element).find(Selector.DROPDOWN_TEXT).html(1 + ' item selected');
            } else {
                $(this._element).find(Selector.DROPDOWN_TEXT).html('Choose options');
            }
        }

        /**search function */
        search() {
            if ($(this._element).find(Selector.SEARCH_IPT).length > 0) {
                let searchval = $(this._element).find(Selector.SEARCH_IPT).val().toLowerCase();
                $(this._element).find(Selector.DROPDOWN_ITEM).each((ix, e) => {
                    if ($(e).text().toLowerCase().indexOf(searchval) > -1) {
                        $(e).removeClass(ClassName.HIDDEN)
                    } else {
                        $(e).addClass(ClassName.HIDDEN)
                    };
                })
            }
        }

        /**when clicked item in tab select we only update the tab targe part, below is the update function */
        updatetabselect(scrollTop) {
            $(this._element).find(Selector.TAB_CONT).html("");
            if ($(this._element).hasClass(ClassName.TAB_SELECT)) {
                this.data.forEach(tabitem => {
                    let contItem = $(`<div class="a-tab-target-item" tid=${tabitem.tid} id="target${tabitem.tid}"></div>`);
                    tabitem.data.forEach(groupitem => {
                        let group = $(`<div class="a-dropdown-group" gid=${groupitem.gid}>
                            <div class="a-group-title">${groupitem.val}</div>
                            <ul class="a-group-content"></ul></div>
                        `)
                        groupitem.data.forEach(listitem => {
                            let item = $(`<div class="${ClassName.DROPDOWN_ITEM}" sid=${listitem.id}>${listitem.value}</div>`)
                            if (listitem.active) {
                                item = $(`<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${listitem.id}>${listitem.value}</div>`)
                            }
                            group.find(".a-group-content").append(item);
                        })
                        contItem.append(group);
                    })
                    $(this._element).find(Selector.TAB_CONT).append(contItem);
                })
                let selectedtext = $(this._element).find(Selector.DROPDOWN_ITEM_ACTIVE).text();
                if (selectedtext) {
                    $(this._element).find(Selector.DROPDOWN_TEXT).html(selectedtext);
                }
                $(this._element).find('.a-btn-tab').tab({
                    init: true
                })
            } else {
                this.data.forEach(tabitem => {
                    let contItem = $(`<div class="a-tab-target-item" tid=${tabitem.tid} id="target${tabitem.tid}"></div>`);
                    tabitem.data.forEach(groupitem => {
                        let group = $(`<div class="a-dropdown-group" gid=${groupitem.gid}>
                            <div class="a-group-title">${groupitem.val}</div>
                            <ul class="a-group-content"></ul></div>
                        `)
                        groupitem.data.forEach(listitem => {
                            let item = $(`<div class="${ClassName.DROPDOWN_ITEM}" sid=${listitem.id}><label class="a-checkbox">
                                <input type="checkbox">
                                <span class="a-checkbox-mark">
                                    <span class="appkiticon icon-check-mark-fill"></span>
                                </span>
                                <span class="a-checkbox-text">${listitem.value}</span>
                            </label></div>`)
                            if (listitem.active) {
                                item = $(`<div class="${ClassName.DROPDOWN_ITEM} ${ClassName.ACTIVE}" sid=${listitem.id}><label class="a-checkbox">
                                <input type="checkbox" checked>
                                    <span class="a-checkbox-mark">
                                        <span class="appkiticon icon-check-mark-fill"></span>
                                    </span>
                                    <span class="a-checkbox-text">${listitem.value}</span>
                                </label></div>`)
                            }
                            group.find(".a-group-content").append(item);
                        })
                        contItem.append(group);
                    })
                    $(this._element).find(Selector.TAB_CONT).append(contItem);
                })
                $(this._element).find('.a-btn-tab').tab({
                    init: true
                })
                let count = $(this._element).find(Selector.TBB_CONT_ACTIVE).find(Selector.DROPDOWN_ITEM_ACTIVE).length;
                this.setMultiSelectShowText(count);
            }
            if (scrollTop) {
                $(this._element).find(Selector.DROPDOWN_MENU).scrollTop(scrollTop);
            }
        }

        /**set active dropdown item function */
        setActive(current) {
            if ($(this._element).hasClass(ClassName.MULTIPLE)) {
                let currentId = $(current).attr(AttrName.SID);
                this.data.forEach(element => {
                    if (element.id.toString() === currentId) {
                        element.active = !element.active;
                    }
                });
                this.init();
            } else if ($(this._element).hasClass(ClassName.GROUP)) {
                $(this._element).find(Selector.DROPDOWN_ITEM).removeClass(ClassName.ACTIVE);
                let currentSid = $(current).attr(AttrName.SID);
                let currentGid = $(current).closest(Selector.DROPDOWN_GROUP).attr(AttrName.GID);
                this.data.forEach(element => {
                    if (element.gid.toString() === currentGid) {
                        element.data.forEach(item => {
                            if (item.id.toString() === currentSid) {
                                item.active = true;
                            } else {
                                item.active = false;
                            }
                        })
                    } else {
                        element.data.forEach(item => {
                            item.active = false;
                        })
                    }
                });
                $(this._element).removeClass(ClassName.SHOW);
                this.init();
            } else if ($(this._element).hasClass(ClassName.GROUP_MULTIPLE)) {
                let currentSid = $(current).attr(AttrName.SID);
                let currentGid = $(current).closest(Selector.DROPDOWN_GROUP).attr(AttrName.GID);
                this.data.forEach(element => {
                    if (element.gid.toString() === currentGid) {
                        element.data.forEach(item => {
                            if (item.id.toString() === currentSid) {
                                item.active = !item.active;
                            }
                        })
                    }
                });
                this.init();
            } else if ($(this._element).hasClass(ClassName.TAB_SELECT)) {
                let currentTid = $(current).closest(Selector.TAB_TARGET_ITEM).attr(AttrName.TID);
                let currentGid = $(current).closest(Selector.DROPDOWN_GROUP).attr(AttrName.GID);
                let currentSid = $(current).attr(AttrName.SID);
                this.data.forEach(tabitem => {
                    if (tabitem.tid.toString() === currentTid) {
                        tabitem.data.forEach(groupitem => {
                            if (groupitem.gid.toString() === currentGid) {
                                groupitem.data.forEach(item => {
                                    if (item.id.toString() === currentSid) {
                                        item.active = true;
                                    } else {
                                        item.active = false;
                                    }
                                })
                            } else {
                                groupitem.data.forEach(item => {
                                    item.active = false;
                                })
                            }
                        })
                    } else {
                        tabitem.data.forEach(groupitem => {
                            groupitem.data.forEach(item => {
                                item.active = false;
                            })
                        })
                    }
                });
                let scrollTop = $(this._element).find(Selector.DROPDOWN_MENU).scrollTop();
                this.updatetabselect(scrollTop);
            } else if ($(this._element).hasClass(ClassName.TAB_MULTI_SELECT)) {
                let currentTid = $(current).closest(Selector.TAB_TARGET_ITEM).attr(AttrName.TID);
                let currentGid = $(current).closest(Selector.DROPDOWN_GROUP).attr(AttrName.GID);
                let currentSid = $(current).attr(AttrName.SID);
                this.data.forEach(tabitem => {
                    if (tabitem.tid.toString() === currentTid) {
                        tabitem.data.forEach(groupitem => {
                            if (groupitem.gid.toString() === currentGid) {
                                groupitem.data.forEach(item => {
                                    if (item.id.toString() === currentSid) {
                                        item.active = !item.active;
                                    }
                                })
                            }
                        })
                    }
                });
                let scrollTop = $(this._element).find(Selector.DROPDOWN_MENU).scrollTop();
                this.updatetabselect(scrollTop);
            } else {
                $(this._element).find(Selector.DROPDOWN_ITEM).removeClass(ClassName.ACTIVE);
                let currentId = $(current).attr(AttrName.SID);
                this.data.forEach(element => {
                    element.active = false;
                    if (element.id.toString() === currentId) {
                        element.active = true;
                    }
                });
                $(this._element).removeClass(ClassName.SHOW);
                this.init();
            }
        }

        /**toggle dropdown function */
        toggle() {
            if ($(this._element).hasClass(ClassName.TOGGLE_SEARCH)) {
                if (!$(this._element).hasClass(ClassName.SHOW)) {
                    $(this._element).addClass(ClassName.SHOW)
                    $(this._element).find(Selector.SEARCH_IPT).focus();
                }
            } else {
                if ($(this._element).hasClass(ClassName.SHOW)) {
                    $(this._element).removeClass(ClassName.SHOW)
                } else {
                    $(this._element).addClass(ClassName.SHOW)
                    if ($(this._element).hasClass(ClassName.TAB_SELECT) || $(this._element).hasClass(ClassName.TAB_MULTI_SELECT)) {
                        $(this._element).find('.a-btn-tab').tab({
                            init: true
                        })
                    }
                }
            }
        }

        /**hide dropdown function */
        hide() {
            if ($(this._element).find(Selector.SEARCH_IPT).length > 0) {
                $(this._element).find(Selector.SEARCH_IPT).val("");
                $(this._element).find(Selector.DROPDOWN_ITEM).removeClass(ClassName.HIDDEN);
            }
            $(this._element).removeClass(ClassName.SHOW);
        }

        static _jQueryInterface(config) {
            return this.each(function () {
                let data = $(this).data(DATA_KEY)

                if (!data) {
                    data = new Select(this);
                    data.data = config.data;
                    if (config.tabclass) {
                        data.tabclass = config.tabclass
                    }
                    if (config.markcomment) {
                        data.markcomment = config.markcomment;
                    }
                    $(this).data(DATA_KEY, data);
                    data.init();
                }

                if (config) {
                    if (config.current) {
                        data.setActive(config.current);
                    }
                    if (config.toggle) {
                        data.toggle();
                    }
                    if (config.hide) {
                        data.hide();
                    }
                    if (config.searching) {
                        data.init();
                    }
                    if (config.update) {
                        data.updatetabselect();
                    }
                }
            })
        }
    }


    $(document)
        .on(Event.CLICK, Selector.DROPDOWN_ITEM, event => {
            event.preventDefault()
            event.stopPropagation();
            let clickedMenu;
            if (!$(event.target).is(Selector.DROPDOWN_ITEM)) {
                clickedMenu = $(event.target).closest(Selector.DROPDOWN_ITEM);
            } else {
                clickedMenu = event.target;
            }

            let select = $(clickedMenu).closest(Selector.SELECT);
            Select._jQueryInterface.call($(select), {
                current: clickedMenu
            })
        })
        .on(Event.PROPERTY_CHANGE, Selector.SEARCH_IPT, event => {
            event.preventDefault()
            event.stopPropagation();
            let field = event.target
            let select = $(field).closest(Selector.SELECT);
            Select._jQueryInterface.call($(select), {
                searching: true
            })
        })
        .on(Event.CLICK, Selector.SEARCH_IPT, event => {
            event.stopPropagation();
        })
        .on(Event.CLICK, Selector.DROPDOWN_MENU, event => {
            event.stopPropagation();
            let select = $(event.target).closest(Selector.SELECT);
            if (select.hasClass(ClassName.TAB_SELECT) || select.hasClass(ClassName.TAB_MULTI_SELECT)) {
                Select._jQueryInterface.call($(select), {
                    update: true
                })
            }
        })
        .on(Event.CLICK, Selector.DROPDOWN_TOGGLE, event => {
            event.preventDefault();
            event.stopPropagation();
            let select = $(event.target).closest(Selector.SELECT);
            $(Selector.SELECT).not(select).removeClass(ClassName.SHOW);
            Select._jQueryInterface.call($(select), {
                toggle: true
            })
        })

    $(window).click(function () {
        Select._jQueryInterface.call($(Selector.SELECT), {
            hide: true
        })
    })

    $.fn[NAME] = Select._jQueryInterface
    $.fn[NAME].Constructor = Select
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Select._jQueryInterface
    }

    return Select
})(jquery)

export default Select
