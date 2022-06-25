'use strict';
const execSync = require('child_process').execSync,
      configs=require('../configs/configs.js');

module.exports = async (codeCity) => {
  /*let gisRes;
  const redisKey='gisInfo_'+codeCity;
  if (await redis.client.exists(redisKey)) {
    gisRes=await redis.client.get(redisKey);
  }
  else {
    gisRes=execSync("curl -s -H 'X-Gismeteo-Token: "+configs.gis.token+"' 'https://api.gismeteo.net/v2/weather/current/"+codeCity+"/?lang=ru'").toString().slice(0, -1);
    redis.client.set(redisKey, gisRes);
    redis.client.expire(redisKey, configs.gis.expire);//установка времени действия кэша
  }
  return JSON.parse(gisRes);*/
  return 'hello';
};
