const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = Object.create({});

if (require('electron-squirrel-startup')) return app.quit();

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
            results[name] = [];
        }
        results[name].push(net.address);
    }
  }
}

console.log(results);

const http = require('http');
const hostname = results?.en0?.[0] 
  || results?.Ethernet?.[0] 
  || '127.0.0.1';
const port = 3000;

function handleGetServerUrl() {
  return `http://${hostname}:${port}/`;
}

let json = {};

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 617,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.loadFile('index.html');
  win.maximize();
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {

  ipcMain.on('updateJSON', (_event, updatedJSON) => {
    json = updatedJSON;
    // console.log('updateJSON' , updatedJSON);
  })

  ipcMain.handle('get-server-url', handleGetServerUrl);

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

//////////////////////////////////////////////////////////////////
// 
// Set up server to host JSON files for wall
// 

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/json');
  res.end(JSON.stringify(json));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})

