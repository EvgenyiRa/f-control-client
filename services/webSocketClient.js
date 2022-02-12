// Создаётся экземпляр клиента
const configs=require('../configs/configs.js'),
      WebSocketClient = require('websocket').client,
      wsClient = new WebSocketClient(),
      state={
        wsAuth:false,
        wsConnect:false
      };

//Признак коннекта к серверу
let wsConnect=false;
console.log("Подключение к серверу "+configs.webServer+" по WebSocket");

const init=(data)=>{
  // Вешаем на него обработчик события подключения к серверу
  wsClient.on('connect', wsHandler);
  function wsHandler(connection) {
    console.log('WebSocket Client Connected');
    state.wsConnect=true;
    connection.on('error', function(error) {
        state.wsConnect=false;
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
        state.wsConnect=false;
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log("Received: '" + message.utf8Data + "'");
            try {
              const dataP=JSON.parse(message.utf8Data);
              if (dataP.type==='auth') {
                  // посылаем сообщение серверу
                  const request={
                    type:'auth',
                    message:"it's my, open!",
                    repUserId:configs.repUserId,
                    login:data.login,
                    key:configs.keyForWebServer,
                  };
                  connection.sendUTF(JSON.stringify(request));
              }
              else if (dataP.type==='authRes') {
                state.wsAuth=dataP.data.auth;
              }
            } catch (err) {
              console.log('wsServer err msg: ', err);
            }
        }
    });
  }
  // Подключаемся к нужному ресурсу
  wsClient.connect(configs.webSocketServer);
  //ошибка подключения
  wsClient.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
      state.wsConnect=false;
  });
}
module.exports.init = init;
