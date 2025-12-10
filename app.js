const express = require("express");
const mongoose = require("mongoose");

// Local MongoDB connection
const dbURI = "mongodb://localhost:27017/GameLibraryApp";

//create the express app
const app = express();

//instruction with the view engine to be used
app.set("view engine", "ejs");

//game schema to be used for db
const gameSchema = mongoose.Schema(
  {
    title: String,
    yearMade: Number,
    genre: String,
    studio: String,
    country: String,
    launchPrice: Number,
  },
  { timestamps: true }
);

//schema used as model now
const Game = mongoose.model("Game", gameSchema);

//middleware to allow access to static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//route and response

//display all games on the home page
app.get("/", (request, response) => {
  Game.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      response.render("index", { title: "Game Library", games: result });
    })
    .catch((error) => console.log(error));
});

//link to add new game page
app.get("/add", (request, response) => {
  response.render("add", { title: "Add a new game!" });
});

//link to year made graph
app.get("/yearmade", (request, response) => {
  response.render("yearmade", { title: "Sort by Year Made" });
});

//link to genre graph
app.get("/genre", (request, response) => {
  response.render("genre", { title: "Sort by Genre" });
});

//link to studio graph
app.get("/studio", (request, response) => {
  response.render("studio", { title: "Sort by Studio" });
});

//link to country graph
app.get("/country", (request, response) => {
  response.render("country", { title: "Sort by country" });
});

//link to launch price graph
app.get("/launchprice", (request, response) => {
  response.render("launchprice", { title: "Sort by Launch Price" });
});
//insert a test game
//reference @eugene slides
app.get("/new-game", (request, response) => {
  const game = new Game({
    title: "Minecraft",
    yearMade: 2011,
    genre: "Sandbox survival",
    studio: "Mojang",
    country: "Sweden",
    launchPrice: 29.99,
  });
  game
    .save()
    .then((result) => response.send(result))
    .catch((error) => console.log(error));
});

//get all the games as JSON, this is used then to display our charts
app.get("/games", (request, response) => {
  Game.find()
    .then((result) => response.send(result))
    .catch((error) => console.log(error));
});

//route to handle game addition
app.post("/", (request, response) => {
  const game = new Game(request.body);

  game
    .save()
    .then(() => response.redirect("/"))
    .catch((error) => console.log(error));
});

//display single game details -- commented out for debugging - catching everything and 404 will not load
/*app.get("/:id", (request, response) => {
  const id = request.params.id;

  Game.findById(id)
    .then((result) =>
      response.render("game", { game: result, title: "Game details" })
    )
    .catch((error) => console.log(error));
});*/

//delete request handler
app.delete("/:id", (request, response) => {
  const id = request.params.id;

  Game.findByIdAndDelete(id)
    .then(() => {
      response.json({ redirect: "/" });
    })
    .catch((error) => console.log(error));
});

//update handler
//This returns the details from the add.ejs page and stores it back on the database
app.post("/:id", (request, response) => {
  //this stores the id paramter from the URL
  const id = request.params.id;
  //mongoose function does a lot of the heavy lifting here, it finds the object by id in the db and then updates
  Game.findOneAndUpdate({ _id: id }, request.body, { new: true })
    .then((result) => {
      Game.findById(id).then((result) =>
        //after it finds and updates it renders the game.ejs page with the selected game and updated details
        response.render("game", { game: result, title: "Game Details" })
      );
    })
    .catch((error) => console.log(error));
});

//get single game by id
app.get("/game/:id", (request, response) => {
  const id = request.params.id;
  Game.findById(id)
    .then((result) =>
      response.render("game", { game: result, title: "Game details" })
    )
    .catch((error) => console.log(error));
});

//404 page
app.use((request, response) => {
  response.status(404).render("404", { title: "404" });
});

//connect to mongoose and then launch app
mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("Connected to LOCAL MongoDB");
    app.listen(3000);
  })
  .catch((error) => {
    console.log("Local connection error:", error);
  });
