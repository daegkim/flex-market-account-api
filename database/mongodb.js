const mongoose = require('mongoose');

const connectDB = function() {
  mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
  mongoose.connection.on('error', () => { console.log('db connection error'); } );
  mongoose.connection.once('open', () => { console.log('db connect') });
}