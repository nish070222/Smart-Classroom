// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu
// - ESP32
// - Timer
// - History Firestore
// - Lokasi Bilik
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
// DEFAULT LOCATION
// =====================================================

const DEFAULT_LOCATION =
    "Bilik Kuliah DB";


// =====================================================
// GET SELECTED LOCATION
// =====================================================

function getSelectedLocation() {

    const saved =
        localStorage.getItem(
            "selectedLocation"
        );

    return saved || DEFAULT_LOCATION;

}


// =====================================================
// GET ACTIVE LOCATION
// =====================================================

function getActiveLocation() {

    const active =
        localStorage.getItem(
            "activeLocation"
        );

    return active || getSelectedLocation();

}


// =====================================================
// SET LOCATION
// =====================================================

function setLocation(location) {

    if (!location) {

        location =
            DEFAULT_LOCATION;

    }

    // Lokasi yang dipilih user
    localStorage.setItem(
        "selectedLocation",
        location
    );


    // Update paparan pada page
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


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );

    if (
        dashLocation &&
        localStorage.getItem("lampStatus") === "ON"
    ) {

        dashLocation.innerHTML =
            location;

    }

}


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


    const result =
        hour +
        ":" +
        minute +
        ":" +
        second;


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

    const location =
        getSelectedLocation();


    console.log(
        "💡 Lampu ON:",
        location
    );


    // =================================================
    // SIMPAN LOKASI AKTIF
    // =================================================

    localStorage.setItem(
        "activeLocation",
        location
    );


    localStorage.setItem(
        "selectedLocation",
        location
    );


    // =================================================
    // ESP32
    // =================================================

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


    // =================================================
    // UPDATE LAMP STATUS
    // =================================================

    const lamp =
        document.getElementById(
            "lampStatus"
        );

    if (lamp) {

        lamp.innerHTML =
            "ON";

        lamp.style.color =
            "green";

    }


    const dashLamp =
        document.getElementById(
            "dashLamp"
        );

    if (dashLamp) {

        dashLamp.innerHTML =
            "ON";

        dashLamp.style.color =
            "green";

    }


    // =================================================
    // UPDATE LOCATION
    // =================================================

    setLocation(
        location
    );


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );

    if (dashLocation) {

        dashLocation.innerHTML =
            location;

    }


    // =================================================
    // SAVE STATUS
    // =================================================

    localStorage.setItem(
        "lampStatus",
        "ON"
    );


    // =================================================
    // SAVE START TIME
    // =================================================

    const start =
        new Date();

    localStorage.setItem(
        "startTime",
        start.toISOString()
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

function lampOff() {

    const location =
        getActiveLocation();


    console.log(
        "💡 Lampu OFF:",
        location
    );


    // =================================================
    // ESP32
    // =================================================

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


    // =================================================
    // UPDATE UI
    // =================================================

    const lamp =
        document.getElementById(
            "lampStatus"
        );

    if (lamp) {

        lamp.innerHTML =
            "OFF";

        lamp.style.color =
            "red";

    }


    const dashLamp =
        document.getElementById(
            "dashLamp"
        );

    if (dashLamp) {

        dashLamp.innerHTML =
            "OFF";

        dashLamp.style.color =
            "red";

    }


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );

    if (dashLocation) {

        dashLocation.innerHTML =
            "Tiada lampu dibuka";

    }


    // =================================================
    // SAVE STATUS
    // =================================================

    localStorage.setItem(
        "lampStatus",
        "OFF"
    );


    // =================================================
    // STOP TIMER
    // =================================================

    stopTimer();


    // =================================================
    // SAVE HISTORY
    // =================================================

    saveHistory(
        location
    );


    // =================================================
    // RESET TIMER
    // =================================================

    seconds = 0;

    localStorage.setItem(
        "lampTime",
        0
    );

    updateTimerDisplay();


    // =================================================
    // LOG
    // =================================================

    addLog(
        "💡 Lampu OFF",
        "Berjaya",
        location
    );


    // =================================================
    // REMOVE ACTIVE LOCATION
    // =================================================

    localStorage.removeItem(
        "activeLocation"
    );

}


// =====================================================
// SAVE HISTORY TO FIRESTORE
// =====================================================

async function saveHistory(
    location
) {

    console.log(
        "🔥 SAVE HISTORY START"
    );


    // =================================================
    // FIREBASE AUTH
    // =================================================

    if (!auth.currentUser) {

        console.error(
            "❌ Firebase Auth User = NULL"
        );

        alert(
            "❌ Firebase Authentication tidak aktif.\n\nSila logout dan login semula."
        );

        return;

    }


    // =================================================
    // START TIME
    // =================================================

    const startValue =
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


    const start =
        new Date(
            startValue
        );


    // =================================================
    // END TIME
    // =================================================

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


    let hour =
        Math.floor(
            total / 3600
        );


    let minute =
        Math.floor(
            (total % 3600) / 60
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
    // FIRESTORE DATA
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
            location ||
            getSelectedLocation(),

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
            hour +
            ":" +
            minute +
            ":" +
            second,

        timestamp:
            serverTimestamp()

    };


    console.log(
        "📦 History Data:",
        historyData
    );


    // =================================================
    // SEND FIRESTORE
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
            "✅ HISTORY BERJAYA DISIMPAN!",
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


        // =================================================
        // REMOVE START TIME
        // =================================================

        localStorage.removeItem(
            "startTime"
        );


        alert(
            "✅ History berjaya disimpan!\n\n📍 " +
            location
        );

    }


    catch(error) {

        console.error(
            "❌ FIRESTORE ERROR:",
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

    const status =
        localStorage.getItem(
            "lampStatus"
        );


    const selectedLocation =
        getSelectedLocation();


    const activeLocation =
        getActiveLocation();


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


    const currentLocation =
        document.getElementById(
            "currentLocation"
        );


    const systemLocation =
        document.getElementById(
            "systemLocation"
        );


    // =================================================
    // PAPAR LOKASI YANG DIPILIH
    // =================================================

    if (currentLocation) {

        currentLocation.innerHTML =
            selectedLocation;

    }


    if (systemLocation) {

        systemLocation.innerHTML =
            selectedLocation;

    }


    // =================================================
    // LAMP ON
    // =================================================

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


        if (dashLocation) {

            dashLocation.innerHTML =
                activeLocation;

        }


        startTimer();

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
                "Tiada lampu dibuka";

        }


        stopTimer();

    }

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
    // LOAD SAVED LOCATION
    // =================================================

    const savedLocation =
        getSelectedLocation();


    locationSelect.value =
        savedLocation;


    setLocation(
        savedLocation
    );


    // =================================================
    // USER TUKAR LOKASI
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


            // Simpan lokasi baru
            localStorage.setItem(
                "selectedLocation",
                newLocation
            );


            // Update UI
            setLocation(
                newLocation
            );


            // Jika lampu masih ON,
            // lokasi aktif turut berubah
            if (
                localStorage.getItem(
                    "lampStatus"
                ) === "ON"
            ) {

                localStorage.setItem(
                    "activeLocation",
                    newLocation
                );


                const dashLocation =
                    document.getElementById(
                        "dashLocation"
                    );


                if (dashLocation) {

                    dashLocation.innerHTML =
                        newLocation;

                }

            }

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
            "Smart Classroom script loaded"
        );


        updateTimerDisplay();


        setupLocation();


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