// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal lampu melalui Firebase
// - Setiap bilik mempunyai status sendiri
// - ESP32 melalui Firestore
// - Timer setiap bilik
// - History Firestore
// - Lokasi bilik
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
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LOCATION =
    "Bilik Kuliah DB";


// =====================================================
// SEMUA LOKASI
// =====================================================

const LOCATIONS = [

    "Bilik Kuliah DB",

    "Bilik ICT 1",

    "Bilik ICT 4"

];


// =====================================================
// LOCATION ID
// =====================================================

function getLocationId(location) {

    return location
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

}


// =====================================================
// FIRESTORE DOCUMENT MENGIKUT BILIK
// =====================================================

function getRoomDocument(location) {

    const locationId =
        getLocationId(location);

    return doc(
        db,
        "devices",
        locationId
    );

}


// =====================================================
// GET SELECTED LOCATION
// =====================================================

function getSelectedLocation() {

    const saved =
        localStorage.getItem(
            "selectedLocation"
        );

    if (
        saved &&
        LOCATIONS.includes(saved)
    ) {

        return saved;

    }

    return DEFAULT_LOCATION;

}


// =====================================================
// SET LOCATION
// =====================================================

function setLocation(location) {

    if (
        !location ||
        !LOCATIONS.includes(location)
    ) {

        location =
            DEFAULT_LOCATION;

    }


    localStorage.setItem(
        "selectedLocation",
        location
    );


    const currentLocation =
        document.getElementById(
            "currentLocation"
        );

    if (currentLocation) {

        currentLocation.innerHTML =
            location;

    }


    const systemLocation =
        document.getElementById(
            "systemLocation"
        );

    if (systemLocation) {

        systemLocation.innerHTML =
            location;

    }

}


// =====================================================
// ROOM STATUS STORAGE
// =====================================================

function getRoomStatuses() {

    return JSON.parse(
        localStorage.getItem(
            "roomStatuses"
        )
    ) || {};

}


function saveRoomStatuses(statuses) {

    localStorage.setItem(
        "roomStatuses",
        JSON.stringify(statuses)
    );

}


function getRoomStatus(location) {

    const statuses =
        getRoomStatuses();

    return statuses[location] || "OFF";

}


function setRoomStatus(
    location,
    status
) {

    const statuses =
        getRoomStatuses();

    statuses[location] =
        status;

    saveRoomStatuses(
        statuses
    );

}


// =====================================================
// ROOM START TIME STORAGE
// =====================================================

function getRoomStartTimes() {

    return JSON.parse(
        localStorage.getItem(
            "roomStartTimes"
        )
    ) || {};

}


function saveRoomStartTimes(
    startTimes
) {

    localStorage.setItem(
        "roomStartTimes",
        JSON.stringify(
            startTimes
        )
    );

}


function getRoomStartTime(location) {

    const startTimes =
        getRoomStartTimes();

    return startTimes[location] || null;

}


function setRoomStartTime(
    location,
    time
) {

    const startTimes =
        getRoomStartTimes();

    startTimes[location] =
        time;

    saveRoomStartTimes(
        startTimes
    );

}


function removeRoomStartTime(
    location
) {

    const startTimes =
        getRoomStartTimes();

    delete startTimes[location];

    saveRoomStartTimes(
        startTimes
    );

}


// =====================================================
// TIMER
// =====================================================

let timer = null;


// =====================================================
// GET TIMER SECONDS
// =====================================================

