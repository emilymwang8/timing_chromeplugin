var namespace = {};
 
 
void function (window, document,  ns, undefined){
 
     
    ns = window[ns];
     
    if(!window.performance || ns.Performance){
    //performance api , (Date : 2011-11),  ie9+(包括兼容模式), chrome11+, Firefox7+ . (Safari,Opera. 没有实现) 
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
                /*
                 
                    ie9+ 兼容模式. performance 可用，但ES5 相关特性不可用.
                    但是getter 的设计,本来是为了解决.获取时间不正确的状况处理的.
                    比如 responseTime 的设计.  为了解决这个问题.引入了update接口.
                 
                */
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
                /*  
                    0  nomal get or link .  
                    1  reload.   
                    2 back forward.
                    3 reserved . (oters method.)
                    但应注意的是,Firefox8+,开始又恢复了Firefox3.5-的老问题，即返回（后退）的方式访问页面，onload不会被触发.
                    所以如果搜集信息上报,是在onload回调中,就要警惕,Firefox8+浏览器，会导致上报脚本，没有被执行的问题.
                    Opera,Safari 也存在同样的问题,将来这两款浏览器支持performance时也应注意.
                    另外一个问题就是,domContentLoaded事件存在onload同样的问题.只有IE和Chrome,没有这个问题.
                    最靠谱的做法是注册到onpageshow上(如果浏览器支持的话). 否则.除非我们牺牲精准度.来直接执行脚本...
                     
                     
                    辅onpageshow 事件支持情况:
                     
                        onpageshow的支持列表:
                        Firefox 1.5 +
                        Safari5+
                        Chrome4+
 
                        Opera12,IE10 PP2,至今仍未支持 .
                     
                */
            },
            redirectCount : {//只能统计到同源的重定向次数.
                value : navigation.redirectCount
            },
            redirectTime : {//重定向消耗的时间.
                value : timing.redirectEnd - timing.redirectStart
            },
            /* fetchTime,我们 拿到，没什么价值，也没有优化的可能性存在.
            fetchTime : {
                value : Math.max(timing.domainLookupStart - timing.fetchStart, 0)
                //Firefox的domainLookupStart，如果因没有发生dns look up ,则该值不是fetchStart,而是navigationStart的值.并没有遵守标准.
            },
            */
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
                /*
                 
                    .responseEnd
                    返回用户代理接收到最后一个字符的时间，和当前连接被关闭的时间中，更早的那个. 同样,文档可能来自服务器、缓存、或本地资源.
                    补充: 此值的读取应该是在我们可以确保真的是Response结束以后. 比如window.onload.  因为考虑到chunked输出的情况. 那么我们脚本执行，并获取该值时，响应还没有结束. 这就会导致获取时间不准确.
                    bugs : 
                         1. IE10 PP2, 以及Chrome17- ，走本地缓存时.在文档中间的脚本执行时去读取此值, 将为0. IE9本来没有问题,结果IE10 PP2,反倒有了问题.
                         2. Chrome16-,(Chrome17,已修复此问题.)在地址栏输入相同地址,走本地缓存时. responseEnd的时间，居然早于responseStart的时间. （不得不承认，这简直就是奇葩啊!）
                         3. Chrome17-,从页面a,到地址b,再重定向到地址c, 此时如果地址c是走缓存.则. ResponseEnd的时间，会早于ResponseStart的时间.(好吧,我们把希望寄予Chrome18好了.)
 
                    实现差异:(由于草案中，并未提及,当文档被分段输出后.在中间文档数据，接受过程中,responseEnd应如何处理,导致浏览器实现存在差异.)
                         IE9 - IE10 PP2 , Firefox8-Firefox10,在不走存在Response阶段（非走cache的情况下.）.会根据每次接收到的数据块的时间,去更新.responseEnd的时间.
                         Chrome17-,Firefox7,则在分段数据的接受过程中，不会更新.responseEnd的时间,其值,始终为0.
 
                         
                    基于不确定性,所以该值被获取的时如果过早，就返回 -1, 否则返回正确的值.
                    DomContentLoaded., 即语义上的DOM Parse 也早已结束了.而且其他资源也都加在完毕了.   而更早的 domInteractive .IE系列存在bug:
                    IE9 - IE10 PP2(IE10,走cache情况除外). 在分段输出文档的情况下，该值并不是全部文档解析完成后的时间,而是第一个数据块被解析完成的时间. 
 
                        实现差异:(由于草案中，并未提及,文档解析并未结束时,其默认值的应该是多少.导致浏览器实现有差异.)
                        按我个人理解，并未解析结束，应该为0. 但是IE似乎对这个东西理解不太一样. 其他浏览器会是0. 
                        但是. IE9-IE10 PP2,则会比较有趣.即使是分段输出,我取到的值.也和onload以后去到的,domInteractive的值是一致的.  
                        导致这一神奇现象的原因是,正式IE系的bug所导. 该时间是错误的引用了,DOM解析完成第一个数据块的时间.而不是整个文档的. 
                        但是纠结起来就要挖掘更深层次的原因了. 因为草案只说该值体现的是,用户代理把"current document readiness" 设置为 "interactive"的时间.
                        如果IE系处理分段输出的html文档，向来都是这样做的。那么该值与其他浏览器的差异。也是可以理解的. 
                     
                    基于，以上综合原因，所以决定借助domContentLoadedEventStart 检测来确定responseTime是否可信. 如不可信，则返回-1.
                 
                */
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
                    /*
                        注意IE9 - IE10 PP2,bug.  IE下，这个计算出来的值，仅共参考.完全不靠谱.
                        iE9 - IE10 PP2 , 当文档是chunked方式输出的时候.总是要等最后一个chunked被浏览器接收后,
                        domLoading才会有有效值.  也就是说,IE中目前的状况是.domLoading.无论如何，都要晚于responseEnd.
                        其他浏览器则无此问题.  但是这个问题导致我们计算IE下DOM Parsing等后续的一系列时间不准确. 
                        即 domInteractive - domLoading 甚至会经常得到0.   
                         
                         
                         
                     
                    */
                     
                   
                    return timing.domContentLoadedEventStart ? timing.domInteractive - timing.domLoading : -1;
                }
            },
            resourcesLoadedTime : {//IE系列不可信任,原因当然是分段输出问题.domLoading不准确,导致后续计算都不准确的问题.所以仅供参考.
                /*
                   此时间指的是.页面所有onload计算范围内的资源加载结束后到文档开始进行dom parse的时间段. 
                 
                */
                get : function () {
                    return timing.loadEventStart ? timing.loadEventStart - timing.domLoading : -1;
                }
            },
            firstPaintTime : {//从导航到页面首次渲染所消耗的时间.(该属性并非标准的属性.而是微软私有的.目前IE9+支持)
                get : function () {//如果都不支持该属性，或，读取该属性时，页面还没有渲染,则返回 -1;
                    //这段代码是一个愿望，希望将来,firstPaint 将进入草案，并被浏览器实现.哪怕他们依赖前缀.
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
     
    }, 3000);
}
