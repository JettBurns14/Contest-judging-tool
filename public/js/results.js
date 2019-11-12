let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);

// Spinners to be soon hidden
let sidebarSpinner = document.querySelector("#sidebar-spinner");
let evalsPerLevelSpinner = document.querySelector("#evalsPerLevel-spinner");
let evalsPerEvaluatorSpinner = document.querySelector("#evalsPerEvaluator-spinner");
let winnersSpinner = document.querySelector("#winners-spinner");
let entriesByAvgScoreSpinner = document.querySelector("#entriesByAvgScore-spinner");
// Hidden tables to be displayed once data is received.
let evalsPerLevelTable = document.querySelector("#evals-per-level-table");
let evalsPerEvaluatorTable = document.querySelector("#evals-per-evaluator-table");
let winnersTable = document.querySelector("#winners-table");
let entriesByAvgScoreTable = document.querySelector("#entries-by-avg-score-table");
// Containers to fill
let sidebar = document.querySelector(".side-bar");
let evalsPerLevelTableBody = document.querySelector("#evalsPerLevel-table-body");
let evalsPerEvaluatorTableBody = document.querySelector("#evalsPerEvaluator-table-body");
let winnersTableBody = document.querySelector("#winners-table-body");
let entriesByAvgScoreTableBody = document.querySelector("#entriesByAvgScore-table-body");

let resultsContestName = document.querySelector("#results-contest-name");

request("get", "/api/internal/contests", null, (data) => {
    if (!data.error) {
        sidebarSpinner.style.display = "none";
        resultsContestName.textContent = `Results for ${data.contests.filter(c => c.contest_id == currentContestId)[0].contest_name}`;
        data.contests.forEach(c => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/results/${c.contest_id}">
                    <i class="fas fa-trophy"></i>
                    <p>
                        ${c.contest_name}
                    </p>
                </a>
            `;
        });
        let navButtons = document.querySelectorAll(".nav-button");
        navButtons[navButtons.length - currentContestId].classList.add("selected");
    } else {
        alert(data.error.message);
    }
});

request("get", `/api/internal/results?contestId=${currentContestId}`, null, (data) => {
    if (!data.error) {
        evalsPerLevelSpinner.style.display = "none";
        evalsPerLevelTable.style.display = "block";
        data.results.evaluationsPerLevel.forEach(a => {
            evalsPerLevelTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.evaluation_level}
                </td>
                <td>
                    ${a.cnt}
                </td>
            </tr>`;
        });
        evalsPerEvaluatorSpinner.style.display = "none";
        evalsPerEvaluatorTable.style.display = "block";
        data.results.evaluationsPerEvaluator.forEach(a => {
            evalsPerEvaluatorTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.evaluator_name}
                </td>
                <td>
                    ${a.cnt} / ${data.results.entryCount}
                </td>
            </tr>`;
        });
        winnersSpinner.style.display = "none";
        winnersTable.style.display = "block";
        data.results.winners.forEach(a => {
            winnersTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.entry_id}
                </td>
                <td>
                    <a href="${a.entry_url}" target="_blank">
                        ${a.entry_title}
                    </a>
                </td>
                <td>
                    ${a.entry_author}
                </td>
                <td>
                    ${a.entry_level}
                </td>
                ${data.is_admin
                    ? `<td id="${a.entry_id}-actions">
                           <i class="control-btn red far fa-trash-alt" onclick="deleteWinner(${a.entry_id})"></i>
                       </td>`
                    : ""
                }
            </tr>`;
        });
        entriesByAvgScoreSpinner.style.display = "none";
        entriesByAvgScoreTable.style.display = "block";
        data.results.entriesByAvgScore.forEach(a => {
            entriesByAvgScoreTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.entry_id}
                </td>
                <td>
                    <a href="${a.entry_url}" target="_blank">
                        ${a.title}
                    </a>
                </td>
                <td>
                    ${a.entry_author}
                </td>
                ${data.logged_in ? `
                    <td>
                        ${a.evaluations}
                    </td>
                    <td>
                        ${a.entry_level}
                    </td>
                    <td>
                        ${a.avg_score}
                    </td>` : ""
                }
            </tr>`;
        });
    } else {
        alert(data.error.message);
    }
});

let addWinner = () => {
    let entry_id = window.prompt("Enter the ID of the entry you want to add:");
    entry_id = +entry_id;

    if (entry_id > 0) {
        request("post", "/api/internal/winners", {
            entry_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    } else {
        window.alert("Entry ID must be > 0");
    }
};

let deleteWinner = entry_id => {
    let shouldDelete = confirm("Are you sure you want to delete this winner?");

    if (shouldDelete) {
        request("delete", "/api/internal/winners", {
            entry_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
};