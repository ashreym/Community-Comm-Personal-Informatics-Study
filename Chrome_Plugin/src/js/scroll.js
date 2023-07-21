console.log("scroll.js is active");

const idle_limit = 120; // activeScroll set to false after 2 minutes; if this gets changes then change the one in background.js as well.
let activeScroll = true;
let timerStart = null;
let scrollTime = 0;
//04.25.2023
let scrollNums = 0;
//05.02.2023 scrollNum, title, clickNum
let datas = [0,0,0];
//05.03.2023
let clkNums = 0;

chrome.storage.sync.set({ "activeScroll": true });

const startTimer = () => {
    timerStart = Date.now()
    setInterval(() => {
        scrollTime += 1000
    }, 1000);
};

const resetTimer = () => {
    timerStart = null;
    scrollTime = 0;
};

const scrollTimer = () => {
    if (!document.hidden) {
        if (timerStart === null) {
            startTimer();
        }
        if (scrollTime > idle_limit * 1000) {
            if (activeScroll) {
                chrome.storage.sync.set({ "activeScroll": false })
                activeScroll = false
                resetTimer();
            }
        }
    } else {
        resetTimer();
    }
};

setInterval(scrollTimer, 1000);

//04.28.2023 data send to iframe.js for firebase and iframe.html
function sendToiframe(data){
    const frame = document.getElementById('comms-iframe');
    const targetOrigin = "localhost:5500";
    var initialMessage = data;
    frame.contentWindow.postMessage(initialMessage, '*');
};

document.addEventListener("scroll", (event) => {
    if (activeScroll === false) {
        chrome.storage.sync.set({ "activeScroll": true });
        activeScroll = true;
        resetTimer();
    };
    scrollNums++;
    //04.25.2023 data send to iframe.js for firebase and iframe.html
    if(scrollNums!=0){
        datas[0] = scrollNums;
        sendToiframe(datas);
    };
});

document.addEventListener("mousemove", (event) => {
    if (activeScroll === false) {
        chrome.storage.sync.set({ "activeScroll": true });
        activeScroll = true;
        resetTimer();
    };
    //05.06.2023 gathering document title
    datas[1] = document.title;
    sendToiframe(datas);
});

document.addEventListener("keypress", (event) => {
    if (activeScroll === false) {
        chrome.storage.sync.set({ "activeScroll": true });
        activeScroll = true;
        resetTimer();
    };
});

document.addEventListener("click", (event) => {
    if (activeScroll === false) {
        chrome.storage.sync.set({ "activeScroll": true });
        activeScroll = true;
        resetTimer();
    };
    //05.03.2023 click through rate
    clkNums++;
    if(scrollNums!=0){
        datas[2] = clkNums;
        sendToiframe(datas);
    };
});

window.addEventListener("beforeunload", (event) => {
    if (timerStart !== null) {
        const scrollPercentage = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        const scrollEvent = {
            scroll_time: scrollTime / 1000,
            scroll_percentage: scrollPercentage,
        };
    }
});
