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
            auth=authM.set(/*dataP.key*/);
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
              const text='Auth user error: ip-'+request.ip+'; login-'+dataP.login+'; key-'+dataP.key;
              await common.checkErr(request.ip,result.message,text);
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
              args=dataP.args;
        const fn = api.get(method);
        try {
          const result = await fn(...args);
          if (!result) {
            wsf.send('"No result"');
            return;
          }
          wsf.send(JSON.stringify({data:result}));
        } catch (err) {
          console.dir({ err });
          wsf.send('"Server error"');
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
