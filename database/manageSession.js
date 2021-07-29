const mongoose = require('mongoose');

const manageSession = {
  currSessionId: 1,
  sessions: [],
  /**
   * 
   * @param {number} sessionId 
   * @param { import('mongoose').ClientSession } session 
   */
  insertSession: function(sessionId, session) {
    this.sessions.push({sessionId: sessionId, session: session})
  },
  /**
   * 
   * @param { number } sessionId 
   * @returns { import('mongoose').ClientSession }
   */
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
  /**
   * 
   * @returns { number }
   */
  getSessionId: function() {
    var prevSessionId = this.currSessionId;
    this.currSessionId += 1;
    return prevSessionId;
  },
  /**
   * 
   * @param { number } sessionId 
   */
  deleteSession: function(sessionId){
    const targetIndex = this.sessions.findIndex((item) => { return item.sessionId === sessionId});
    if(targetIndex > -1){
      this.sessions.splice(targetIndex, 1);
    }
  },
  /**
   * 
   * @returns { import('mongoose').ClientSession[] }
   */
  showSessions: function() {
    return this.sessions;
  }
}

module.exports = manageSession;