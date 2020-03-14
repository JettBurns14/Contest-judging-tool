let reviewedEntriesCount = document.querySelector("#reviewed-entries-count");
let totalEvaluationsCount = document.querySelector("#total-evaluations-count");

// Load page data
request("get", "/api/internal/admin/stats", null, (data) => {
    if (!data.error) {
        reviewedEntriesCount.textContent = `${data.reviewedEntriesCount} / ${data.entryCount}`;
        totalEvaluationsCount.textContent = `${data.totalEvaluationsCount} / ${data.totalEvaluationsNeeded}`;
    } else {
        alert(data.error.message);
    }
});
