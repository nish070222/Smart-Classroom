// =====================================================
// SMART CLASSROOM
// DASHBOARD FIREBASE STATISTICS
// dashboard.js
//
// Fungsi:
// - Ambil history dari Firestore
// - Kira jumlah sesi
// - Kira jumlah penggunaan
// - Kira penggunaan hari ini
// - Delete semua history
// =====================================================


// =====================================================
// FIREBASE IMPORT
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc
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

const db =
    getFirestore(app);


// =====================================================
// CONVERT HH:MM:SS
// TO SECONDS
// =====================================================

function durationToSeconds(duration) {

    if (!duration) {

        return 0;

    }


    const parts =
        String(duration).split(":");


    if (parts.length !== 3) {

        return 0;

    }


    const hours =
        Number(parts[0]) || 0;

    const minutes =
        Number(parts[1]) || 0;

    const seconds =
        Number(parts[2]) || 0;


    return (
        (hours * 3600) +
        (minutes * 60) +
        seconds
    );

}


// =====================================================
// FORMAT SECONDS
// TO HH:MM:SS
// =====================================================

function formatDuration(totalSeconds) {

    totalSeconds =
        Math.max(
            0,
            Math.floor(totalSeconds)
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    return (

        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")

    );

}


// =====================================================
// LOAD FIREBASE STATISTICS
// =====================================================

async function loadFirebaseStatistics() {

    try {

        console.log(
            "🔥 Mengambil statistik Firebase..."
        );


        const historyRef =
            collection(
                db,
                "history"
            );


        const snapshot =
            await getDocs(
                historyRef
            );


        let totalSessions = 0;

        let totalSeconds = 0;

        let todaySessions = 0;


        // =================================================
        // TODAY
        // =================================================

        const today =
            new Date();


        const todayString =

            today.getDate() +
            "/" +
            (
                today.getMonth() + 1
            ) +
            "/" +
            today.getFullYear();


        // =================================================
        // READ FIRESTORE
        // =================================================

        snapshot.forEach(
            function(data) {

                const history =
                    data.data();


                totalSessions++;


                totalSeconds +=
                    durationToSeconds(
                        history.duration
                    );


                if (
                    history.date ===
                    todayString
                ) {

                    todaySessions++;

                }

            }
        );


        // =================================================
        // DISPLAY TOTAL SESSION
        // =================================================

        const totalSessionsBox =
            document.getElementById(
                "totalSessions"
            );


        if (totalSessionsBox) {

            totalSessionsBox.innerHTML =
                totalSessions;

        }


        // =================================================
        // DISPLAY TOTAL USAGE
        // =================================================

        const totalUsageBox =
            document.getElementById(
                "totalUsage"
            );


        if (totalUsageBox) {

            totalUsageBox.innerHTML =
                formatDuration(
                    totalSeconds
                );

        }


        // =================================================
        // DISPLAY TODAY
        // =================================================

        const todaySessionsBox =
            document.getElementById(
                "todaySessions"
            );


        if (todaySessionsBox) {

            todaySessionsBox.innerHTML =
                todaySessions;

        }


        console.log(
            "📊 Total Sessions:",
            totalSessions
        );


        console.log(
            "⏱ Total Usage:",
            formatDuration(
                totalSeconds
            )
        );


        console.log(
            "📅 Today Sessions:",
            todaySessions
        );

    }

    catch(error) {

        console.error(
            "❌ Firebase Statistics Error:",
            error
        );

    }

}


// =====================================================
// DELETE ALL FIRESTORE HISTORY
// =====================================================

async function deleteAllHistory() {

    try {

        console.log(
            "🗑️ Memadam semua history Firestore..."
        );


        const historyRef =
            collection(
                db,
                "history"
            );


        const snapshot =
            await getDocs(
                historyRef
            );


        // =================================================
        // DELETE EVERY DOCUMENT
        // =================================================

        const deletePromises = [];


        snapshot.forEach(
            function(historyDoc) {

                deletePromises.push(

                    deleteDoc(

                        doc(
                            db,
                            "history",
                            historyDoc.id
                        )

                    )

                );

            }
        );


        await Promise.all(
            deletePromises
        );


        console.log(
            "✅ Semua history Firestore berjaya dipadam"
        );


        // =================================================
        // CLEAR LOCAL HISTORY
        // =================================================

        localStorage.removeItem(
            "history"
        );


        // =================================================
        // RESET STATISTICS
        // =================================================

        const totalSessions =
            document.getElementById(
                "totalSessions"
            );


        const totalUsage =
            document.getElementById(
                "totalUsage"
            );


        const todaySessions =
            document.getElementById(
                "todaySessions"
            );


        if (totalSessions) {

            totalSessions.innerHTML =
                "0";

        }


        if (totalUsage) {

            totalUsage.innerHTML =
                "00:00:00";

        }


        if (todaySessions) {

            todaySessions.innerHTML =
                "0";

        }


        // =================================================
        // REMOVE ACTIVITY LOG
        // =================================================

        localStorage.removeItem(
            "logs"
        );


        // =================================================
        // UPDATE LOG TABLE
        // =================================================

        if (
            typeof loadLogs ===
            "function"
        ) {

            loadLogs();

        }


        alert(
            "✅ Semua history dan statistik telah dikosongkan."
        );

    }

    catch(error) {

        console.error(
            "❌ Gagal memadam history:",
            error
        );


        alert(

            "❌ Gagal memadam history Firebase.\n\n" +

            "Code: " +
            error.code +

            "\n\nMessage: " +
            error.message

        );

    }

}


// =====================================================
// MAKE FUNCTION AVAILABLE
// =====================================================

window.deleteAllHistory =
    deleteAllHistory;


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function() {

        loadFirebaseStatistics();

    }
);