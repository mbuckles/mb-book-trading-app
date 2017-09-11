const User = require('./models/user');
const Book = require('./models/book');
const Trade = require('./models/trade');
const mongoose = require('mongoose');
var configDB = require('../config/database.js');
const assert = require('assert');
module.exports = function(app, passport){
  //routes
  // render the main index page
  app.get('/', function(req, res) {
    res.render('pages/index');
  });
//login route
  app.get('/login', function(req, res){
  		res.render('pages/login.ejs', { message: req.flash('loginMessage') });
  	  });
app.post('/login', passport.authenticate('local-login', {
  		successRedirect: '/myBooks',
  		failureRedirect: '/login',
  		failureFlash: true
  	  }));
//logout
app.get('/logout', function(req, res){
      		req.logout();
      		res.redirect('/');
      	});
// show the signup form
app.get('/signup', function(req, res) {
         res.render('pages/signup.ejs', { message: 'Get signed up!' });
     });

app.post('/signup',  passport.authenticate('local-signup', {
      successRedirect: '/myBooks',
      failureRedirect: '/signup',
      failureFlash: true
    }),function(req, res){
      console.log(req.body.city);
      console.log(req.body.state);
    });

//profile page
app.get('/profile', isLoggedIn, function(req, res){
		res.render('pages/profile.ejs', { user: req.user });
	});

app.get('/user', isLoggedIn, function(req, res){
    var user = req.user;
    console.log(user);
    //res.json(user);
  	res.render('pages/user.ejs', { message: 'Update location!' , user: req.user });
  	});


app.post('/user', isLoggedIn, function(req, res){
   var user = req.body;
   var id = req.user._id;
   console.log(id);
    User.findOne({_id: id}, function(err, user){
    var newUser = user;
    console.log(user);
      user.local.username = req.body.email;
      user.local.city = req.body.city;
      user.state = req.body.state;

      user.save(function(err){
        if(err)
          throw err;
          console.log(user);
          res.render('pages/profile.ejs', { user: req.user  });
      })
    })
  	});

app.post('/location', isLoggedIn, function(req, res){
  var user = req.user;
  var id = req.user.id;
  //console.log(user.local);
  console.log(id);
  User.update({_id: id}), function(err, user){
    if(err){
      console.log(err);
      res.send(err);
    } else{
        if (!user) {
          res.send(404);
        } else{
          console.log(user);
          //res.render('pages/profile.ejs', { user: req.user });
            res.json(user);
          }
        }
  	}});


//facebook login
app.get('/auth/facebook',  passport.authenticate('facebook', { scope: [ 'email' ] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/myBooks',
                                      failureRedirect: '/' }));
//google login
app.get('/auth/google',  passport.authenticate('google', { scope: [ 'profile', 'email' ] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect:'/myBooks',
                                    failureRedirect: '/'
                        }));

app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

app.get('/connect/local', function(req, res){
	res.render('pages/connect-local.ejs', { message: req.flash('signupMessage')});
});

app.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect: '/profile',
	failureRedirect: '/connect/local',
	failureFlash: true
}));

app.get('/unlink/facebook', function(req, res){
		var user = req.user;

		user.facebook.token = null;

		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		})
	});

	app.get('/unlink/local', function(req, res){
		var user = req.user;
    var city = req.city;
    var state = req.state;
    console.log(city);

		user.local.username = null;
		user.local.password = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		});

	});

	app.get('/unlink/google', function(req, res){
		var user = req.user;
		user.google.token = null;
		user.save(function(err){
			if(err)
				throw err;
			res.redirect('/profile');
		});
	});
