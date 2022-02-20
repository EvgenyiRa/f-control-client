const getIP=(req)=>{
  let ip = req.ip; // trust proxy sets ip to the remote client (not to the ip of the last reverse proxy server)
  if (ip.substr(0,7) == '::ffff:') { // fix for if you have both ipv4 and ipv6
    ip = ip.substr(7);
  }
  return ip;
}
module.exports.getIP=getIP;
