const url = require('url');

async function post(req, res) {
    try {
      if (['POST','OPTIONS'].indexOf(req.method)>-1) {
        let rawData = '';
        req.setEncoding('utf8');
        res.writeHead(200, {
          "Access-Control-Allow-Origin": '*',
          "Access-Control-Allow-Methods":"*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
          'Content-Type': 'application/json'
        });

        req.on('data', (chunk) => {
          rawData+=chunk;
        })
        .on('end', () => {
            if (rawData!=='') {
              const parsedData = JSON.parse(rawData);
              //console.log(parsedData);
              const {host}=url.parse(parsedData.url),
                    data=req.indexData;
              //console.log('host',host);
              if (!!!data.data.browser) {
                  data.data.browser={};
              }
              if (!!!data.data.browser[host]) {
                  data.data.browser[host]={timeAll:0,urls:[]};
              }
              if (data.data.browser[host].urls.indexOf(parsedData.url)===-1) {
                  data.data.browser[host].urls.push(parsedData.url);
              }
              data.data.browserLastHost=host;
              res.end(JSON.stringify({result:'ok'}));
            }
            else {
              res.end(JSON.stringify({result:'no data'}));
            }
        })
        .on('error', (err) => {
          // This prints the error message and stack trace to `stderr`.
          console.error(err.stack);
          res.statusCode = 404;
          res.end('');
        });
      }
      else {
          res.statusCode = 404;
          res.end('');
      }
    } catch (err) {
      res.statusCode = 404;
      res.end('');
      console.error(err);
    }
}

module.exports.post = post;
