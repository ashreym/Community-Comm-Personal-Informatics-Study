/* This script runs in the background and logs the time a user spends on each tab in their browser by pinging the
tab and getting the URL and seeing it has changed from the previous URL.*/
console.log("background.js active");
let timeOnPage = 0;
let articleTime = 0;
let active_domain = "";
let prev_url = "";
let userid;
let inFocus = true;
let currTabID = -1;
let enableRibbon = true;
let data, prevData, article;
let activeScroll = true;
let focusLostReportOnce = false;
let lastPush = -1;

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
// firebase.initializeApp(firebaseConfig);
const auth = firebase.auth()
const database = firebase.database()

//This script detects change in focus
function checkBrowserFocus(){
    chrome.windows.getCurrent(function(browser){
        inFocus = browser.focused
        if (inFocus) {
            focusLostReportOnce = false;
        }
    })
}

//Attempting to not stop the timer when the popup window is opened (Deprecated)
chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        //console.log("popup has been opened")

        /*  We changed the way we check for in/out of focus and so we don't really
        use this function for anything, but could be useful in the future.
         */

        port.onDisconnect.addListener(function() {
            //console.log("popup has been closed")

        });
    }
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User logged in already or has just logged in.
    userid = user.uid;
    //console.log(user.uid);
  } else {
    // User not logged in or has just logged out.
    //console.log("no user")
  }
});


Date.prototype.Format = (fmt) => {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


function sendData(uid, website, date, time, seconds, tabid, pushType) {
        //  uploads user's general brwosing data to user_log node

        //console.log("background.js sendData Running...");
        firebase.database().ref('user_log/' + uid + '/' + date + '/' + time).set({
                website: website,
                seconds: seconds,
                tabID: tabid,
                pushType: pushType
            },

            (response) => {
                //console.log("background.js sendData(): Data successfully sent to server; received response");
            });
}


function sendArticle(id, article, date, time, timeOnPage){
        console.log("background.js sendArticle Running...");
        try {
            if (article != undefined) {
                firebase.database().ref('user_log/' + id + '/' + date + '/' + 'articles' + '/' + cleanURL(article.url)).set({
                        bias: article.bias,
                        timestamp: article.timestamp,
                        timeOnPage:timeOnPage,
                        tabID: currTabID
                    },
                    (response) => {
                        console.log("background.js sendArticle(): Article information sent!");
                    }
                )   
            }

        } catch (e) {
            console.log("Error in sendArticle(): " + e);
        }
}

const getDomain = (url) => {
    // reduces a full URL into just it's domain name
    let newURL = url.toString();
    arr = newURL.split('/');
    return arr[2];
}


function getData(domain, id, date){
        // Takes the user's current domain and returns relevant data from Firebase

        //console.log("background.js GetData Running...");
        let data;
        let name = domain.replaceAll('.', ' ');
        //console.log("background.js getData name", name);
        try {
            firebase.database().ref('bias_annotations_allsides/' + name).on('value', (snapshot) => {
                data = [snapshot.val()];
            });
        } catch (error) {
            console.log(error);
        }

        firebase.database().ref('user_log/' + id + '/' + date + '/articles').on('value', (snapshot) => {
            articles = snapshot.val();
            if (articles !== null && data !== null && articles !== undefined &&data !== undefined) {
                data.push(articles);
            }
        });
        if(data!==undefined) return data;
        else return -1;
}

const processDate = () => {
    // Separates timestamps into date and time. We can delete if necessary
    splitDate = Date().split(' ');
    timestamp = {
        date:`${splitDate[0]} ${splitDate[1]} ${splitDate[2]} ${splitDate[3]}`,
        time:`${splitDate[4]} ${splitDate[5]} ${splitDate[6]}`,
        full: Date()
    };
    return timestamp;
};


const averageTime = (id, date) => {
    // Calculates the average time a user spends reading news for a given date.

    let avg;
    firebase.database().ref("user_log/" + id + "/" + date + "/articles").on("value", (snapshot) => {
        const articles = snapshot.val();
        if (articles){
            const arr = Object.entries(articles).map(item => item[1].timeOnPage);
            avg = arr.reduce((a,b) => a + b)/arr.length;
        }
    });

    if (avg !== undefined) return avg;
    else return -1;
}

//2023.3.10 added for '#' character
const cleanURL = (url) => {
    //return url.replaceAll('.',' ').replaceAll('/', '%');
    return url.replaceAll('.',' ').replaceAll('/', '%').replaceAll('#','%23');
}


/* not being used until ribbon is reactivated */

const sendToRibbon = (tab, msg) => {
    //console.log("send to ribbon");
        //var msg = [getData(domain, userid, processDate().date), url, Date(), userid, averageTime(userid, processDate().date), enableRibbon, timeOnPage];
        chrome.tabs.sendMessage(tab, msg, (response) => {
            //console.log("sendMessage to ribbon");
            //sendArticle(userid, response, processDate().date, processDate().time, timeOnPage);
        });
};

// This listens for a change in user's scroll activity
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {  // code from https://developer.chrome.com/docs/extensions/reference/storage/#synchronous-response-to-storage-updates
        if (key === "activeScroll"){
            //console.log("2: Active domain: " + active_domain + ", inFocus: " + inFocus + ", lastPush: " + lastPush);
            activeScroll = newValue;
            console.log("background.js activeScroll changed:", activeScroll);
            //04.25.2023
            scrolltimes++;

            // Handle what happens when some is thought to be idle
            if (activeScroll == false){
                if (inFocus == true) {
                    //console.log("background.js User is idle")
                    //console.log("Subtracting idle time from timeOnPage")

                    timeOnPage = timeOnPage - 120;
                    if (timeOnPage <= 0) {
                        timeOnPage = 1;
                    }
                    //console.log("background.js timeOnPage is now: " + timeOnPage)
                }
                console.log("background.js Sending information to firebase")
                sendData(userid, active_domain, processDate().date, processDate().time, timeOnPage, currTabID, 2); // (2) : idle push
                lastPush = 2;
                //Setting time on page to zero for when the user comes back
                timeOnPage = 1;
            }
        }
    }
});

