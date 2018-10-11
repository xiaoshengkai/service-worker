var imgs = []
var CACHESNAME = 'A5'
var scope = '/service-worker'    // 域
// var scope = ''

for(var i = 0; i< 100; i++) {
    imgs.push(scope + '/images/筑基丹 - 副本 ('+ i +').jpg')
}
var cachesData = imgs.concat([
    // scope + '/jquery.js',
    // scope + '/app.js',
    // scope + '/index.html',
    scope + '/images/t.gif'
])

// 安装 install 事件监听器
// 这里用caches作为网络缓存使用
// 预缓存
self.addEventListener('install', event => {
    event.waitUntil(
        // 注册之前清理无用（版本不匹配cache）
        caches.keys().then(list => {
            list.forEach(key => {
                if (CACHESNAME !== key) {
                    caches.delete(key)
                }
            })
        })
        .then(() => {
            caches.open(CACHESNAME)
            // 获取缓存 a1, 并加入缓存地址
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

// fetch 的事件监听器  劫持我们的 HTTP 响应
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