// ===================================
// SMART CLASSROOM USERS DATABASE
// ===================================


let users = JSON.parse(

localStorage.getItem("users")

);



if(!users){


users = [


{
username:"admin",
password:"admin123",
role:"admin"
},


{
username:"user",
password:"user123",
role:"user"
}


];



localStorage.setItem(

"users",

JSON.stringify(users)

);


}