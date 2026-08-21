// =====================================
// SMART CLASSROOM
// FIREBASE CONFIGURATION
// =====================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// FIREBASE CONFIG
// =====================================

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


// =====================================
// INITIALIZE FIREBASE
// =====================================

const app =
    initializeApp(firebaseConfig);


// =====================================
// FIREBASE AUTH
// =====================================

const auth =
    getAuth(app);


// =====================================
// FIRESTORE
// =====================================

const db =
    getFirestore(app);


// =====================================
// EXPORT
// =====================================

export {
    app,
    auth,
    db
};