function getTimerSeconds(location) {

    const startTime =
        getRoomStartTime(location);

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

    const location =
        getSelectedLocation();

    const seconds =
        getTimerSeconds(
            location
        );


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

        clearInterval(timer);

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
// SEND COMMAND KE BILIK TERTENTU
// =====================================================

async function sendESP32Command(
    command,
    location
) {

    console.log(
        "📡 Hantar command:",
        command,
        "Lokasi:",
        location
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


    // =================================================
    // CHECK LOCATION
    // =================================================

    if (
        !location ||
        !LOCATIONS.includes(location)
    ) {

        alert(
            "❌ Lokasi bilik tidak sah."
        );

        return false;

    }


    try {

        // =============================================
        // DOKUMEN IKUT LOKASI
        // =============================================

        const roomDocument =
            getRoomDocument(
                location
            );


        // =============================================
        // SIMPAN COMMAND
        // =============================================

        await setDoc(

            roomDocument,

            {

                location:
                    location,

                command:
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
            command,
            location
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

    const location =
        getSelectedLocation();


    console.log(
        "💡 Lampu ON:",
        location
    );


    // =================================================
    // CHECK STATUS BILIK
    // =================================================

    if (
        getRoomStatus(location) === "ON"
    ) {

        alert(
            "💡 Lampu " +
            location +
            " sudah ON."
        );

        return;

    }


    // =================================================
    // HANTAR COMMAND
    // =================================================

    const sent =
        await sendESP32Command(
            "ON",
            location
        );


    if (!sent) {

        return;

    }


    // =================================================
    // SAVE STATUS BILIK
    // =================================================

    setRoomStatus(
        location,
        "ON"
    );


    // =================================================
    // SAVE START TIME BILIK
    // =================================================

    setRoomStartTime(
        location,
        new Date().toISOString()
    );


    // =================================================
    // UPDATE UI
    // =================================================

    updateLampUI(
        location
    );


    // =================================================
    // LOG
    // =================================================

    addLog(
        "💡 Lampu ON",
        "Berjaya",
        location
    );


    // =================================================
    // TIMER
    // =================================================

    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

async function lampOff() {

    const location =
        getSelectedLocation();


    console.log(
        "💡 Lampu OFF:",
        location
    );


    // =================================================
    // CHECK STATUS
    // =================================================

    if (
        getRoomStatus(location) === "OFF"
    ) {

        alert(
            "💡 Lampu " +
            location +
            " sudah OFF."
        );

        return;

    }


    // =================================================
    // HANTAR COMMAND
    // =================================================

    const sent =
        await sendESP32Command(
            "OFF",
            location
        );


    if (!sent) {

        return;

    }


    // =================================================
    // SAVE HISTORY
    // =================================================

    await saveHistory(
        location
    );


    // =================================================
    // UPDATE STATUS
    // =================================================

    setRoomStatus(
        location,
        "OFF"
    );


    // =================================================
    // REMOVE START TIME
    // =================================================

    removeRoomStartTime(
        location
    );


    // =================================================
    // UPDATE UI
    // =================================================

    updateLampUI(
        location
    );


    // =================================================
    // LOG
    // =================================================

    addLog(
        "💡 Lampu OFF",
        "Berjaya",
        location
    );


    // =================================================
    // UPDATE TIMER
    // =================================================

    updateTimerDisplay();

}


// =====================================================
// UPDATE LAMP UI
// =====================================================

function updateLampUI(location) {

    const status =
        getRoomStatus(
            location
        );


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
    // ON
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
                location;

        }

    }


    // =================================================
    // OFF
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
                "Tiada lampu dibuka";

        }

    }


    updateTimerDisplay();

}


// =====================================================
// SAVE HISTORY TO FIRESTORE
// =====================================================

async function saveHistory(
    location
) {

    console.log(
        "🔥 SAVE HISTORY START:",
        location
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
        getRoomStartTime(
            location
        );


    if (!startValue) {

        console.error(
            "❌ Start time tidak dijumpai:",
            location
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
            location,

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
            "📍 History disimpan:",
            location
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
    status,
    location
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
            location ||
            getSelectedLocation(),

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

    const location =
        getSelectedLocation();


    setLocation(
        location
    );


    updateLampUI(
        location
    );

}


// =====================================================
// LOCATION SELECT EVENT
// =====================================================

function setupLocation() {

    const locationSelect =
        document.getElementById(
            "locationSelect"
        );


    if (!locationSelect) {

        return;

    }


    // =================================================
    // LOAD LOCATION
    // =================================================

    const savedLocation =
        getSelectedLocation();


    locationSelect.value =
        savedLocation;


    setLocation(
        savedLocation
    );


    // =================================================
    // LOCATION CHANGE
    // =================================================

    locationSelect.addEventListener(

        "change",

        function() {

            const newLocation =
                this.value;


            console.log(
                "📍 Lokasi dipilih:",
                newLocation
            );


            setLocation(
                newLocation
            );


            // =========================================
            // PAPAR STATUS BILIK YANG DIPILIH
            // =========================================

            updateLampUI(
                newLocation
            );


            // =========================================
            // UPDATE TIMER BILIK TERSEBUT
            // =========================================

            updateTimerDisplay();

        }

    );

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


        setupLocation();

        loadLampStatus();

        startTimer();

    }

);


// =====================================================
// MAKE FUNCTIONS AVAILABLE
// =====================================================

window.lampOn =
    lampOn;


window.lampOff =
    lampOff;