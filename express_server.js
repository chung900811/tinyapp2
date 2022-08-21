const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const findEmail = require("./helpers.js");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, user_id:req.cookies.userid, email:req.cookies.userid};
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user_id:req.cookies.userid,email:req.cookies.userid};
  res.render("urls_register", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
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
  const shortURL = req.params.shortURL
  //this is use to define the :shortURL. ,req.params come from the form action
  //in the form ,the action="/urls/<%= id %>/delete" already give each button its own short url
  delete urlDatabase[shortURL];
  //delete the data which storing in the database so it will disappear
  res.redirect("/urls");
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

if (email === "" || password === "") {
  res.status(400).send("400: Please enter your Email and password.")
  } else if (findEmail(email,users).email === email && findEmail(email,users).password === password) {
    res.cookie ('userid',findEmail(email,users))
    res.redirect("/urls");
  } else {
    res.status(403).send("403: Incorrect email or password");
  }

})

app.post("/logout", (req, res) => {
  res.clearCookie('userid')
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {

  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL};
  //use the generated string as shotURL // set the longURL is what the user entered on the new page
  const shortURL = templateVars.shortURL;
  // give a name for it so is can be use
  urlDatabase[shortURL] = templateVars.longURL; 
  // adding the new data as object to database
  res.redirect(`/urls/${shortURL}`);        
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});


console.log(users)
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user_id:req.cookies.userid,email:req.cookies.userid};
  res.render("urls_show",templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


