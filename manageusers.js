// =====================================
// SMART CLASSROOM
// MANAGE USER SYSTEM
// FIRESTORE VERSION
// =====================================



import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getFirestore,

collection,

addDoc,

getDocs,

deleteDoc,

doc,

updateDoc

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";






// =============================
// FIREBASE CONFIG
// =============================


const firebaseConfig = {


apiKey: "AIzaSyCc45wk-89MHpHdIj9q8TREUzFHHJWu24Q",

authDomain: "smart-classroom-351a3.firebaseapp.com",

projectId: "smart-classroom-351a3",

storageBucket: "smart-classroom-351a3.firebasestorage.app",

messagingSenderId: "1031651524426",

appId: "1:1031651524426:web:327b07e9d3f97c8ec78bb3"


};






const app = initializeApp(firebaseConfig);


const db = getFirestore(app);






let allUsers=[];








// =============================
// CHECK ADMIN
// =============================



const loginUser = JSON.parse(

localStorage.getItem("loginUser")

);





if(!loginUser || loginUser.role!="admin"){


window.location.href="index.html";


}







document.getElementById("adminName").innerHTML =
"👤 "+loginUser.email;





// =============================
// LOAD USERS
// =============================



async function loadUsers(){



const table = document.getElementById("userList");


table.innerHTML="";



allUsers=[];



const snapshot = await getDocs(

collection(db,"users")

);






let admin=0;

let user=0;






snapshot.forEach((item)=>{



let data=item.data();



allUsers.push({

id:item.id,

...data

});



if(data.role=="admin"){

admin++;

}else{

user++;

}






let badge =

data.role=="admin"

?

`<span class="role-admin">
👑 Admin
</span>`

:

`<span class="role-user">
🙋 User
</span>`;






table.innerHTML +=



`

<tr>

<td>

${data.email}

</td>


<td>

${badge}

</td>


<td>



<button class="edit-btn"

onclick="editRole('${item.id}','${data.role}')">

✏️ Edit

</button>




<button class="delete-btn"

onclick="deleteUser('${item.id}')">

🗑 Delete

</button>



</td>


</tr>

`;





});






document.getElementById("totalUser").innerHTML =
snapshot.size;


document.getElementById("totalAdmin").innerHTML =
admin;


document.getElementById("totalNormal").innerHTML =
user;



}








// =============================
// ADD USER
// =============================



window.addUser = async function(){

let email =
document.getElementById("email").value;


let role =
document.getElementById("role").value;



if(email==""){

alert("Masukkan email");

return;

}



try{


await addDoc(

collection(db,"users"),

{

email:email,

role:role,

createdAt:new Date()

}

);



alert("User berjaya masuk Firestore");


loadUsers();



}

catch(error){


console.log(error);


alert(error.message);


}


}



// =============================
// EDIT ROLE
// =============================



window.editRole = async function(id,role){



let newRole = prompt(

"Tukar role (admin/user)",

role

);





if(
newRole!="admin"
&&
newRole!="user"

){


alert("Role tidak sah");


return;


}





await updateDoc(

doc(db,"users",id),

{


role:newRole


}

);






alert("Role berjaya dikemaskini");



loadUsers();



}









// =============================
// DELETE USER
// =============================



window.deleteUser = async function(id){



let confirmDelete = confirm(

"Anda pasti mahu padam user ini?"

);





if(confirmDelete){



await deleteDoc(

doc(db,"users",id)

);




alert("User dipadam");



loadUsers();



}



}









// =============================
// SEARCH
// =============================



window.searchUser=function(){



let value =

document.getElementById("search").value.toLowerCase();



let table =
document.getElementById("userList");



table.innerHTML="";




allUsers

.filter(user=>

user.email
.toLowerCase()
.includes(value)

)

.forEach(user=>{


let badge =

user.role=="admin"

?

`<span class="role-admin">
👑 Admin
</span>`

:

`<span class="role-user">
🙋 User
</span>`;




table.innerHTML +=


`

<tr>


<td>${user.email}</td>


<td>${badge}</td>


<td>


<button class="edit-btn"

onclick="editRole('${user.id}','${user.role}')">

✏️ Edit

</button>



<button class="delete-btn"

onclick="deleteUser('${user.id}')">

🗑 Delete

</button>



</td>


</tr>


`;



});



}









// START


loadUsers();