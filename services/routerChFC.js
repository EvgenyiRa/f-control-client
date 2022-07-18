const chFSsetUrl = require('../controllers/chFSsetUrl.js');
const chFSgetInfo = require('../controllers/chFSgetInfo.js');

const routerChFC=(req,res)=>{
  const controller=req.url.split(req.router)[1];
  //console.log('controller',controller);
  if (controller==='/set_url') {
      chFSsetUrl.post(req,res);
  }
  else if (controller==='/get_info') {
      chFSgetInfo.get(req,res);
  }
}

module.exports = routerChFC;
