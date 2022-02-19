const configs=require('../configs/configs.js'),
      common=require('../services/common.js');

async function post(req, res, next) {
  try {
    let result=false;
    if ((typeof configs.adminLogin==='undefined')
        & (typeof configs.adminPwd==='undefined')) {
            result=true;
    }
    return res.status(200).json({ result:  result});
  } catch (err) {
    next(err);
  }
}

module.exports.post = post;
