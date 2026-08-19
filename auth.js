// =====================================
// SMART CLASSROOM AUTH SYSTEM
// auth.js
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // GET LOGIN USER
    // =====================================

    const loginUser = JSON.parse(
        localStorage.getItem("loginUser")
    );


    // =====================================
    // CHECK LOGIN
    // =====================================

    if (!loginUser) {

        window.location.href = "userlogin.html";

        return;

    }


    // =====================================
    // DISPLAY USER
    // =====================================

    const displayName =
        loginUser.email || "User";


    const userName =
        document.getElementById("userName");


    const welcome =
        document.getElementById("welcome");


    if (userName) {

        userName.innerHTML =
            "👤 " + displayName;

    }


    if (welcome) {

        welcome.innerHTML =
            "Welcome, " + displayName;

    }


    // =====================================
    // ROLE MENU
    // =====================================

    const dashboardMenu =
        document.getElementById("dashboardMenu");


    const manageMenu =
        document.getElementById("manageMenu");


    // =====================================
    // ADMIN
    // =====================================

    if (loginUser.role === "admin") {

        if (dashboardMenu) {

            dashboardMenu.style.display = "";

        }


        if (manageMenu) {

            manageMenu.style.display = "";

        }

    }


    // =====================================
    // USER
    // =====================================

    else {

        if (dashboardMenu) {

            dashboardMenu.style.display = "none";

        }


        if (manageMenu) {

            manageMenu.style.display = "none";

        }

    }

});