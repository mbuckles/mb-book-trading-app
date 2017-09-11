var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TradeSchema = new Schema({
    value: String,
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
    name: String,
    image: String,
    url: String
});
var Trade = mongoose.model('Trade', TradeSchema);
module.exports = Trade;
