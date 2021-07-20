const mongoose = require('mongoose');

//schema에 없어도 데이터는 가져오지만 조회가 안된다.
const accountSchema = new mongoose.Schema({
  userId: { type: String, require: true, unique: true },
  userName: { type: String, require: true },
  userPwd: { type: String, require: true },
  point: { type: Number },
  favoriteProductId: { type: Array }
}, { collection: "account" });

accountSchema.statics.findAccount = async function (userId, session) {
  var result = null;
  if(session === undefined){
    result = await this.findOne({ userId: userId }).exec();
  }
  else {
    result = await this.findOne({ userId: userId }).session(session).exec();
  }

  const userInfo = {
    userId: result.userId,
    userName: result.userName,
    point: result.point,
    favoriteProductId: result.favoriteProductId
  };

  return userInfo;
}

accountSchema.statics.login = async function (userId, userPwd) {
  try {
    var account = await this.findOne({ userId: userId, userPwd: userPwd }).exec();
    var loginResult = null;

    if (account !== null) {
      loginResult = {
        userId: account.userId,
        userName: account.userName,
        point: account.point,
        favoriteProductId: account.favoriteProductId
      };
    }

    return loginResult;
  }
  catch (err) {
    throw err;
  }
}

accountSchema.statics.changeAccount = async function(userId, changeData, session) {
  try {
    var result = await this.updateOne({userId: userId}, changeData).session(session).exec();
    return result;
  }
  catch(err) {
    throw err;
  }
}

module.exports = mongoose.model('account', accountSchema);