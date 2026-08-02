// =====================================
// SMART CLASSROOM AUTH SYSTEM
// auth.js
//
// Fungsi:
// - Semak user login
// - Halang akses tanpa login
// =====================================



let loginUser = JSON.parse(

localStorage.getItem("loginUser")

);




// Kalau belum login

if(!loginUser){


window.location="userlogin.html";


}

// ===================================
// SMART CLASSROOM AUTH CHECK
// ===================================


let loginUser = JSON.parse(

localStorage.getItem("loginUser")

);



if(!loginUser){


window.location="userlogin.html";


}