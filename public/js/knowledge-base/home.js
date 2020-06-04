let sectionsContainer = document.getElementById("sections-container");
let createArticleSectionDropdown = document.getElementById("create-article-section-dropdown");

/***** Loads page data *****/
request("get", "/api/internal/kb/sections", null, (data) => {
    if (!data.error) {
        data.sections.forEach((s, idx) => {
            // Fill forms with sections
            createArticleSectionDropdown.innerHTML += `
                <option value="${s.section_id}">${s.section_name}</option>
            `;

            // Fill page with sections
            sectionsContainer.innerHTML += `
            <div class="preview col-12 standard">
                <div class="db-header">
                    <p>${s.section_name}</p>
                    ${data.is_admin
                        ?`<span class="admin-controls">
                            <i class="control-btn far fa-edit" onclick="showEditSectionForm(${s.section_id})"></i>
                            <i class="control-btn red far fa-trash-alt" onclick="deleteSection(${s.section_id})"></i>
                        </span>`
                        : ""
                    }
                </div>
                <div class="preview-content article-section" id="section-${s.section_id}">
                </div>
            </div>`
        });

        data.sections.forEach((s, idx) => {
            fillSection(s.section_id);
        });
    } else {
        alert(data.error.message);
    }
});

// Fills a given section with articles
let fillSection = (id) => {
    let sectionContainer = document.getElementById("section-" + id);
    request("get", "/api/internal/kb/articles?sectionId=" + id, null, (data) => {
        if (!data.error) {
            data.articles.forEach((a, idx) => {
                sectionContainer.innerHTML += `
                    <div class="article-preview preview col-6">
                        <i class="far fa-file"></i>
                        <a href="/kb/article/${a.article_id}">${a.article_name}</a>
                    </div>
                `;
            });
        } else {
            alert(data.error.message);
        }
    });
}


/***** These send form post requests *****/
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

let editSection = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("put", "/api/internal/kb/sections", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let deleteSection = (id) => {
    let shouldDelete = confirm("Are you sure you want to delete this section?");

    if (shouldDelete) {
        let body = {section_id: id};
        request("delete", "/api/internal/kb/sections", body, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

let createArticle = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    body["article_content"] = document.querySelector("#new-article-editor").firstChild.innerHTML;
    delete body[""];
    request("post", "/api/internal/kb/articles", body, (data) => {
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

let showEditSectionForm = (id) => {
    let editSection = document.querySelector("#edit-section-container");
    let viewSections = document.querySelector("#view-sections-container");
    viewSections.style.display = "none";
    editSection.style.display = "block";

    let editSectionForm = document.querySelector("#edit-section-form");
    request("get", "/api/internal/kb/getSection?sectionId=" + id, null, (data) => {
        data = data.section;
        editSectionForm[0].value = data.section_id;
        editSectionForm[1].value = data.section_name;
        editSectionForm[2].value = data.section_description;
        editSectionForm[3].value = data.section_visibility;
    });
}

let showCreateArticleForm = () => {
    let createArticle = document.querySelector("#create-article-container");
    let viewSections = document.querySelector("#view-sections-container");
    viewSections.style.display = "none";
    createArticle.style.display = "block";
}

/***** Create text editors *****/
let newArticleEditor = new Quill("#new-article-editor", quillOptions);
