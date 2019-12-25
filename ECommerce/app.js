//var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var path = require('path');
var multer = require('multer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bsse0826@iit.du.ac.bd',
    pass: '830516Rh'
  }
});
var posts;

var customerName;  // temporary
var customerId;
var app = express();


/*
app.set('view engine', 'pug');
const expressHbs=require('express-handlebars');
app.engine('hbs',expressHbs({layoutsDir:'views/layouts/',
  defaultLayout:'main-layout',
  extname: 'hbs'
}));
*/
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html')
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ecommerce_web"

});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + '/public'));         //  Declared public directory for loading images on the website
app.use(bodyParser.json());


var storage = multer.diskStorage({
  destination: './public/images/',
  filename: function(req, file, cb) {
    cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage
});

app.get('/', function(request, response) {            // Website starts from here
  connection.query('SELECT * FROM products WHERE status <> "pending"',null,function (err, posts, fields) {
    if (err) throw err;
    //console.log(result);
    response.render('mainPage.html',{posts});
  });
});

app.get('/customerLogin', function(request, response) {         // login page for customer
  var notCorrect = false;
  //response.sendFile(path.join(__dirname + '/login.html'));
  response.render('login.html', {notCorrect});
});

app.post('/auth', function(request, response) {             // authorisation for the customer
  var id = request.body.id;
  customerId = id;
  var password = request.body.password;
  if (id && password) {
    connection.query('SELECT * FROM customers WHERE id = ? AND password = ?', [id, password], function(error, results, fields) {
      //console.log(results);
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.id = id;
        customerName = results[0].name;   // just for fun for now
        //console.log("Answer "+ results[0].name);


        response.redirect('/customerHomepage');
        //response.render('tips.html',{customerName});
      } else {
        var notCorrect = true;
        response.render('login.html', {notCorrect});
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

app.get('/customerHomepage', function(request, response) {          // cutomerhomepafe. Populates the page with pthe products and the name
  connection.query('SELECT * FROM products WHERE customerId <> ? AND status <> "pending"',[customerId],function (err, posts, fields) {
    if (err) throw err;
    //console.log(result);
    response.render('customerHomepage.html',{customerName, posts});
  });
  //console.log(posts);


});

app.get('/contact', function(request, response) {       // redirects to the contact information page
  response.render('contact.html',{customerName});
});

app.get('/addProduct', function(request, response) {      // Redirects to the add product page
  response.render('addProduct.html',{customerName});
});

app.post('/addProduct', upload.single('photo'), function(request, response) {         // adds a product to the database
  //console.log("File is " + request.file.filename);

  var title = request.body.title;
  var price = request.body.price;
  var imageURL = request.file.filename;
  var description = request.body.description;
  var category=request.body.category;
  var status = "pending";

  //var id;
  //  Listen for click
  /*
  First user fills form with information and then connection query to upload all data except imageURL
  Second form to upload picture
   */



  connection.query(
      'INSERT INTO products( title, price, imageURL, description, customerId) VALUES (?,?,?,?,?)',
      [ title, price, imageURL, description, customerId],function (err, result) {
        if (err) throw err;
        console.log("Product inserted");
        //SELECT * FROM `table_name` WHERE id=(SELECT MAX(id) FROM `table_name`);

        connection.query(
            'SELECT * FROM products WHERE id=(SELECT MAX(id) FROM products)',
            null,function (err, result) {
              if (err) throw err;
              var id = result[0].id;
              console.log("Most recent ID:" + id);


              connection.query(
                  'INSERT INTO '+  category +' ( productId, title, price, imageURL, description, customerId) VALUES (?,?,?,?,?,?)',
                  [ id, title, price, imageURL, description, customerId],function (err, result) {
                    if (err) throw err;
                    console.log("Product inserted");
                  });
              // console.log("File is " + request.file.fieldname);
              console.log("Updated into Category table " +id + title + price + imageURL + description);

              response.redirect('/customerHomepage');
            });

            });


  });

//---- these are for the customer PAGE

app.post('/filterShowAllCustomer',function(request,response) {
  connection.query('SELECT * FROM products  ', null,function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  })
});

app.post('/filterApparelCustomer',function(request,response) {

  connection.query('SELECT * FROM apparel' ,  null,function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  });
});


app.post('/filterAcademicCustomer',function(request,response) {

  connection.query('SELECT * FROM academic' ,null,  function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  });
});


app.post('/filterAthleticsCustomer',function(request,response) {

  connection.query('SELECT * FROM athletics ',null , function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  });
});

app.post('/filterOtherCustomer',function(request,response) {

  connection.query('SELECT * FROM other' , null, function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  });

});



//  Sign Up Screen
app.get('/signup', function(request, response) {
  response.render('signup.html');
});


app.post('/signup', function(request, response) {
  var name = request.body.name;
  var email = request.body.email;
  var id = request.body.username;
  var password = request.body.password;

  console.log("id:" + id);
  connection.query(
      'INSERT INTO customers( id, password, email, name) VALUES (?,?,?,?)',
      [id, password, email, name],function (err, result) {
        if (err) throw err;

        console.log("Customer created!");

      });
  response.redirect('/customerLogin');
});



app.post('/remove', function(request, response) {         //customer wants to remove an item from his inventory
  var id = request.body.removeId;
  connection.query(
      'DELETE FROM products WHERE id = ?',
      [id],function (err, result) {
        if (err) throw err;
        console.log("Product deleted");
      }
  );

  //console.log(id + " removed");

  response.redirect('/customerHomepage');
});

app.post('/buy', function(request, response) {      // product requested to buy. Seller will get a notification
  var id = request.body.buyId;
  connection.query(
      'UPDATE products SET sellRequested=1 WHERE id = ?',
      [id],function (err, result) {
        if (err) throw err;
        console.log("Product requested");
      }
  );

  response.redirect('/customerHomepage');
});

app.get('/logout', function(request, response) {        // Logs out the customer
  request.session.loggedin = false;
  response.redirect('/');
});

app.get('/showAllMyProducts', function(request, response) {         // Show All my products from the database

  var id = customerId;        // only prints out the product belong to the user
  //console.log(id);
  connection.query('SELECT * FROM products WHERE customerId = ? ',[id],function (err, posts, fields) {
    if (err) throw err;
    response.render('showAllMyProducts.html',{customerName, posts});
  });
});



app.get('/home', function(request, response) {        // Goes to home
  if (request.session.loggedin) {
    response.send('Welcome back, ' + request.session.password + '!');

  } else {
    response.send('Please login to view this page!');
  }
  response.end();
});

app.post('/emailSeller', (req, res) => {           // emails the seller: contains email address of the buyer and his information
  var pId = req.body.buyId;
  connection.query('SELECT * FROM products WHERE id = ?',[pId],function (err, result, fields) {
    if (err) throw err;
    var id = result[0].customerId;

    connection.query('SELECT email FROM customers WHERE id = ?',[id],function (err, result, fields) {
      if (err) throw err;
      var email = result[0].email;
      console.log("Extracted from database: "+email);
      res.render('sendEmail.html', {customerName, email});
    });

  });


});

app.post('/send-email', function (req, res) {         // send email
 // console.log("Email sent to:" + req.body.to);

  var mailOptions = {
    from: 'bsse0826@iit.du.ac.bd',
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.redirect('/customerHomepage');
  });
});

