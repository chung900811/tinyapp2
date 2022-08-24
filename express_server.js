const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const findEmail = require("./helpers.js");
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

const filterDatebase = function(id) {
  let newDatabase = {};
  const shortKeys = Object.keys(urlDatabase);
  for (let i = 0; i < shortKeys.length; i++) {
    if (urlDatabase[shortKeys[i]].userID === id) {
      newDatabase[shortKeys[i]] = urlDatabase[shortKeys[i]];
    }
  }
  return newDatabase;
}

app.get("/", (req, res) => {
  res.redirect("/login")
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(urlDatabase)
  if (!req.cookies.userid) {
    res.redirect("/login")
  } else {
    console.log("ID"+req.cookies.userid.id)
    console.log(filterDatebase(req.cookies.userid.id))
    const userDatabase = filterDatebase(req.cookies.userid.id)
    const templateVars = { urls: userDatabase, user_id:req.cookies.userid, email:req.cookies.userid};
    res.render("urls_index", templateVars)};
  });

app.get("/new", (req, res) => {
  if (req.cookies.userid) {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid }
  res.render("urls_new", templateVars)
} else {
  res.redirect("/login")
}
});

app.get("/login", (req, res) => {
  if (req.cookies.userid) {
    res.redirect("/urls")
  } else {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid };
  res.render("urls_login", templateVars);}
});

app.get("/register", (req, res) => {
  if (req.cookies.userid) {
    res.redirect("/urls")
  } else {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid};
  res.render("urls_register", templateVars)}
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("eafffffffffffffffffffff")
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  console.log(urlDatabase)
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString()
  const usersData = {
    id: id,
    email: email,
    password: password
  }

if (email === "" || password === "") {
  res.status(400).send("400: Please enter your Email and password.")
  } else if (findEmail(email,users).email === email) {
   res.status(400).send("400: User is already exist.");
  } else {
    users[id] = usersData
    res.cookie('userid', usersData )
    res.redirect("/urls");
    console.log(findEmail(email,users))
  }
  })


app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { user_id: req.cookies.userid };
  const shortURL = req.params.shortURL
  console.log("111111: "+urlDatabase[shortURL].userID)
  console.log("222222: "+templateVars.user_id.id)
  if (urlDatabase[shortURL].userID === templateVars.user_id.id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const findUser = findEmail(email,users)

if (!findUser.password||!findUser.email) {
  res.status(403).send("403: Incorrect email or password");
}
if (bcrypt.compareSync(password, findUser.password) === true) {
    res.cookie ('userid',findEmail(email,users))
    res.redirect("/urls");
} else {
  res.status(403).send("403: User does not exist");
}
})

app.post("/logout", (req, res) => {
  res.clearCookie('userid')
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {

  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL, userID: req.cookies.userid};
  const shortURL = templateVars.shortURL;
  urlDatabase[shortURL] = { longURL: templateVars.longURL, userID: templateVars.userID.id}; 

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});

console.log(users)
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL, 
    user_id:req.cookies.userid, 
    email:req.cookies.userid
  };
  if (templateVars.user_id !== undefined && templateVars.user_id.id === urlDatabase[req.params.id].userID) {
    console.log(templateVars.user_id.id)
    console.log(urlDatabase[req.params.id])
    console.log(urlDatabase[req.params.id].userID)
  res.render("urls_show",templateVars)
} else {
  console.log("sfwfwefwe")
  res.redirect("/login")
}
});

app.get("/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL){
  res.redirect("/urls");
}});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


