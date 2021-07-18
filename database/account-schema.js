const mongoose = require('mongoose');

//schema에 없어도 데이터는 가져오지만 조회가 안된다.
const accountSchema = new mongoose.Schema({
  userId: {type: String, require: true, unique: true},
  userName: {type: String, require: true},
  userPwd: {type: String, require: true},
  point: {type: Number},
  favoriteProductId: {type: Array}
}, { collection: "account" });

accountSchema.statics.findAccount = async function(userId) {
  var result = await this.findOne({ userId: userId }).exec();
  return result;
}

accountSchema.statics.login = async function(userId, userPwd) {
  var result = await this.findOne({ userId: userId, userPwd: userPwd }).exec();
  return result;
}

module.exports = mongoose.model('account', accountSchema);