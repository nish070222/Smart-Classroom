
// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu
// - ESP32
// - Timer
// - History Firestore
// - Backup History LocalStorage
// - Log Aktiviti
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
    addDoc,
    serverTimestamp
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
// TIMER
// =====================================================

let timer = null;


let seconds =
    Number(
        localStorage.getItem(
            "lampTime"
        )
    ) || 0;


let running = false;


// =====================================================
// ESP32 IP
// =====================================================

const ESP32_IP =
    "192.168.4.1";


// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {


    let hour =
        Math.floor(
            seconds / 3600
        );


    let minute =
        Math.floor(
            (seconds % 3600) / 60
        );


    let second =
        seconds % 60;


    hour =
        hour < 10
            ? "0" + hour
            : hour;


    minute =
        minute < 10
            ? "0" + minute
            : minute;


    second =
        second < 10
            ? "0" + second
            : second;


    let result =
        hour +
        ":" +
        minute +
        ":" +
        second;


    // INDEX TIMER

    let timerBox =
        document.getElementById(
            "timer"
        );


    if (timerBox) {

        timerBox.innerHTML =
            result;

    }


    // DASHBOARD TIMER

    let dashTimer =
        document.getElementById(
            "dashTimer"
        );


    if (dashTimer) {

        dashTimer.innerHTML =
            result;

    }

}


// =====================================================
// START TIMER
// =====================================================

function startTimer() {


    if (running) {

        return;

    }


    running = true;


    timer =
        setInterval(
            function() {


                seconds++;


                localStorage.setItem(
                    "lampTime",
                    seconds
                );


                updateTimerDisplay();


            },
            1000
        );

}


// =====================================================
// STOP TIMER
// =====================================================

function stopTimer() {


    if (timer) {

        clearInterval(
            timer
        );

    }


    timer = null;


    running = false;

}


// =====================================================
// LAMP ON
// =====================================================

