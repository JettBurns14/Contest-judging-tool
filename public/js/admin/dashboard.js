let yourReviewedEntriesCount = document.querySelector("#your-reviewed-entries-count");
let yourGroupTotalEvaluationsCount = document.querySelector("#your-group-total-evaluations-count");
let totalReviewedEntries = document.querySelector("#total-reviewed-count");
let totalEvaluationsCount = document.querySelector("#total-evaluations-count");
let entryStats = document.querySelector("#entry-stats");
let tab = document.querySelector("#sidebar-dashboard");

// Load page data
request("get", "/api/internal/admin/stats", null, (data) => {
    if (!data.error) {
        yourReviewedEntriesCount.innerText = `${data.yourReviewedEntriesCount} / ${data.groupEntriesCount}`;
        yourGroupTotalEvaluationsCount.innerText = `${data.groupEvaluationsCount} / ${data.groupEntriesCount * data.groupEvaluatorCount}`;

        if (data.is_admin) {
            totalReviewedEntries.innerText = `${data.totalReviewedEntries} / ${data.totalEntriesCount}`;
            totalEvaluationsCount.innerText = `${data.totalEvaluationsCount} / ${data.totalActiveEvaluators * data.totalEntriesCount}`;
            entryStats.innerText = `Flagged Entries: ${data.totalFlaggedEntries}\n
                Disqualified Entries: ${data.totalDisqualifiedEntries}\n
                Total Entries: ${data.totalEntriesCount}`;
        }
    } else {
        alert(data.error.message);
    }
});

// Update navbar highlighting
tab.classList.add("selected");
