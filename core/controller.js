function controller()
{


    this.onEnter = function()
    {

    }

    this.onPause = function()
    {

    }

    this.onResume = function()
    {
        
    }

    this.onExit = function()
    {

    }   
}

/**
 * 
 * if success, must return true
 * @param {object} win
 * @return  {boolean}
 */
controller.prototype.init = function(win)
{
    this.window = win;
    return true;
}




module.exports = controller;
