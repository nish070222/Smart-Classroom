
// =====================================
// SMART CLASSROOM
// FIRESTORE HISTORY
// =====================================

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    db
} from "./firebase.js";


// =====================================
// ELEMENT
// =====================================

const table =
    document.getElementById(
        "historyTable"
    );


// =====================================
// USER
// =====================================

const user =
    JSON.parse(
        localStorage.getItem(
            "loginUser"
        )
    );


if (!user) {

    window.location.href =
        "userlogin.html";

}


// =====================================
// LOAD HISTORY
// =====================================

async function loadHistory() {

    try {

        const q =
            query(
                collection(
                    db,
                    "history"
                ),
                orderBy(
                    "timestamp",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        table.innerHTML = "";


        if (snapshot.empty) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="no-record">

                        📭 Tiada rekod penggunaan lampu

                    </td>

                </tr>

            `;

            updateSummary([]);

            return;

        }


        let history = [];


        snapshot.forEach(
            function(document) {

                history.push({

                    id:
                        document.id,

                    ...document.data()

                });

            }
        );


        // =================================
        // PAPAR DATA
        // =================================

        history.forEach(
            function(data) {

                let deleteButton;


                if (
                    user.role ===
                    "admin"
                ) {

                    deleteButton = `

                        <button
                            class="delete-btn"
                            onclick="
                                deleteHistory('${data.id}')
                            ">

                            🗑 Delete

                        </button>

                    `;

                }

                else {

                    deleteButton =
                        "🔒 Tiada akses";

                }


                table.innerHTML += `

                    <tr>

                        <td>
                            👤
                            ${
                                data.user ||
                                data.email ||
                                "Unknown"
                            }
                        </td>


                        <td>
                            ${
                                data.role ||
                                "user"
                            }
                        </td>


                        <td>
                            ${
                                data.date ||
                                "-"
                            }
                        </td>


                        <td>
                            ${
                                data.start ||
                                "-"
                            }
                        </td>


                        <td>
                            ${
                                data.end ||
                                "-"
                            }
                        </td>


                        <td>
                            ${
                                data.duration ||
                                "-"
                            }
                        </td>


                        <td>
                            ${deleteButton}
                        </td>

                    </tr>

                `;

            }
        );


        updateSummary(history);


    }

    catch(error) {

        console.error(
            "Firestore Error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="no-record">

                    ❌ Gagal mengambil data Firestore

                </td>

            </tr>

        `;

    }

}


// =====================================
// SUMMARY
// =====================================

function updateSummary(
    history
) {


    // Total sessions

    document.getElementById(
        "totalSessions"
    ).innerHTML =
        history.length;


    // Total duration

    let totalSeconds = 0;


    history.forEach(
        function(data) {

            if (!data.duration) {

                return;

            }


            let parts =
                data.duration.split(":");


            if (
                parts.length !== 3
            ) {

                return;

            }


            let hour =
                parseInt(parts[0]) || 0;


            let minute =
                parseInt(parts[1]) || 0;


            let second =
                parseInt(parts[2]) || 0;


            totalSeconds +=
                (hour * 3600) +
                (minute * 60) +
                second;

        }
    );


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


    document.getElementById(
        "totalDuration"
    ).innerHTML =

        hour + ":" +
        minute + ":" +
        second;


    // =================================
    // TODAY
    // =================================

    const today =
        new Date();


    const todayString =

        today.getDate() +
        "/" +
        (today.getMonth() + 1) +
        "/" +
        today.getFullYear();


    let todayCount = 0;


    history.forEach(
        function(data) {

            if (
                data.date ===
                todayString
            ) {

                todayCount++;

            }

        }
    );


    document.getElementById(
        "todaySessions"
    ).innerHTML =
        todayCount;

}


// =====================================
// DELETE HISTORY
// =====================================

window.deleteHistory =
    async function(id) {


        if (
            !user ||
            user.role !== "admin"
        ) {

            alert(
                "❌ Hanya Admin boleh delete"
            );

            return;

        }


        const confirmDelete =
            confirm(
                "Adakah anda pasti mahu delete rekod ini?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "history",
                    id
                )
            );


            alert(
                "✅ Rekod berjaya dipadam"
            );


            loadHistory();

        }

        catch(error) {

            console.error(
                error
            );


            alert(
                "❌ Gagal delete rekod"
            );

        }

    };


// =====================================
// START
// =====================================

loadHistory();