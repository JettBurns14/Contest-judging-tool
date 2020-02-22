/** Handlers for ADDING, EDITING, and DELETING messages **/

const {
    handleNext,
    successMsg
} = require(process.cwd() + "/util/functions");
const db = require(process.cwd() + "/util/db");
const { displayDateFormat } = require(process.cwd() + "/util/variables");
const nodemailer = require('nodemailer');

exports.get = (request, response, next) => {
    if (request.decodedToken) {
        return db.query("SELECT *, to_char(m.message_date, $1) as message_date FROM messages m ORDER BY m.message_date DESC", [displayDateFormat], res => {
            if (res.error) {
                return handleNext(next, 400, "There was a problem getting the messages");
            }
            response.json({
                logged_in: true,
                is_admin: request.decodedToken.is_admin,
                messages: res.rows
            });
        });
    }
    return db.query("SELECT *, to_char(m.message_date, $1) as message_date FROM messages m WHERE public = true ORDER BY m.message_date DESC", [displayDateFormat], res => {
        if (res.error) {
            return handleNext(next, 400, "There was a problem getting the messages");
        }
        response.json({
            logged_in: false,
            is_admin: false,
            messages: res.rows
        });
    });
};

exports.add = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_date,
                message_title,
                message_content,
                public,
                send_email,
                email_address,
                password
            } = request.body;
            let {
                is_admin,
                evaluator_name
            } = request.decodedToken;

            if (is_admin) {

                return db.query("INSERT INTO messages (message_author, message_date, message_title, message_content, public) VALUES ($1, $2, $3, $4, $5);", [evaluator_name, message_date, message_title, message_content, public], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem adding this message");
                    }

                    if (send_email) {
                        return db.query("SELECT email FROM evaluator WHERE email LIKE '%@%' AND receive_emails = true AND account_locked = false;", [], res => {
                            if (res.error) {
                                return handleNext(next, 400, "There was a problem sending emails");
                            }

                            let emails = res.rows;
                            let emailList = '';
                            for (var i = 0; i < emails.length; i++) {
                                emailList += emails[i].email;

                                if (i != emails.length - 1) {
                                    emailList += ", ";
                                }
                            }

                            var transporter = nodemailer.createTransport({
                                service: email_address.split("@")[1].split(".")[0],
                                auth: {
                                    user: email_address,
                                    pass: password
                                }
                            });

                            var mailOptions = {
                                from: email_address,
                                to: emailList,
                                subject: "[KACP Challenge Council] " + message_title,
                                html: message_content
                            };

                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                    return handleNext(next, 400, error);
                                }
                            });

                            successMsg(response);
                        });
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem adding this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.edit = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_id,
                message_date,
                message_title,
                message_content,
                public
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("UPDATE messages SET message_date = $1, message_title = $2, message_content = $3, public = $4 WHERE message_id = $5", [message_date, message_title, message_content, public, message_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem editing this message");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem editing this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

exports.delete = (request, response, next) => {
    if (request.decodedToken) {
        try {
            let {
                message_id
            } = request.body;
            let {
                is_admin
            } = request.decodedToken;

            if (is_admin) {
                return db.query("DELETE FROM messages WHERE message_id = $1", [message_id], res => {
                    if (res.error) {
                        return handleNext(next, 400, "There was a problem deleting this message");
                    }
                    successMsg(response);
                });
            } else {
                return handleNext(next, 403, "Insufficient access");
            }
        } catch (err) {
            return handleNext(next, 400, "There was a problem deleting this message");
        }
    }
    return handleNext(next, 401, "Unauthorized");
}

module.exports = exports;
