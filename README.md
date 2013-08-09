## 这是一个chrome plugin for test the performace of http://touch.anjuke.com#
## 使用方法如下：#
1. git clone git@git.corp.anjuke.com:mingyongwang/webtouch_chromeplugin
2. 打开chrome 浏览器设置加载页为http://touch.anjuke.com,
3. 拖动webtouch_chromeplugin.crx文件到浏览器里,这个文件是公钥文件，然后copy webtouch_chromeplugin.pem 至本机这个文件是私钥文件,然后通过浏览器访问http://touch.anjuke.com 网址，就会看到监测结果。

# 注意：如果想测试其它网站，请将重复step 2和3。另外，每次只能测试一次，如果想多次测试请先清浏览器缓存后关闭浏览器再次重复步骤2,3。#