//render the add book page
  app.get('/addBook', isLoggedIn, function(request, response) {
    console.log(request.user);
  	response.render('pages/addBook', {user: request.user});
  });

  // render the my trades page
  app.get('/myTrades', function(request, response) {
    //console.log(request.user);
    //console.log(request.book);
     response.render('pages/myTrades', { user : request.user, books: request.books});
  });

  app.post('/getMyTrades', function(request, response) {
    console.log('my trades page!');
    //console.log(request.user);
    Trade.find({})
    .exec(function(err, trades){
      if (err){
        response.send('error has occured!');
      } else {
        //console.log(trades);
        response.json({user : request.user, "trades": trades});
      }
    })
  });

  app.post('/getRequestedTrades', function(request, response) {
    //console.log(request.user);
    Trade.find({})
    .exec(function(err, trades){
      if (err){
        response.send('error has occured!');
      } else {
      //  console.log(trades);
        response.json({user : request.user, "trades": trades});
      }
    })
  });

  // add book to database
  app.post('/addBook', function(request, response){
    var result = request.body;
    //console.log(request.user);
    var book = [{
      name: result.name,
      image: result.image,
      url: result.url,
      userGoogle: request.user.google,
      userFacebook: request.user.facebook
    }];
    var prettyJson = JSON.stringify(book, null, 4);
    console.log(prettyJson);
    console.log('I received a POST call');
        Book.create(book).then(function(book){
          });
          var book = new Book(book);
        response.redirect('/profile');
      });
  // add trade to database
  app.post('/addTrade', function(request, response){
    var result = request.body;
    var id = result.bookid;
    var trade = [{
      name: result.name,
      image: result.image,
      url: result.url,
      userGoogle: request.user.google,
      userFacebook: request.user.facebook
    }];
    Trade.create(trade).then(function(trade){
      var trade = new Trade(trade);
          response.send({"data":"Added Trade"});
      }, request.body.image, request.body.bookid, request.body.targetUser, request.body.user, request.body.name );
      console.log('I added a book to trade!');
      //console.log(result.bookid);
    Book.findOneAndRemove({ _id: id }, function(err, book){
        if (err) {
          response.send('error deleting');
        } else {
          console.log('book deleted');
          book.remove();
          response.send(book);
          //response.redirect('/allBooks');
          }
      });
    });

  // update trade status
  app.get('/acceptrade', function(request, response){
    var id = request.query.id;
    var user = request.user;
    console.log(id);

    Trade.findByIdAndUpdate(id, { $set: { userGoogle: user.google }}, { new: true }, function (err, trade) {
      if (err) return handleError(err);
      console.log('trade made, you own it');
      response.redirect('/myTrades');
      });
  });
  // render the settings page
  app.get('/myInfo',isLoggedIn, function(request, response) {
    var user = request.user;
      response.render('pages/settings', {user: user});
  });

app.post('/updateInfo', isLoggedIn, function(request, response) {
  var user = request.user;
  var result = request.body;
  	//request.user.getCustomData(function(err, data) {
    /*  data.city = request.body.city;
      data.state = request.body.state;
      data.save(function() {
        request.user.givenName = request.body.firstname;
        request.user.surname = request.body.lastname;
        request.user.save();
        response.redirect("/myInfo?updated=true");
      //});
    });*/
  });

  // render the my books page
  app.get('/myBooks',isLoggedIn, function(request, response) {
    console.log('myBooks page!');
    Book.find({})
    .exec(function(err,books){
      if(err){
      response.send('error has occured');
    } else {
      //console.log(books);
      response.render('pages/myBooks', { user : request.user, books: books });
    }
  })
  });
