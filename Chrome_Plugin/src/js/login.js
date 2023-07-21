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
    firebase.app(); // if already initialized, use that one
 }

  const auth = firebase.auth()
  const database = firebase.database()


//KEEPING THE TRACK OF AUTH USER STATUS IN FIREBASE
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      localStorage.setItem("uid", user.uid);
      localStorage.setIten("email", user.email);
    } else {
        //Do Nothing?
    }
  });

  var storedEmail = localStorage.getItem('email');
  var storeduid = localStorage.getItem('uid');

  if(storedEmail && storeduid) {
    location.replace("../html/popup.html");
  }

  document.getElementById("myButtonlogin").addEventListener("click", login);
  function login(){
      console.log('login button clicked');
      email = document.getElementById('email').value
      password = document.getElementById('password').value
  
      if (validate_email(email) == false || validate_password(password) == false) {
        alert('Please enter a valid email address and password')
        return
      }
    
      auth.signInWithEmailAndPassword(email, password)
      .then((user) =>  {
          localStorage.setItem('email', user.email);
          localStorage.setItem('uid', user.uid);
          location.replace("../html/popup.html")
      })
      .catch((error) => {
          console.log(error)
        alert("Login failed; have you registered an account? have you used the correct password? If problems persist, please contact the research team")
      });
  }
  
  document.getElementById("myButtonreg").addEventListener("click", register);
  function register () {
      console.log('register button clicked');
      email = document.getElementById('email').value
      password = document.getElementById('password').value
  
      if (validate_email(email) == false || validate_password(password) == false) {
          alert('Please enter a valid email address and password greater than six characters')
          return
      }
     
      auth.createUserWithEmailAndPassword(email, password)
      .then(function() {
        var user = auth.currentUser

        localStorage.setItem('email', user.email);
        localStorage.setItem('uid', user.uid);

        alert('Your account has been created')
        location.replace("../html/popup.html")
      })
      .catch(function(error) {
        //var error_code = error.code
        var error_message = error.message
    
        alert(error_message)
      })
    }

    //CODE FOR VALIDATING EMAIL AND PASSWORD
  
  function validate_email(email) {
    expression = /^[^@]+@\w+(\.\w+)+\w$/
    if (expression.test(email) == true) {
      return true
    } else {
      return false
    }
  }
  function validate_password(password) {
    if (password < 6) {
      return false
    } else {
      return true
    }
  }
  
  function validate_field(field) {
    if (field == null) {
      return false
    }
    if (field.length <= 0) {
      return false
    } else {
      return true
    }
  }