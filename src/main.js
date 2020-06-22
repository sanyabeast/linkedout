


const {app, BrowserWindow} = require('electron')
const path = require('path')
const forEach = require("lodash/forEach")
const find = require("lodash/find")
const ipc = require('electron').ipcMain;

function create_windows () {
  const main_window = new BrowserWindow({
    title: "LIQUID BURGER TECHNOLOGY",
    width: 600,
    height: 600,
    nodeIntegration: true,
    nodeIntegrationInWorker : true,
    nodeIntegrationInSubFrames: true,
    experimentalFeatures: true,
    webPreferences: {
      preload: path.join(process.cwd(), '/src/main_preload.js'),
      webSecurity: false,
      
    }
  })

  // main_window.maximize()
  main_window.loadURL( path.join(process.cwd(), '/src/app/index.html') )
  // main_window.openDevTools()
  main_window.setPosition( 0, 0 )
  main_window.setAlwaysOnTop( true, "screen" )

  const worker_window = new BrowserWindow({
    title: "worker",
    width: (1920 / 3) * 2,
    height: 720,
    nodeIntegration: true,
    nodeIntegrationInWorker : true,
    nodeIntegrationInSubFrames: true,
    experimentalFeatures: true,
    webPreferences: {
      // images: false,
      preload: path.join(process.cwd(), '/src/worker_preload.js'),
      webSecurity: false,
      
    }
  })

  // worker_window.maximize()
  worker_window.loadURL( "https://www.linkedin.com/" )
  // worker_window.openDevTools()
  worker_window.setPosition( 1920 / 3, 0 )
  // worker_window.setAlwaysOnTop( true, "screen" )


  
  ipc.on('message', (event, payload ) => {
    if (  typeof payload === "object" ) {
      switch ( payload.to ) {
        case "main":
          if ( payload.data && payload.data.type === "url" ) {
            main_window.loadURL( payload.data.url )
            break;
          }

          if ( payload.data && payload.data.type === "reload" ) {
            main_window.reload()
            break;
          }

          if ( payload.data && payload.data.type === "back" ) {
            main_window.webContents.goBack()
            break;
          }

          if ( payload.data && payload.data.type === "reload" ) {
            main_window.webContents.reload()
            break;
          }
          
          main_window.send( "message", payload.data )
        break;
        case "worker":
          if ( payload.data && payload.data.type === "url" ) {
            worker_window.loadURL( payload.data.url )
            break;
          }

          if ( payload.data && payload.data.type === "reload" ) {
            worker_window.reload()
            break;
          }

          if ( payload.data && payload.data.type === "back" ) {
            worker_window.webContents.goBack()
            break;
          }

          if ( payload.data && payload.data.type === "reload" ) {
            worker_window.webContents.reload()
            break;
          }
          

          worker_window.send( "message", payload.data )
        break;
      }
    }
  });

  ipc.on('instruction', (event, payload ) => {
    if (  typeof payload === "object" ) {
      switch ( payload.to ) {
        case "main":
          main_window.send( "instruction", payload.data )
        break;
        case "worker":
          worker_window.send( "instruction", payload.data )
        break;
      }
    }
  });
  
}

app.whenReady().then(create_windows)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length < 2) create_windows()
})
