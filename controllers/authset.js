const configs=require('../configs/configs.js'),
      common=require('../services/common.js');

async function post(req, res, next) {
      //console.log('req.body',req.body);
      if ((!!req.body.login) && (!!req.body.password)) {
        try {

          return res.status(200).json({ result:  true});
        } catch (err) {
          next(err);
        }
      }
      else {
          return res.status(200).json({ message: 'Data error' });
      }
}

module.exports.post = post;
