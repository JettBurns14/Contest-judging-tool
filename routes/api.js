const express = require("express");
const router = express.Router();
const hasBody = require(process.cwd() + "/middleware/hasBody");
const { check } = require('express-validator/check');
const wasValidated = require(process.cwd() + "/middleware/wasValidated");
const { nameChars, datePattern, kaidPattern, dateFormat, scoreChars, messageChars, contentChars } = require(process.cwd() + "/util/variables");

const admin = require(process.cwd() + "/handlers/api/admin");
const contests = require(process.cwd() + "/handlers/api/contests");
const entries = require(process.cwd() + "/handlers/api/entries");
const results = require(process.cwd() + "/handlers/api/results");
const judging = require(process.cwd() + "/handlers/api/judging");
const messages = require(process.cwd() + "/handlers/api/messages");
const users = require(process.cwd() + "/handlers/api/users");
const winners = require(process.cwd() + "/handlers/api/winners");
const tasks = require(process.cwd() + "/handlers/api/tasks");

const routeChecks = {
	contests: {
		add: [
		    check("contest_name")
		    .isLength(nameChars)
		    .withMessage("Contest name cannot be empty or longer than 200 characters"),
		    check("contest_author")
		    .isLength(nameChars)
		    .withMessage("Contest author cannot be empty or longer than 200 characters"),
		    check("contest_current")
		    .isBoolean()
		    .withMessage("Current contest must be a boolean"),
		    check("contest_url")
		    .isURL()
		    .withMessage("Must provide a valid contest URL"),
		    check("contest_start_date")
		    .matches(datePattern)
		    .withMessage(`Must be a valid date ${dateFormat}`),
		    check("contest_end_date")
		    .matches(datePattern)
		    .withMessage(`Must be a valid date ${dateFormat}`),
		],
		edit: [
		    check("edit_contest_id")
		    .isInt()
		    .withMessage("Contest ID must be an integer"),
		    check("edit_contest_name")
		    .isLength(nameChars)
		    .withMessage("Contest name cannot be empty or longer than 200 characters"),
		    check("edit_contest_author")
		    .isLength(nameChars)
		    .withMessage("Contest author cannot be empty or longer than 200 characters"),
		    check("edit_contest_url")
		    .isURL()
		    .withMessage("Must provide a valid contest URL"),
		    check("edit_contest_start_date")
		    .matches(datePattern)
		    .withMessage(`Start date must be a valid date ${dateFormat}`),
		    check("edit_contest_end_date")
		    .matches(datePattern)
		    .withMessage(`End date must be a valid date ${dateFormat}`),
		    check("edit_contest_current")
		    .isBoolean()
		    .withMessage("Current contest must be true or false")
		],
		delete: [
		    check("contest_id")
		    .isInt()
		    .withMessage("Contest ID must be an integer")
		]
	},
	entries: {
		add: [
		    check("contest_id")
		    .isInt()
		    .withMessage("Contest ID must be an integer"),
		    check("entry_url")
		    .isURL()
		    .withMessage("Entry url must be a valid URL"),
		    check("entry_kaid")
		    .isInt()
		    .withMessage("Entry KAID must be an integer"),
		    check("entry_title")
		    .isLength(nameChars)
		    .withMessage("Entry title cannot be empty or longer than 200 characters"),
		    check("entry_author")
		    .isLength(nameChars)
		    .withMessage("Entry author cannot be empty or longer than 200 characters"),
		    check("entry_level")
		    .isIn(["Advanced", "Intermediate", "Beginner", "TBD"])
		    .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'TBD'"),
		    check("entry_votes")
		    .isInt()
		    .withMessage("Entry votes must be an integer"),
		    check("entry_height")
		    .isInt()
		    .withMessage("Entry height must be an integer")
		],
		edit: [
		    check("entry_id")
		    .isInt()
		    .withMessage("Entry ID must be an integer"),
		    check("edited_level")
		    .isIn(["Advanced", "Intermediate", "Beginner", "tbd"])
		    .withMessage("Entry level must be 'Advanced', 'Intermediate', 'Beginner', or 'tbd'"),
		],
		delete: [
		    check("entry_id")
		    .isInt()
		    .withMessage("Entry ID must be an integer"),
		    check("contest_id")
		    .isInt()
		    .withMessage("Contest ID must be an integer")
		],
		import: [
		    check("contest_id")
		    .isInt()
		    .withMessage("Contest ID must be an integer")
		]
	},
	judging: {
		submit: [
		    check("entry_id")
		    .isInt()
		    .withMessage("entry_id must be an integer"),
		    check("creativity")
		    .isInt(scoreChars)
		    .withMessage("creativity score must be >= 0 and <= 10"),
		    check("complexity")
		    .isInt(scoreChars)
		    .withMessage("complexity score must be >= 0 and <= 10"),
		    check("quality_code")
		    .isInt(scoreChars)
		    .withMessage("quality_code score must be >= 0 and <= 10"),
		    check("interpretation")
		    .isInt(scoreChars)
		    .withMessage("interpretation score must be >= 0 and <= 10"),
		    check("skill_level")
		    .isIn(["Advanced", "Intermediate", "Beginner"])
		    .withMessage("skill_level must be 'Advanced', 'Intermediate', or 'Beginner'")
		]
	},
	messages: {
		add: [
		    check("message_date")
		    .matches(datePattern)
		    .withMessage(`Message date must be a valid date ${dateFormat}`),
		    check("message_title")
		    .isLength(messageChars)
		    .withMessage("Message title cannot be empty or longer than 100 characters"),
		    check("message_content")
		    .isLength(contentChars)
		    .withMessage("Message content cannot be empty or longer than 5,000 characters"),
		    check("public")
		    .isBoolean()
		    .withMessage("Public must be a boolean"),
			check("send_email")
		    .isBoolean()
		    .withMessage("Send Email must be a boolean"),
			check("email_address")
		    .isEmail()
		    .withMessage("Email must be a valid email"),
			check("password")
		    .isLength({ min: 1 })
		    .withMessage("Password field must not be empty"),
		],
		edit: [
		    check("message_id")
		    .isInt()
		    .withMessage("Message ID must be an integer"),
		    check("message_date")
		    .matches(datePattern)
		    .withMessage(`Message date must be a valid date ${dateFormat}`),
		    check("message_title")
		    .isLength(messageChars)
		    .withMessage("Message title cannot be empty or longer than 100 characters"),
		    check("message_content")
		    .isLength(contentChars)
		    .withMessage("Message content cannot be empty or longer than 5,000 characters"),
		    check("public")
		    .isBoolean()
		    .withMessage("Public must be a boolean"),
		],
		delete: [
		    check("message_id")
		    .isInt()
		    .withMessage("Message ID must be an integer")
		]
	},
	users: {
		whitelist: [
		    check("kaid")
		    .matches(kaidPattern)
		    .withMessage("kaid must have correct format")
		],
		unwhitelist: [
		    check("kaid")
		    .matches(kaidPattern)
		    .withMessage("kaid must have correct format")
		],
		edit: [
		    check("edit_user_id")
		    .isInt()
		    .withMessage("User ID must be an integer"),
		    check("edit_user_name")
		    .isLength(nameChars)
		    .withMessage("User name cannot be empty or longer than 200 characters"),
		    check("edit_user_kaid")
		    .matches(kaidPattern)
		    .withMessage("User KAID must have correct format"),
		    check("edit_user_is_admin")
		    .isBoolean()
		    .withMessage("Is admin must be true or false"),
		    check("edit_user_account_locked")
		    .isBoolean()
		    .withMessage("Account locked must be true or false")
		]
	},
	winners: {
		add: [
		    check("entry_id")
		    .isInt()
		    .withMessage("Entry ID must be an integer")
		],
		delete: [
		    check("entry_id")
		    .isInt()
		    .withMessage("Entry ID must be an integer")
		]
	},
	tasks: {
		add: [
		    check("task_title")
		    .isLength(contentChars)
		    .withMessage("Task title cannot be empty or longer than 200 characters"),
		    check("due_date")
		    .matches(datePattern)
		    .withMessage(`Due date must be a valid date ${dateFormat}`),
		    check("task_status")
		    .isIn(["Not Started", "Started", "Completed"])
		    .withMessage("Task status must be 'Not Started', 'Started', 'Completed'"),
		    check("assigned_member")
		    .isInt()
		    .withMessage("Assigned member must be an integer")
		],
		edit: [
		    check("edit_task_id")
		    .isInt()
		    .withMessage("Task id must be an integer"),
		    check("edit_task_title")
		    .isLength(contentChars)
		    .withMessage("Task title cannot be empty or longer than 200 characters"),
		    check("edit_due_date")
		    .matches(datePattern)
		    .withMessage(`Due date must be a valid date ${dateFormat}`),
		    check("edit_task_status")
		    .isIn(["Not Started", "Started", "Completed"])
		    .withMessage("Task status must be 'Not Started', 'Started', 'Completed'"),
		    check("edit_assigned_member")
		    .isInt()
		    .withMessage("Assigned member must be an integer")
		],
		delete: [
		    check("task_id")
		    .isInt()
		    .withMessage("Task id must be an integer"),
		]
	}
};

