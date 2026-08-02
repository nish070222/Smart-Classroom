// =====================================
// SMART CLASSROOM AUTH SYSTEM
// auth.js
//
// Fungsi:
// - Semak user login
// - Halang akses tanpa login
// - Simpan status pengguna
// =====================================



// Ambil data pengguna

const loginUser = JSON.parse(

localStorage.getItem("loginUser")

);




// Check pengguna login

if(!loginUser){


window.location.href = "userlogin.html";


}




// Papar nama pengguna jika ada

window.addEventListener("load",()=>{



let userName = document.getElementById("userName");

let welcome = document.getElementById("welcome");




if(loginUser){



if(userName){


userName.innerHTML =
"👤 " + loginUser.username;


}




if(welcome){


welcome.innerHTML =
"Welcome, " + loginUser.username;


}



}



});