// =====================================
// SMART CLASSROOM
// MANAGE USER SYSTEM
// FIREBASE AUTH + FIRESTORE
// =====================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {

    apiKey: "AIzaSyCc45wk-89MHpHdIj9q8TREUzFHHJWu24Q",

    authDomain: "smart-classroom-351a3.firebaseapp.com",

    projectId: "smart-classroom-351a3",

    storageBucket: "smart-classroom-351a3.firebasestorage.app",

    messagingSenderId: "1031651524426",

    appId: "1:1031651524426:web:327b07e9d3f97c8ec78bb3"

};


// =====================================
// INITIALIZE FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =====================================
// VARIABLES
// =====================================

let allUsers = [];

let editingUserId = null;


// =====================================
// CHECK ADMIN
// =====================================

let loginUser = JSON.parse(
    localStorage.getItem("loginUser")
);


if (!loginUser || loginUser.role !== "admin") {

    window.location = "index.html";

}


// =====================================
// LOAD USERS
// =====================================

async function loadUsers() {

    try {

        let table = document.getElementById("userList");

        table.innerHTML = "";

        allUsers = [];


        // GET USERS FROM FIRESTORE

        let snapshot = await getDocs(
            collection(db, "users")
        );


        let admin = 0;

        let normal = 0;


        // =====================================
        // PAPAR SEMUA USER
        // =====================================

        snapshot.forEach((item) => {

            let data = item.data();


            allUsers.push({

                id: item.id,

                ...data

            });


            // COUNT ROLE

            if (data.role === "admin") {

                admin++;

            } else {

                normal++;

            }


            // ROLE BADGE

            let badge;


            if (data.role === "admin") {

                badge = `
                    <span class="role-admin">
                        👑 Admin
                    </span>
                `;

            } else {

                badge = `
                    <span class="role-user">
                        🙋 User
                    </span>
                `;

            }


            // TABLE ROW

            table.innerHTML += `

                <tr>

                    <td>
                        ${data.email || "-"}
                    </td>

                    <td>
                        ${badge}
                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editRole('${item.id}')">

                            ✏️ Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteUser('${item.id}')">

                            🗑 Delete

                        </button>

                    </td>

                </tr>

            `;

        });


        // =====================================
        // UPDATE STATISTICS
        // =====================================

        document.getElementById("totalUser").innerHTML =
            snapshot.size;


        document.getElementById("totalAdmin").innerHTML =
            admin;


        document.getElementById("totalNormal").innerHTML =
            normal;


        // EMPTY MESSAGE

        if (snapshot.empty) {

            table.innerHTML = `

                <tr>

                    <td colspan="3"
                        style="text-align:center;">

                        Tiada pengguna dijumpai.

                    </td>

                </tr>

            `;

        }


    } catch (error) {

        console.error(
            "Firestore Error:",
            error
        );

        alert(
            "Gagal mengambil data pengguna.\n\n" +
            error.message
        );

    }

}


// =====================================
// ADD USER
// =====================================

