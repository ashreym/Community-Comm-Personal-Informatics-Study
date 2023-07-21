console.log("ribbon.js is active");

let isDisplayed = false;
let hasArticles = false;
let bias, biasCnt;
//4.12.2023 add it for visualization's calculation
let LbiasCnt = 0;
let LCbiasCnt = 0;
let RCbiasCnt = 0;
let RbiasCnt = 0;
let CenCnt = 0;
let biasleaning = 0;
let UnCnt = 0;
let Ltemp =0 , Rtemp=0;
let articleCnt = 0;
let dominant_bias;

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(msg, sender, sendResponse){
  //console.log('ribbon.js: Message recieved from background.js', msg);
  bias = msg[0][0].bias;
  if(msg[0].length > 1){
    hasArticles=true;
    countArticles(msg[0][1]);
  }
  if(!isDisplayed && msg[5]){
      iframeRibbon(msg[1], msg[3], bias, msg[4], msg[7]);
  }
  try {
    //console.log("ribbon.js trying sendResponse...");
    sendResponse(/*processMessage(msg)*/ {"msg":"message recieved"});
  } catch (e) {
    console.log("ribbon.js error in sendResponse ", e);
  }
};

function countArticles(articles){
  //console.log("ribbon.js countArticles:");
  articleCnt = 0;
  Ltemp = 0;
  Rtemp = 0;
  biasleaning = 0;
  LbiasCnt = 0;
  LCbiasCnt = 0;
  RCbiasCnt = 0;
  RbiasCnt = 0;
  UnCnt = 0;

  let keys = Object.keys(articles);
  //console.log("number of articles :", keys.length);
  articleCnt = keys.length; 
  try{
    for(k in keys){
      //console.log(k);
      if(articles[keys[k]].bias === "left-center"){
        LCbiasCnt++;
        //articleCnt++;
      }
      if(articles[keys[k]].bias === "left"){
        LbiasCnt++;
        //articleCnt++;
      }
      if(articles[keys[k]].bias === "right-center"){
        RCbiasCnt++;
        //articleCnt++;
      }
      if(articles[keys[k]].bias === "right"){
        RbiasCnt++;
        //articleCnt++;
      }
      if(articles[keys[k]].bias === "Undefined"){
        UnCnt++;
        //articleCnt++;
      }
      if(articles[keys[k]].bias === "center"){
        CenCnt++;
        //articleCnt++;
      }
    }
    
    // //Compute bias leaning percentage 4.11.2023
    Ltemp = LCbiasCnt + LbiasCnt;
    Rtemp = RCbiasCnt + RbiasCnt;

    if (Ltemp > Rtemp && Ltemp > CenCnt){
      biasleaning = Math.floor((Ltemp/articleCnt)*100);
      if(LbiasCnt > LCbiasCnt){
        dominant_bias = 'left'
      } else {
        dominant_bias = 'left-center'
      }
    } else if (Rtemp > CenCnt){ 
      biasleaning = Math.floor((Rtemp/articleCnt)*100);
      if(RbiasCnt > RCbiasCnt){
        dominant_bias = 'right'
      } else {
        dominant_bias = 'right-center'
      }
    }
    //06.26.2023 account for all amounts being equal
    if (Ltemp == Rtemp || Rtemp == CenCnt){
      biasleaning = Math.floor((Ltemp/articleCnt)*100);
      dominant_bias='none';
    }
    //05.04.2023 add Bias center 
    if (CenCnt>Ltemp && CenCnt>Rtemp){
      biasleaning = Math.floor((CenCnt/articleCnt)*100);
      dominant_bias = 'center';
    } 
  }
  catch (e){
    console.log("Error in countArticles(): " + e);
  }
}

function iframeRibbon(domain, id, date, avgTime, url){
  isDisplayed=true;

  let frame = document.createElement('iframe');

  frame.id = "comms-iframe";
  frame.src = `http://127.0.0.1:5500/Chrome_Plugin/src/html/iframe.html?srcid=${domain}&uid=${id}&bias=${bias}&time=${avgTime}&count=${articleCnt}&lcnt=${LbiasCnt}&lccnt=${LCbiasCnt}&ucnt=${UnCnt}&ccnt=${CenCnt}&rccnt=${RCbiasCnt}&rcnt=${RbiasCnt}&leaning=${biasleaning}&dbias=${dominant_bias}&url=${url}`; 
  
  frame.style = "width: 100vw; height: 25%; border: 0px; overflow: hidden; position:fixed; top:0px; left:0px; z-index:1000";
  document.body.insertBefore(frame, document.body.firstChild);
};
