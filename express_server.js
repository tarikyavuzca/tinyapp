const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const {duplicateEmail, generateRandomString, usersUrls, findUser} = require('./helpers/helper')


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
  res.send(`Hello From TinyApp`);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
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

app.get("/urls/new", (req, res) => {
  if(req.session.userID) {  
    let templateVars = {
      user: users[req.session.user_id] 
    };
      res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { 
    urlDatabase,
    userUrls,
    shortURL,
    user: users[userID] 
  };

  if (!urlDatabase[shortURL]) {
    res.status(404);
  } else if (!userID || !userUrls[shortURL]) {
    res.status(401);
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404);
  }
});


app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401);
  }

});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect(`/urls`);
  } else {
    res.status(401);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401);
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = usersUrls(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});

// LOGIN ROUTE

app.get("/login", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
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
    res.status(401);
  }
});

// REGISTER ROUTE

app.get("/register", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
    return;
  };
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {

    if (!findUser(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt)
      };
      req.session.userID = userID;
      res.redirect("/urls");
  } else {
    res.statusCode(400);
  }
} else {
  res.statusCode(400);
}
});


app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie("session.sig");
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});










