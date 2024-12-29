const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbStates = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//1 Get all states
app.get("/states/", async (request, response) => {
  const statesQuery = `
    SELECT 
        *
    FROM
        state;`;
  const states = await db.all(statesQuery);
  response.send(states.map((eachState) => convertDbStates(eachState)));
});

//2 Get state on stateId
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `
    SELECT 
        *
    FROM 
        state
    WHERE 
        state_id = ${stateId};`;
  const stateDetails = await db.get(query);
  response.send(convertDbStates(stateDetails));
});

//3 Create a district
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrict = `
    INSERT INTO 
        district(district_id, district_name, state_id, cases, cured, active, deaths)
    VALUES
        (${districtId}, '${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const dbResponse = await db.run(addDistrict);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
});

const convertDbDistrict = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//4 Get district based on districtId
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `
    SELECT 
        *
    FROM
        district
    WHERE 
        district_id = ${districtId};`;
  const queryResponse = await db.get(query);
  response.send(convertDbDistrict(queryResponse));
});

//5 Delete district on districtId
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `
    DELETE FROM
        district
    WHERE
        district_id = ${districtId};`;
  const queryResponse = await db.run(query);
  response.send("District Removed");
});

//6 Update district on districtId
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, active, deaths } = request.body;
  const query = `
    UPDATE
        district
    SET 
        district_name = '${districtName}', state_id = ${stateId},
        cases = ${cases}, cured = ${cured}, active = ${active}, deaths = ${deaths}
    WHERE 
        district_id = ${districtId};`;
  await db.run(query);
  response.send("District Details Updated");
});

//7 Get data based on stateId
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const query = `
    SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active), 
        SUM(deaths)
    FROM 
        district
    WHERE
        state_id = ${stateId};`;
  const queryResponse = await db.get(query);
  response.send({
    totalCases: queryResponse["SUM(cases)"],
    totalCured: queryResponse["SUM(cured)"],
    totalActive: queryResponse["SUM(active)"],
    totalDeaths: queryResponse["SUM(deaths)"],
  });
});

//8 Get state name based on districtId
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
