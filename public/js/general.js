// Request handler
let request = (method = "post", path, data, callback) => {
    fetch(path, (method === "get") ? null : {
        method,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => alert(err)); // Will change later.
};

// Dropdown accordion handler
var collapsables = document.getElementsByClassName("collapsable");

for (var i = 0; i < collapsables.length; i++) {
    collapsables[i].addEventListener("click", function() {
        this.classList.toggle("expanded");
        var panel = this.nextElementSibling;
        panel.classList.toggle("closed");
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
}

// Text editor settings
var quillOptions = {
    modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'link', { 'list': 'bullet' }, 'image', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
    ]
    },
    handlers: {
        'link': function(value) {
          if (value) {
            var href = prompt('Enter the URL');
            this.quill.format('link', href);
          } else {
            this.quill.format('link', false);
          }
        }
    },
    theme: 'snow'
};
