const express = require('express');
const crypto = require('crypto');
const util = require('util');

const accountSchema = require('../database/account-schema');
const router = express.Router();

const isNullOrEmpty = (str) => {
  let result = false;
  if(str === undefined || str === null || str === ''){
    result = true;
  }
  return result;
}

router.post('/login', async function(req, res, next) {
  try {
    const userId = req.body.userId;
    const userPwd = req.body.userPwd;
    var result = {
      isSuccess: false,
      reason: "Please contact the customer service center.",
      userInfo: null
    };

    if (isNullOrEmpty(userId) || isNullOrEmpty(userPwd)) {
      result.reason = "Please enter your ID and password.";
      res.send(result);
    }
    else{
      const derivedUserPwd = crypto.pbkdf2Sync(userPwd, 'salt', 100000, 64, 'sha512').toString('hex');
      const loginResult = await accountSchema.login(userId, derivedUserPwd.toString('hex'));
      console.log(derivedUserPwd.toString('hex'));
      if(loginResult !== null){
        result.isSuccess = true;
        result.reason = null;
        result.userInfo = {
          userId: loginResult.userId,
          userName: loginResult.userName,
          point: loginResult.point,
          favoriteProductId: loginResult.favoriteProductId
        };
      }
      else{
        result.reason = "Please check your ID and password.";
      }
      res.send(result);
    }
  }
  catch(err) {
    result.isSuccess = false;
    result.reason = '고객센터에 문의하세요.';
    result.userInfo = null;
    res.send(result);
  }
});

module.exports = router;
