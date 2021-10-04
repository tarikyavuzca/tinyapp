// generateRandomString function added to generate userId and short url
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substr(2,6);
  return randomString;
};



// findUserID function accepting email as parameter, created to find the user with the email address in the database
const findUser = function (email, db) {
  for (let user in db) { // looping through the users object
    if(db[user].email === email) { // if the email address matches with the one in db
      return db[user]; // return that user otherwise return false
    }
  }
  return undefined;
};



// usersUrls function accepting id and db as parameters, created to return the object of url related to user id
const usersUrls = function(id ,db) {
  const userUrls = {};
  for (const shortURL in db) {
    if (db[shortURL].userID === id) {
      userUrls[shortURL] = db[shortURL];
    }
  } 
  return userUrls;
};


module.exports = {findUser, usersUrls, generateRandomString};