function lampOn() {


    console.log(
        "💡 Lampu ON"
    );


    // =====================================
    // ESP32
    // =====================================

    fetch(
        "http://" +
        ESP32_IP +
        "/lamp/on"
    )

    .then(
        function(response) {

            return response.text();

        }
    )

    .then(
        function(data) {

            console.log(
                "ESP32:",
                data
            );

        }
    )

    .catch(
        function(error) {

            console.log(
                "⚠️ ESP32 tidak disambung"
            );

        }
    );


    // =====================================
    // UPDATE UI
    // =====================================

    let lamp =
        document.getElementById(
            "lampStatus"
        );


    if (lamp) {

        lamp.innerHTML =
            "ON";

        lamp.style.color =
            "green";

    }


    let dashLamp =
        document.getElementById(
            "dashLamp"
        );


    if (dashLamp) {

        dashLamp.innerHTML =
            "ON";

        dashLamp.style.color =
            "green";

    }


    // =====================================
    // SAVE STATUS
    // =====================================

    localStorage.setItem(
        "lampStatus",
        "ON"
    );


    // =====================================
    // SAVE START TIME
    // =====================================

    let start =
        new Date();


    localStorage.setItem(
        "startTime",
        start.toISOString()
    );


    // =====================================
    // LOG
    // =====================================

    addLog(
        "💡 Lampu ON",
        "Berjaya"
    );


    // =====================================
    // TIMER
    // =====================================

    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

function lampOff() {


    console.log(
        "💡 Lampu OFF"
    );


    // =====================================
    // ESP32
    // =====================================

    fetch(
        "http://" +
        ESP32_IP +
        "/lamp/off"
    )

    .then(
        function(response) {

            return response.text();

        }
    )

    .then(
        function(data) {

            console.log(
                "ESP32:",
                data
            );

        }
    )

    .catch(
        function(error) {

            console.log(
                "⚠️ ESP32 tidak disambung"
            );

        }
    );


    // =====================================
    // UPDATE UI
    // =====================================

    let lamp =
        document.getElementById(
            "lampStatus"
        );


    if (lamp) {

        lamp.innerHTML =
            "OFF";

        lamp.style.color =
            "red";

    }


    let dashLamp =
        document.getElementById(
            "dashLamp"
        );


    if (dashLamp) {

        dashLamp.innerHTML =
            "OFF";

        dashLamp.style.color =
            "red";

    }


    // =====================================
    // SAVE STATUS
    // =====================================

    localStorage.setItem(
        "lampStatus",
        "OFF"
    );


    // =====================================
    // STOP TIMER
    // =====================================

    stopTimer();


    // =====================================
    // SAVE HISTORY
    // =====================================

    saveHistory();


    // =====================================
    // RESET TIMER
    // =====================================

    seconds = 0;


    localStorage.setItem(
        "lampTime",
        0
    );


    updateTimerDisplay();


    // =====================================
    // LOG
    // =====================================

    addLog(
        "💡 Lampu OFF",
        "Berjaya"
    );

}


// =====================================================
// SAVE HISTORY TO FIRESTORE
// =====================================================

async function saveHistory() {


    console.log(
        "====================================="
    );


    console.log(
        "🔥 SAVE HISTORY START"
    );


    // =====================================
    // CHECK FIREBASE AUTH
    // =====================================

    console.log(
        "Firebase Auth User:",
        auth.currentUser
    );


    if (!auth.currentUser) {


        console.error(
            "❌ Firebase Auth User = NULL"
        );


        alert(
            "❌ Firebase Authentication tidak aktif.\n\n" +
            "Sila logout dan login semula."
        );


        return;

    }


    // =====================================
    // GET START TIME
    // =====================================

    let startValue =
        localStorage.getItem(
            "startTime"
        );


    if (!startValue) {


        console.error(
            "❌ startTime tidak dijumpai"
        );


        alert(
            "❌ Masa mula lampu tidak dijumpai."
        );


        return;

    }


    // =====================================
    // START TIME
    // =====================================

    let start =
        new Date(
            startValue
        );


    // =====================================
    // END TIME
    // =====================================

    let end =
        new Date();


    // =====================================
    // CALCULATE DURATION
    // =====================================

    let total =
        Math.floor(
            (
                end - start
            ) / 1000
        );


    if (total < 0) {

        total = 0;

    }


    let hour =
        Math.floor(
            total / 3600
        );


    let minute =
        Math.floor(
            (
                total % 3600
            ) / 60
        );


    let second =
        total % 60;


    hour =
        hour < 10
            ? "0" + hour
            : hour;


    minute =
        minute < 10
            ? "0" + minute
            : minute;


    second =
        second < 10
            ? "0" + second
            : second;


    // =====================================
    // GET LOGIN USER
    // =====================================

    let user =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    if (!user) {


        console.error(
            "❌ loginUser tidak dijumpai"
        );


        alert(
            "❌ Maklumat pengguna tidak dijumpai."
        );


        return;

    }


    // =====================================
    // CREATE FIRESTORE DATA
    // =====================================

    let historyData = {


        user:
            user.username ||
            user.email ||
            "Unknown",


        email:
            user.email ||
            auth.currentUser.email ||
            "",


        uid:
            auth.currentUser.uid,


        role:
            user.role ||
            "user",


        date:
            start.getDate() +
            "/" +
            (
                start.getMonth() +
                1
            ) +
            "/" +
            start.getFullYear(),


        start:
            start.getHours() +
            ":" +
            (
                start.getMinutes() < 10
                    ? "0"
                    : ""
            ) +
            start.getMinutes(),


        end:
            end.getHours() +
            ":" +
            (
                end.getMinutes() < 10
                    ? "0"
                    : ""
            ) +
            end.getMinutes(),


        duration:
            hour +
            ":" +
            minute +
            ":" +
            second,


        timestamp:
            serverTimestamp()

    };


    console.log(
        "📦 Data:",
        historyData
    );


    // =====================================
    // SEND TO FIRESTORE
    // =====================================

    try {


        const docRef =
            await addDoc(

                collection(
                    db,
                    "history"
                ),

                historyData

            );


        console.log(
            "====================================="
        );


        console.log(
            "✅ HISTORY BERJAYA DISIMPAN!"
        );


        console.log(
            "Document ID:",
            docRef.id
        );


        // =================================
        // BACKUP LOCALSTORAGE
        // =================================

        let localHistory =
            JSON.parse(
                localStorage.getItem(
                    "history"
                )
            ) || [];


        localHistory.unshift(
            historyData
        );


        localStorage.setItem(

            "history",

            JSON.stringify(
                localHistory
            )

        );


        // =================================
        // REMOVE START TIME
        // =================================

        localStorage.removeItem(
            "startTime"
        );


        alert(
            "✅ History berjaya disimpan ke Firebase!"
        );


    }

    catch(error) {


        console.error(
            "====================================="
        );


        console.error(
            "❌ FIRESTORE ERROR"
        );


        console.error(
            "Error Code:",
            error.code
        );


        console.error(
            "Error Message:",
            error.message
        );


        console.error(
            "Full Error:",
            error
        );


        alert(

            "❌ Gagal simpan History ke Firebase\n\n" +

            "Code: " +
            error.code +

            "\n\n" +

            "Message: " +
            error.message

        );

    }

}


// =====================================================
// ACTIVITY LOG
// =====================================================

function addLog(
    activity,
    status
) {


    let user =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    let logs =
        JSON.parse(
            localStorage.getItem(
                "logs"
            )
        ) || [];


    let now =
        new Date();


    let time =
        now.getHours() +
        ":" +
        (
            now.getMinutes() < 10
                ? "0"
                : ""
        ) +
        now.getMinutes();


    logs.unshift({

        time:
            time,

        user:
            user
                ? (
                    user.username ||
                    user.email
                )
                : "Unknown",

        activity:
            activity,

        status:
            status

    });


    // Maksimum 10 log

    if (
        logs.length > 10
    ) {

        logs.pop();

    }


    localStorage.setItem(
        "logs",
        JSON.stringify(
            logs
        )
    );

}


// =====================================================
// LOAD LAMP STATUS
// =====================================================

function loadLampStatus() {


    let status =
        localStorage.getItem(
            "lampStatus"
        );


    let lamp =
        document.getElementById(
            "lampStatus"
        );


    let dashLamp =
        document.getElementById(
            "dashLamp"
        );


    // =====================================
    // LAMP ON
    // =====================================

    if (
        status === "ON"
    ) {


        if (lamp) {

            lamp.innerHTML =
                "ON";

            lamp.style.color =
                "green";

        }


        if (dashLamp) {

            dashLamp.innerHTML =
                "ON";

            dashLamp.style.color =
                "green";

        }


        startTimer();

    }


    // =====================================
    // LAMP OFF
    // =====================================

    else {


        if (lamp) {

            lamp.innerHTML =
                "OFF";

            lamp.style.color =
                "red";

        }


        if (dashLamp) {

            dashLamp.innerHTML =
                "OFF";

            dashLamp.style.color =
                "red";

        }


        stopTimer();

    }

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function() {


        console.log(
            "Smart Classroom script loaded"
        );


        console.log(
            "Firebase Auth:",
            auth.currentUser
        );


        updateTimerDisplay();


        loadLampStatus();


    }
);


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.lampOn =
    lampOn;


window.lampOff =
    lampOff;