// render the my books page
app.get('/allBooks',isLoggedIn, function(request, response) {
  console.log('allBooks page!');
  Book.find({})
  .exec(function(err,books){
    if(err){
    res.send('error has occured');
  } else {
    response.render('pages/allBooks', { user : request.user, books: books });
    console.log(books);
  }
})
});

  // get all of the books in the database
  app.get('/getBooks', function(req, res){
    console.log('getBooks page!');
    Book.find({})
    .exec(function(err,books){
      if(err){
      res.send('error has occured');
    } else {
      console.log(books);
      res.json(books);
    }
  })
});
    /*findBooks(function(books) {
          res.json({"books":books});
      });*/
  // get a single book in the database
  app.get('/getBook', function(req, res){
    var bookID = req.param('bookid');
    mongoose.connect(configDB.url, function(err, db) {
      assert.equal(null, err);
      findBook(db, function(book) {
          db.close();
          res.json({"book":book});
      }, bookID);
    });
  });
  //add Trade to books
  app.get('/moveTrade', function(req, res){
    var id = req.query.id;
    Trade.findOne({ _id: id }, function(err, trade){
      if (err) {
        res.send('error swapping');
      } else {
       var book = [{
         name: trade.name,
         image: trade.image,
         url: trade.url,
         userGoogle: trade.userGoogle,
         userFacebook: trade.userFacebook
       }];
       console.log(book);
       Book.create(book).then(function(book){
         });
         var book = new Book(book);
         trade.remove();
       res.redirect('/myTrades');
     }
     });
   });

  // delete trade
 app.get('/deleteTrade', function(req, res){
      var id = req.query.id;
      console.log(req.query.id);
      Trade.findOneAndRemove({ _id: id }, function(err, trade){
        if (err) {
          res.send('error deleting');
        } else {
          console.log('Trade deleted');
          res.redirect("/myTrades");
        }
      })
    });
  // delete book
  app.get('/deleteBook', function(req, res){
      var id = req.query.id;
      console.log(req.query.id);
      Book.findOneAndRemove({ _id: id }, function(err, book){
        if (err) {
          res.send('error deleting');
        } else {
          console.log('book deleted');
          res.redirect("/myBooks");
        }
      })
    });

      /*mongoose.connect(configDB.url, function(err, db) {
        assert.equal(null, err);
        deleteBooks(db, function() {
            db.close();
            res.redirect("/myBooks");
        }, id);
  });*/

  // delete trade
  app.get('/deleteTrade', function(req, res){
      var id = req.query.id;
      mongoose.connect(configDB.url, function(err, db) {
        assert.equal(null, err);
        deleteTrades(db, function() {
            db.close();
            res.redirect("/myTrades");
        }, id);
      });
  });



  // query the database to pull all of the books
  var findBooks = function(db, callback) {
    var books = [];
    var cursor =db.collection('Books').find( );
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        books.push(doc);
      } else {
        callback(books);
      }
    });
  };

  // query the database to pull a single book from the database
  var findBook = function(db, callback, bookid) {
    var books = [];
    var obj_id = new ObjectId(bookid);
    var cursor = db.collection('Books').findOne({"_id":obj_id}, function(err, doc){
      callback(doc);
    });
  };

  // query the database to pull all of the books for an user
  var findUserBooks = function(db, callback, username) {
    var book = [];
    var cursor = Book.find( { "name": name } );
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         books.push(doc);
      } else {
         callback(books);
      }
    });
  };

  // query the database to pull trades for this username
  var findUserTrades = function(db, callback, username) {
    var trades = [];
    var cursor = db.collection('Trades').find( { "user": username } );
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         trades.push(doc);
      } else {
         callback(trades);
      }
    });
  };

  var findRequestedTrades = function(db, callback, username) {
    var trades = [];
    var cursor = db.collection('Trades').find( { "targetUser": username } );
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         trades.push(doc);
      } else {
         callback(trades);
      }
    });
  };

  // insert a book into the book database
  var insertDocument = function(db, callback, image, name, url, username) {
    console.log(username);
     db.collection('Books').insertOne( {
       "user" : username,
       "url" : url,
       "name" : name,
       "image" : image
     }, function(err, result) {
      assert.equal(err, null);
      callback();
    });
  };

  // insert a trade into the trade database
  var insertDocument2 = function(db, callback, image, bookid, targetUser, username) {
    console.log(username);
     db.collection('Trades').insertOne( {
       "user" : username,
       "status" : "pending",
       "book" : bookid,
       "targetUser" : targetUser,
       "image" : image
     }, function(err, result) {
      assert.equal(err, null);
      callback();
    });
  };

  // delete a book from the database
  var deleteBooks = function(db, callback, id) {
     db.collection('Books').deleteMany(
        {_id: new ObjectId(id)},
        function(err, results) {
           //console.log(results);
           callback();
        }
     );
  };

  // delete a trade from the database
  var deleteTrades = function(db, callback, id) {
     db.collection('Trades').deleteMany(
        {_id: new ObjectId(id)},
        function(err, results) {
           //console.log(results);
           callback();
        }
     );
  };

  // update the record
  var updateStatus = function(db, callback, id, status) {
     db.collection('Trades').updateOne(
        {_id: new ObjectId(id)},
        {
          $set: {"status" : status}
        }, {upsert:true}, function(err, results) {
        //console.log(results);
        callback();
     });
  };
};
//If logged in
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
};
