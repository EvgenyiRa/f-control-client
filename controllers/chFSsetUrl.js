const lurl=require('url');

async function post(req, res, next) {
    try {
      const {host}=lurl.parse(req.body.url);
      
      const resObj={result:'ok'}
      res.status(200).json(resObj);
      //res.status(404).end();
    } catch (err) {
      next(err);
    }
}

module.exports.post = post;
