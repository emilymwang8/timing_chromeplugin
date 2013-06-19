var namespace = {};
 
 
void function (window, document,  ns, undefined){
 
     
    ns = window[ns];
     
    if(!window.performance || ns.Performance){
         return;
    }
     
     
    var mixin = function (oTarget ,oSource) {
            var s;
            for (s in oSource){
                if(oSource.hasOwnProperty(s)){
                    oTarget[s] = oSource[s];
                }
            }
            return oTarget;
        },
        performance = window.performance,
        timing = performance.timing,
        navigation = performance.navigation,
        create = function (properties) {
            var obj;
             
            if(Object.create){
                return Object.create(null, properties);
            }
             
             
            obj = {};
            for (var s  in properties){
              
                if(properties.hasOwnProperty(s)){
                    if(typeof properties[s].get == 'function'){
                        //如果属性是一个函数,那么就应该是需要延迟获取的属性.则调用相关get方法获取当前值.
                        obj[s] = properties[s].get();
                    }else{
                        obj[s] = properties[s].value;
                    }
                }
            }
            return obj; 
        },
        properties = {
            isDirectClientCache : {//是否直接走的客户端缓存.
                value : function () {
                    if(navigation.type === 1){//刷新的访问,自然不可能直接走cache.
                        return false;
                    }
                    if(timing.requestStart === 0){//Firefox7,当直接走缓存时request,connect相关时间节点都为0
                        return true;
                    }
                    if(timing.connectStart === timing.connectEnd){//Freifox8+,Chrome11+,IE9+
                    //应注意的是,有时候304时, 如果资源问本地文件，chrome会因为connect连接建立过快，而导致 此处为true. 但基本线上应不会出现此类问题.
                    //另一个解决思路是对比responseStart和responseEnd.但这个受干扰影响更多.更不靠谱.
                        return true;
                    }
                     
                    return false;
                }()
            },
            navigationType : {
                value : navigation.type 
              
            },
            redirectCount : {//只能统计到同源的重定向次数.
                value : navigation.redirectCount
            },
            redirectTime : {//重定向消耗的时间.
                value : timing.redirectEnd - timing.redirectStart
            },
           
            domainLookupTime : {
                value : timing.domainLookupEnd - timing.domainLookupStart
            },
            connectTime : {//注意,这个不是连接保持的时间,而是与服务器端建立连接所花费的时间.
                value : timing.connectEnd - timing.connectStart
            },
            requestTime : {//因为木有准确的获取RequestEnd的有效办法.所以这个值实际上是我们接收到服务器响应数据的那个时间 减去发出HTTP请求，所花费的时间.
                //注意,Firefox 7,在走cache时.requestStart,会为0.Firefox8以修复.当无法正确获取时,我们应该返回 -1.
                value : timing.responseStart - (timing.requestStart || timing.responseStart + 1)
            }
        },
        deferrProperites = {
                //延时的属性
            responseTime : {
               
                get : function () {//此值IE9仅共参考.并不值信任.IE10则可信任.
                    var val = timing.responseEnd - timing.responseStart;
                    if(timing.domContentLoadedEventStart){
                        if(val < 0 ) {//修正chrome16- 走cache时的bug.
                            val = 0;
                        }
                    }else {
                        val = -1;
                    }
                    return val;
                }
                 
            },
            domParsingTime : {//IE系不可信任.职能期待IE系将来的实现了.
                get : function () {
                                       
                   
                    return timing.domContentLoadedEventStart ? timing.domInteractive - timing.domLoading : -1;
                }
            },
            resourcesLoadedTime : {
                get : function () {
                    return timing.loadEventStart ? timing.loadEventStart - timing.domLoading : -1;
                }
            },
            firstPaintTime : {
                get : function () {
                    var t = timing.firstPaint ||  
                            timing.msFirstPaint || 
                            timing.mozFirstPaint || 
                            timing.webkitFirstPaint || 
                            timing.oFirstPaint;
                             
                    return t ? t - timing.fetchStart : -1; 
                             
                     
                }
            },
            domContentLoadedTime : {//从导航 到 页面domReady所消耗的时间. 
                get : function () {
                     return timing.domContentLoadedEventStart ? timing.domContentLoadedEventStart - timing.fetchStart : -1;
                }
            },
            windowLoadedTime :{//获取当前文档fetchStart 到 window.onload,所花费的总时间.
                get : function () {
                    return timing.loadEventStart ? timing.loadEventStart - timing.fetchStart : -1;
                }
            }
        },
        pfm = create(mixin(properties, deferrProperites));
         
         
    ns.Performance = pfm;
 
     
     
    if(Object.defineProperty){//单体对象的方法，没有必要挂在到prototype上. so ..
        Object.defineProperty(pfm, 'update', {value : function () {return this;}});
    }else{ //for IE9+,兼容模式. 需要每次依赖update方法，每次都去手动更新那些不靠谱的东西.
        pfm.update = function () {
            for (var s in deferrProperites){
                if(deferrProperites.hasOwnProperty(s)){
                    pfm[s] = deferrProperites[s].get();
                }
            }
        }
    }
 
     
     
     
}(window, document, 'namespace');
 
 
window.onload = function () {
    setTimeout(function () {
        var pfm = namespace.Performance;
        pfm.update();
        alert([
            'isDirectClientCache : ' + pfm.isDirectClientCache,
            'navigationType : ' + pfm.navigationType,
            'redirectCount : ' + pfm.redirectCount,
            'redirectTime : ' + pfm.redirectTime,
            'domainLookupTime : ' + pfm.domainLookupTime,
            'connectTime : ' + pfm.connectTime,
            'requestTime : ' + pfm.requestTime,
            'responseTime : ' + pfm.responseTime,
            'domParsingTime : ' + pfm.domParsingTime,
            'resourcesLoadedTime : ' + pfm.resourcesLoadedTime,
            'firstPaintTime : ' + pfm.firstPaintTime,
            'domContentLoadedTime : ' + pfm.domContentLoadedTime,
            'windowLoadedTime : ' + pfm.windowLoadedTime
        ].join('\n'));
     
    }, 300);
}
