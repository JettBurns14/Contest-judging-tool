let logout = e => {
    e.preventDefault();
    fetch("/api/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(data => {
        window.location.href = "/login";
    });
};