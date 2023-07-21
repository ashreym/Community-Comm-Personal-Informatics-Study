// content.js
console.log("content.js is active");
let realURL;
let uid;
let demographicCompleted = false;
const generateIDTXT = document.getElementById('generateidtxt');
const copy = document.getElementById('copy');

// Adding to try and allow background.js to capture open/close events
chrome.runtime.connect({ name: "popup" });


Date.prototype.Format = function (fmt) { 
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

/*
Since I've hidden the submit button because we aren't working on that, disabling this function...
document.getElementById("submit").addEventListener("click", function() {
    var time = $("#clockDisplay").html();
    var host = $("#domainDisplay").html();
    var url = $("#urlDisplay").html();
    var title = $("#titleDisplay").html();
    var link = $("#link").val();
    var Reason = $("#Reason").val();
    var realURL;
    var url = getCurrentTabUrl(function(url,domain, title) {
      realURL = url;
    });
    var url = realURL;
    var attitude = "";
    var a = document.getElementsByName("attitude");
    for (var i=0; i<a.length; i++) {
        if(a[i].checked){
          attitude = a[i].value;
        }
    }

    var leaning = "";
    var a = document.getElementsByName("leaning");
    for (var i=0; i<a.length; i++) {
        if(a[i].checked){
          leaning = a[i].value;
        }
    }    

    var articlelabel = "";
    var a = document.getElementsByName("articlelabel");
    for (var i=0; i<a.length; i++) {
        if(a[i].checked){
          articlelabel = a[i].value;
        }
    }    
// Added ---------------------------
    var reasoning = "";
    var a = document.getElementsByName("reasoning");
    for (var i=0; i<a.length; i++) {
      if(a[i].checked){
        articlelabel = a[i].value;
      }
    }
//-------------------------------------
    if(time == "" || host == "" || url == "" 
        || title == "" || link == "" || attitude == "" 
        || learning == "" || Reason == "" || articlelabel == "") {
        //alert("uuid or time or host or url or title or link or attitude or learning is null");
        // return;
    }

    var data = {"time" : time,"host":host, "url":url, 
        "title":title,"link":link,"attitude":attitude,
        "learning":leaning, "Reason":Reason, "articlelabel":articlelabel};

    var XML = new XMLHttpRequest();
    XML.onreadystatechange = function () {
        if (XML.readyState == 4 && XML.status == 200) {
          var response_data = JSON.parse(XML.responseText);
          if(response_data["status"] == -1) {
              alert("save error");
              return;
  
          }else{
            alert("save ok");
          }
        }
    }
    return true;
});*/

function UpdateDynamicDisplayInformation() {
  $(document).ready(function () {
      document.getElementById("clockDisplay").innerHTML = new Date();//.Format("yyyy-MM-dd hh:mm:ss");
      document.getElementById("generateidtxt").innerHTML =  localStorage.getItem('uid');
      if (!demographicCompleted) {
          //console.log("Checking demographic status..");
          getDemographicStatus(localStorage.getItem('uid'));
      }
  });
}

function getDemographicStatus(user){
    //console.log("checking : " + user)
        var ret = false;
        chrome.runtime.sendMessage({
                command: "demo",
                data: {user}
            },
            
            (resp) => {
              if (!resp.data) {
                //console.log("Updating display...")
                document.getElementById("qualtrics_form").innerHTML = "<form action='https://delaware.ca1.qualtrics.com/jfe/form/SV_1zQ3NFleX4dAPTU' method='post' target='_blank'><button style='background: darkred; color:white; width:100%; height: 100%;'>Click here to read the articles</button></form>"
            } else {
                document.getElementById("qualtrics_form").innerHTML = "";
                demographicCompleted = true;
            }
            }
            )
            
            // the code below seems to work for some users but not others. We should find out why. I've replaced it with the above (resp) function. -Luke
            
            /*.then(
            function handleResponse(resp) {
                if (!resp.data) {
                    console.log("Updating display...")
                    document.getElementById("qualtrics_form").innerHTML = "<form action='https://delaware.ca1.qualtrics.com/jfe/form/SV_3IamacpZ0IDpXr8/?user="+localStorage.getItem('uid')+"' method='post' target='_blank'><button style='background: darkred; color:white; width:100%; height: 100%;'>When you have a moment, please click here to take our demographic questionnaire</button></form>"
                } else {
                    document.getElementById("qualtrics_form").innerHTML = "";
                    demographicCompleted = true;
                }
            },
            function handleError(resp){
                console.log("getDemographicsStatus() failed...");
            });*/
}


function sendData(leaning, classification, website, date, reason){ 
  /*console.log("content.js: attempting to send message to firebase.js...");
  console.log('sendData(): date is ', date);*/
  console.log('content.js, sendData(): date is ', date);
  try {
      chrome.runtime.sendMessage({
              command: "post",
              data: {classification: classification, leaning: leaning, site: website, date: date, reason: reason}
          },
          (response) => {
              console.log("content.js, sendData(): Data successfully sent to server; received response");
          });
  } catch (e) {
      console.log("content.js, Error in sendMessage(): " + e.message + " " + e.stack);
  }
}

function retrieveData(url) {
    try {
        chrome.runtime.sendMessage({command: "query", data: {site: url}},
            function (resp) {

                if (resp.data == null) {
                    //console.log("retrieveData(): The current page is not known to us.")
                    //document.getElementById("knownDisplay").textContent = "This article has not been rated yet";
                } else {
                    //console.log("retrieveData(): uid is ", resp.uid);
                    uid = resp.uid;
                    generateIDTXT.innerHTML = uid;
                    //console.log("retrieveData(): The current page is known to us.")
                    //console.log('response:  ' + resp.data);
                    //console.log(Object.values(resp.data)[0].Classification);
                    $(document).ready(function () {
                        if (resp.data) {
                            var consCount = 0;
                            var libCount = 0;
                            var centCount = 0;
                            Object.values(resp.data).forEach(element => {
                                if (element.Leaning == "Liberal" || element.Leaning == "Very Liberal") {
                                    libCount++;
                                } else if (element.Leaning == "Conservative" || element.Leaning == "Very conservative") {
                                    consCount++;
                                } else {
                                    centCount++;
                                }
                            });
                            var type;
                            var percent;
                            if (libCount > consCount && libCount > centCount) {
                                type = "Liberal";
                                percent = (libCount / (libCount + centCount + consCount)) * 100;
                            } else if (libCount < consCount && consCount > centCount) {
                                type = "Conservative";
                                percent = (consCount / (libCount + centCount + consCount)) * 100;
                            } else {
                                type = "Centrist";
                                percent = (centCount / (libCount + centCount + consCount)) * 100;
                            }
                            //document.getElementById("knownDisplay").textContent = "This article has been determined to be: " + type + " by " + Math.round(percent) + "% of the ratings";
                        }
                    });
                }
            });
    } catch (e) {
        console.log("content.js, Error in sendMessage(): " + e.message + " " + e.stack);
    }
}

//function to get Current URL
function getCurrentTabUrl(callback) {  
  var queryInfo = {
    active: true, 
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0]; 
    var url = tab.url;
    var url_obj = new URL(tab.url);
    var domain = url_obj.hostname;
    var title = tab.title;
    
    callback(url, domain, title);
  });
}