// Admin functions starts here
// *********************************************************Admin***********************************************************************

// when you press admin login-- come to this function and then redirected to admin login page
app.get('/adminLogin',function(request, response){
  var notCorrect = false;
  //response.sendFile(path.join(__dirname + '/login.html'));
  response.render('adminlogin.html', {notCorrect});
  //response.render('adminlogin.html');
});






app.post('/adminauth', function(request, response) {
  var id = request.body.id;
  customerId = id;
  var password = request.body.password;
  if (id && password) {
    connection.query('SELECT * FROM admincredentials WHERE id = ? AND password = ?', [id, password], function(error, results, fields) {
      console.log(error);
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.id = id;
        customerName = results[0].name;   // just for fun for now
        //console.log("Answer "+ results[0].name);


        response.redirect('/adminHomepage');
      } else {
        var notCorrect = true;
        response.render('adminlogin.html', {notCorrect});
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});



// the href takes you here, then you render the page
app.get('/adminHomepage', function(request, response) {
  connection.query('SELECT * FROM products WHERE status <> "pending"',function (err, posts, fields) {
    if (err) throw err;
    //console.log(result);
    response.render('adminHomepage.html',{posts});
  });
});


// for pending products
app.get('/showPendingProducts', function(request, response) {
  connection.query('SELECT * FROM products WHERE status="pending"',function (err, posts, fields) {
    if (err) throw err;
    //console.log(result);
    response.render('showPendingProduct.html',{customerName, posts});
  });
  //console.log(posts);


});


// .get for remove pending items. called from showPendingProduct.html

app.post('/removependingproduct', function(request, response) {         //customer wants to remove an item from his inventory
  var id = request.body.Id;
  connection.query(
      'DELETE FROM products WHERE id = ?',
      [id],function (err, result) {
        if (err) throw err;
        console.log("Product removed from pending deleted");
      }
  );

  //console.log(id + " removed");

  response.redirect('/showPendingProducts');// redirect takes you back to the get function
});



// admin approving the product to be added
app.post('/approveproduct', function(request, response) {         //customer wants to remove an item from his inventory
  var id = request.body.Id;

  connection.query('UPDATE products SET status="approved" WHERE id = ?',[id],function (err, result, fields) {

    if (err) throw err;
  });

  response.redirect('/showPendingProducts');// redirect takes you back to the get function
});




app.post('/searchMain',function(request,response){

//  let searched=document.getElementById('searchbar');
  var searched=request.body.searchStmt;
  console.log(searched);
  connection.query('SELECT * FROM products where title LIKE ?  AND status = "approved" ', [searched], function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});

app.post('/searchAdmin',function(request,response){

//  let searched=document.getElementById('searchbar');
  var searched=request.body.searchStmt;
  console.log(searched);
  connection.query('SELECT * FROM products where title LIKE ?  AND status = "approved" ', [searched], function(err,posts,fields){

    if(err) throw err;

    response.render('adminHomepage.html',{customerName, posts});
  });
});

app.post('/searchCustomer',function(request,response){

  var searched=request.body.searchStmt;
  console.log(searched);
  connection.query('SELECT * FROM products where title LIKE "%?%"  AND status = "approved" ', [searched], function(err,posts,fields){

    if(err) throw err;

    response.render('customerHomepage.html',{customerName, posts});
  });
});

//////////////////////////////////////////////////////New Addition for main page/////////////////////////////////////////////////////////////////
app.post('/filterShowAll',function(request,response) {
  connection.query('SELECT * FROM products ', function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});

app.post('/filterApparel',function(request,response) {

  connection.query('SELECT * FROM apparel ',  function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});


app.post('/filterAcademic',function(request,response) {

  connection.query('SELECT * FROM academic  WHERE status <> "pending" ',  function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});


app.post('/filterAthletics',function(request,response) {

  connection.query('SELECT * FROM athletics ',  function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});


app.post('/filterOther',function(request,response) {


  connection.query('SELECT * FROM other  ',  function(err,posts,fields){

    if(err) throw err;

    response.render('mainPage.html',{customerName, posts});
  });
});



var port = '3000';
app.set('port', port);
//app.listen(3306);

module.exports = app;


