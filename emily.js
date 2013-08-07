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
	
	
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	var request = false;
    try {
        request = new XMLHttpRequest();
    } catch (trymicrosoft) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
			
        } catch (othermicrosoft) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (failed) {
                request = false;
            }
        }
    }
    //发送xmlhttp请求的方法
    
   
        var url = "http://localhost:8888?datas="+datas;
        request.open("get", url, true);
        request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        request.onreadystatechange = updatePage;
        request.send();
    
   
	 function updatePage() {
        if (request.readyState == 4)
            if (request.status == 200)
                console.log("Server is done!");
            else if (request.status == 404)
                console.log("Request URL does not exist");
            else
                console.log("Error: status code is " + request.status);
    	}

		 console.log("ok.send xmlhttp request successfully...");
		 

   
	});


		
});



