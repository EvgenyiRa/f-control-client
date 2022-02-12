// Создаётся экземпляр клиента
const configs=require('../configs/configs.js'),
      WebSocketClient = require('websocket').client,
      wsClient = new WebSocketClient();

//Признак коннекта к серверу
let wsConnect=false;
console.log("Подключение к серверу "+configs.webServer+" по WebSocket");

const init=(data)=>{
  // Вешаем на него обработчик события подключения к серверу
  wsClient.on('connect', wsHandler);
  function wsHandler(connection) {
    console.log('WebSocket Client Connected');
    wsConnect=true;
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
        wsConnect=false;
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    // посылаем сообщение серверу
    connection.sendUTF('Hi, there!');
  }
  // Подключаемся к нужному ресурсу
  wsClient.connect(configs.webSocketServer);
  //ошибка подключения
  wsClient.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
      wsConnect=false;
  });
}
module.exports.init = init;
