const lurl=require('url');

async function post(req, res, next) {
    try {
      const {host}=lurl.parse(req.body.url),
            data=req.body.data;
      if (!!!data.data.browser) {
          data.data.browser={};
      }
      if (!!!data.data.browser[host]) {
          data.data.browser[host]=[];
      }
      if (data.data.browser[host].indexOf(req.body.url)===-1) {
          data.data.browser[host].push(req.body.url);
      }
      const resObj={result:'ok'}
      res.status(200).json(resObj);
      //res.status(404).end();
    } catch (err) {
      next(err);
    }
}

module.exports.post = post;
