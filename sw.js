var imgs = []
var cachesName = 'c1'
for(var i = 0; i< 10; i++) {
    imgs.push('/images/筑基丹 - 副本 ('+ i +').jpg')
}
var cachesData = imgs.concat([
    '/jquery.js',
    '/app.js',
    '/img_list.js',
    '/index.html',
    '/images/t.gif'
])

// 安装 install 事件监听器
// 这里用caches作为网络缓存使用
self.addEventListener('install', event => {
    console.log('install 事件监听器')
    event.waitUntil(
        // 获取缓存 a1, 并加入缓存地址
        caches.open(cachesName).then(cache => {
            for(let i = 0; i< cachesData.length; i++) {
                fetch(cachesData[i]).then(function (response) {     // 这部分代码等于 cache.add()
                    if (!response.ok) {
                        throw new TypeError('bad response status');
                    }
                    return cache.put(cachesData[i], response);
                })
            }
        })
    )
})

// fetch 的事件监听器  劫持我们的 HTTP 响应

self.addEventListener('fetch', event => {
    console.log(666, event)
    // 获取到响应
    event.respondWith(
        // 匹配路由成功的操作以及失败的操作
        caches.match(event.request).then(function(response) {
            console.log('fetch 的事件监听器', response)
            // 成功，那么去请求本地网络资源，否则打开 a1克隆一份
            return response || fetch(event.request).then(function(response) {

                let responseClone = response.clone()
        
                caches.open(cachesName).then(cache => {
                    cache.put(event.request, responseClone)
                })
                return response
            })
        }).catch(function() {
            // 匹配不到也要放回给他默认的
            return caches.match('images/t.gif')
        })
    );
});