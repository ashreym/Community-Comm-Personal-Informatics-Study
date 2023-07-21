var firebaseConfig = {
    apiKey: "AIzaSyCQsWrA1_zCAukNqv3qOUBYXY7KBudFRjQ",
    authDomain: "cisc475database.firebaseapp.com",
    databaseURL: "https://cisc475database-default-rtdb.firebaseio.com",
    projectId: "cisc475database",
    storageBucket: "cisc475database.appspot.com",
    messagingSenderId: "372963635946",
    appId: "1:372963635946:web:7ed6c09fce9f9bff8d1d93",
    measurementId: "G-JZ5HT65P6V"
};


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
 }else {
    firebase.app(); 
    // if already initialized, use that one
 }

const auth = firebase.auth();
const database = firebase.database();

//IMPLEMENTING SIGNOUT FUNCTIONALITY IN THE LOGIN SCREEN
 document.getElementById('sign_out').onclick = function(){
  console.log("sign out button clicked!")
  auth.signOut().then(() => {
      console.log("Signed Out")
      window.alert('You have been signed-out');
      location.replace("../html/login.html")
      localStorage.removeItem('email');
      localStorage.removeItem('uid');
    }).catch((error) => {
      console.log("Signout error")
    });
}



