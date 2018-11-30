// For help: https://node-postgres.com/
// Postgres DB constants and helpers for connecting/querying.

const { Pool } = require("pg");
// const async = require("async");

// Names of databases to connect to, given the mode.
const PRODUCTION_DB = process.env.PRODUCTION_DB;
const DEV_DB = process.env.DEV_DB;

exports.MODE_DEV = "mode_dev";
exports.MODE_PRODUCTION = "mode_production";

let state = {
	pool: null,
	mode: null,
};

// Initial connection helper.
exports.connect = function(mode, done) {
    // Connect to specificed DB.
	/*state.pool = new Pool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : DEV_DB,
	});*/
    state.pool = new Pool({
        connectionString: process.env.PRODUCTION_DB_URL,
    });

    state.pool.on("error", (err, client) => {
        console.log("PG Pool error!", err, "Client upon which the error occurred: ", client);
        process.exit(-1);
    });

	state.mode = mode;

	done();
};

// Easily run a query.
exports.query = function(text, params, callback) {
	return state.pool.query(text, params)
        .then(res => callback(res))
        .catch(err => {
            // Log or send this back correctly.
            // callback(err);
            console.log("Error from db.js");
            console.error(err);
        });
};

exports.shutdown = function() {
    return state.pool.end().then(() => console.log("Pool has shutdown"));
}

// Taken from my MySQL module, might not need.
/*exports.fixtures = function(data) {
	var pool = state.pool;
	if (!pool) return new Error("Missing database connection.");

	var names = Object.keys(data.tables);
	async.each(names, function(name, cb) {
		async.each(
			data.tables[name],
			function(row, cb) {
				var keys = Object.keys(row),
					values = keys.map(function(key) {
						return "'" + row[key] + "'";
					});

				pool.query(
					"INSERT INTO " +
						name +
						" (" +
						keys.join(",") +
						") VALUES (" +
						values.join(",") +
						")",
					cb
				);
			},
			cb
		);
	});
};

exports.drop = function(tables, done) {
	var pool = state.pool;
	if (!pool) return done(new Error("Missing database connection."));

	async.each(
		tables,
		function(name, cb) {
			pool.query("DELETE * FROM " + name, cb);
		},
		done
	);
};
*/
