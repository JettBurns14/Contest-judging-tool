let entriesTab = document.getElementById("sidebar-entries");
let resultsTab = document.getElementById("sidebar-results");

request("get", "/api/internal/contests/getCurrentContest", null, (data) => {
    if (!data.error) {
        entriesTab.href = "/entries/" + data.currentContest.contest_id;
        resultsTab.href = "/results/" + data.currentContest.contest_id;
    } else {
        alert(data.error.message);
    }
});
