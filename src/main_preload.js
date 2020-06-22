console.log("preload")


const ipc = window.ipc = require('electron').ipcRenderer;
const Vue = require( "vue/dist/vue.common" )
window.Vue = Vue

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

window.makeid = makeid

ipc.on('message', (event, message) => {
  switch ( message.type ) {
    case "state":
      window.update_state( message.data ) 
    break;
    case "task_state":
      window.update_task_state( message.data )
    break;
  }
  console.log(message); // logs out "Hello second window!"
})


window.send_message = function( data ) {
  ipc.send( "message", {
    to: "worker",
    data
  } )
}
