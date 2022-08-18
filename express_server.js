const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
    res.cookie('name', req.body.username )
    const templateVars = { urls: urlDatabase, username: req.cookies.username };
    res.render("urls_index",templateVars);
  });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  //this is use to define the :shortURL. ,req.params come from the form action
  //in the form ,the action="/urls/<%= id %>/delete" already give each button its own short url
  delete urlDatabase[shortURL];
  //delete the data which storing in the database so it will disappear
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username )
  console.log('Cookies: ', req.cookies)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
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

app.get("/urls/:id", (req, res) => {
  res.cookie('username', req.body.username )
    //the edit button also res this page 
      //in the form ,the action="/urls/<%= id %>" already give each button its own short url
const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username };
res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});