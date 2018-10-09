var headers = new Headers();
// *** I set the header in order to solve the error above:
// *** The value is set to "/" because this js is included in html file in upper folder.
// *** I tried even "../" and many more others values...
headers.append('Service-Worker-Allowed', '/service-worker');
console.log(headers.get('Service-Worker-Allowed'));


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker/sw.js', { scope: '/service-worker' })
    .then(reg => {
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

/* jq请求 */

// window.onload = function () {

//     function  getImgUrl (localUrl, fn) {
//         $.ajax({
//             type: 'get',
//             url: localUrl,
//             dataType: 'blob',
//             success: function (data) {
//                 var reader = new FileReader()
//                 reader.readAsDataURL(data)
//                 reader.addEventListener("loadend", function() {
//                     $('body').append('<img src="'+ reader.result +'" alt="">')
//                 })
//             },
//             error: function (e) {
//                 console.log(e)
//             }
//         })
//     }
    
//     for(let i = 0; i< imgs.length; i++) {
//         getImgUrl(imgs[i].url)
//     }
// }

// function imgLoad(imgJSON) {
//     // return a promise for an image loading
//     return new Promise(function(resolve, reject) {
//     var request = new XMLHttpRequest();
//     request.open('GET', imgJSON.url);
//     request.responseType = 'blob';

//     request.onload = function() {
//         if (request.status == 200) {
//             resolve(window.URL.createObjectURL(request.response))
//         } else {
//         reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
//         }
//     };

//     request.onerror = function() {
//         reject(Error('There was a network error.'));
//     };

//     // Send the request
//     request.send();
//     });
// }

// window.onload = function() {

//     // load each set of image, alt text, name and caption
//     for(var i = 0; i < 10; i++) {
//     imgLoad(imgs[i]).then(function(url) {
//         var img = document.createElement('img')
//         img.src = url
//         document.body.appendChild(img)
//     }, function(Error) {
//         console.log(Error);
//     });
//     }
// };