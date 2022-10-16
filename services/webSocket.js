const WebSocket = require('ws'),
      wss= new WebSocket.Server({ noServer: true }),
      configs=require('../configs/configs.js'),
      common=require('./common.js'),
      authM=require('./auth.js');

wss.on('connection', async (wsf, request, socket, api)=> {
  //console.log('api',Array.from(api.keys()));
  let auth=false;
  const messDefault=JSON.stringify({type:'auth',data:"who is?"});
  wsf.send(messDefault);
  wsf.on('message', async (data)=> {
    //console.log(`Received message ${data} from user ${client}`);
    try {
      const dataP=JSON.parse(data);

      if (!auth) {
        if (dataP.type==='auth') {
            auth=await authM.set(dataP.login,dataP.pwd);
            const result={
                      auth:auth
                  };
            if (auth) {
                result.message='Welcome';
                result.methods=Array.from(api.keys());
            }
            else {
                result.message='Go Home!';
            }
            wsf.send(JSON.stringify({type:'authRes',data:result}));
            if (!auth) {
              const text='Auth user error: ip-'+request.ip+'; login-'+dataP.login+'; pwd-'+dataP.pwd;
              console.log(text);
              socket.destroy();
            }
        }
        else {
            socket.destroy();
        }
      }
      else if (dataP.type==='method') {
        //console.log('Received: ' + dataP);
        const method=dataP.method,
              args=dataP.args,
              id=dataP.id;
        const fn = api.get(method);
        try {
          const result = await fn(...args);
          if (!result) {
            wsf.send(JSON.stringify({type:dataP.type,data:null,method:method,id:id});
            return;
          }
          wsf.send(JSON.stringify({type:dataP.type,data:result,method:method,id:id}));
        } catch (err) {
          console.log('Error exist API method');
          console.error(err);
          wsf.send(JSON.stringify({type:dataP.type,data:null,method:method,id:id});
        }
      }
    } catch (err) {
      console.log('wsCliient err msg: ', err);
      socket.destroy();
      auth=false;
    }
  });
  wsf.on('close', function() {
    // отправка уведомления в консоль
    auth=false;
    console.log('Пользователь отключился');
  });
});

module.exports=wss;
