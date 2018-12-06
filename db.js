// For help: https://node-postgres.com/
// Postgres DB constants and helpers for connecting/querying.

const { Pool } = require("pg");
// const async = require("async");

// Names of databases to connect to, given the mode.
const PROD_DB = process.env.PROD_DB_URL;
const DEV_DB = process.env.DEV_DB_URL;

exports.MODE_DEV = "mode_dev";
exports.MODE_PROD = "mode_prod";

let state = {
	pool: null,
	mode: null,
};

// Initial connection helper.
exports.connect = (mode, done) => {
    state.pool = new Pool({
        connectionString: mode === exports.MODE_PROD ? PROD_DB : DEV_DB,
    });

    state.pool.on("error", (err, client) => {
        console.log("PG Pool error!", err, "Client upon which the error occurred: ", client);
        process.exit(-1);
    });

	state.mode = mode;

	done();
};

// Easily run a query.
exports.query = (text, params, callback) => {
	return state.pool.query(text, params)
        .then(res => callback(res))
        .catch(error => {
			console.log("Error from db.js");
			console.error(error);
			callback({ error });
        });
};

exports.shutdown = () => {
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
