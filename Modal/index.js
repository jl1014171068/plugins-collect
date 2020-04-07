/*
 * @Author: 末空
 * @since: 2020-03-19 13:38:39
 * @lastTime: 2020-04-07 16:02:17
 * @LastAuthor: 末空
 * @message: 模态框弹出
 * @custom_string_末空: 0.0
 */
/**
 * const modal = new Modal({
        "el": "#box",
        'title':'新增装车方案（连云港转运中心）',
        'confirm':(el)=>{
            console.log('这里应该是对象方式吧',el)
        },
        content:'<b>1321313123</b>'
    })
    modal.on('confirm',()=>{
        console.log('关闭啦')
    })
 * 
 */
;
"use strict";
// import './index.css'
class Modal {
    constructor(opt) {
        const ops = {
            width: '600',
            height: '',
            okText: '确认',
            cancelText: '取消',
            cancel: false,
            ok: true,
            title: '提示',
            align: 'center', //底部按钮居中
            confirm: function () {},
            close: function () {},
            content: '',
            btnType:'',
            autoHide: true, //点击确定按钮是否关闭
            formFlag:false
        }
        this.ops = Object.assign({}, ops, opt)
        this.dom = ''; //存放在实例中的节点
        this.hasDom = false; //检查dom树中dialog的节点是否存在
        this.listeners = []; //自定义事件，用于监听插件的用户交互
        this.handlers = {};
    }
    show() {
        const $dom = document.querySelectorAll('.z-modal');
        for(let i=0,len=$dom.length;i<len;i++){
            // formFlag
            const $item = $dom[i];
            if($item&&$item.dataset&&$item.dataset.flag&&$item.dataset.flag=='form'){
                // 如果是表单
            }else{
                $item.remove();
            }
        }
        if (this.hasDom) return;
        if (this.listeners.indexOf('show') > -1) {
            if (!this.emit({
                    type: 'show',
                    target: this.dom
                })) return;
        }
        this.appendHtml();
    }
    hide(callback) {
        document.body.removeChild(this.dom);
        this.hasDom = false;
        callback && callback();
    }
    on(type, handler) {
        // type: show, shown, hide, hidden, close, confirm
        if (typeof this.handlers[type] === 'undefined') {
            this.handlers[type] = [];
        }
        this.listeners.push(type);
        this.handlers[type].push(handler);
        return this;
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
    appendHtml() {
        const {
            ops
        } = this
        const html = `
            <div class='modal-outer-wrapper'>
                <span class='modal-mask'></span>
                <div class='modal-inner-wrapper'>
                    <div class='modal-wrapper' style ='width:${ops.width}px;height:${ops.height}px'>
                        <div class='modal-header'>
                            <span class="modal-close">×</span>
                            <span class='modal-title'>${ops.title}</span>
                        </div>
                        <div class='modal-content'>
                            ${ops.content}
                        </div>
                        <div class='modal-btns ${!ops.ok&&ops.cancel?'hide':''}' style='text-align:${ops.align}'>
                            ${ops.cancel?`<button  class="btn btn-cancel">${ops.cancelText}</button>`:''}
                            ${ops.ok?`<button type='${ops.btnType}' class="btn btn-ok">${ops.okText}</button>`:''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.setAttribute('class', 'z-modal');
        if(ops.formFlag){
            div.setAttribute('data-flag', 'form');
        }
        // div.setAttribute('class', 'z-modal hide');
        div.innerHTML = html;
        document.querySelector('body').appendChild(div);
        this.dom = div;
        this.hasDom = true;
        this.addEvent();
    }

    addEvent() {
        const _this = this;
        this.dom.getElementsByClassName('modal-close')[0].onclick = function () {
            _this.hide()
            if (_this.listeners.indexOf('close') > -1) {
                _this.emit({
                    type: 'close',
                    target: _this.dom
                })
            }!!_this.ops.close && _this.ops.close.call(this, _this.dom);
        }
        this.dom.getElementsByClassName('btn-ok')[0].onclick = function () {
            _this.ops.autoHide && _this.hide()
            // 下面两句暂时没明白什么意思
            if (_this.listeners.indexOf('confirm') > -1) {
                _this.emit({
                    type: 'confirm',
                    target: _this.dom
                })
            }!!_this.ops.confirm && _this.ops.confirm.call(this, _this.dom);
        }
        if (this.ops.cancel) {
            this.dom.getElementsByClassName('btn-cancel')[0].onclick = function () {
                _this.hide();
                if (_this.listeners.indexOf('cancel') > -1) {
                    _this.emit({
                        type: 'cancel',
                        target: _this.dom
                    })
                }
            };
        }
    }

}

// export default Modal
