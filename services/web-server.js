const configs=require('../configs/configs.js'),
      lurl=require('url');
let https;
if (configs.https) {
    https = require('https');
}
else {
    https = require('http');
}
const express = require('express');
const fs = require('fs');
const path = require('path');

const bodyParser = require('body-parser');

let httpsServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express()/*,
          appWs = express()*/;

    if (configs.https) {
      const serverKey=path.resolve('cert', 'server.key');
      const serverCert=path.resolve('cert', 'server.cert');
      const pathCert='/cert/server.key';
      httpsServer =https.createServer({
        key: fs.readFileSync(path.normalize(serverKey)),
        cert: fs.readFileSync(path.normalize(serverCert))
      }, app);
    }
    else {
        httpsServer = https.createServer(app);
        //httpWsServer = httpWs.createServer(appWs);
    }

    app.all('*', function(req, res, next) {
        let origin = req.headers.origin;
        next();
        /*if(jwt.host.indexOf(origin) >= 0){
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Methods", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        }
        else {
          //console.log(req);
          if ((req.originalUrl.split('/')[1]==='f-client') & (req.method==='POST')) {
            next();
          }
          else if (req.originalUrl==='/ws') {
            next();
          }
        }*/
    });

    app.use(bodyParser.json({limit: '100mb', extended: true}));
    //app.use('/ch_fc', routerDB);

    httpsServer.listen(configs.webClientPort,configs.webClientIP)
      .on('listening', () => {
        console.log(`Web server listening on ${configs.webClientIP}:${configs.webClientPort}`);

        resolve();
      })
      .on('error', err => {
        reject(err);
      })
      .setTimeout(700000);

  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpsServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;
