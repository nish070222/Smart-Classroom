// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu
// - ESP32
// - Timer
// - History
// - Log Aktiviti
// - Dashboard
// =====================================================


// =====================================================
// GLOBAL TIMER
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

const ESP32_IP = "192.168.4.1";


// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    let hour =
        Math.floor(seconds / 3600);

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


    // Light Control timer

    let timerBox =
        document.getElementById(
            "timer"
        );


    if (timerBox) {

        timerBox.innerHTML =
            result;

    }


    // Dashboard timer

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


    // ==============================
    // ESP32
    // ==============================

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


    // ==============================
    // LIGHT CONTROL
    // ==============================

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


    // ==============================
    // DASHBOARD
    // ==============================

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


    // ==============================
    // SAVE STATUS
    // ==============================

    localStorage.setItem(
        "lampStatus",
        "ON"
    );


    // ==============================
    // SAVE START TIME
    // ==============================

    let start =
        new Date();


    localStorage.setItem(
        "startTime",
        start.toISOString()
    );


    // ==============================
    // LOG
    // ==============================

    addLog(
        "💡 Lampu ON",
        "Berjaya"
    );


    // ==============================
    // TIMER
    // ==============================

    startTimer();

}


// =====================================================
// LAMP OFF
// =====================================================

function lampOff() {


    // ==============================
    // ESP32
    // ==============================

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


    // ==============================
    // LIGHT CONTROL
    // ==============================

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


    // ==============================
    // DASHBOARD
    // ==============================

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


    // ==============================
    // SAVE STATUS
    // ==============================

    localStorage.setItem(
        "lampStatus",
        "OFF"
    );


    // ==============================
    // STOP TIMER
    // ==============================

    stopTimer();


    // ==============================
    // SAVE HISTORY
    // ==============================

    saveHistory();


    // ==============================
    // RESET TIMER
    // ==============================

    seconds = 0;


    localStorage.setItem(
        "lampTime",
        0
    );


    updateTimerDisplay();


    // ==============================
    // LOG
    // ==============================

    addLog(
        "💡 Lampu OFF",
        "Berjaya"
    );

}


// =====================================================
// SAVE HISTORY
// =====================================================

function saveHistory() {


    let startValue =
        localStorage.getItem(
            "startTime"
        );


    if (!startValue) {

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


    // ==============================
    // USER
    // ==============================

    let user =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
            )
        );


    // ==============================
    // HISTORY
    // ==============================

    let history =
        JSON.parse(
            localStorage.getItem(
                "history"
            )
        ) || [];


    history.unshift({

        user:
            user
                ? user.username
                : "Unknown",

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
            second

    });


    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    // Jangan simpan session lama sebagai
    // start time untuk sesi seterusnya

    localStorage.removeItem(
        "startTime"
    );

}


// =====================================================
// ADD LOG
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


    // Maximum 10 log

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
