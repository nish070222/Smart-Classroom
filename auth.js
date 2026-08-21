// =====================================
// SMART CLASSROOM AUTH SYSTEM
// auth.js
// =====================================

import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================
// CHECK FIREBASE LOGIN
// =====================================

onAuthStateChanged(
    auth,
    function(firebaseUser) {

        console.log(
            "🔥 Firebase Auth:",
            firebaseUser
        );


        // =================================
        // USER BELUM LOGIN
        // =================================

        if (!firebaseUser) {

            window.location.href =
                "userlogin.html";

            return;

        }


        // =================================
        // GET LOCAL USER
        // =================================

        const loginUser =
            JSON.parse(
                localStorage.getItem(
                    "loginUser"
                )
            );


        // =================================
        // DISPLAY USER
        // =================================

        const displayName =
            firebaseUser.email ||
            "User";


        const userName =
            document.getElementById(
                "userName"
            );


        const welcome =
            document.getElementById(
                "welcome"
            );


        if (userName) {

            userName.innerHTML =
                "👤 " +
                displayName;

        }


        if (welcome) {

            welcome.innerHTML =
                "Welcome, " +
                displayName;

        }


        // =================================
        // ROLE
        // =================================

        const role =
            loginUser
                ? loginUser.role
                : "user";


        const dashboardMenu =
            document.getElementById(
                "dashboardMenu"
            );


        const manageMenu =
            document.getElementById(
                "manageMenu"
            );


        // =================================
        // ADMIN
        // =================================

        if (
            role === "admin"
        ) {

            if (dashboardMenu) {

                dashboardMenu.style.display =
                    "";

            }


            if (manageMenu) {

                manageMenu.style.display =
                    "";

            }

        }


        // =================================
        // USER
        // =================================

        else {

            if (dashboardMenu) {

                dashboardMenu.style.display =
                    "none";

            }


            if (manageMenu) {

                manageMenu.style.display =
                    "none";

            }

        }

    }
);