//---------------------------------------------------------------------
  //function to set id to show in the html
  function renderURL(url, domain, title , attitude, learning, count, allcount, articlelabel) {
    //console.log("renderURL: "+ url);
    /*$(document).ready(function () {
      document.getElementById("urlDisplay").innerHTML = url;
    });*/

    website = cleanURL(website);
    retrieveData(website);

    /*document.getElementById('urlDisplay').innerHTML = url;
    document.getElementById('urlDisplay').textContent = url;*/

    document.getElementById('domainDisplay').textContent = domain;
    //document.getElementById('titleDisplay').textContent = title;

    if(attitude == "" || attitude == null) {

        /*document.getElementById('kownDisplay').textContent = "unknown website"
        document.getElementById('kownacticleDisplay').textContent = "unknown website"*/

    } else {
       // already vistor
       /*document.getElementById('kownDisplay').textContent = ((count/allcount) * 100) + "% of our users who visit this site have labeled this site as " + attitude
       document.getElementById('kownDisplay').style="font-weight: bold"

       document.getElementById('kownacticleDisplay').textContent = ((count/allcount) * 100) + "% of our users who visit this site have labeled this site as " + attitude + ", acticle as " + articlelabel
       document.getElementById('kownacticleDisplay').style="font-weight: bold"*/


       var a = document.getElementsByName("attitude");
       for (var i=0; i<a.length; i++) {
           if(a[i].value == attitude){
             a[i].checked = "true";
           }
       }
   
       var a = document.getElementsByName("learning");
       for (var i=0; i<a.length; i++) {
           //console.log(a[i].value);
           //console.log(learning);
           if(a[i].value == learning){
             
             a[i].checked = "true";
           }
       }   

       var a = document.getElementsByName("articlelabel");
       for (var i=0; i<a.length; i++) {
           //console.log(a[i].value);
           //console.log(learning);
           if(a[i].value == articlelabel){
             
             a[i].checked = "true";
           }
       }         

    }
  }
  

  document.addEventListener('DOMContentLoaded', function() {
    getCurrentTabUrl(function(url,domain, title) {
      //console.log("Starting request for current page.");
      //console.log(url);
      realURL = url;
      website = cleanURL(url);
      retrieveData(website);

      // $(document).ready(function () {
      //  document.getElementById("urlDisplay").innerHTML = url;
      //});
      $(document).ready(function () {
        document.getElementById("domainDisplay").innerHTML = domain;
      });
      //$(document).ready(function () {
      //  document.getElementById("titleDisplay").innerHTML = title;
      //});

      var XML = new XMLHttpRequest();
      XML.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          
        var response_data = JSON.parse(XML.responseText);
          
          var attitude = "";
          var learning = "";
          if(response_data["status"] == 0) {
              attitude = response_data["attitude"]
              learning = response_data["learning"]
              count = response_data["count"]
              allcount = response_data["allcount"]
              articlelabel = response_data["articlelabel"]
          }
          renderURL(url,domain, title, attitude, learning, count, allcount, articlelabel);
        } 
      }
      //console.log(url);
    });
    return true;
  });

  
  //--------------------------------------------------------

