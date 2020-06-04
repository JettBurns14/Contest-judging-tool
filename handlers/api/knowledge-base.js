/** Handlers for the knowledge base sections and articles **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");

exports.getAllSections = (request, response, next) => {
    if (request.decodedToken) {
        let {
            is_admin
        } = request.decodedToken;

        if (is_admin) {
            // User is an admin, so return all sections
            return db.query("SELECT * FROM kb_section ORDER BY section_visibility, section_id", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the sections");
                }
                response.json({
                    is_admin: true,
                    logged_in: true,
                    sections: res.rows
                });
            });
        } else {
            // User is a standard user, so only return sections with "Evaluators Only" visibility
            return db.query("SELECT * FROM kb_section WHERE section_visibility = 'Evaluators Only' ORDER BY section_id", [], res => {
                if (res.error) {
                    return handleNext(next, 400, "There was a problem getting the sections");
                }
                response.json({
                    is_admin: false,
                    logged_in: true,
                    sections: res.rows
                });
            });
        }
    } else {
        // User is not logged in, so only return public sections
        return db.query("SELECT * FROM kb_section WHERE section_visibility = 'Public' ORDER BY section_id", [], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the sections");
            }
            response.json({
                is_admin: false,
                logged_in: false,
                sections: res.rows
            });
        });
    }
};

exports.getSection = (request, response, next) => {
    let section_id = parseInt(request.query.sectionId);

    if (section_id > 0) {
        return db.query("SELECT * FROM kb_section WHERE section_id = $1", [section_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the requested section");
            }

            if ((res.rows[0].section_visibility === "Admin Only" && !request.decodedToken.is_admin) ||
                (res.rows[0].section_visibility === "Evaluators Only") && !request.decodedToken) {
                return handleNext(next, 403, "Insufficient access");
            }
            response.json({
                is_admin: request.decodedToken.is_admin,
                logged_in: request.decodedToken ? true : false,
                section: res.rows[0]
            });
        });
    } else {
        return handleNext(next, 400, "Bad Request");
    }
};

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

exports.editSection = (request, response, next) => {
    let {
        section_id,
        section_name,
        section_description,
        section_visibility
    } = request.body;
    let {
        is_admin
    } = request.decodedToken;

    if (is_admin) {
        return db.query("UPDATE kb_section SET section_name = $1, section_description = $2, section_visibility = $3 WHERE section_id = $4", [section_name, section_description, section_visibility, section_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem editing this section");
            }
            successMsg(response);
        });
    } else {
        return handleNext(next, 403, "Insufficient access");
    }
};

exports.deleteSection = (request, response, next) => {
    let {
        section_id
    } = request.body;
    let {
        is_admin
    } = request.decodedToken;

    if (is_admin) {
        return db.query("DELETE FROM kb_section WHERE section_id = $1", [section_id], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem deleting this section");
            }
            successMsg(response);
        });
    } else {
        return handleNext(next, 403, "Insufficient access");
    }
};

exports.addArticle = (request, response, next) => {
    let {
        article_name,
        article_content,
        article_visibility,
        article_section
    } = request.body;
    let {
        is_admin
    } = request.decodedToken;

    if (is_admin) {
        return db.query("INSERT INTO kb_article (section_id, article_name, article_content, article_author, article_last_updated, article_visibility) VALUES ($1, $2, $3, $4, $5, $6)", [article_section, article_name, article_content, request.decodedToken.evaluator_id, new Date(), article_visibility], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem creating this article");
            }
            successMsg(response);
        });
    } else {
        return handleNext(next, 403, "Insufficient access");
    }
};

module.exports = exports;
