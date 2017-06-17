


let electron = require('electron')
let {BrowserWindow,app} = electron
let path = require('path');
let url = require('url');
let util = require("util");
let config = require('./config');

let base_path = config.base_path || path.dirname(__dirname);

function window()
{
    this.name = 'window';
    this.mainWindow = null;
    this.url = null;
    this.ipcMain = electron.ipcMain;
    this.ipcRenderer = electron.ipcRenderer;
    this.listener_channels = [];
}

/**
 * 创建窗口，准备完成后执行回调
 */
window.prototype.createWindow = function(param,ready_callback,obj)
{
    var args = param || this.param || {};

    args.show = false;
    var win = new BrowserWindow(args);
    this.mainWindow = win;

    var self = this;
    if(param.debug_view)
    {
        this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.once('ready-to-show', () => {
        win.show();
    });

    this.mainWindow.on('closed',function(){
        for(var i in self.listener_channels)
        {
            var tmp = self.listener_channels[i];
            self.ipcMain.removeListener(tmp.msg,tmp.listener);
        }
        self.mainWindow = null;
        process.exit(0);
    });

    ready_callback && ready_callback.call(obj,self);

}
// 事件监听
window.prototype.listener_channels = [];
window.prototype._cur_ctrl = null;
window.prototype.controllers_stack = [];

window.prototype.bind = function(msg,func,self)
{
    if(func == undefined || func == null) return;
    this.unbind(msg);
    var listener = function(event,arg)
    {
        func.call(self,event,arg);
    }

    this.listener_channels[event] = arg;
    this.ipcMain.on(msg,listener);
}

window.prototype.unbind = function(msg)
{
    var v = this.listener_channels[msg];
    if(!!v)
    {
        this.ipcMain.removeListener(msg,v);
        delete this.listener_channels[msg];
    }
}

window.prototype.clearListener = function()
{
    for(var k in this.listener_channels)
    {
        this.ipcMain.removeListener(k,this.listener_channels[k]);
        delete this.listener_channels[k];
    }
}

/**
 * 创建View，实质上是创建View对应的控制器
 */
window.prototype.createView = function(view_controller)
{
    var ret = null;
    try
    {
        var s = path.join(base_path, config.controller, view_controller);
        var c = require(s);
        var o = new c();
        (o.init(this)) && (ret = o);
    }catch(e)
    {
        console.error(e);
    }
    return ret;
}

window.prototype.pushView = function(view_controller)
{
    if(!view_controller) return;
    var v = this.createView(view_controller);
    if(!v) return;
    if(this._cur_ctrl)
    {
        if(this._cur_ctrl.pause)
            this._cur_ctrl.onPause();
        this.controllers_stack.push(this._cur_ctrl);
        this._cur_ctrl = null;
    }
    this._cur_ctrl = v;
    if(this._cur_ctrl)
    {
        this._cur_ctrl.onEnter();
    }
}

window.prototype.popView = function()
{
    if(!this._cur_ctrl) return;
    if(this._cur_ctrl.onExit)
        this._cur_ctrl.onExit();
    this._cur_ctrl = null;
    if(this.controllers_stack.length > 0)
    {
        this._cur_ctrl = this.controllers_stack.pop();
        if(this._cur_ctrl && this._cur_ctrl.resume)
        {
            this._cur_ctrl.onResume();
        }
    }

}

window.prototype.clearViewStack = function()
{
    while(this._cur_ctrl)
    {
        this.popView();
    }
}

window.prototype.loadView = function(view_name)
{
    if(!this.mainWindow) return;
    this.mainWindow.loadURL(url.format(
        {
            pathname: path.join(base_path, config.view, view_name+'.html'),
            protocol:'file:',
            slashes:true
        }
    ))
}

module.exports = window
