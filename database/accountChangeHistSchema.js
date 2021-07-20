const mongoose = require('mongoose');

const accountChangeHistSchema = new mongoose.Schema({
  userId: {type: String, require: true},
  actId: {type: String, require: true},
  prevData: {type: Object, require: true},
  changeData: {type: Object, require: true},
  changeDate: {type: Date, require: true}
}, { collection: "accountChangeHist", versionKey: false});

accountChangeHistSchema.statics.createHist = function(userId, prevData, changeData, actId, session) {
  return this.create([{
    userId: userId,
    actId: actId,
    prevData: prevData,
    changeData: changeData,
    changeDate: new Date()
  }], { session });
}

module.exports = mongoose.model('accountChangeHist', accountChangeHistSchema);