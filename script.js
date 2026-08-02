// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js FULL
//
// Fungsi:
// - Kawal Lampu ESP32
// - Timer
// - History Email User
// - Log Aktiviti
// =====================================================


let timer;

let seconds = Number(
localStorage.getItem("lampTime")
) || 0;


let running = false;


// ESP32 IP

const ESP32_IP = "192.168.4.1";





// =====================================================
// TIMER
// =====================================================


function updateTimerDisplay(){


let hour = Math.floor(seconds / 3600);

let minute = Math.floor((seconds % 3600) / 60);

let second = seconds % 60;



hour = hour < 10 ? "0"+hour : hour;
minute = minute < 10 ? "0"+minute : minute;
second = second < 10 ? "0"+second : second;



let result =
hour+":"+minute+":"+second;



let timerBox =
document.getElementById("timer");


if(timerBox){

timerBox.innerHTML=result;

}




let dashTimer =
document.getElementById("dashTimer");


if(dashTimer){

dashTimer.innerHTML=result;

}


}








function startTimer(){


if(!running){


running=true;


timer=setInterval(()=>{


seconds++;


localStorage.setItem(
"lampTime",
seconds
);


updateTimerDisplay();



},1000);


}


}








// =====================================================
// USER INFO
// =====================================================


function getUser(){


return JSON.parse(

localStorage.getItem("loginUser")

);


}









// =====================================================
// LAMP ON
// =====================================================


function lampOn(){



fetch(
"http://"+ESP32_IP+"/lamp/on"
)



.then(res=>res.text())

.then(data=>console.log(data))

.catch(()=>console.log("ESP32 Offline"));






let lamp =
document.getElementById("lampStatus");


if(lamp){

lamp.innerHTML="ON";

lamp.style.color="green";

}





let dashLamp =
document.getElementById("dashLamp");


if(dashLamp){

dashLamp.innerHTML="ON";

dashLamp.style.color="green";

}





localStorage.setItem(
"lampStatus",
"ON"
);





let start = new Date();


localStorage.setItem(
"startTime",
start
);






addLog(
"💡 Lampu ON",
"ON"
);




startTimer();



}









// =====================================================
// LAMP OFF
// =====================================================


function lampOff(){



fetch(
"http://"+ESP32_IP+"/lamp/off"
)



.then(res=>res.text())

.then(data=>console.log(data))

.catch(()=>console.log("ESP32 Offline"));







let lamp =
document.getElementById("lampStatus");



if(lamp){

lamp.innerHTML="OFF";

lamp.style.color="red";

}







let dashLamp =
document.getElementById("dashLamp");



if(dashLamp){

dashLamp.innerHTML="OFF";

dashLamp.style.color="red";

}







localStorage.setItem(
"lampStatus",
"OFF"
);







clearInterval(timer);


running=false;





saveHistory();





seconds=0;


localStorage.setItem(
"lampTime",
0
);



updateTimerDisplay();







addLog(
"💡 Lampu OFF",
"OFF"
);





}










// =====================================================
// SAVE HISTORY
// =====================================================


function saveHistory(){



let start =
new Date(
localStorage.getItem("startTime")
);



let end =
new Date();





let total =
Math.floor(
(end-start)/1000
);





let hour =
Math.floor(total/3600);



let minute =
Math.floor((total%3600)/60);



let second =
total%60;





hour = hour<10 ? "0"+hour : hour;

minute = minute<10 ? "0"+minute : minute;

second = second<10 ? "0"+second : second;








let user = getUser();






let history =
JSON.parse(
localStorage.getItem("history")
)||[];







history.unshift({



email:

user ?
user.email :
"Unknown",




role:

user ?
user.role :
"user",






date:

start.getDate()+"/"+
(start.getMonth()+1)+"/"+
start.getFullYear(),






time:

start.getHours()+":"+
(start.getMinutes()<10?"0":"")+
start.getMinutes(),





action:

"💡 Lampu OFF",





duration:

hour+":"+minute+":"+second




});








localStorage.setItem(

"history",

JSON.stringify(history)

);





}









// =====================================================
// LOG AKTIVITI DASHBOARD
// =====================================================


function addLog(activity,status){



let user=getUser();





let logs =
JSON.parse(
localStorage.getItem("logs")
)||[];





let now=new Date();




let time =
now.getHours()+":"+
(now.getMinutes()<10?"0":"")+
now.getMinutes();







logs.unshift({



time:time,



user:

user ?
user.email :
"Unknown",




activity:activity,



status:status



});






if(logs.length>10){

logs.pop();

}







localStorage.setItem(

"logs",

JSON.stringify(logs)

);





}









// =====================================================
// LOAD
// =====================================================


window.onload=function(){



updateTimerDisplay();




let status =
localStorage.getItem("lampStatus");



let lamp =
document.getElementById("lampStatus");



let dashLamp =
document.getElementById("dashLamp");





if(status=="ON"){



if(lamp){

lamp.innerHTML="ON";

lamp.style.color="green";

}



if(dashLamp){

dashLamp.innerHTML="ON";

dashLamp.style.color="green";

}



startTimer();



}

else{



if(lamp){

lamp.innerHTML="OFF";

lamp.style.color="red";

}



if(dashLamp){

dashLamp.innerHTML="OFF";

dashLamp.style.color="red";

}



}



};