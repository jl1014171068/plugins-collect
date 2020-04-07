/*
 * @Author: 末空
 * @since: 2020-03-20 14:25:30
 * @lastTime: 2020-04-07 15:58:43
 * @LastAuthor: 末空
 * @message: 树形选择器
 * @custom_string_末空: 0.0
 */
;
"use strict";
// import './index.css'

Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
class TreeSelect {
    constructor(opt) {
        const ops = {
            el: '',
            title: '全国',
            data: [],
            afterContent: '', //组件前后追加内容
            beforeContent: '', // 组件前后追加内容
            allFlag: true,
            searchParentSelect: true, // 搜索时是否父子联动
            parentSelectChildren: true, // 父级勾选取消，消除子集选中
            searchFlag: true, //是否开启搜索功能
            idSearchFlag: false, //是否开启id搜索
            fuzzyFlag: true, //是否开启模糊搜索
            selectedIdS: [], //针对默认传入
            comKeyId: 'id',
            comKeyChildren: 'children',
            comKeyName: 'name',
            childrenCancelParent: false,
            changed: function () {}, //选中变化时
        }
        this.ops = Object.assign({}, ops, opt)
        this.dom = ''; //存放在实例中的节点
        this.hasDom = false; //检查dom树中dialog的节点是否存在
        this.listeners = []; //自定义事件，用于监听插件的用户交互
        this.handlers = {};
        this.selectedS = [] //已选择数组
        this._selectedIdS = [], //已选择数组的id
            this.searchSecIdList = [], //搜索出来符合条件的数据id
            this.searchRightSecIdList = [], //搜索出来右侧符合条件的数据id

            Object.defineProperty(this, "selectedIdS", {
                get: () => {
                    return this._selectedIdS || []
                },
                set: (value) => {
                    this._selectedIdS = value;
                    // 参数传出
                    if (this.listeners.indexOf('changed') > -1) {
                        this.emit({
                            type: 'changed',
                            target: this.dom,
                            selectedIdS: value
                            // selectedIdS: this.selectedIdS
                        })
                    }!!this.ops.changed && this.ops.changed.call(this, this.dom);
                    console.log(`已选中参数id为：[${value}]`)
                }
            })
        this.init();
    }
    on(type, handler) {
        // changed
        if (typeof this.handlers[type] === 'undefined') {
            this.handlers[type] = [];
        }
        this.listeners.push(type);
        this.handlers[type].push(handler);
        return this;
    }
    destroy() {
        console.log(this.dom, 1)
        this.dom.remove();
        window.sss = this.dom;
        console.log(this.dom, 2)
    }
    emit(event) {
        if (!event.target) {
            event.target = this;
        }
        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
                return true;
            }
        }
        return false;
    }
    init() {
        this.appendHtml();
        this._renderChecked();
    }
    _renderChecked() {
        // 传入数据做处理
        if (!this.ops.selectedIdS || !this.ops.selectedIdS.length) return;
        const _this = this;
        const {
            selectedIdS
        } = this.ops;
        // 此处逻辑处理应该为传入多少遍选中多少，不参与父子联动
        selectedIdS.map(id => {
            _this._clickCheckedMain(id, true, false);
        })
    }
    renderSelected(flag = true) {
        const _this = this;
        const {
            ops
        } = this;
        const {
            comKeyId,
            comKeyName
        } = ops;
        /**
         * 如果是进入页面时触发，则直接返回html元素插入即可，后续点击则调用插入
         */
        let html = '';
        if (this.selectedS && Array.isArray(this.selectedS) && this.selectedS.length) {
            // 如果是点击后则更新渲染
            this.selectedS.map(item => {
                var flags = false;
                // if (item[comKeyId].length < 5 && item[comKeyName].indexOf('中心') != -1) {
                //     flags = true;
                // }
                html += `<li data-id=${item[comKeyId]}>${item[comKeyName]} <span class='ts-ulli__delete'>x</span></li>`;
                // html += `<li data-id=${item[comKeyId]}>${!flags?'[省]':''}${item[comKeyName]} <span class='ts-ulli__delete'>x</span></li>`;
            })
        }
        if (flag) {
            var $right = this.dom.querySelector('.ts-right .ts-right__ul');
            $right.innerHTML = html;
            // 当左侧添加后，右侧才会有
            this._rihtClickChecked();
            const $tsCheckboxs = this.dom.querySelectorAll('.ts-left__ul .ts-checkbox');
            // 加状态
            for (let i = 0, len = $tsCheckboxs.length; i < len; i++) {
                const item = $tsCheckboxs[i];
                const {
                    dataset
                } = item;
                // 在已选中列表，但是未选中状态
                if (_this.selectedIdS.indexOf(dataset.id) !== -1) {
                    if (item.className.indexOf('is-checked') === -1) item.className += ' is-checked'
                } else {
                    // 如果不存在列表,但是选中状态
                    if (item.className.indexOf('is-checked') !== -1) {
                        item.className = item.className.replace('is-checked', '')
                    }
                }
            }
        }
        //  // 参数传出
        //  if (_this.listeners.indexOf('changed') > -1) {
        //     _this.emit({
        //         type: 'changed',
        //         target: _this.dom,
        //         selectedIdS: _this.selectedIdS
        //     })
        // }!!_this.ops.changed && _this.ops.changed.call(this, _this.dom);
        return html;
    }
    appendHtml() {
        const {
            ops
        } = this
        // 不知道为什么会有多余的符号
        const left = this.recursive(ops.data).join('').replace(/,/g, '');
        const right = this.renderSelected(false).replace(/,/g, '');
        const search = `
            <div class='ts-search'>
                <input  placeholder="请输入搜索内容"/>
            </div>    
        `
        // searchFlag
        const html = `
            ${this.ops.beforeContent||''}
            <div class='ts-select__inner'>
                <div class='ts-left ts-panel'>
                    <div class='ts-panel__header'>
                        <label class='ts-checkbox ts-all__check'>
                            <span class='ts-checkbox__input'>
                                <span class='ts-checkbox__inner'></span>
                                <input type="checkbox" aria-hidden="false" class="ts-checkbox__original">
                            </span>
                            <span class='ts-checkbox__label'>${this.ops.title}</span>
                        </label>
                    </div>  
                    ${search}
                    <div class='ts-left__ul'>${left}</div>
                </div>
                <div class='ts-right ts-panel'>
                    <div class='ts-panel__header'>
                          <span class='ts-panel__label'>已选</span>
                          <span class='ts-panel__count'>${this.selectedIdS.length}</span>
                    </div> 
                    ${search}
                    <ul class='ts-right__ul'>${right}</ul>
                </div>
                
            </div>
            ${this.ops.afterContent||''}
        `;
        const div = document.createElement('div');
        div.setAttribute('class', 'tree-select');
        // if (this.ops.beforeContent) html = this.ops.beforeContent + html
        // if (this.ops.afterContent) html = html + this.ops.afterContent
        div.innerHTML = html;
        document.querySelector(this.ops.el || 'body').appendChild(div);
        // document.querySelectorAll(this.ops.el || 'body')[0].appendChild(div);
        this.dom = div;
        this.hasDom = true;
        this.addEvent();
    }
    recursive(data) {
        const _this = this;
        const {
            ops
        } = this;
        const {
            comKeyId,
            comKeyName,
            comKeyChildren
        } = ops;
        return data.map(e => {
            return e[comKeyChildren] ? `
                    <label class='ts-checkbox' data-id='${e[comKeyId]}'>
                        <span class='ts-checkbox__input'>
                            <span class='ts-checkbox__inner'></span>
                            <input type="checkbox" aria-hidden="false" class="ts-checkbox__original">
                        </span>
                        <i class='ts-checkbox__triangle'></i>
                        <span class='ts-checkbox__label'>${e[comKeyName]}</span>
                    </label>
                    <div style="padding-left: 20px">${_this.recursive(e[comKeyChildren])}</div>` :
                `<label class='ts-checkbox' data-id='${e[comKeyId]}'>
                        <span class='ts-checkbox__input'>
                            <span class='ts-checkbox__inner'></span>
                            <input type="checkbox" aria-hidden="false" class="ts-checkbox__original">
                        </span>
                        <span class='ts-checkbox__label'>${e[comKeyName]}</span>
                    </label>`;
        })
    }
    // _flat_utils1(data) {
    //     // 数组扁平化
    //     function flatten(e) {
    //         return e.reduce((arr, {
    //             name,
    //             id,
    //             children = []
    //         }) => arr.concat([{
    //             name,
    //             id
    //         }], flatten(children)), [])
    //     }
    //     const array = flatten(data);
    //     return array;
    // }
    _flat_utils(data, keys, level = 0) {
        const _this = this;
        const {
            ops
        } = this;
        const {
            comKeyId,
            comKeyName,
            comKeyChildren
        } = ops;
        const key = keys || [comKeyId, comKeyName];
        // 数组扁平化
        return data.reduce((arr, x) => [
            ...arr,
            key.reduce((o, k) => (o[k] = x[k], o), {
                level
            }),
            ..._this._flat_utils(x[comKeyChildren] || [], keys, level + 1),
        ], [])
    }
    _flat_utils_array(data, key) {
        var result = this._flat_utils(data, [key])
        const arr = []
        result.forEach(e => arr.push(e[key]));
        return Array.from(new Set(arr));
    }
    _removeArrObj(arr, key, value) {
        // 查找删除数组对象中的元素
        if (!Array.isArray(arr) || !key) return;
        arr.splice(arr.findIndex(item => item[key] === value), 1)
        return arr;
    }
    _recursiveSearch(arr, key, value) {
        const {
            comKeyId,
            comKeyName,
            comKeyChildren
        } = this.ops;
        var result = null;
        //函数要有返回值，否则默认返回undefiend
        function fn(arr) {
            if (!arr) return null;
            for (var i = 0, len = arr.length; i < len; i++) {
                const item = arr[i];
                if (item[key] == value) {
                    result = item
                    break;
                };
                if (item[comKeyChildren]) fn(item[comKeyChildren])
            }
            return result;
        }
        return fn(arr)
    }
    addEvent() {
        // 事件函数
        this._clickChecked()
        // 当左侧添加后，右侧才会有
        this._rihtClickChecked();
        // 查询事件
        this.ops.searchFlag && this._searchFn();
        //全选事件
        this._checkAll();

    }
    _checkAll() {
        // 由于代码没有业务分离造成左侧需要再次渲染
        const $dom = this.dom.querySelectorAll('.ts-all__check')[0]
        const _this = this;
        const {
            ops
        } = this;
        const {
            comKeyId,
            comKeyName,
            comKeyChildren
        } = ops;
        let evTimeStamp = 0;
        $dom.onclick = function () {
            let now = +new Date();
            if (now - evTimeStamp < 100) return;
            evTimeStamp = now;
            if (_this._hasClass($dom, 'is-checked')) {
                _this.selectedS = []
                _this.selectedIdS = []
                _this._removeClass($dom, 'is-checked')
            } else {
                const flat_data = _this._flat_utils(ops.data);
                const result = _this._flat_utils_array(flat_data, comKeyId);
                _this.selectedS = flat_data;
                _this.selectedIdS = result;
                _this._addClass($dom, 'is-checked')
            }
            _this.dom.querySelectorAll('.ts-panel__count')[0].innerHTML = _this.selectedIdS.length || 0;
            // 渲染
            _this.renderSelected();
        }
    }
    _hasClass(ele, cls) {
        cls = cls || '';
        if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
        return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
    }

    _addClass(ele, cls) {
        if (!this._hasClass(ele, cls)) {
            ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
        }
    }

    _removeClass(ele, cls) {
        if (this._hasClass(ele, cls)) {
            var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
            while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                newClass = newClass.replace(' ' + cls + ' ', ' ');
            }
            ele.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    }
    _fuzzyQuery(list, key, value, fuzzyFlag = true) {
        var arr = [];
        if (fuzzyFlag) {
            for (var i = 0; i < list.length; i++) {
                if (list[i][key].indexOf(value) >= 0) {
                    arr.push(list[i]);
                }
            }
        } else {
            const flat_data = this._flat_utils(list);
            arr = flat_data.find(e => e[key] == value) || [];
        }
        return arr;
    }
    _findParent(array, id) {
        let stack = [];
        let going = true;
        const {
            comKeyId,
            comKeyChildren
        } = this.ops;
        let walker = (array, id) => {
            array.forEach(item => {
                if (!going) return;
                stack.push(item[comKeyId]);
                if (item[comKeyId] === id) {
                    going = false;
                } else if (item[comKeyChildren]) {
                    walker(item[comKeyChildren], id);
                } else {
                    stack.pop();
                }
            });
            if (going) stack.pop();
        }

        walker(array, id);
        return stack;
    }
    _searchMain(data, value, type = 'left') {
        /**
         * 左侧树查询
         * 思路：
         * 1、列出所有符合条件的id组合成数组
         * 2、递归遍历1中数组的所有子集id组合成数组
         * 3、结果数组 遍历加上状态
         * 直接从原始数据中遍历比对
         * 
         * emmm~ 写的差不多了忽然想到另一种写法
         * 1、递归列出所有的id和name组成两个数组
         * 2、模糊、id、name查询时对这两个表进行匹配，将匹配到的数据进行提取，根据里面的数据进行树搜索
         * ～在数据量大的时候应该这个比较好吧
         * 
         * 插入新需求，搜索子元素，需要展示上级上上级+++ 手动捂脸.jpg
         * 
         * 写的头好疼
         */
        const _this = this;
        const {
            ops
        } = this;
        if (value == '') {
            this._renderHideShow(false, type);
            return;
        }
        const {
            fuzzyFlag, //是否开启模糊搜索
            idSearchFlag, //是否开启id搜索
            searchParentSelect, //搜索父子联动
            comKeyId,
            comKeyName,
            comKeyChildren
        } = ops;
        //扁平化

        const flat_data = this._flat_utils(data);
        let array = [];
        let idArray = [];
        // 非联动搜索
        //id和姓名精确与否fuzzyFlag根据来定
        array = array.concat(this._fuzzyQuery(flat_data, comKeyName, value, fuzzyFlag))
        if (idSearchFlag) {
            // 是否开启id搜索
            array = array.concat(this._fuzzyQuery(flat_data, comKeyId, value, fuzzyFlag))
        }

        idArray = this._flat_utils_array(array, comKeyId)

        if (type === 'right') {
            idArray = Array.from(new Set(idArray.concat(parentArray)));
            _this.searchRightSecIdList = idArray
            this._renderHideShow(true, 'right');
            return;
        }

        /**
         * 下面为左侧时候的渲染处理情况
         */
        //根据idArray查找并列出所有父级
        let parentArray = [];
        idArray.map(item => {
            parentArray = parentArray.concat(_this._findParent(data, item))
        })
        // 联动搜索 
        if (searchParentSelect) {
            // if (parentSelectChildren) {
            idArray.map(item => {
                const result = _this._recursiveSearch(data, comKeyId, item)
                if (result && result[comKeyChildren] && result[comKeyChildren].length) {
                    const childrenData = _this._flat_utils(result[comKeyChildren])
                    idArray = idArray.concat(_this._flat_utils_array(childrenData, comKeyId))
                }
            })
        }
        idArray = Array.from(new Set(idArray.concat(parentArray)));
        _this.searchSecIdList = idArray
        this._renderHideShow();
    }
    _renderHideShow(flag = true, type = 'left') {
        // 渲染左侧可视情况
        const data = type == 'left' ? this.searchSecIdList : this.searchRightSecIdList;
        const _this = this;
        const $tsCheckboxs = type == 'left' ? this.dom.querySelectorAll(`.ts-${type}__ul .ts-checkbox`) : this.dom.querySelectorAll(`.ts-${type}__ul li`)

        for (let i = 0, len = $tsCheckboxs.length; i < len; i++) {
            const $item = $tsCheckboxs[i]
            const {
                id
            } = $item.dataset;
            if (flag) {
                if (data.some(e => e == id)) _this._removeClass($item, 'hide');
                else _this._addClass($item, 'hide');
            } else _this._removeClass($item, 'hide');
        }
    }
    _searchFn() {

        const _this = this;
        const {
            ops,
            selectedS
        } = this;
        const {
            data
        } = ops;
        let last = 0;
        const $dom = this.dom.querySelectorAll('.ts-left .ts-search input')[0];
        const $domRight = this.dom.querySelectorAll('.ts-right .ts-search input')[0];
        // 左侧搜索事件
        $dom.addEventListener('input', event => {
            last = event.timeStamp;
            const {
                value
            } = event.target;
            setTimeout(function () {
                //如果停止输入1s内没其他keyup事件发生
                if (last == event.timeStamp) {
                    _this._searchMain(data, value);
                }
            }, 1000);
        })

        // 右侧搜索事件
        $domRight.addEventListener('input', event => {
            last = event.timeStamp;
            const {
                value
            } = event.target;
            setTimeout(function () {
                //如果停止输入1s内没其他keyup事件发生
                if (last == event.timeStamp) {
                    // _this._searchMain(data, value);
                    // selectedS
                    _this._searchMain(data, value, 'right');
                }
            }, 1000);
        })
    }
    _rihtClickChecked() {
        // 右侧点击取消
        const _this = this;
        const $tsls = this.dom.querySelectorAll('.ts-right li');
        let evTimeStamp = 0;
        const {
            data,
            comKeyId,
            comKeyName,
            comKeyChildren
        } = this.ops;

        for (let i = 0, len = $tsls.length; i < len; i++) {
            const $dom = $tsls[i]
            $dom.onclick = function () {
                let now = +new Date();
                if (now - evTimeStamp < 100) return;
                evTimeStamp = now;
                const {
                    id
                } = this.dataset;
                if (id !== undefined) {
                    _this._clickCheckedMain(id, false)
                }
                if (_this.ops.childrenCancelParent) {
                    // 点击取消，判断是否有父级且开启flag
                    var array = _this._findParent(data, id);
                    // var result = _this._fuzzyQuery(data,'provinceId', array[0], false);
                    var result = null;
                    const fn = (arr, value) => {
                        if (!arr) return null;
                        for (var i = 0, len = arr.length; i < len; i++) {
                            const item = arr[i];
                            if (item[comKeyId] == value) {
                                result = item
                                break;
                            }
                            if (item[comKeyChildren]) fn(item[comKeyChildren], value)
                        }
                        return result;
                    }
                    const parentNode = fn(data, array[0]);
                    if (parentNode && parentNode.centerInfo && parentNode.centerInfo.length) {
                        const ids = []
                        if (parentNode[comKeyId] == id == array[0]) {
                            _this._clickCheckedMain(array[0], false)
                        } else {
                            parentNode.centerInfo.map(item => ids.push(item[comKeyId]))
                            // this.selectedIdS
                            var sy = ids.filter(v => _this.selectedIdS.includes(v));
                            if (!sy || !sy.length) _this._clickCheckedMain(array[0], false)
                        }
                    }
                    // console.log(array.remove(id),array)
                }
            }
            // _this.ops.childrenCancelParent
            // _findParent(array, id) {
            // function fn(arr) {
            //     if (!arr) return null;
            //     for (var i = 0, len = arr.length; i < len; i++) {
            //         const item = arr[i];
            //         if (item[key] == value) {
            //             result = item
            //             break;
            //         };
            //         if (item[comKeyChildren]) fn(item[comKeyChildren])
            //     }
            //     return result;
            // }
            // return fn(arr)


        }
    }
    _clickCheckedMain(id, isRight = true, isParams = true) {
        // isRight为false取消监听父子联动
        // isParams 为false的时候禁止联动，用于传参数方式进入
        const _this = this;
        const {
            ops
        } = this;
        const {
            comKeyId,
            comKeyName,
            comKeyChildren
        } = ops;
        const data = this._flat_utils(ops.data)
        const result_flat = data.find(e => e && e[comKeyId] == id);
        const result = _this._recursiveSearch(ops.data, comKeyId, id)
        const flag = _this.selectedS.some(e => e && e[comKeyId] == id);
        // 如果查询到该选中，则再次点击取消
        if (flag) _this._removeArrObj(_this.selectedS, comKeyId, id)
        else _this.selectedS.push(result_flat);

        // 开启父子联动情况下====> 右侧isRight设置为false禁止右侧点击联动
        if (isParams && isRight && ops.parentSelectChildren && result && result[comKeyChildren] && result[comKeyChildren].length) {
            // 如果需要选择父级同时选择子集，在存在子集且不为空，则联动选中,取消亦同
            //将其所有子集扁平化
            const childrenData = _this._flat_utils(result[comKeyChildren])
            childrenData.map(item => {
                const isFlag = _this.selectedS.some(e => e[comKeyId] === item[comKeyId]);
                if (isFlag) _this._removeArrObj(_this.selectedS, comKeyId, item[comKeyId])
            })
            if (!flag) _this.selectedS = _this.selectedS.concat(childrenData)
            // 取消选中情况下
        }
        // 保证已选中id列表和已选中数组的一致性
        _this.selectedIdS = this._flat_utils_array(_this.selectedS, comKeyId)
        // 根据已选中id列表 加 减对应的选中状态

        this.dom.querySelectorAll('.ts-panel__count')[0].innerHTML = _this.selectedIdS.length || 0;
        // 渲染
        _this.renderSelected();
    }
    _clickChecked() {
        // 点击左侧选中/取消
        const _this = this;
        const $tsCheckboxs = this.dom.querySelectorAll('.ts-left__ul .ts-checkbox');
        let evTimeStamp = 0;
        for (let i = 0, len = $tsCheckboxs.length; i < len; i++) {
            const $dom = $tsCheckboxs[i]
            $dom.onclick = function () {
                let now = +new Date();
                if (now - evTimeStamp < 100) return;
                evTimeStamp = now;
                this.className = this.className.indexOf('is-checked') != -1 ? this.className.replace('is-checked', '') : this.className += ' is-checked';
                const {
                    id
                } = this.dataset;
                if (id !== undefined) _this._clickCheckedMain(id);
            }
        }
    }
}
window.TreeSelect = TreeSelect;
// export default TreeSelect;