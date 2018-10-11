# service-worker

[在线预览地址](https://xiaoshengkai.top/service-worker/)

含义：瀏覽器為JavaScript提供了多線程能力—— Web worker

- Worker線程不能操作主線程的某些對象（如DOM）。
- Worker線程與主線程不共享數據，只能通過消息機制（postMessage）傳遞數據。

Service worker也是一種Web Worker，只是它的能力比一般的Web worker要強大得多，這主要體現在：

- 一旦被安裝，就永遠存在，除非註銷；
- 用到的時候喚醒，閒置的時候睡眠；
- 可以作為代理攔截請求和響應；
- 離線狀態下也可用。

能力越大，責任也越大，所以 Service worker 僅在 HTTPS協議（或localhost:*域）下可用。

如果只是用来作为一个交互体验的优化，可以理解为缓存来使用，那么一般缓存关键资源并且是get请求的资源

### 掌握的核心

- CacheStorage：接口表示 Cache 对象的存储,是一种客户端缓存机制，可以通过属性caches访问到CacheStorage
- fetch：用来代替 XMLHttpRequest ，提供了一种简单，合理的方式来跨网络异步获取资源。
- service worker 使用步骤： 需要经过註冊 、 安裝 、 激活 這三個步驟，才可以對頁面生效


### 开始使用

通过一个demo，了解 service worker 生命周期中与CacheStorage的交互，以及fetch请求资源的使用

#### 1. 注册

在注册之前先看一张图：

![image](https://img2.tuicool.com/7ZNZRzI.png)

发现总的支持性能还行，但是微信浏览器还不行，所以在使用之前先处理他的可用性  

> 'serviceWorker' in navigator  

注册api
> navigator.serviceWorker.register

所使用的是es6 promise语法，所以在使用server-worker之前必须掌握promise

```
// index.html

    <!DOCTYPE html>
    <html lang="en">
        <head>
        </head>
        <body>
            <script src="/sw.js"></script>
        </body>
    </html>

// sw.js
    
    // 因为他的兼容性，首先得判断他是否能使用
    if ('serviceWorker' in navigator) {
        // 注册
        navigator.serviceWorker.register(scope + '/sw.js')
        .then(reg => {
            // 监听各个周期
            if(reg.installing) {
                console.log('Service worker installing');
            } else if(reg.waiting) {
                console.log('Service worker installed');
            } else if(reg.active) {
                console.log('Service worker active');
            }
        })
        .catch(e => {
            console.log(e)
        })
    }

```


> 这里注册的时候有一个域的问题

```
navigator.serviceWorker.register(scope + '/sw.js') 这里sw.js的文件路径是相对于站点路径，不是当前文件路径
```

#### 2. 安装

这个阶段可以 实现预缓存以及缓存更新，这里涉及到 

- 进入安装阶段
- caches API
- cache API: 来自 caches.open().then(cache => {} ) 中的返回值

```
// 安装 install 事件监听器
// 这里用caches作为网络缓存使用

const CACHESNAME = 'A5'

self.addEventListener('install', event => {
    event.waitUntil(
        // 注册之前清理无用（版本不匹配cache）
        // 获取cache键名
        caches.keys().then(list => {
            list.forEach(key => {
                if (CACHESNAME !== key) {
                    // 删除cache
                    caches.delete(key)
                }
            })
        })
        // 预缓存
        .then(() => {
            // 打开 某个cache
            caches.open(CACHESNAME)
            // 获取缓存, 并加入缓存地址，
            .then(cache => {
                for(let i = 0; i< cachesData.length; i++) {
                    fetch(cachesData[i]).then(function (response) {     // 这部分代码等于 cache.add()
                        if (!response.ok) {
                            throw new TypeError('bad response status');
                        }
                        return cache.put(cachesData[i], response);  
                    })
                }
            })
        })
        // 更新：新的 Service worker 馬上生效
        .then(() => {
            return self.skipWaiting()
        })
    )
})
```

#### 3. 激活

Service worker 激活後就會成為 頁面跟瀏覽器之間 的代理，这个时候会触发他的fetch事件

这里可以实现另外一种缓存策略：增量緩存 

其实在存入缓存之前应该排除的几种情况

- 获取不到资源，就不能把这个请求或者URL放入缓存
- 非get请求

```
// fetch 的事件监听器  劫持我们这个应用的所有 HTTP 响应
self.addEventListener('fetch', event => {
    // 获取到响应
    event.respondWith(
        // 匹配路由成功的操作以及失败的操作
        caches.match(event.request).then(function(response) {

            // 匹配成功，直接返回使用，否则发起请求去获取资源
            // 增量缓存
            return response || fetch(event.request).then(function(response) {
                // 克隆返回结果
                let responseClone = response.clone()
                // 保存到cahce
                caches.open(CACHESNAME).then(cache => {
                    cache.put(event.request, responseClone)
                })
                return response
            })
        }).catch(function() {
            // 匹配不到也要放回给他默认的
            return caches.match(scope + '/images/t.gif')
        })
    );
});
```

### 小结

最後我們必須搞清楚一個問題： Service worker + CacheStorage 的緩存機制與 HTTP緩存 其實是比較相似的，為什麼需要兩種相似的緩存？

- 其一，HTTP緩存則是由服務器（響應頭）控制的，且緩存過期前，服務器無法通知瀏覽器清理緩存；
- 其二， Service worker 可以在瀏覽器端實現對緩存的有效控制，包括 緩存策略 與 緩存清理 ；
- 其三， Service worker 支持離線運行，在離線或網絡不好的情況下可以 快速響應 ，這一點對信號不穩定的 移動網絡 來説尤其重要。

性能检测：

正常网速下面没有太大的区别，其实很好理解，无论是CacheStorge还是http缓存，本质上都来源于磁盘或者内存，
既然来源一样，那么获取的速度自然没有什么区别？但是如果你把网络切换到3g（google在调试器network上）或
者更低你会发现区别

