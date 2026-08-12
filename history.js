// =====================================================
// SMART CLASSROOM
// HISTORY SYSTEM
// history.js
//
// Fungsi:
// - Ambil history dari Firestore
// - Papar history
// - Admin boleh delete
// =====================================================


// =====================================================
// FIREBASE IMPORT
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCc45wk-89MHpHdIj9q8TREUzFHHJWu24Q",

    authDomain:
        "smart-classroom-351a3.firebaseapp.com",

    projectId:
        "smart-classroom-351a3",

    storageBucket:
        "smart-classroom-351a3.firebasestorage.app",

    messagingSenderId:
        "1031651524426",

    appId:
        "1:1031651524426:web:327b07e9d3f97c8ec78bb3"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


// =====================================================
// GET LOGIN USER
// =====================================================

const user =
    JSON.parse(
        localStorage.getItem(
            "loginUser"
        )
    );


if (!user) {

    window.location.href =
        "userlogin.html";

}


// =====================================================
// WELCOME
// =====================================================

const welcome =
    document.getElementById(
        "welcome"
    );


if (welcome) {

    welcome.innerHTML =
        "Smart Classroom Control System";

}


// =====================================================
// ROLE MENU
// =====================================================

if (
    user &&
    user.role !== "admin"
) {


    const dashboardMenu =
        document.getElementById(
            "dashboardMenu"
        );


    const manageMenu =
        document.getElementById(
            "manageMenu"
        );


    if (dashboardMenu) {

        dashboardMenu.style.display =
            "none";

    }


    if (manageMenu) {

        manageMenu.style.display =
            "none";

    }

}


// =====================================================
// LOAD HISTORY
// =====================================================

async function loadHistory() {


    const table =
        document.getElementById(
            "historyTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="7">

                ⏳ Memuatkan history...

            </td>

        </tr>

    `;


    try {


        // =====================================
        // FIRESTORE QUERY
        // =====================================

        const historyRef =
            collection(
                db,
                "history"
            );


        const q =
            query(
                historyRef,
                orderBy(
                    "timestamp",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        console.log(
            "Jumlah history:",
            snapshot.size
        );


        // =====================================
        // TIADA DATA
        // =====================================

        if (
            snapshot.empty
        ) {


            table.innerHTML = `

                <tr>

                    <td colspan="7">

                        Tiada rekod penggunaan lampu

                    </td>

                </tr>

            `;


            return;

        }


        // =====================================
        // CLEAR TABLE
        // =====================================

        table.innerHTML = "";


        // =====================================
        // DISPLAY DATA
        // =====================================

        snapshot.forEach(
            function(data) {


                const history =
                    data.data();


                const documentId =
                    data.id;


                let deleteButton =
                    "";


                // =================================
                // ADMIN DELETE
                // =================================

                if (
                    user.role === "admin"
                ) {


                    deleteButton = `

                        <button

                            class="delete-btn"

                            onclick="deleteHistory('${documentId}')">

                            🗑 Delete

                        </button>

                    `;

                }


                else {


                    deleteButton =
                        "🔒 Tiada akses";

                }


                // =================================
                // CREATE ROW
                // =================================

                table.innerHTML += `

                    <tr>

                        <td>

                            👤 ${
                                history.user ||
                                history.email ||
                                "Unknown"
                            }

                        </td>


                        <td>

                            ${
                                history.role ||
                                "user"
                            }

                        </td>


                        <td>

                            ${
                                history.date ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                history.start ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                history.end ||
                                "-"
                            }

                        </td>


                        <td>

                            ${
                                history.duration ||
                                "-"
                            }

                        </td>


                        <td>

                            ${deleteButton}

                        </td>

                    </tr>

                `;

            }
        );


    }

    catch(error) {


        console.error(
            "❌ Firestore History Error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="7">

                    ❌ Gagal mengambil data Firebase

                </td>

            </tr>

        `;


        alert(

            "❌ Gagal mengambil History Firebase\n\n" +

            error.code +
            "\n\n" +
            error.message

        );

    }

}


// =====================================================
// DELETE HISTORY
// =====================================================

async function deleteHistory(
    documentId
) {


    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    // =====================================
    // ADMIN CHECK
    // =====================================

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {


        alert(
            "❌ Hanya Admin boleh delete"
        );


        return;

    }


    // =====================================
    // CONFIRM
    // =====================================

    const confirmDelete =
        confirm(
            "Adakah anda pasti mahu delete rekod ini?"
        );


    if (!confirmDelete) {

        return;

    }


    try {


        await deleteDoc(

            doc(
                db,
                "history",
                documentId
            )

        );


        alert(
            "✅ Rekod berjaya dipadam"
        );


        // Reload history

        loadHistory();


    }

    catch(error) {


        console.error(
            "❌ Delete Error:",
            error
        );


        alert(

            "❌ Gagal delete rekod\n\n" +

            error.code +
            "\n\n" +
            error.message

        );

    }

}


// =====================================================
// MAKE DELETE AVAILABLE TO HTML
// =====================================================

window.deleteHistory =
    deleteHistory;


// =====================================================
// LOAD PAGE
// =====================================================

window.addEventListener(
    "load",
    function() {

        loadHistory();

    }
);
