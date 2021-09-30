const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const app = express();

const PORT = 8080; 

// generateRandomString function added to generate userId and short url
const generateRandomString = function() {
  let randomString = "";
  randomString = Math.random().toString(36).substr(2,6);
  return randomString;
};

const createUser = function (email, password, users) {
  const userId = generateRandomString();

  users[userId] = {
    id: userId,
    email,
    password
  };
  return userId;
};

// duplicateEmail function accepting email argument as parameter, created to maku sure that the user type email address that not in use.
const duplicateEmail = function(email) {
  for (let user in users) { //looping through the users object
    if (users[user].email === email) { // if the email that user type is in the database
      return users[user].id; // return that email otherwise return false
    }
  }
  return false;
};

// findUserByEmail function accepting email as parameter, created to find the user with the email address in the database
const findUserByEmail = function (email) {
  for (let id in users) { // looping through the users object
    const user = users[id]; // creating user variable and assign it to usersid
    if(email === user.email) { // if the email address matches with the one in db
      return user; // return that user otherwise return false
    }
  }
  return false;
};

// const authenticateUser = function (email, password, users) {
//   const userFound = findUserByEmail(email, users);

//   if (userFound && userFound.password === password) {
//     return userFound;
//   };
//   return false;
// };

const usersUrls = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  } 
  return userUrls;
};


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "id001", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};


app.get("/", (req, res) => {
  res.send(`Hello From TinyApp`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: usersUrls(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if(!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]] };
      res.render("urls_new", templateVars);
    }
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urlUserID: urlDatabase[req.params.shortURL].userID,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  } else {  
    res.redirect(longURL);
  }
});


app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = usersUrls(userID);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = usersUrls(userID);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  if (!duplicateEmail(email)) {
    res.send(403, "This email address is not in use, please first register with this email address");
  } else {
      const userID = duplicateEmail(email);
      if (users[userID].password !== password) {
      res.send(403, "Password does not match with the associated email address");
      } else {
      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.post("/register", (req, res) => {
  // const userId = req.body.userId;
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    res.send(400, "Please enter an email and password");
  }else if (duplicateEmail(email)) {
    res.send(400, "This email is in use");
  } else {
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email,
    password
  };
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});










