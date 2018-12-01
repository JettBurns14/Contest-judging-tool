const submitLogin = e => {
    e.preventDefault();
    var errors = document.getElementsByClassName("error");
    for (var i = 0; i < errors.length; i++) {
        errors[i].textContent = "";
    }
    var postData = {};
    for (var i = 0; i < e.target.length - 1; i++) {
        postData[e.target[i].name] = e.target[i].value;
    }
    fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        return res.json();
    }).then(data => {
        // Unauthorized login
        // if (data.code === 1) {
        //     document.getElementById("evalutor-error").textContent = "Unauthorized";
        // }
        // // Council password incorrect
        // if (data.code === 2) {
        //     document.getElementById("councilpw-error").textContent = "Incorrect";
        // }
        // // Account password incorrect
        // if (data.code === 3) {
        //     document.getElementById("password-error").textContent = "Incorrect";
        // }
        if (data.code === 4) {
            window.location.href = window.location.href.slice(0, window.location.href.length - 5);
        }
    })
}
