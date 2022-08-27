const findEmail = function(email,dataBase) {
  let emailData = {};
  for (let keys in dataBase) {
    if (dataBase[keys].email === email) {
      emailData = dataBase[keys];
    }
  } return emailData;
};

module.exports = findEmail;
