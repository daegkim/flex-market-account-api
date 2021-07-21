const mongoose = require('mongoose');

const manageSession = {
  currSessionId: 1,
  sessions: [],
  insertSession: function(sessionId, session) {
    this.sessions.push({sessionId: sessionId, session: session})
  },
  getSession: function(sessionId) {
    var result = null;
    for(var value of this.sessions){
      if(value.sessionId === sessionId){
        result = value.session;
        break;
      }
    }
    return result;
  },
  getSessionId: function() {
    var prevSessionId = this.currSessionId;
    this.currSessionId += 1;
    return prevSessionId;
  },
  deleteSession: function(sessionId){
    const targetIndex = this.sessions.findIndex((item) => { return item.sessionId === sessionId});
    if(targetIndex > -1){
      this.sessions.splice(targetIndex, 1);
    }
  },
  showSessions: function() {
    return this.sessions;
  }
}

module.exports = manageSession;