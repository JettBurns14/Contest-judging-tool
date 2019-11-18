// Show and hide the dropdown.
/*let dropdown = document.querySelector(".dropdown");
let dropdownBtn = document.querySelector(".dropdown-btn");

dropdownBtn.addEventListener("click", function() {
    dropdown.classList.toggle("open");
});*/

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