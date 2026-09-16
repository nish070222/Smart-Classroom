// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal lampu melalui Firebase
// - 1 bilik sahaja
// - ESP32 melalui Firestore
// - Timer lampu
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
    serverTimestamp,
    doc,
    setDoc
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
// TETAPAN BILIK
// =====================================================

const DEFAULT_LOCATION =
    "Bilik Kuliah DB";


// =====================================================
// FIRESTORE ESP32
// =====================================================

const ESP32_DOCUMENT =
    doc(
        db,
        "devices",
        "esp32"
    );


// =====================================================
// STATUS LAMPU
// =====================================================

function getLampStatus() {

    return localStorage.getItem(
        "lampStatus"
    ) || "OFF";

}


function setLampStatus(status) {

    localStorage.setItem(
        "lampStatus",
        status
    );

}


// =====================================================
// START TIME
// =====================================================

function getStartTime() {

    return localStorage.getItem(
        "lampStartTime"
    ) || null;

}


function setStartTime(time) {

    localStorage.setItem(
        "lampStartTime",
        time
    );

}


function removeStartTime() {

    localStorage.removeItem(
        "lampStartTime"
    );

}


// =====================================================
// TIMER
// =====================================================

let timer = null;


// =====================================================
// GET TIMER SECONDS
// =====================================================

function getTimerSeconds() {

    const startTime =
        getStartTime();


    if (!startTime) {

        return 0;

    }


    const start =
        new Date(startTime);

    const now =
        new Date();


    const total =
        Math.floor(
            (now - start) / 1000
        );


    return total > 0
        ? total
        : 0;

}


// =====================================================
// FORMAT TIMER
// =====================================================

function formatTime(totalSeconds) {

    let hour =
        Math.floor(
            totalSeconds / 3600
        );


    let minute =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    let second =
        totalSeconds % 60;


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


    return (
        hour +
        ":" +
        minute +
        ":" +
        second
    );

}


// =====================================================
// UPDATE TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    const status =
        getLampStatus();


    let seconds = 0;


    if (status === "ON") {

        seconds =
            getTimerSeconds();

    }


    const result =
        formatTime(seconds);


    const timerBox =
        document.getElementById(
            "timer"
        );


    if (timerBox) {

        timerBox.innerHTML =
            result;

    }


    const dashTimer =
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

    if (timer) {

        clearInterval(
            timer
        );

    }


    timer =
        setInterval(
            function() {

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

}


// =====================================================
// SET LOCATION DISPLAY
// =====================================================

function setLocation() {

    const currentLocation =
        document.getElementById(
            "currentLocation"
        );


    if (currentLocation) {

        currentLocation.innerHTML =
            DEFAULT_LOCATION;

    }


    const systemLocation =
        document.getElementById(
            "systemLocation"
        );


    if (systemLocation) {

        systemLocation.innerHTML =
            DEFAULT_LOCATION;

    }


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );


    if (dashLocation) {

        dashLocation.innerHTML =
            DEFAULT_LOCATION;

    }

}


// =====================================================
// SEND COMMAND KE ESP32
// =====================================================

