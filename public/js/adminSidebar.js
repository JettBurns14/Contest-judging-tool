let entriesTab = document.getElementById("sidebar-entries");
let resultsTab = document.getElementById("sidebar-results");
let evaluationsTab = document.getElementById("sidebar-evaluations");

request("get", "/api/internal/contests/getCurrentContest", null, (data) => {
    if (!data.error) {
        entriesTab.href = "/entries/" + data.currentContest.contest_id;
        resultsTab.href = "/results/" + data.currentContest.contest_id;
        //evaluationsTab.href += ("/" + data.currentContest.contest_id);
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/users/id", null, (d) => {
    if (!d.error) {
        request("get", "/api/internal/contests/getContestsEvaluatedByUser?userId=" + d.evaluator_id, null, (data) => {
            if (!data.error) {
                evaluationsTab.href += ("/" + data.contests[0].contest_id);
            } else {
                alert(data.error.message);
            }
        });
    } else {
        alert(data.error.message);
    }
});
