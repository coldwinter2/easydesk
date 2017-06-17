const util = require('util');
const controller = require('../core/controller');
function index()
{
    controller.apply(this);
    this.onEnter = function()
    {
        this.window.loadView('index');
    }
}

index.prototype.init = function(win)
{
    controller.prototype.init.apply(this,[win]);
    return true;
}

util.inherits(index,controller);
module.exports=index;