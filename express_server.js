const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const { filterDatebase , findEmail , generateRandomString }  = require('./helpers');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//library to help hash passwords
const bcrypt = require('bcryptjs');

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
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//     ROUTE
app.get('/', (req, res) => {
  res.redirect('/urls');
});

//renders URLs page with list of all the URLs currently in the database
app.get('/urls', (req, res) => {
  const user_id = users[req.session.user_id];
  const checkDb = filterDatebase(req.session.user_id, urlDatabase);
  const templateVars = { urls: checkDb, user_id: user_id };
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  res.render('urls_index', templateVars);
});

//renders new URL page
app.get('/urls/new', (req, res) => {
  const user_id = users[req.session.user_id];
  const templateVars = { user_id: user_id };
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  res.render('urls_new', templateVars);
});

// Logs in user by creating encrypted cookie, then redirects to /urls
app.get('/login', (req, res) => {
  const user_id = users[req.session.user_id];
  if (!user_id) {
    const templateVars = { urls: urlDatabase, user_id: user_id };
    res.render('urls_login', templateVars);
    return;
  }
  res.redirect('/urls');
});

//renders register page (unless user is already logged in)
app.get('/register', (req, res) => {
  const user_id = users[req.session.user_id];
  if (!user_id) {
    const templateVars = { urls: urlDatabase, user_id: user_id };
    res.render('urls_register', templateVars);
    return;
  }
  res.redirect('/urls');
});
// Adds user to database with hashed password, creates encrypted cookie (login), then redirects to /urls
app.post('/register', (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Please enter your Email and password.");
  }
  if (findEmail(req.body.email, users)) {
    res.status(400).send("400: User is already exist.");
    return;
  }
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post('/urls', (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(403).send('403 Forbidden');
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL:req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  if (!findEmail(email, users)) {
    res.status(403).send("403: User does not exist");
    return;
  }
  const findUser  = findEmail(email, users);
  const password = req.body.password;
  const hashPass = users[findUser].password;
  if (!bcrypt.compareSync(password, hashPass)) {
    res.status(403).send("403: Incorrect password");
    return;
  }
  req.session.user_id = findUser;
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// Delete database entry
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }
  res.status(403).send("You cannot acesss a URL that is not yours");
});

// Renders Edit Page GET & Edit POST
app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("The URL that you are trying to access does not exist");
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send("You cannot acesss a URL that is not yours");
    return;
  }
  const user_id = users[req.session.user_id];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: user_id };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
    return;
  }
  res.status(403).send("You cannot acesss a URL that is not yours");
});

// if URL for the given ID does not exist: returns HTML with a relevant error message
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(401).send('The URL that you are trying to access does not exist');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Redirect non-useful GET routes to login
app.get("/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL) {
    res.redirect("/urls");
  }
});

// PORT LISTENER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});