async function sendESP32Command(command) {

    console.log(
        "📡 Hantar command:",
        command
    );


    // =================================================
    // CHECK AUTH
    // =================================================

    if (!auth.currentUser) {

        console.error(
            "❌ Firebase Auth User = NULL"
        );


        alert(
            "❌ Firebase Authentication tidak aktif.\n\n" +
            "Sila logout dan login semula."
        );


        return false;

    }


    try {

        await setDoc(

            ESP32_DOCUMENT,

            {

                location:
                    DEFAULT_LOCATION,

                command:
                    command,

                lampStatus:
                    command,

                status:
                    command,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );


        console.log(
            "✅ Command berjaya dihantar:",
            command
        );


        return true;

    }


    catch (error) {

        console.error(
            "❌ Firebase ESP32 Error:",
            error
        );


        alert(

            "❌ Gagal menghantar arahan kepada ESP32.\n\n" +

            "Code: " +
            error.code +

            "\n\nMessage: " +
            error.message

        );


        return false;

    }

}


// =====================================================
// LAMP ON
// =====================================================

async function lampOn() {

    console.log(
        "💡 Lampu ON"
    );


    // =================================================
    // CHECK STATUS
    // =================================================

    if (
        getLampStatus() === "ON"
    ) {

        alert(
            "💡 Lampu sudah ON."
        );

        return;

    }


    // =================================================
    // HANTAR COMMAND
    // =================================================

    const sent =
        await sendESP32Command(
            "ON"
        );


    if (!sent) {

        return;

    }


    // =================================================
    // SAVE STATUS
    // =================================================

    setLampStatus(
        "ON"
    );


    // =================================================
    // SAVE START TIME
    // =================================================

    setStartTime(
        new Date().toISOString()
    );


    // =================================================
    // UPDATE UI
    // =================================================

    updateLampUI();


    // =================================================
    // LOG
    // =================================================

    addLog(
        "💡 Lampu ON",
        "Berjaya"
    );


    // =================================================
    // START TIMER
    // =================================================

    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

async function lampOff() {

    console.log(
        "💡 Lampu OFF"
    );


    // =================================================
    // CHECK STATUS
    // =================================================

    if (
        getLampStatus() === "OFF"
    ) {

        alert(
            "💡 Lampu sudah OFF."
        );

        return;

    }


    // =================================================
    // HANTAR COMMAND
    // =================================================

    const sent =
        await sendESP32Command(
            "OFF"
        );


    if (!sent) {

        return;

    }


    // =================================================
    // SAVE HISTORY
    // =================================================

    await saveHistory();


    // =================================================
    // UPDATE STATUS
    // =================================================

    setLampStatus(
        "OFF"
    );


    // =================================================
    // REMOVE START TIME
    // =================================================

    removeStartTime();


    // =================================================
    // UPDATE UI
    // =================================================

    updateLampUI();


    // =================================================
    // LOG
    // =================================================

    addLog(
        "💡 Lampu OFF",
        "Berjaya"
    );


    // =================================================
    // STOP TIMER
    // =================================================

    stopTimer();

    updateTimerDisplay();

}


// =====================================================
// UPDATE LAMP UI
// =====================================================

function updateLampUI() {

    const status =
        getLampStatus();


    const lamp =
        document.getElementById(
            "lampStatus"
        );


    const dashLamp =
        document.getElementById(
            "dashLamp"
        );


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );


    // =================================================
    // LAMP ON
    // =================================================

    if (status === "ON") {

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


        if (dashLocation) {

            dashLocation.innerHTML =
                DEFAULT_LOCATION;

        }

    }


    // =================================================
    // LAMP OFF
    // =================================================

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


        if (dashLocation) {

            dashLocation.innerHTML =
                DEFAULT_LOCATION;

        }

    }


    updateTimerDisplay();

}


// =====================================================
// SAVE HISTORY TO FIRESTORE
// =====================================================

async function saveHistory() {

    console.log(
        "🔥 SAVE HISTORY START"
    );


    // =================================================
    // AUTH
    // =================================================

    if (!auth.currentUser) {

        console.error(
            "❌ Firebase Auth User = NULL"
        );

        return;

    }


    // =================================================
    // START TIME
    // =================================================

    const startValue =
        getStartTime();


    if (!startValue) {

        console.error(
            "❌ Start time tidak dijumpai"
        );

        return;

    }


    const start =
        new Date(
            startValue
        );


    const end =
        new Date();


    // =================================================
    // DURATION
    // =================================================

    let total =
        Math.floor(
            (
                end - start
            ) / 1000
        );


    if (total < 0) {

        total = 0;

    }


    const duration =
        formatTime(
            total
        );


    // =================================================
    // USER
    // =================================================

    const user =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    if (!user) {

        console.error(
            "❌ loginUser tidak dijumpai"
        );

        return;

    }


    // =================================================
    // HISTORY DATA
    // =================================================

    const historyData = {

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

        location:
            DEFAULT_LOCATION,

        date:
            start.getDate() +
            "/" +
            (
                start.getMonth() + 1
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
            duration,

        timestamp:
            serverTimestamp()

    };


    console.log(
        "📦 History Data:",
        historyData
    );


    // =================================================
    // FIRESTORE
    // =================================================

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
            "✅ HISTORY BERJAYA:",
            docRef.id
        );


        // =================================================
        // BACKUP LOCAL
        // =================================================

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


        console.log(
            "📍 History disimpan"
        );

    }


    catch (error) {

        console.error(
            "❌ FIRESTORE HISTORY ERROR:",
            error
        );


        alert(

            "❌ Gagal simpan History ke Firebase\n\n" +

            "Code: " +
            error.code +

            "\n\nMessage: " +
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

    const user =
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


    const now =
        new Date();


    const time =
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

        location:
            DEFAULT_LOCATION,

        activity:
            activity,

        status:
            status

    });


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

    setLocation();

    updateLampUI();


    if (
        getLampStatus() === "ON"
    ) {

        startTimer();

    }

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(

    "load",

    function() {

        console.log(
            "🚀 Smart Classroom script loaded"
        );


        loadLampStatus();

    }

);


// =====================================================
// MAKE FUNCTIONS AVAILABLE
// =====================================================

window.lampOn =
    lampOn;


window.lampOff =
    lampOff;