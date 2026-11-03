// =====================================================
// SMART CLASSROOM
// DASHBOARD DAILY STATISTICS
// dashboard.js
//
// Fungsi:
// - Papar statistik penggunaan hari ini sahaja
// - Papar status ESP32
// - Admin boleh kosongkan history
// =====================================================


// =====================================================
// FIREBASE IMPORT
// =====================================================

import {
    initializeApp,
    getApp,
    getApps
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    getDoc
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

const app = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

const db = getFirestore(app);


// =====================================================
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LOCATION = "Bilik Kuliah DB";


// =====================================================
// GET TODAY DATE
// FORMAT: D/M/YYYY
// =====================================================

function getTodayString() {

    const today = new Date();

    return (

        today.getDate() +

        "/" +

        (today.getMonth() + 1) +

        "/" +

        today.getFullYear()

    );

}


// =====================================================
// DURATION TO SECONDS
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
// FORMAT DURATION
// =====================================================

function formatDuration(totalSeconds) {

    totalSeconds =
        Math.max(
            0,
            Math.floor(totalSeconds)
        );

    const hours =
        Math.floor(totalSeconds / 3600);

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
// STATISTIK HARI INI SAHAJA
// =====================================================

async function loadFirebaseStatistics() {

    try {

        console.log(
            "Mengambil statistik penggunaan hari ini..."
        );

        const historyRef =
            collection(db, "history");

        const snapshot =
            await getDocs(historyRef);

        const todayString =
            getTodayString();

        let todaySessions = 0;

        let todaySeconds = 0;


        // =================================================
        // READ FIRESTORE
        // =================================================

        snapshot.forEach(function(record) {

            const history =
                record.data();


            // =============================================
            // FILTER LOCATION
            // =============================================

            if (
                history.location &&
                history.location !== DEFAULT_LOCATION
            ) {

                return;

            }


            // =============================================
            // FILTER TARIKH HARI INI
            // =============================================

            if (
                history.date !== todayString
            ) {

                return;

            }


            // =============================================
            // KIRA SESI HARI INI
            // =============================================

            todaySessions++;


            // =============================================
            // KIRA TEMPOH PENGGUNAAN HARI INI
            // =============================================

            todaySeconds +=
                durationToSeconds(
                    history.duration
                );

        });


        // =================================================
        // KIRA PURATA TEMPOH SESI
        // =================================================

        const averageSeconds =
            todaySessions > 0
                ? Math.round(
                    todaySeconds / todaySessions
                )
                : 0;


        // =================================================
        // PAPAR JUMLAH SESI HARI INI
        // =================================================

        const totalSessionsBox =
            document.getElementById(
                "totalSessions"
            );

        if (totalSessionsBox) {

            totalSessionsBox.textContent =
                todaySessions;

        }


        // =================================================
        // PAPAR JUMLAH PENGGUNAAN HARI INI
        // =================================================

        const totalUsageBox =
            document.getElementById(
                "totalUsage"
            );

        if (totalUsageBox) {

            totalUsageBox.textContent =
                formatDuration(
                    todaySeconds
                );

        }


        // =================================================
        // PAPAR PURATA TEMPOH SESI HARI INI
        // =================================================

        const todayAverageBox =
            document.getElementById(
                "todayAverage"
            );

        if (todayAverageBox) {

            todayAverageBox.textContent =
                formatDuration(
                    averageSeconds
                );

        }


        // =================================================
        // CONSOLE
        // =================================================

        console.log(
            "Tarikh statistik:",
            todayString
        );

        console.log(
            "Jumlah sesi hari ini:",
            todaySessions
        );

        console.log(
            "Jumlah penggunaan hari ini:",
            formatDuration(todaySeconds)
        );

        console.log(
            "Purata tempoh sesi:",
            formatDuration(averageSeconds)
        );

    }

    catch(error) {

        console.error(
            "Firebase Statistics Error:",
            error
        );


        const totalSessionsBox =
            document.getElementById("totalSessions");

        const totalUsageBox =
            document.getElementById("totalUsage");

        const todayAverageBox =
            document.getElementById("todayAverage");


        if (totalSessionsBox) {
            totalSessionsBox.textContent = "Ralat";
        }

        if (totalUsageBox) {
            totalUsageBox.textContent = "--:--:--";
        }

        if (todayAverageBox) {
            todayAverageBox.textContent = "--:--:--";
        }

    }

}


// =====================================================
// LOAD ESP32 STATUS
// =====================================================

async function loadESP32Status() {

    const espStatus =
        document.getElementById("espStatus");

    if (!espStatus) {

        return;

    }

    try {

        console.log(
            "Membaca status ESP32..."
        );


        const espDocument =
            doc(
                db,
                "devices",
                "esp32"
            );


        const snapshot =
            await getDoc(espDocument);


        if (!snapshot.exists()) {

            espStatus.textContent = "OFFLINE";

            espStatus.style.color = "red";

            return;

        }


        const data =
            snapshot.data();


        if (data.status === "ONLINE") {

            espStatus.textContent = "ONLINE";

            espStatus.style.color = "green";

        }

        else {

            espStatus.textContent = "OFFLINE";

            espStatus.style.color = "red";

        }


        console.log(
            "ESP32 Status:",
            data.status
        );

    }

    catch(error) {

        console.error(
            "ESP32 Status Error:",
            error
        );

        espStatus.textContent = "OFFLINE";

        espStatus.style.color = "red";

    }

}


// =====================================================
// DELETE ALL FIRESTORE HISTORY
// =====================================================

async function deleteAllHistory() {

    const currentUser =
        JSON.parse(
            localStorage.getItem("loginUser") || "null"
        );


    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        alert(
            "Hanya Admin boleh mengosongkan history."
        );

        return;

    }


    try {

        console.log(
            "Memadam semua history Firestore..."
        );


        const historyRef =
            collection(db, "history");


        const snapshot =
            await getDocs(historyRef);


        const deletePromises = [];


        snapshot.forEach(function(historyDoc) {

            deletePromises.push(

                deleteDoc(

                    doc(
                        db,
                        "history",
                        historyDoc.id
                    )

                )

            );

        });


        await Promise.all(deletePromises);


        localStorage.removeItem("history");

        localStorage.removeItem("logs");


        await loadFirebaseStatistics();


        const activityLog =
            document.getElementById("activityLog");


        if (activityLog) {

            activityLog.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="empty-log">

                        Tiada aktiviti direkodkan

                    </td>

                </tr>

            `;

        }


        alert(
            "Semua history dan log berjaya dikosongkan."
        );

    }

    catch(error) {

        console.error(
            "Delete History Error:",
            error
        );


        alert(

            "Gagal mengosongkan history.\n\n" +

            (error.code || "") +

            "\n" +

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
// INITIAL DASHBOARD
// =====================================================

loadFirebaseStatistics();

loadESP32Status();


// =====================================================
// AUTO UPDATE STATISTICS
// SETIAP 1 MINIT
// =====================================================

setInterval(

    loadFirebaseStatistics,

    60 * 1000

);


// =====================================================
// AUTO UPDATE ESP32
// SETIAP 15 SAAT
// =====================================================

setInterval(

    loadESP32Status,

    15 * 1000

);


// =====================================================
// UPDATE WHEN RETURN TO DASHBOARD
// =====================================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (!document.hidden) {

            loadFirebaseStatistics();

            loadESP32Status();

        }

    }
);