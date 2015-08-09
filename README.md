## 这是一个chrome plugin for test the performace of http://touch.anjuke.com#
## 使用方法如下：#
1. git clone git@git.corp.anjuke.com:mingyongwang/webtouch_chromeplugin
2. 打开chrome 浏览器设置加载页为http://touch.anjuke.com,
3. 拖动webtouch_chromeplugin.crx文件到浏览器里,这个文件是公钥文件，然后copy webtouch_chromeplugin.pem 至本机这个文件是私钥文件,然后通过浏览器访问http://touch.anjuke.com 网址，就会看到监测结果。

## 注意：如果想测试其它网站，请将重复step 2和3。另外，每次只能测试一次，如果想多次测试请先清浏览器缓存后关闭浏览器再次重复步骤2,3。
--------
chrome plugin developing process:
1.写4个文件：*.html  *.json  *.png   *.js 有了这四个文件chrome 插件的代码部分就结束了。下面举例介绍四个文件的功能：
manifest.json - 所有插件都要有这个文件，这是插件的配置文件，可看作插件的“入口”。
icon.png - 小图标，推荐使用19*19的半透明png图片，更好的做法是同时提供一张38*38的半透明的png图片作为大图标，在我后面提供的例子中，我就是那么干的。
popup.html - 就是你所看到的那个阿猫阿狗的弹出页面。
popup.js - 阿猫阿狗页面所引用的javascript文件。

2. 打开chrome Extentions 页面，在“Load unpacked extention"页面中导入目录，点击确定后，即导入插件，也可以在线调试。
3. 调试成功后，打开"Pack extension"页面，键入插件目录，第一次生成Pack Extension时可以不键入公钥，因为此时没有生成公钥和私钥。点击“Pack Extention"生成.crx  .pem公钥和私钥两个文件。
4.以后使用时，可以直接将公钥拖至浏览器的Extensions 页面中即可使用。私钥留在本机中的任意位置。
