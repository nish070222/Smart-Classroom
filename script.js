// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu melalui Firebase
// - ESP32 melalui Internet
// - ESP32 Status ONLINE / OFFLINE
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
    serverTimestamp,
    doc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "API_KEY_KAU_YANG_SEKARANG",

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
// ESP32 FIRESTORE DOCUMENT
// =====================================================

const ESP32_DOCUMENT =
    doc(
        db,
        "devices",
        "esp32"
    );


// =====================================================
// ESP32 REALTIME STATUS
// =====================================================

function listenESP32Status() {

    onSnapshot(
        ESP32_DOCUMENT,

        function(snapshot) {

            // =========================================
            // DOCUMENT TAK WUJUD
            // =========================================

            if (!snapshot.exists()) {

                console.log(
                    "⚠️ devices/esp32 tidak wujud"
                );

                updateESP32Status(
                    "OFFLINE"
                );

                return;

            }


            // =========================================
            // AMBIL DATA FIRESTORE
            // =========================================

            const data =
                snapshot.data();


            const status =
                data.status ||
                "OFFLINE";


            console.log(
                "📡 ESP32 Status:",
                status
            );


            // =========================================
            // UPDATE WEBSITE
            // =========================================

            updateESP32Status(
                status
            );

        },


        function(error) {

            console.error(
                "❌ ESP32 Status Error:",
                error
            );


            updateESP32Status(
                "OFFLINE"
            );

        }
    );

}


// =====================================================
// UPDATE ESP32 STATUS UI
// =====================================================

function updateESP32Status(
    status
) {

    const espStatus =
        document.getElementById(
            "espStatus"
        );


    // =========================================
    // ELEMENT TAK JUMPA
    // =========================================

    if (!espStatus) {

        console.log(
            "⚠️ #espStatus tidak dijumpai"
        );

        return;

    }


    const currentStatus =
        String(
            status || "OFFLINE"
        ).toUpperCase();


    // =========================================
    // ONLINE
    // =========================================

    if (
        currentStatus ===
        "ONLINE"
    ) {

        espStatus.innerHTML =
            "🟢 ONLINE";


        espStatus.classList.remove(
            "offline"
        );


        espStatus.classList.add(
            "online"
        );

    }


    // =========================================
    // OFFLINE
    // =========================================

    else {

        espStatus.innerHTML =
            "🔴 OFFLINE";


        espStatus.classList.remove(
            "online"
        );


        espStatus.classList.add(
            "offline"
        );

    }

}


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


    return saved ||
        DEFAULT_LOCATION;

}


// =====================================================
// GET ACTIVE LOCATION
// =====================================================

function getActiveLocation() {

    const active =
        localStorage.getItem(
            "activeLocation"
        );


    return active ||
        getSelectedLocation();

}


// =====================================================
// SET LOCATION
// =====================================================

