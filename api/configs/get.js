'use strict';
const configs=require('../../configs/configs.js');

module.exports = async (codeCity) => {
  const resConfigs={...configs};
  delete resConfigs.adminPwd;
  return resConfigs;
};
