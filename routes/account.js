const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');

const manageSession = require('../database/manageSession');
const accountSchema = require('../database/accountSchema');
const accountChangeHistSchema = require('../database/accountChangeHistSchema');
const router = express.Router();

const isNullOrEmpty = (str) => {
  let result = false;
  if (str === undefined || str === null || str === '') {
    result = true;
  }
  return result;
}

const changeAccount = async (userId, changeData, actId, session) => {
  const prevProcessedData = {};
  const prevData = await accountSchema.findAccount(userId, session);

  if (prevData === null) {
    return false;
  }

  //changeData 중 point는 changeData.point += prevData.point로 변경
  //prevData 중 changeData에 있는 key들의 요소만 뽑아냄
  Object.keys(changeData).forEach((key) => {
    if (key === 'point') {
      changeData[key] += prevData[key];
    }
    prevProcessedData[key] = prevData[key];
  });

  //account 도큐먼트 수정
  //accountChangeHist에 하나 추가
  await accountSchema.changeAccount(userId, changeData, session);
  await accountChangeHistSchema.createHist(userId, prevProcessedData, changeData, actId, session);
  return true;
}

router.post('/login', async function (req, res, next) {
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
    else {
      const derivedUserPwd = crypto.pbkdf2Sync(userPwd, 'salt', 100000, 64, 'sha512').toString('hex');
      const loginResult = await accountSchema.login(userId, derivedUserPwd);
      if (loginResult !== null) {
        result.isSuccess = true;
        result.reason = null;
        result.userInfo = loginResult;
      }
      else {
        result.reason = "Please check your ID and password.";
      }
      res.send(result);
    }
  }
  catch (err) {
    result.isSuccess = false;
    result.reason = '고객센터에 문의하세요.';
    result.userInfo = null;
    res.send(result);
  }
});

router.post('/change_point', async function (req, res, next) {
  var session = null;
  var sessionId = 0;

  try {
    var userId = req.body.userId;
    var changeData = req.body.changeData;
    var result = {
      isSuccess: false,
      reason: "고객센터에 문의하세요.",
      afterUserInfo: null,
      sessionId: sessionId
    };

    //Validations
    if (changeData === undefined || changeData === null) {
      result.reason = "변경하려는 값이 입력되지 않았습니다.";
      res.send(result);
      return;
    }

    if (userId === undefined || userId === null || userId === '') {
      result.reason = "변경하려는 값이 입력되지 않았습니다.";
      res.send(result);
      return;
    }

    session = await mongoose.startSession();
    session.startTransaction();
    sessionId = manageSession.getSessionId();
    manageSession.insertSession(sessionId, session);
    //api gateway는 이 세션ID를 받고 성공적으로 끝났다고 판단되면
    //이 sessionId를 commit하라고 다시 명령한다.
    result.sessionId = sessionId;

    var isSuccessChangeAccount = await changeAccount(userId, changeData, "CHARGE_POINT", session);

    if (isSuccessChangeAccount) {
      await session.commitTransaction();
      session.endSession();
      manageSession.deleteSession(sessionId);

      const afterUserInfo = await accountSchema.findAccount(userId);

      result.isSuccess = true;
      result.reason = null;
      result.afterUserInfo = afterUserInfo;
    }
    else {
      if (session !== null && session.inTransaction()) {
        await session.abortTransaction();
        session.endSession();
        manageSession.deleteSession(sessionId);
      }

      result.isSuccess = false;
      result.reason = '해당 계정을 찾지 못했습니다.';
      result.afterUserInfo = null;
    }
    res.send(result);
  }
  catch (err) {
    if (session !== null && session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
      manageSession.deleteSession(sessionId);
    }
    result.isSuccess = false;
    result.reason = "고객센터에 문의하세요.";
    result.afterUserInfo = null;

    res.send(result);
  }
});

router.post('/use_point', async function(req, res, next) {
  
})

module.exports = router;
