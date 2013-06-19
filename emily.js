chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        var iscomplete = false;
        console.log(changeInfo);
        if (changeInfo.status == "complete"){
            iscomplete = true;
            
        }
	    if (changeInfo.status == "loading") {
            console.log("starting...");
            nt=JSON.stringify(window.performance.timing);
            console.log('performancetimg project contents'+nt);
            var navigationtiming=JSON.parse(nt);
            var preunload=navigationtiming.domainLookupStart-navigationtiming.navigationStart;
            var dns=navigationtiming.domainLookupEnd-navigationtiming.domainLookupStart;
            var connect=navigationtiming.connectEnd-navigationtiming.connectStart;
            var wait=navigationtiming.requestStart-navigationtiming.connectEnd;
            var req=navigationtiming.responseStart-navigationtiming.requestStart;
            var resp=navigationtiming.responseEnd-navigationtiming.responseStart;
            var dom=navigationtiming.domComplete-navigationtiming.fetchStart;
            var loadEvent=navigationtiming.loadEventEnd-navigationtiming.fetchStart;
            console.log('preunload: '+preunload+'dns: '+dns+'connect: '+connect+'wait: '+wait+'req: '+req+'resp: '+resp+'dom: '+dom+'loadEvent: '+loadEvent);
            var datas=new Array(preunload,dns,connect,wait,req,resp,dom,loadEvent);
            console.log(datas);
            if (document.cookie.length>0){　
                document.cookie=0;
                }    
            alert([
            'preunload : ' + preunload,
            'dns : ' + dns,
            'connect : ' + connect,
            'wait : ' + wait,
            'req : ' + req,
            'resp : ' + resp,
            'dom : ' + dom,
            'loadEvent : ' + loadEvent
        ].join('\n'));  
    setTimeout(function(){
        chrome.tabs.onCreated.addListener(function(tab) {
            stopTimer();   
            if (tab.url.indexOf("http://touch.anjuke.com") > 0)     
            startTimer();   
        })}, 5000);
    }
});

