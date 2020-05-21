///// These send form post requests /////
let createSection = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/kb/sections", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

// Displays forms
let showCreateSectionForm = () => {
    let createSection = document.querySelector("#create-section-container");
    let viewSections = document.querySelector("#view-sections-container");
    viewSections.style.display = "none";
    createSection.style.display = "block";
}