// This starts the time that starts the tracking of domain time
chrome.alarms.create("TabChecker", {delayInMinutes: 0.0167, periodInMinutes: 0.167});
chrome.alarms.onAlarm.addListener(function (alarm){
    tabTimer();
    chrome.alarms.create("TabChecker", {delayInMinutes: 0.0167, periodInMinutes: 0.167});
});


const tabTimer = () => {

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true} , function (tabs) { 
      try {
          //Browser Focus
          checkBrowserFocus();

          //Check abort variables
          if ((!inFocus && focusLostReportOnce) || !activeScroll) {
              //console.log("inFocus: " + inFocus + ", focusLostReportOnce: " + focusLostReportOnce + ", activeScroll: " + activeScroll)
              return;
          }

          //Get current tab ID
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var tab = tabs[0];
              //console.log(tab.id);
              try {
                  currTabID = tab.id;
              } catch (e) {
                  //Do nothing
              }
          });

          if (tabs[0] != undefined) {
              let active_url = tabs[0].url;
              const domain = getDomain(active_url);
              data = getData(domain, userid, processDate().date);
              //console.log("Active Domain: " + active_domain);
            // User has just begun browsing
              if (active_domain === "") { 
                  const domain = active_domain = getDomain(active_url); 
                  //console.log("active domain now set to", active_domain)
                  prev_url = active_url;
                  timeOnPage = 1;
                  articleTime = 1;
                  prevData = []; 
              }

              // User moves to a different site
              else if (active_domain != domain && active_domain != undefined && active_domain != "" && inFocus && activeScroll) {
                  active_url = tabs[0].url
                  //console.log("previous active domain: " + active_domain + ", " + timeOnPage + "s");
                  //console.log("0: Active domain: " + active_domain + ", domain: " + domain + ", inFocus: " + inFocus + ", lastPush: " + lastPush);
                  sendData(userid, active_domain, processDate().date, processDate().time, timeOnPage, currTabID, 0); // (0) : new domain push
                  lastPush = 0;
                  if(prevData!==-1 && prevData[0]){
                        bias = prevData[0].bias
                        article = {
                            bias:bias,
                            url:prev_url,
                            timestamp: Date()
                        };
                      sendArticle(userid, article, processDate().date, processDate().time, articleTime, currTabID);
                      prevData=data
                  }
                  articleTime = 1;
                  timeOnPage = 1;
                  prev_url = active_url;
                  active_domain = domain;
              }
              
              // User is on the same site. Increment timer.
              else if (active_domain == domain && inFocus && activeScroll) {
                active_url = tabs[0].url;

                // same domain, but new url (we consider this a new article)
                if(active_url !== prev_url && prevData !== -1 && prevData[0]){

                        bias = prevData[0].bias
                        article = {
                            bias:bias,
                            url:prev_url,
                            timestamp: Date()
                        };
                        
                        //console.log("background.js: sending article... ", article, articleTime);
                        // Upload the data tied to the previous URL
                        sendArticle(userid, article, processDate().date, processDate().time, articleTime, currTabID);
                        articleTime = 1;
                        prev_url = active_url ;
                }
                  prevData = data; 
                  timeOnPage += 1;
                  articleTime += 1;
                  //console.log(`background.js: timeOnPage = ${timeOnPage}`);
              }

              else {
                  //console.log("1: Active domain: " + active_domain + ", domain: " + domain + ", inFocus: " + inFocus + ", lastPush: " + lastPush);
                  if (!inFocus && !focusLostReportOnce) {
                      focusLostReportOnce = true
                      //console.log("Browser does not have focus")
                      //console.log("Sending information to firebase")
                      if (active_domain === "mail.google.com" && timeOnPage == 1){
                          //ignore as Google has some kind of feature that is causing this function to activate multiple times
                      } else {
                          sendData(userid, active_domain, processDate().date, processDate().time, timeOnPage, currTabID, 1); // (1) : lost focus push
                          lastPush = 1;
                          timeOnPage = 1;
                      }
                  }
              }
              //4.12.2023 send data to ribbon(for iframe)
              var msg = [data, active_url, Date(), userid, averageTime(userid, processDate().date), enableRibbon, timeOnPage, active_url];
              sendToRibbon(currTabID, msg);
            // sendToRibbon() here
          }
        } catch (e) {
            console.log("background.js, Error in query: " + e.message + " " + e.stack);
      }
    });
}