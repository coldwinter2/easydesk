const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const win = require('./window');

global.window = null;

function createWindow () {
    if(window) return;
    window = new win();
    window.createWindow({
        width: 1366,
        height:768,
        maximizable:false,

        resizable:false
    },function(o){
        window.pushView('index'); 
    });

}


app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', ()=>{
    app.quit()
})

app.on('activate', ()=>{
    createWindow()
})
