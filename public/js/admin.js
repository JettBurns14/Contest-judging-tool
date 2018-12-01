let navButtons = document.getElementsByClassName("nav-button");
let pages = document.getElementsByClassName("page-content");
let updateButton = document.getElementById("update-entries-button");

const showpage = (page) => {
    for (var i = 0; i < pages.length; ++i) {
        pages[i].style.display = "none";
    }
    for(var i = 0; i < navButtons.length; ++i) {
        navButtons[i].classList.remove("selected");
    }
    navButtons[page].classList.add("selected");
    pages[page].style.display = "block";
    if (page == 0) {
        pages[page].style.display = "flex";
    }
};
showpage(0);

updateButton.addEventListener("click", () => {
    alert("This isn\'t set up yet.");
});
