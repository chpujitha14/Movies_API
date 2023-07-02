const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

//accept json data
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get list Players
app.get("/movies/", async (request, response) => {
  const sqlQuery = `SELECT movie_name as movieName FROM movie;`;
  const movieArray = await db.all(sqlQuery);
  response.send(movieArray);
});
//2 API save data
app.post("/movies/", async (request, response) => {
  const requestDetails = request.body;
  const { directorId, movieName, leadActor } = requestDetails;
  const insertQuery = `INSERT into movie(director_id,movie_name,lead_actor) values
   (
       '${directorId}','${movieName}','${leadActor}'
   );`;
  const dbResponse = await db.run(insertQuery);
  response.send("Movie Successfully Added");
});
//3 API Get single value
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const selectQuery = `SELECT movie_id as movieId,director_id as directorId,
  movie_name as movieName,lead_actor as leadActor
   FROM movie where movie_id='${movieId}';`;
  const responseArray = await db.get(selectQuery);
  response.send(responseArray);
});
//4 API update
app.put("/movies/:movieId/", async (request, response) => {
  const requestDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = requestDetails;
  const updateQuery = `update movie set director_id='${directorId}',movie_name='${movieName}'
  ,lead_actor='${leadActor}' where movie_id='${movieId}'`;
  const dbResponse = await db.run(updateQuery);
  response.send("Movie Details Updated");
});
//5 API Delete single value
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie where movie_id='${movieId}';`;
  const teamMates = await db.exec(deleteQuery);
  response.send("Movie Removed");
});

//get list Directors
app.get("/directors/", async (request, response) => {
  const sqlQuery = `SELECT director_id as directorId,director_name as directorName FROM director;`;
  const directorArray = await db.all(sqlQuery);
  response.send(directorArray);
});

//get list Directors
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const sqlQuery = `SELECT movie_name as movieName FROM movie where director_id='${directorId}';`;
  const directorArray = await db.all(sqlQuery);
  response.send(directorArray);
});
module.exports = app;
