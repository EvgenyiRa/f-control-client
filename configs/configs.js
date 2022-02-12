const configs={
  webServerIP: "192.168.1.57:3777",
  webServerProtocol: 'http',
  webSocketProtocol:'ws',
  repUserId: 1,
  countMSsave:3000,
  counMSupd:1000,
  test:true,
  webClientIP:"127.0.0.1",
  webClientPort:"4777",
  https:false
};
configs.webServer=configs.webServerProtocol+'://'+configs.webServerIP;
configs.webSocketServer=configs.webSocketProtocol+'://'+configs.webServerIP+'/ws';
module.exports = configs;
