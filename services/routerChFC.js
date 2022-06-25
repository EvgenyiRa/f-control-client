const chFSsetUrl = require('../controllers/chFSsetUrl.js');
const chFSgetInfo = require('../controllers/chFSgetInfo.js');

/*routerChFC.route('/set_url')
  .post(chFSsetUrl.post);

routerChFC.route('/get_info')
  .get(chFSgetInfo.get);*/
const routerChFC=(req,res)=>{
  const controller=req.url.split(req.router)[1];
  console.log('controller',controller);
  if (controller==='/set_url') {
      hFSsetUrl.post(req,res);
  }
  else if (controller==='/get_info') {
      chFSgetInfo.post(req,res);
  }
}

module.exports = routerChFC;
