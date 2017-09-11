var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
     userGoogle:  {
       id: String,
       token: String,
       name: String,
       email: String
     },
     userFacebook:  {
       id: String,
       token: String,
       name: String,
       email: String
     },
    user: {
      type: Schema.ObjectId,
      ref: 'user'
    },
    name: String,
    image: String,
    url: String,
    traderequest: String,
    traderequested: String
});
var Book = mongoose.model('Book', BookSchema);
module.exports = Book;
