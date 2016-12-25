const mongoose = require( 'mongoose' );

const dbURI = 'mongodb://127.0.0.1:12345/test';

const connection = mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
     console.log('Mongoose connected to ' + dbURI +' at ' + Date());
});
mongoose.connection.on('error',function (err) {
      console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
      console.log('Mongoose disconnected');
});
process.on('SIGINT', function() {
      mongoose.connection.close(function () {
          console.log('Mongoose disconnected through app termination');
          process.exit(0);
       });
});

module.exports = mongoose;
