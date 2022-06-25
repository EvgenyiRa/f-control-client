const lurl=require('url');

async function post(req, res) {
    try {
      const {host}=lurl.parse(req.body.url),
            data=req.body.data;
      if (!!!data.data.browser) {
          data.data.browser={};
      }
      if (!!!data.data.browser[host]) {
          data.data.browser[host]={timeAll:0,urls:[]};
      }
      if (data.data.browser[host].urls.indexOf(req.body.url)===-1) {
          data.data.browser[host].urls.push(req.body.url);
      }
      data.data.browserLastHost=host;
      const resObj={result:'ok'};
      res.status(200).json(resObj);
      //res.status(404).end();
    } catch (err) {
      console.error(err);
    }
}

module.exports.post = post;
