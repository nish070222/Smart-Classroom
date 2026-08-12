
// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu
// - ESP32
// - Timer
// - History Firestore
// - Log Aktiviti
// =====================================================


// =====================================================
// FIREBASE
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


// =====================================================
// TIMER
// =====================================================

let timer;

let seconds =
    Number(
        localStorage.getItem("lampTime")
    ) || 0;

let running = false;


// =====================================================
// ESP32
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
        hour + ":" +
        minute + ":" +
        second;


    let timerBox =
        document.getElementById(
            "timer"
        );


    if (timerBox) {

        timerBox.innerHTML =
            result;

    }


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
        setInterval(function() {

            seconds++;


            localStorage.setItem(
                "lampTime",
                seconds
            );


            updateTimerDisplay();

        }, 1000);

}


// =====================================================
// STOP TIMER
// =====================================================

function stopTimer() {

    clearInterval(timer);

    running = false;

}


// =====================================================
// LAMP ON
// =====================================================

function lampOn() {


    fetch(
        "http://" +
        ESP32_IP +
        "/lamp/on"
    )

    .then(function(response) {

        return response.text();

    })

    .then(function(data) {

        console.log(
            "ESP32:",
            data
        );

    })

    .catch(function(error) {

        console.log(
            "ESP32 tidak disambung"
        );

    });


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


    localStorage.setItem(
        "lampStatus",
        "ON"
    );


    let start =
        new Date();


    localStorage.setItem(
        "startTime",
        start.toISOString()
    );


    addLog(
        "💡 Lampu ON",
        "Berjaya"
    );


    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

function lampOff() {


    fetch(
        "http://" +
        ESP32_IP +
        "/lamp/off"
    )

    .then(function(response) {

        return response.text();

    })

    .then(function(data) {

        console.log(
            "ESP32:",
            data
        );

    })

    .catch(function(error) {

        console.log(
            "ESP32 tidak disambung"
        );

    });


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


    localStorage.setItem(
        "lampStatus",
        "OFF"
    );


    stopTimer();


    // SIMPAN HISTORY KE FIRESTORE

    saveHistory();


    seconds = 0;


    localStorage.setItem(
        "lampTime",
        0
    );


    updateTimerDisplay();


    addLog(
        "💡 Lampu OFF",
        "Berjaya"
    );

}


// =====================================================
// SAVE HISTORY TO FIRESTORE
// =====================================================

async function saveHistory() {


    let startValue =
        localStorage.getItem(
            "startTime"
        );


    if (!startValue) {

        console.log(
            "Tiada start time"
        );

        return;

    }


    let start =
        new Date(startValue);


    let end =
        new Date();


    let total =
        Math.floor(
            (end - start) / 1000
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


    let user =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    let historyData = {

        user:
            user
                ? user.username
                : "Unknown",

        email:
            user
                ? user.email
                : "",

        uid:
            user
                ? user.uid
                : "",

        role:
            user
                ? user.role
                : "user",

        date:
            start.getDate() +
            "/" +
            (start.getMonth() + 1) +
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
            "✅ History berjaya disimpan:",
            docRef.id
        );


        // LocalStorage masih disimpan
        // sebagai backup

        let history =
            JSON.parse(
                localStorage.getItem(
                    "history"
                )
            ) || [];


        history.unshift(
            historyData
        );


        localStorage.setItem(
            "history",
            JSON.stringify(
                history
            )
        );


        localStorage.removeItem(
            "startTime"
        );


    }

    catch(error) {

        console.error(
            "❌ Firestore Error:",
            error
        );


        alert(
            "❌ Gagal simpan History ke Firebase"
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

        time: time,

        user:
            user
                ? user.username
                : "Unknown",

        activity:
            activity,

        status:
            status

    });


    if (logs.length > 10) {

        logs.pop();

    }


    localStorage.setItem(
        "logs",
        JSON.stringify(logs)
    );

}


// =====================================================
// LOAD STATUS
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


        startTimer();

    }

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

        updateTimerDisplay();

        loadLampStatus();

    }
);


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.lampOn = lampOn;
window.lampOff = lampOff;