window.addUser = async function () {


    let email =
        document.getElementById("email")
        .value
        .trim();


    let password =
        document.getElementById("password")
        .value;


    let role =
        document.getElementById("role")
        .value;


    // CHECK INPUT

    if (email === "" || password === "") {

        alert(
            "Sila isi email dan password."
        );

        return;

    }


    // CHECK PASSWORD

    if (password.length < 6) {

        alert(
            "Password mestilah sekurang-kurangnya 6 aksara."
        );

        return;

    }


    try {


        // =====================================
        // CREATE FIREBASE AUTH ACCOUNT
        // =====================================

        let userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        let uid =
            userCredential.user.uid;


        // =====================================
        // SAVE USER TO FIRESTORE
        // =====================================

        await addDoc(

            collection(db, "users"),

            {

                uid: uid,

                email: email,

                role: role,

                createdAt: new Date()

            }

        );


        alert(
            "✅ User berjaya didaftarkan!"
        );


        // CLEAR FORM

        document.getElementById("email")
            .value = "";

        document.getElementById("password")
            .value = "";

        document.getElementById("role")
            .value = "user";


        // RELOAD USER LIST

        loadUsers();


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

};


// =====================================
// OPEN EDIT MODAL
// =====================================

window.editRole = function (id) {


    let user =
        allUsers.find(
            user => user.id === id
        );


    if (!user) {

        alert(
            "User tidak dijumpai."
        );

        return;

    }


    editingUserId = id;


    // EMAIL

    document.getElementById(
        "editEmail"
    ).value =
        user.email || "";


    // CURRENT ROLE

    document.getElementById(
        "editRole"
    ).value =
        user.role || "user";


    // OPEN MODAL

    document
        .getElementById("editModal")
        .classList.add("show");

};


// =====================================
// CLOSE EDIT MODAL
// =====================================

window.closeEditModal = function () {


    document
        .getElementById("editModal")
        .classList.remove("show");


    editingUserId = null;

};


// =====================================
// SAVE EDIT USER
// =====================================

window.saveEditUser = async function () {


    if (!editingUserId) {

        return;

    }


    let newRole =
        document.getElementById(
            "editRole"
        ).value;


    if (
        newRole !== "admin" &&
        newRole !== "user"
    ) {

        alert(
            "Role tidak sah."
        );

        return;

    }


    try {


        await updateDoc(

            doc(
                db,
                "users",
                editingUserId
            ),

            {

                role: newRole

            }

        );


        alert(
            "✅ Role user berjaya dikemaskini!"
        );


        closeEditModal();


        loadUsers();


    } catch (error) {

        console.error(error);

        alert(
            "Gagal mengemaskini user.\n\n" +
            error.message
        );

    }

};


// =====================================
// DELETE USER
// =====================================

window.deleteUser = async function (id) {


    let user =
        allUsers.find(
            user => user.id === id
        );


    let email =
        user
            ? user.email
            : "user ini";


    let confirmDelete = confirm(

        "⚠️ Pasti mahu delete user ini?\n\n" +
        email

    );


    if (!confirmDelete) {

        return;

    }


    try {


        await deleteDoc(

            doc(
                db,
                "users",
                id
            )

        );


        alert(
            "✅ User dipadam."
        );


        loadUsers();


    } catch (error) {

        console.error(error);

        alert(
            "Gagal memadam user.\n\n" +
            error.message
        );

    }

};


// =====================================
// SEARCH USER
// =====================================

window.searchUser = function () {


    let value =
        document.getElementById("search")
        .value
        .toLowerCase()
        .trim();


    let table =
        document.getElementById(
            "userList"
        );


    table.innerHTML = "";


    let filteredUsers =
        allUsers.filter(user =>

            (user.email || "")
                .toLowerCase()
                .includes(value)

        );


    if (filteredUsers.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="text-align:center;">

                    Tiada pengguna dijumpai.

                </td>

            </tr>

        `;

        return;

    }


    filteredUsers.forEach(user => {


        let badge;


        if (user.role === "admin") {

            badge = `
                <span class="role-admin">
                    👑 Admin
                </span>
            `;

        } else {

            badge = `
                <span class="role-user">
                    🙋 User
                </span>
            `;

        }


        table.innerHTML += `

            <tr>

                <td>
                    ${user.email || "-"}
                </td>

                <td>
                    ${badge}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editRole('${user.id}')">

                        ✏️ Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteUser('${user.id}')">

                        🗑 Delete

                    </button>

                </td>

            </tr>

        `;

    });

};


// =====================================
// CLOSE MODAL WHEN CLICK OUTSIDE
// =====================================

document
    .getElementById("editModal")
    .addEventListener(
        "click",
        function (event) {

            if (event.target === this) {

                closeEditModal();

            }

        }
    );


// =====================================
// START SYSTEM
// =====================================

loadUsers();
