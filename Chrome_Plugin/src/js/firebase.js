self.importScripts('../lib/firebase-app.js', '../lib/firebase-auth.js',
    '../lib/firebase-database.js', '../lib/firebase-analytics.js');

//console.log("firebase.js active");

let uid;

// Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User logged in already or has just logged in.
      uid = user.uid;
      //console.log(user.uid);
    } else {
      // User not logged in or has just logged out.
      //console.log("firebase.js: no user");
    }
  });

  chrome.runtime.onMessage.addListener(
    function(msg, sender, resp){
      //console.log("firebase.js: message recieved ", msg);
      //console.log("sender ", sender);
      var check = 0;
      if(msg.command=="post"){
          var data = msg.data;
          var reason = data.reason; // added
          var classification = data.classification;
          //var id = data.id;
          var leaning = data.leaning;
          var date = data.date;
          var site = data.site
          try{
            /*console.log("firebase.js: attempting post");
            console.log("ref args: ", site, uid);
            console.log("post args: ", classification, leaning, date, reason);*/
              var newPost = firebase.database().ref('sites/'+ site + '/' + uid).set({
                  Classification: classification,
                  Leaning:leaning,
                  Date:date,
                  Reason:reason 
              })
              resp("successful upload???");
          }
          catch (e) {
              console.log("Unknown error in firebase.js post", e);
          }
      }
      else if(msg.command=="query"){
        var data = msg.data;
        var site = data.site;

        var ref = firebase.database().ref('sites/' + site.split('#')[0].replaceAll('.',' ').replaceAll('/', '%'));
        var submissions;
        ref.get().then((snapshot) => {
            submissions = snapshot.val();
            resp({data: submissions, uid:uid});
            check = 1; 
        }).catch((error) => {
            console.log(error);
        });
      } else if(msg.command=="demo"){
        var ref = firebase.database().ref('Qualtrics_Demographics/' + msg.data.user);
        ref.get().then((snapshot) => {
            demo_status = snapshot.val();
            resp({data: demo_status});
        }).catch((error) => {
            console.log(error);
        });
      }
      return true;
  })