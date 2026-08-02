// =====================================
// SMART CLASSROOM AUTH SYSTEM
// auth.js
// =====================================



const loginUser = JSON.parse(

localStorage.getItem("loginUser")

);





// Kalau belum login

if(!loginUser){


window.location.href="userlogin.html";


}






window.addEventListener("load",()=>{



let userName =
document.getElementById("userName");



let welcome =
document.getElementById("welcome");





if(loginUser){



let displayName =
loginUser.email;



if(userName){


userName.innerHTML =
"👤 "+displayName;


}




if(welcome){


welcome.innerHTML =
"Welcome, "+displayName;


}



}



});