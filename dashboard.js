```javascript
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
// - Papar status ESP32
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

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// =====================================================
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LOCATION =
    "Bilik Kuliah DB";


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


                // =========================================
                // HANYA BILIK KULIAH DB
                // =========================================

                if (
                    history.location &&
                    history.location !== DEFAULT_LOCATION
                ) {

                    return;

                }


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
// LOAD ESP32 STATUS
// =====================================================

async function loadESP32Status() {

    try {

        console.log(
            "📡 Membaca status ESP32..."
        );


        const espDocument =
            doc(
                db,
                "devices",
                "esp32"
            );


        const snapshot =
            await getDoc(
                espDocument
            );


        const espStatus =
            document.getElementById(
                "espStatus"
            );


        if (!espStatus) {

            return;

        }


        // =================================================
        // DOCUMENT TAK WUJUD
        // =================================================

        if (!snapshot.exists()) {

            espStatus.innerHTML =
                "🔴 OFFLINE";

            espStatus.style.color =
                "red";

            return;

        }


        const data =
            snapshot.data();


        // =================================================
        // STATUS ESP32
        // =================================================

        if (
            data.status === "ONLINE"
        ) {

            espStatus.innerHTML =
                "🟢 ONLINE";

            espStatus.style.color =
                "green";

        }

        else {

            espStatus.innerHTML =
                "🔴 OFFLINE";

            espStatus.style.color =
                "red";

        }


        console.log(
            "📡 ESP32 Status:",
            data.status
        );

    }


    catch(error) {

        console.error(
            "❌ ESP32 Status Error:",
            error
        );


        const espStatus =
            document.getElementById(
                "espStatus"
            );


        if (espStatus) {

            espStatus.innerHTML =
                "🔴 OFFLINE";

            espStatus.style.color =
                "red";

        }

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
            document.ge
```
