let article_id = window.location.href.substring(window.location.href.lastIndexOf("/")+1);
let articleContainer = document.getElementById("article-container");
let viewArticleContainer = document.getElementById("view-article-container")
let editArticleContainer = document.getElementById("edit-article-container")
let editArticleSectionDropdown = document.getElementById("edit-article-section-dropdown");

/***** Loads page data *****/
request("get", "/api/internal/kb/articles?articleId=" + article_id, null, (data) => {
    let a = data.article;
    request("get", "/api/internal/users?userId=" + data.article.article_author, null, (data) => {
        let author_name = data.evaluator.evaluator_name;

        if (!data.error) {
            articleContainer.innerHTML = `
                <div class="preview col-8 standard">
                    <div class="db-header">
                        <p>${a.article_name}</p>
                            <span class="admin-controls">
                                <i class="control-btn far fa-edit" onclick="showEditArticleForm(${a.article_id})"></i>
                                <i class="control-btn red far fa-trash-alt" onclick="deleteArticle(${a.article_id})"></i>
                            </span>
                    </div>
                    <div class="preview-content">
                        ${a.article_content}

                         <div class="article-meta">
                            <p>Last updated: ${a.last_updated}</p>
                            <p>Created by: ${author_name}</p>
                            ${data.is_admin ? `<p>Published: ${a.is_published ? "<span style='color: green'>True</span>" : "<span style='color: red'>False</span>"}</p>
                            <p>Visibility: ${a.article_visibility}</p>
                        </div>` : ``}
                    </div>
                </div>
            `;
        } else {
            alert(data.error.message);
        }
    });
});

request("get", "/api/internal/kb/sections", null, (data) => {
    if (!data.error) {
        data.sections.forEach((s, idx) => {
            // Fill forms with sections
            editArticleSectionDropdown.innerHTML += `
                <option value="${s.section_id}">${s.section_name}</option>
            `;
        });
    } else {
        alert(data.error.message);
    }
});

/***** Send Form Requests *****/
let editArticle = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === 'is_published') {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    body["article_content"] = document.querySelector("#edit-article-editor").firstChild.innerHTML;
    delete body[""];
    request("put", "/api/internal/kb/articles", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}

let deleteArticle = (id) => {
    let confirm = window.confirm("Are you sure you want to delete this article?");
    if (confirm) {
        request("delete", "/api/internal/kb/articles", {article_id: id}, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

/***** Show forms *****/
let showEditArticleForm = (id) => {
    viewArticleContainer.style.display = "none";
    editArticleContainer.style.display = "block";

    let editArticleForm = document.querySelector("#edit-article-form");
    request("get", "/api/internal/kb/articles?articleId=" + id, null, (data) => {
        data = data.article;
        editArticleForm["article_id"].value = data.article_id;
        editArticleForm["article_name"].value = data.article_name;
        editArticleForm["article_visibility"].value = data.article_visibility;
        editArticleForm["article_section"].value = data.section_id;
        editArticleForm["is_published"].checked = data.is_published;

        document.querySelector("#edit-article-editor").firstChild.innerHTML = data.article_content;
    });
}

/***** Create text editors *****/
var editArticleEditor = new Quill("#edit-article-editor", quillOptions);
