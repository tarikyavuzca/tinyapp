const { assert } = require('chai');

const { findUser, usersUrls } = require('../helpers/helper');


const testUsers = {
  "asd": {
    id: "yavuz", 
    email: "yavuz@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "123": {
    id: "qwe", 
    email: "beyza@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUser', function() {
  it('should return a user with valid email', function() {
    const user = findUser("yavuz@example.com", testUsers)
    assert.equal(user, testUsers.asd);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = findUser('ghostperson@example.com', testUsers);
    assert.equal(user, undefined);
  });
});


const testUrls = {
  'ytd': {
    longURL: 'http://www.lighthouselabs.com',
    userID: 'yavuz'
  },
  'bnu': {
    longURL: 'http://www.otazm.com',
    userID: 'beyza'
  },
  'ofd': {
    longURL: 'http://www.uber.com',
    userID: 'omer'
  }
};


describe('#userUrls', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = usersUrls('yavuz', testUrls);
    const expectedResult = {
      'ytd': {
        longURL: 'http://www.lighthouselabs.com',
        userID: 'yavuz'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty obhect for a non-existent user', () => {
    const userUrls = usersUrls('crystal', testUrls);
    assert.deepEqual(userUrls, {});
  });
});