$(document).ready(function() {
    UpdateDynamicDisplayInformation();
    setInterval( UpdateDynamicDisplayInformation, 5000 );
});

//Commenting this out since submit button isn't being used
//const btnSubmit = document.getElementById('submit');

//TODO: Further stripping need to be done to remove things after "?" because this information isn't necessary. Better yet, it would be better to encode this data into the packet sent by the user for analysis later. When a user comes from facebook for example there is an id there that websites use to track this kind of stuff
function stripURL(website){
    website = realURL.replace("https://", "");
    website = website.replace("http://", "");
    website = website.replace("chrome://", "")
    var output = website.split('/');
    output = output.shift() + (output.length ? '/' + output.join('<') : '');
    website = output;
    website = website.replaceAll(".", " ");
    //website = escape(website);
    //console.log("this is the url:" + website);
    return website;
}

const cleanURL = (url) => {
  return url.replaceAll('.',' ').replaceAll('/', '%');
}


//TODO: clean up variables and such. This is ugly
/* //Commenting this out since submit button isn't being used
btnSubmit.addEventListener('click', () => {
  var website = document.getElementById('urlDisplay').innerHTML;
  var reas = document.getElementById('Reason').value;
  var leaning;
  var attitude;
  const attitudeGet = document.querySelectorAll('input[name="attitude"]');
  attitudeGet.forEach(function(att){
    if(att.checked){
      attitude = att.value;
    }
  });
  const politic = document.querySelectorAll('input[name="learning"]');
  politic.forEach(function(lean) {
    if(lean.checked){
      leaning = lean.value;
    }
  });

  website = cleanURL(website);
  console.log("content.js: website = ", website);
  sendData(leaning,attitude, website, document.getElementById("clockDisplay").innerHTML, reas);
  $(document).ready(function() {
    retrieveData(website);
  });
  
  return true;
});*/

