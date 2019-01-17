// Show and hide the dropdown.
let dropdown = document.querySelector(".dropdown");
let dropdownBtn = document.querySelector(".dropdown-btn");

dropdownBtn.addEventListener("click", function() {
    dropdown.classList.toggle("open");
});
