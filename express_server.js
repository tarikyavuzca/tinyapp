const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');


const {generateRandomString, usersUrls, findUser} = require('./helpers/helper')


app.set("view engine", "ejs");

var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "session",
  keys: ['Some way to enctype the values', '$!~`yEs123bla!!%'],
}));

const urlDatabase = {};
const users = {};


// Routes

app.get("/", (req, res) => {
  if (req.session.userID) {
    res.render(`/urls`);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = usersUrls(userID, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: users[userID] 
  };
  if (!userID) {
    res.statusCode = 401;
  }  
  res.render('urls_index', templateVars);
});





app.post('/urls', (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const errorMessage = 'Please log in to proceed!!!';
    res.status(401).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    const templateVars = {
      user: users[req.session.userID]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const userID = req.session.userID;
  const userUrls = usersUrls(userID, urlDatabase);
  const templateVars = { 
    urlDatabase,
    longURL,
    userUrls,
    shortURL,
    user: users[userID] 
  };

  if (!urlDatabase[shortURL]) {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_er', {user: users[userID], errorMessage});
  } else if (!userID || !userUrls[shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(401).render('urls_er', {user: users[userID], errorMessage});
  } else {
    res.render('urls_show', templateVars)
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  if (userID  && userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});





// LOGOUT Route

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie("session.sig");
  res.redirect('/urls');
});


// LOGIN ROUTE

app.get("/login", (req, res) => {
  const templateVars = {
    email: users[req.session.email],
    user: users[req.session.userID]
  };
  res.render('urls_login', templateVars);
});


app.post("/login", (req, res) => {
  

  const user = findUser(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.userID;
    res.redirect('/urls');
  } else {
    const errorMessage = 'Login credentials are wrong, please check again!!!';
    res.status(401).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});

// REGISTER ROUTE

app.get("/register", (req, res) => {
  // if (!req.session.userID) {
  //   res.redirect("/urls");
  //   return;
  // };
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render("urls_registration", templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {

    if (!findUser(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = userID;
      res.redirect('/urls');
    } else {
      const errorMessage = 'This email address is already in use!!!';
      res.status(400).render('urls_er', {user: users[req.session.userID], errorMessage});
    }

  } else {
    const errorMessage = 'Please fill email and password fields!!!';
    res.status(400).render('urls_er', {user: users[req.session.userID], errorMessage});
  }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});










