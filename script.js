// =====================================================
// SMART CLASSROOM CONTROL SYSTEM
// script.js
//
// Fungsi:
// - Kawal Lampu
// - ESP32
// - Timer
// - History pengguna
// - Log aktiviti
// =====================================================



let timer;

let seconds = Number(
localStorage.getItem("lampTime")
) || 0;


let running = false;



// ESP32 IP

const ESP32_IP = "192.168.4.1";






// =====================================================
// TIMER DISPLAY
// =====================================================


function updateTimerDisplay(){



let hour = Math.floor(seconds / 3600);


let minute = Math.floor(
(seconds % 3600) / 60
);


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









// =====================================================
// START TIMER
// =====================================================


function startTimer(){



if(!running){



running=true;



timer=setInterval(function(){



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
// LAMP ON
// =====================================================


function lampOn(){



// ESP32


fetch(
"http://"+ESP32_IP+"/lamp/on"
)


.then(response=>response.text())


.then(data=>{


console.log(data);


})


.catch(error=>{


console.log(
"ESP32 tidak disambung"
);


});








let lamp =
document.getElementById(
"lampStatus"
);



if(lamp){


lamp.innerHTML="ON";

lamp.style.color="green";


}







let dashLamp =
document.getElementById(
"dashLamp"
);



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

"Berjaya"

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



.then(response=>response.text())


.then(data=>{


console.log(data);


})



.catch(error=>{


console.log(
"ESP32 tidak disambung"
);


});







let lamp =
document.getElementById(
"lampStatus"
);



if(lamp){


lamp.innerHTML="OFF";

lamp.style.color="red";


}





let dashLamp =
document.getElementById(
"dashLamp"
);



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

"Berjaya"

);



}









// =====================================================
// SIMPAN HISTORY DENGAN USER
// =====================================================


function saveHistory(){



let start =
new Date(

localStorage.getItem(
"startTime"
)

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
Math.floor(

(total%3600)/60

);



let second =
total%60;





hour =
hour<10?
"0"+hour:hour;



minute =
minute<10?
"0"+minute:minute;



second =
second<10?
"0"+second:second;







let user =
JSON.parse(

localStorage.getItem(
"loginUser"
)

);







let history =
JSON.parse(

localStorage.getItem(
"history"
)

)||[];







history.unshift({



user:

user?
user.username:
"Unknown",




role:

user?
user.role:
"user",





date:

start.getDate()+"/"+

(start.getMonth()+1)+"/"+

start.getFullYear(),






start:

start.getHours()+":"+

(start.getMinutes()<10?"0":"")+

start.getMinutes(),






end:

end.getHours()+":"+

(end.getMinutes()<10?"0":"")+

end.getMinutes(),





duration:

hour+":"+minute+":"+second



});







localStorage.setItem(

"history",

JSON.stringify(history)

);



}









// =====================================================
// LOG AKTIVITI
// =====================================================


function addLog(activity,status){



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

)||[];





let now =
new Date();





let time =
now.getHours()+":"+

(now.getMinutes()<10?"0":"")+

now.getMinutes();







logs.unshift({



time:time,



user:

user?
user.username:
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
// LOAD PAGE
// =====================================================


window.onload=function(){



updateTimerDisplay();






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