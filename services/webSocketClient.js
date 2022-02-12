// Создаётся экземпляр клиента
const configs=require('../configs/configs.js'),
      WebSocketClient = require('websocket').client,
      fs = require('fs'),
      wsClient = new WebSocketClient();

console.log("Подключение к серверу "+configs.webServer+" по WebSocket");
const connectionObj={};

const init=(data)=>{
  // Вешаем на него обработчик события подключения к серверу
  data.wsStat.connect=false;
  data.wsStat.auth=false;
  data.wsStat.dataUpdate=false;
  wsClient.on('connect', wsHandler);
  function wsHandler(connection) {
    console.log('WebSocket Client Connected');
    data.wsStat.connect=true;
    data.wsStat.connection=connection;
    connection.on('error', function(error) {
        data.wsStat.connect=false;
        data.wsStat.auth=false;
        data.wsStat.dataUpdate=false;
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
        data.wsStat.connect=false;
        data.wsStat.auth=false;
        data.wsStat.dataUpdate=false;
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
                    repUserId:data.repUserId,
                    login:data.login,
                    key:data.key
                  };
                  connection.sendUTF(JSON.stringify(request));
              }
              else if (dataP.type==='authRes') {
                data.wsStat.auth=dataP.data.auth;
                if (data.wsStat.auth) {
                    data.lims=dataP.data.lims;
                    fs.writeFileSync("./data/lims_"+data.login+".json", JSON.stringify(data.lims));
                }
              }
              else if (dataP.type==='dataUpdateRes') {
                console.log(dataP);
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
      data.wsStat.connect=false;
      data.wsStat.auth=false;
      data.wsStat.dataUpdate=false;
  });
}
module.exports.init = init;
