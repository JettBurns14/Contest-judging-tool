let hasHashInUrl = document.location.href.indexOf("#") != -1;
let current_contest_id = (
    hasHashInUrl ?
    parseInt(document.location.href.split("#")[0].split("/")[6]) :
    parseInt(document.location.href.split("/")[6])
);
let current_evaluator_id = document.location.href.split("/")[5];

let evaluationsTable = document.querySelector("#evaluations-table");
let evaluationsTableHead = document.querySelector("#evaluations-table-head");
let evaluationsTableBody = document.querySelector("#evaluations-table-body");
let evaluationsSpinner = document.querySelector("#evaluations-spinner");
let evaluationsContestName = document.querySelector("#evaluations-contest-name");
let titleSpinner = document.querySelector("#title-spinner");
let sidebar = document.querySelector(".side-bar");
let sidebarSpinner = document.querySelector("#sidebar-spinner");
let editable_contest;

// Get the current contest
request("get", `/api/internal/contests/getCurrentContest`, null, (data) => {
    if (!data.error) {
        editable_contest = data.currentContest.contest_id;

        if (editable_contest === current_contest_id) {
            evaluationsTableHead.innerHTML = evaluationsTableHead.innerHTML.split("</tr>")[0] + '<th style="width: 3%">Actions</th>' + evaluationsTableHead.innerHTML.split("</tr>")[1];
        }
    } else {
        alert(data.error.message);
    }
});

// Load page data
request("get", "/api/internal/contests/getContestsEvaluatedByUser?userId=" + current_evaluator_id, null, (data) => {
    if (!data.error) {
        titleSpinner.style.display = "none";
        evaluationsContestName.textContent = `${data.contests.filter(c => c.contest_id == current_contest_id)[0].contest_name} - Evaluations For ` + evaluationsContestName.textContent;

        sidebarSpinner.style.display = "none";
        data.contests.forEach((c, idx) => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/admin/evaluations/${current_evaluator_id}/${c.contest_id}" id="contest-tab-${c.contest_id}">
                    <i class="fas fa-trophy"></i>
                    <p>
                        ${c.contest_name}
                    </p>
                </a>
            `;
        });
        let navButton = document.querySelector(`#contest-tab-${current_contest_id}`);
        navButton.classList.add("selected");
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/users?userId=" + current_evaluator_id, null, (data) => {
    if (!data.error) {
        evaluationsContestName.textContent += `${data.evaluator.evaluator_name}`;
    } else {
        alert(data.error.message);
    }
});

request("get", `/api/internal/evaluations?contestId=${current_contest_id}&userId=${current_evaluator_id}`, null, (data) => {
    if (!data.error) {

        evaluationsTable.style.display = "block";
        data.evaluations.forEach((e, idx) => {
            evaluationsTableBody.innerHTML += `
            <tr id="${e.evaluation_id}">
                <td>
                    ${e.evaluation_id}
                </td>
                <td>
                    ${e.entry_id}
                </td>
                <td>
                    <a href='${e.entry_url}' target='_blank'>${e.entry_title}</a>
                </td>
                <td>
                    ${e.creativity}
                </td>
                <td>
                    ${e.complexity}
                </td>
                <td>
                    ${e.execution}
                </td>
                <td>
                    ${e.interpretation}
                </td>
                <td>
                    ${e.creativity + e.complexity + e.execution + e.interpretation}
                </td>
                <td>
                    ${e.evaluation_level}
                </td>
                    ${editable_contest === current_contest_id ? `<td id="${e.evaluation_id}-actions"><i class="control-btn far fa-edit" onclick="showEditEvaluationForm(${e.evaluation_id}, ${e.creativity}, ${e.complexity}, ${e.execution}, ${e.interpretation}, '${e.evaluation_level}')"></i></td>` : ""}
                    ${data.is_admin ? `<td id="${e.evaluation_id}-actions"><i class="control-btn far fa-edit" onclick="showEditEvaluationForm(${e.evaluation_id}, ${e.creativity}, ${e.complexity}, ${e.execution}, ${e.interpretation}, '${e.evaluation_level}')"></i><i class="control-btn red far fa-trash-alt" onclick="deleteEvaluation(${e.evaluation_id})"></i></td>` : ""}
            </tr>`;
        });
        evaluationsSpinner.style.display = "none";
    } else {
        alert(data.error.message);
    }
});

///// These send form post requests /////
let editEvaluation = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("put", "/api/internal/evaluations", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let deleteEvaluation = (evaluation_id) => {
    let shouldDelete = confirm("Are you sure you want to delete this evaluation?");

    if (shouldDelete) {
        request("delete", "/api/internal/evaluations", {
            evaluation_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

///// HTML modifier functions (like displaying forms) /////
let showEditEvaluationForm = (...args) => {
    // evaluation id, creativity, complexity, quality, interpretation, skill level
    let editEvaluationPage = document.querySelector("#edit-evaluation-page");
    let viewEvaluationsPage = document.querySelector("#evaluation-list");
    let editEvaluationForm = document.querySelector("#edit-evaluation-form");
    viewEvaluationsPage.style.display = "none";
    editEvaluationPage.style.display = "block";

    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editEvaluationForm.length - 1; i++) {
        editEvaluationForm[i].value = args[i];
    }
};
