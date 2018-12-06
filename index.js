require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");
const bodyParser = require("body-parser");
const CookieParser = require("cookie-parser");
const db = require("./db");
const errorHandler = require("./middleware/error");
const log = require("./middleware/log");
const apiRoutes = require("./routes/api");
const pagesRoutes = require("./routes/pages");
const app = express();

app.set("view engine", "ejs");
app.use(CookieParser());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Log every request.
app.use(log);
app.use("/", pagesRoutes);
app.use("/api/", apiRoutes);

// Handler for any undefined routes.
app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Handler for standardizing error format.
app.use(errorHandler);

let time = new Date().toLocaleTimeString();
db.connect(
    db.MODE_PROD,
    () => {
        console.log(time, "Connected to Postgres");
        app.listen(PORT, () => {
            console.log(time, `Council app is listening on port ${PORT}, http://localhost:${PORT}/`);
        });
    }
);
