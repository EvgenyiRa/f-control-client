const configs={
  webServerIP: "192.168.1.57:3777",
  webServerProtocol: 'http',
  webSocketProtocol:'ws',
  repUserId: 1,
  keyForWebServer:'e0c0c7d7502e3b41c1136a15e71d6f955781385349e4042134d109c5403360d3',
  countMSsave:10000,
  counMSupd:5000,
  test:true,
  webClientIP:"127.0.0.1",
  webClientPort:"4777",
  https:false,
  adminLogin:undefined,
  adminPwd:undefined
};
configs.webServer=configs.webServerProtocol+'://'+configs.webServerIP;
configs.webSocketServer=configs.webSocketProtocol+'://'+configs.webServerIP+'/ws';
module.exports = configs;
