/** Handler for EVALUATING an entry **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.submit = (request, response, next) => {
    if (request.decodedToken) {
        try {
            const {
                entry_id,
                creativity,
                complexity,
                quality_code,
                interpretation,
                skill_level
            } = request.body;
            const {
                evaluator_id,
                is_admin
            } = request.decodedToken;
            const values = [entry_id, evaluator_id, (creativity / 2), (complexity / 2), (quality_code / 2), (interpretation / 2), skill_level]
            return db.query("SELECT evaluate($1, $2, $3, $4, $5, $6, $7)", values, res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem evaluating this entry");
                }
                return db.query("SELECT update_entry_level($1)", [entry_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem updating the entry's skill level");
                    }
                    successMsg(response);
                });
            });
        } catch (err) {
            return handleNext(next, 400, "There was a problem evaluating this entry");
        }
    }
    handleNext(next, 401, "Unauthorized");
}

module.exports = exports;
