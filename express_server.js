const express = require("express");
let cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const findEmail = require("./helpers.js");
//library to help hash passwords
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);
// stores the session data on the client within a cookie
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["terry"],
  maxAge: 24 * 60 * 60 * 1000
}));

// url database of ALL urls
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

// user database of ALL users
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

// genereates random strings
const generateRandomString = function() {
  const p = "abcdefghijklmnopqrstuvwxyz0123456789";
  const startingArray = p.split("");
  let finalArray = [];
  for (let i = 0; i < 6; i++) {
    finalArray.push(startingArray[Math.floor(Math.random() * 36)]);
  }
  return finalArray.join("");
};

//filtered URL database
const filterDatebase = function(id) {
  let newDatabase = {};
  const shortKeys = Object.keys(urlDatabase);
  for (let i = 0; i < shortKeys.length; i++) {
    if (urlDatabase[shortKeys[i]].userID === id) {
      newDatabase[shortKeys[i]] = urlDatabase[shortKeys[i]];
    }
  }
  return newDatabase;
};

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  if (req.session.userid === undefined) {
    res.redirect("/login");
  } else {
    const userDatabase = filterDatebase(req.session.userid.id);
    const templateVars = { urls: userDatabase, user_id:req.session.userid, email:req.session.userid};
    res.render("urls_index", templateVars);
  }
});

//renders new URL page
app.get("/new", (req, res) => {
  if (req.session.userid) {
    const templateVars = { user_id:req.session.userid, email:req.session.userid };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls");
  } else {
    const templateVars = { user_id:req.session.userid,email:req.session.userid };
    res.render("urls_login", templateVars);
  }
});

//renders register page (unless user is already logged in)
app.get("/register", (req, res) => {
  if (req.session.userid) {
    res.redirect("/urls");
  } else {
    const templateVars = { user_id:req.session.userid,email:req.session.userid};
    res.render("urls_register", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

// Adds user to database with hashed password, creates encrypted cookie (login), then redirects to /urls
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();
  const usersData = {
    id: id,
    email: email,
    password: password
  };

  if (email === "" || password === "") {
    res.status(400).send("400: Please enter your Email and password.");
  } else if (findEmail(email,users).email === email) {
    res.status(400).send("400: User is already exist.");
  } else {
    users[id] = usersData;
    req.session.userid = usersData;
    res.redirect("/urls");
  }
});

//DELETE URL: removes a URL resource and redirects back to URLs page
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { user_id: req.session.userid };
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === templateVars.user_id.id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

// Logs in user by creating encrypted cookie, then redirects to /urls
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const findUser = findEmail(email,users);

  if (!findUser.password || !findUser.email) {
    res.status(403).send("403: Incorrect email or password");
  }
  if (bcrypt.compareSync(password, findUser.password) === true) {
    req.session.userid = findUser;
    res.redirect("/urls");
  } else {
    res.status(403).send("403: User does not exist");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL, userID: req.session.userid};
  const shortURL = templateVars.shortURL;
  urlDatabase[shortURL] = { longURL: templateVars.longURL, userID: templateVars.userID.id};

  res.redirect(`/urls/${shortURL}`);
});

//redirects to the actual page when user clicks on short url link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// if URL for the given ID does not exist: returns HTML with a relevant error message
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(401).send("The URL that you are trying to access does not exist");
  } else if (!req.session.userid) {
    return res.status(401).send("You cannot access this page as you are not logged in");
  } else if (req.session.userid.id !== urlDatabase[req.params.id].userID) {
    return res.status(403).send("You cannot acesss a URL that is not yours");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id:req.session.userid,
    email:req.session.userid
  };
  res.render("urls_show", templateVars);
});

app.get("/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL) {
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


