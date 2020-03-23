/** Utility variables **/

// ReGeX patterns
exports.kaidPattern = /^kaid\_[0-9]+$/;
exports.datePattern = /^(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])-[0-9]{4}$/;
exports.dateFormat = "MM-DD-YYYY";
exports.displayDateFormat = "FMMM-FMDD-YYYY";
exports.displayFancyDateFormat = "FMMM-FMDD-YYYY FMHH12:FMMI:FMSS AM";

// Character limits
exports.scoreChars = {
    min: 0,
    max: 10
};
exports.messageChars = {
    min: 1,
    max: 100
};
exports.nameChars = {
    min: 1,
    max: 200
};
exports.contentChars = {
    min: 1,
    max: 5000
};

// Lists
exports.scores = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

module.exports = exports;
