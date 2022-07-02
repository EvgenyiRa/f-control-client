const configs={
  webServerIP: undefined,
  webServerProtocol: 'https',
  repUserId: undefined,
  keyForWebServer:undefined,
  countMSsave:90000,
  counMSupd:10000,
  test:false,
  webClientIP:"127.0.0.1",
  webClientPort:"4777",
  adminLogin:undefined,
  adminPwd:undefined
};
if (!!configs.webServerIP) {
    configs.webServer=configs.webServerProtocol+'://'+configs.webServerIP;
    configs.webSocketServer=((configs.webServerProtocol==='https')?'wss':'ws')+'://'+configs.webServerIP+'/ws';
}
else {
    configs.webSocketServer=undefined;
}
module.exports = configs;
