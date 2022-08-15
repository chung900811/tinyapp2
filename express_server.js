const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});