router.use(hasBody);

// Docs for validation:
// https://github.com/chriso/validator.js#validators
router.get("/ping", admin.ping);

// Winners
router.post("/internal/winners", routeChecks.winners.add, wasValidated, winners.add);
router.delete("/internal/winners", routeChecks.winners.delete, wasValidated, winners.delete);

// Users
router.get("/internal/users", users.get);
router.post("/internal/users/whitelist", routeChecks.users.whitelist, wasValidated, users.add);
router.delete("/internal/users/whitelist", routeChecks.users.unwhitelist, wasValidated, users.delete);
router.put("/internal/users", routeChecks.users.edit, wasValidated, users.edit);

// Messages
router.get("/internal/messages", messages.get);
router.post("/internal/messages", routeChecks.messages.add, wasValidated, messages.add);
router.put("/internal/messages", routeChecks.messages.edit, wasValidated, messages.edit);
router.delete("/internal/messages", routeChecks.messages.delete, wasValidated, messages.delete);

// Judging
router.post("/internal/judging/submit", routeChecks.judging.submit, wasValidated, judging.submit);

// Entries
router.get("/internal/entries", entries.get);
router.post("/internal/entries", routeChecks.entries.add, wasValidated, entries.add);
router.put("/internal/entries", routeChecks.entries.edit, wasValidated, entries.edit);
router.delete("/internal/entries", routeChecks.entries.delete, wasValidated, entries.delete);
router.post("/internal/entries/import", routeChecks.entries.import, wasValidated, entries.import);

// Results
router.get("/internal/results", results.get);

// Contests
router.get("/internal/contests/", contests.get);
router.post("/internal/contests", routeChecks.contests.add, wasValidated, contests.add);
router.put("/internal/contests", routeChecks.contests.edit, wasValidated, contests.edit);
router.delete("/internal/contests", routeChecks.contests.delete, wasValidated, contests.delete);

// Admin
router.get("/internal/admin/stats", admin.stats);

// Tasks
router.get("/internal/tasks", tasks.get);
router.get("/internal/tasks/user", tasks.getForUser);
router.post("/internal/tasks", routeChecks.tasks.add, wasValidated, tasks.add);
router.put("/internal/tasks", routeChecks.tasks.edit, wasValidated, tasks.edit);
router.delete("/internal/tasks", routeChecks.tasks.delete, wasValidated, tasks.delete);

module.exports = router;
