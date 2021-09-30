// generateRandomString function added to generate userId and short url
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substr(2,6);
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
      console.log(userUrls[shortURL])
    }
  } 
  return userUrls;
};

module.exports = {findUserByEmail, duplicateEmail, createUser, usersUrls, generateRandomString};