const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');

const accountSchema = require('../database/accountSchema');
const accountChangeHistSchema = require('../database/accountChangeHistSchema');
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
      const loginResult = await accountSchema.login(userId, derivedUserPwd);
      if(loginResult !== null){
        result.isSuccess = true;
        result.reason = null;
        result.userInfo = loginResult;
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

router.post('/changeAccount', async function(req, res, next) {
  var session = null;

  try {
    var userId = req.body.userId;
    var changeData = req.body.changeData;
    var result = {
      isSuccess: false,
      reason: "고객센터에 문의하세요.",
      afterUserInfo: null
    };

    if (changeData === undefined || changeData === null) {
      result.reason = "변경하려는 값이 입력되지 않았습니다.";
      res.send(result);
    }
    else {
      if (userId === undefined || userId === null) {
        result.reason = "변경하려는 값이 입력되지 않았습니다.";
        res.send(result);
      }
      else {
        session = await mongoose.startSession();
        session.startTransaction();

        const prevProcessedData = {};
        const prevData = await accountSchema.findAccount(userId, session);

        //changeData 중 point는 changeData.point += prevData.point로 변경
        //prevData 중 changeData에 있는 key들의 요소만 뽑아냄
        Object.keys(changeData).forEach((key) => {
          if(key === 'point'){
            changeData[key] += prevData[key];
          }
          prevProcessedData[key] = prevData[key];
        });

        //account 도큐먼트 수정
        //accountChangeHist에 하나 추가
        await accountSchema.changeAccount(userId, changeData, session);
        await accountChangeHistSchema.createHist(userId, prevProcessedData, changeData, "CHANGE_VALUE", session);

        await session.commitTransaction();
        session.endSession();

        const afterUserInfo = await accountSchema.findAccount(userId);
        
        result.isSuccess = true;
        result.reason = null;
        result.afterUserInfo = afterUserInfo;
        console.log(afterUserInfo)

        res.send(result);
      }
    }
  }
  catch (err) {
    if(session != null){
      await session.abortTransaction();
      session.endSession();
    }
    res.send(result);
  }
})

module.exports = router;
