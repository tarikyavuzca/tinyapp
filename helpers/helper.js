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
const duplicateEmail = function(email ,db) {
  for (let user in db) { //looping through the users object
    if (db[user].email === email) { // if the email that user type is in the database
      return db[user].id; // return that email otherwise return false
    }
  }
  return false;
};

// findUserID function accepting email as parameter, created to find the user with the email address in the database
const findUserID = function (email, db) {
  for (let id in db) { // looping through the users object
    const user = db[id]; // creating user variable and assign it to usersid
    if(db[id].email === email) { // if the email address matches with the one in db
      return db[id].id; // return that user otherwise return false
    }
  }
  return false;
};

const authenticateUser = (userDB, email, password) => {
	if (userDB[email]) {
		// if (userDB[email].password === password) {
		if (bcrypt.compareSync(password, userDB[email].password)) {
			// Email & password match
			return { user: userDB[email], error: null };
		}
		// Bad password
		return { user: null, error: "bad password" };
	}
	// Bad email
	return { user: null, error: "bad email" };
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

module.exports = {findUserID, duplicateEmail, createUser, usersUrls, generateRandomString, authenticateUser};