function setLocation(
    location
) {

    if (!location) {

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


    const dashLocation =
        document.getElementById(
            "dashLocation"
        );


    if (
        dashLocation &&
        localStorage.getItem(
            "lampStatus"
        ) === "ON"
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
// SEND COMMAND TO ESP32
// THROUGH FIRESTORE
// =====================================================

async function sendESP32Command(
    command
) {

    console.log(
        "📡 Hantar command ESP32:",
        command
    );


    try {

        await updateDoc(
            ESP32_DOCUMENT,
            {

                command:
                    command,

                updatedAt:
                    serverTimestamp()

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

    const location =
        getSelectedLocation();


    console.log(
        "💡 Lampu ON:",
        location
    );


    // =========================================
    // HANTAR COMMAND
    // =========================================

    const sent =
        await sendESP32Command(
            "ON"
        );


    if (!sent) {

        return;

    }


    // =========================================
    // SIMPAN LOKASI
    // =========================================

    localStorage.setItem(
        "activeLocation",
        location
    );


    localStorage.setItem(
        "selectedLocation",
        location
    );


    // =========================================
    // UPDATE LAMP STATUS
    // =========================================

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


    // =========================================
    // UPDATE LOCATION
    // =========================================

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


    // =========================================
    // SAVE STATUS
    // =========================================

    localStorage.setItem(
        "lampStatus",
        "ON"
    );


    // =========================================
    // SAVE START TIME
    // =========================================

    const start =
        new Date();


    localStorage.setItem(
        "startTime",
        start.toISOString()
    );


    // =========================================
    // LOG
    // =========================================

    addLog(
        "💡 Lampu ON",
        "Berjaya",
        location
    );


    // =========================================
    // TIMER
    // =========================================

    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

async function lampOff() {

    const location =
        getActiveLocation();


    console.log(
        "💡 Lampu OFF:",
        location
    );


    // =========================================
    // HANTAR COMMAND
    // =========================================

    const sent =
        await sendESP32Command(
            "OFF"
        );


    if (!sent) {

        return;

    }


    // =========================================
    // UPDATE UI
    // =========================================

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


    // =========================================
    // SAVE STATUS
    // =========================================

    localStorage.setItem(
        "lampStatus",
        "OFF"
    );


    // =========================================
    // STOP TIMER
    // =========================================

    stopTimer();


    // =========================================
    // SAVE HISTORY
    // =========================================

    await saveHistory(
        location
    );


    // =========================================
    // RESET TIMER
    // =========================================

    seconds = 0;


    localStorage.setItem(
        "lampTime",
        0
    );


    updateTimerDisplay();


    // =========================================
    // LOG
    // =========================================

    addLog(
        "💡 Lampu OFF",
        "Berjaya",
        location
    );


    // =========================================
    // REMOVE ACTIVE LOCATION
    // =========================================

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


    // =========================================
    // FIREBASE AUTH
    // =========================================

    if (!auth.currentUser) {

        console.error(
            "❌ Firebase Auth User = NULL"
        );


        alert(
            "❌ Firebase Authentication tidak aktif.\n\nSila logout dan login semula."
        );


        return;

    }


    // =========================================
    // START TIME
    // =========================================

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


    // =========================================
    // END TIME
    // =========================================

    const end =
        new Date();


    // =========================================
    // DURATION
    // =========================================

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


    // =========================================
    // USER
    // =========================================

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


    // =========================================
    // FIRESTORE DATA
    // =========================================

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


    // =========================================
    // SEND FIRESTORE
    // =========================================

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


        // =========================================
        // BACKUP LOCAL
        // =========================================

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


        // =========================================
        // REMOVE START TIME
        // =========================================

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


    // =========================================
    // PAPAR LOKASI
    // =========================================

    if (currentLocation) {

        currentLocation.innerHTML =
            selectedLocation;

    }


    if (systemLocation) {

        systemLocation.innerHTML =
            selectedLocation;

    }


    // =========================================
    // LAMP ON
    // =========================================

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


    // =========================================
    // LAMP OFF
    // =========================================

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


    // =========================================
    // LOAD SAVED LOCATION
    // =========================================

    const savedLocation =
        getSelectedLocation();


    locationSelect.value =
        savedLocation;


    setLocation(
        savedLocation
    );


    // =========================================
    // USER TUKAR LOKASI
    // =========================================

    locationSelect.addEventListener(
        "change",
        function() {

            const newLocation =
                this.value;


            console.log(
                "📍 Lokasi dipilih:",
                newLocation
            );


            localStorage.setItem(
                "selectedLocation",
                newLocation
            );


            setLocation(
                newLocation
            );


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


        // =========================================
        // ESP32 REALTIME STATUS
        // =========================================

        listenESP32Status();

    }
);


// =====================================================
// MAKE FUNCTIONS AVAILABLE
// =====================================================

window.lampOn =
    lampOn;


window.lampOff =
    lampOff;