// =====================================================
// SMART CLASSROOM
// HISTORY SYSTEM
// history.js
//
// Fungsi:
// - Ambil history Firestore
// - Papar history
// - Papar lokasi bilik
// - Kira jumlah sesi
// - Kira jumlah penggunaan
// - Kira sesi hari ini
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
// LOGIN USER
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
// DURATION TO SECONDS
// =====================================================

function durationToSeconds(
    duration
) {

    if (!duration) {

        return 0;

    }


    const parts =
        String(duration).split(":");


    if (
        parts.length !== 3
    ) {

        return 0;

    }


    const hour =
        Number(parts[0]) || 0;


    const minute =
        Number(parts[1]) || 0;


    const second =
        Number(parts[2]) || 0;


    return (

        (hour * 3600) +

        (minute * 60) +

        second

    );

}


// =====================================================
// FORMAT DURATION
// =====================================================

function formatDuration(
    totalSeconds
) {

    totalSeconds =
        Math.max(
            0,
            Math.floor(
                totalSeconds
            )
        );


    const hour =
        Math.floor(
            totalSeconds / 3600
        );


    const minute =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const second =
        totalSeconds % 60;


    return (

        String(hour).padStart(
            2,
            "0"
        ) +

        ":" +

        String(minute).padStart(
            2,
            "0"
        ) +

        ":" +

        String(second).padStart(
            2,
            "0"
        )

    );

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

            <td
                colspan="8"
                class="no-record">

                ⏳ Memuatkan history...

            </td>

        </tr>

    `;


    try {

        // =================================================
        // FIRESTORE
        // =================================================

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


        // =================================================
        // SUMMARY
        // =================================================

        let totalSessions =
            0;


        let totalDurationSeconds =
            0;


        let todaySessions =
            0;


        const today =
            new Date();


        const todayDate =

            today.getDate() +
            "/" +
            (
                today.getMonth() + 1
            ) +
            "/" +
            today.getFullYear();


        // =================================================
        // EMPTY
        // =================================================

        if (
            snapshot.empty
        ) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="no-record">

                        Tiada rekod penggunaan lampu

                    </td>

                </tr>

            `;


            updateSummary(
                0,
                0,
                0
            );


            return;

        }


        // =================================================
        // CLEAR
        // =================================================

        table.innerHTML = "";


        // =================================================
        // DISPLAY
        // =================================================

        snapshot.forEach(
            function(data) {

                const history =
                    data.data();


                const documentId =
                    data.id;


                // =========================================
                // SESSION
                // =========================================

                totalSessions++;


                // =========================================
                // DURATION
                // =========================================

                const durationSeconds =
                    durationToSeconds(
                        history.duration
                    );


                totalDurationSeconds +=
                    durationSeconds;


                // =========================================
                // TODAY
                // =========================================

                if (
                    history.date ===
                    todayDate
                ) {

                    todaySessions++;

                }


                // =========================================
                // LOCATION
                // =========================================

                const location =
                    history.location ||
                    "Bilik Kuliah DB";


                // =========================================
                // DELETE
                // =========================================

                let deleteButton =
                    "";


                if (
                    user.role === "admin"
                ) {

                    deleteButton = `

                        <button

                            class="delete-btn"

                            onclick="
                                deleteHistory(
                                    '${documentId}'
                                )
                            ">

                            🗑 Delete

                        </button>

                    `;

                }

                else {

                    deleteButton =
                        "🔒 Tiada akses";

                }


                // =========================================
                // ROW
                // =========================================

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

                            📍 ${location}

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


        // =================================================
        // SUMMARY
        // =================================================

        updateSummary(

            totalSessions,

            totalDurationSeconds,

            todaySessions

        );

    }


    catch(error) {

        console.error(
            "❌ Firestore History Error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="no-record">

                    ❌ Gagal mengambil data Firebase

                </td>

            </tr>

        `;


        updateSummary(
            0,
            0,
            0
        );


        alert(

            "❌ Gagal mengambil History Firebase\n\n" +

            error.code +

            "\n\n" +

            error.message

        );

    }

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary(
    totalSessions,
    totalDurationSeconds,
    todaySessions
) {

    const totalSessionsBox =
        document.getElementById(
            "totalSessions"
        );


    if (totalSessionsBox) {

        totalSessionsBox.innerHTML =
            totalSessions;

    }


    const totalDurationBox =
        document.getElementById(
            "totalDuration"
        );


    if (totalDurationBox) {

        totalDurationBox.innerHTML =
            formatDuration(
                totalDurationSeconds
            );

    }


    const todaySessionsBox =
        document.getElementById(
            "todaySessions"
        );


    if (todaySessionsBox) {

        todaySessionsBox.innerHTML =
            todaySessions;

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


    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "❌ Hanya Admin boleh delete"
        );


        return;

    }


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
// MAKE AVAILABLE
// =====================================================

window.deleteHistory =
    deleteHistory;


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function() {

        loadHistory();

    }
);