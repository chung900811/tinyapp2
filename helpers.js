const filterDatebase  = (cookieId, database) => {
  let newDatabase = {};
  for (const short in database) {
    if (database[short].userID === cookieId) {
      newDatabase[short] = database[short];
    }
  }
  
  return newDatabase;
};

const findEmail  = (email, dataBase) => {
  for (const i in dataBase) {
    if (dataBase[i].email === email) {
      return dataBase[i].id;
    }
  }
  
  return false;
};

const generateRandomString = function() {
  const p = "abcdefghijklmnopqrstuvwxyz0123456789";
  const startingArray = p.split("");
  let finalArray = [];
  for (let i = 0; i < 6; i++) {
    finalArray.push(startingArray[Math.floor(Math.random() * 36)]);
  }
  return finalArray.join("");
};


// EXPORT MODULE
module.exports = {
  filterDatebase ,
  findEmail,
  generateRandomString
};