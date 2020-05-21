/** Handlers for the knowledge base sections and articles **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.addSection = (request, response, next) => {
    let {
        section_name,
        section_description,
        section_visibility
    } = request.body;
    let {
        is_admin
    } = request.decodedToken;

    if (is_admin) {
        return db.query("INSERT INTO kb_section (section_name, section_description, section_visibility) VALUES ($1, $2, $3)", [section_name, section_description, section_visibility], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem creating this section");
            }
            successMsg(response);
        });
    } else {
        return handleNext(next, 403, "Insufficient access");
    }
};

module.exports = exports;
