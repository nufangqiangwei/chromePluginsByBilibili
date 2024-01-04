const urlRoutes = {
    "/x/web-interface/wbi/index/top/feed/rcmd": async function (responseBody) {
        console.log(responseBody)
    }
}
/*
const XHR = XMLHttpRequest.prototype;

const open = XHR.open;

XHR.open = function () {
    this.addEventListener('load', function () {
        console.log("XMLHttpRequest 请求url:",this.responseURL)
        const path = new URL(this.responseURL).pathname
        console.log("请求路径",path)
        const route = urlRoutes[path];
        if (route) {
            route(this.responseText)
        }
    })
    return open.apply(this, arguments);
};
*/
// addEventListener('fetch', event => {
//     console.log("fetch 请求url:",event.request.url)
//     const path = new URL(event.request.url).pathname
//     console.log("请求路径",path)
//     const route = urlRoutes[path];
//     if (route) {
//         event.respondWith(
//             fetch(event.request)
//                 .then(response => {
//                     if (response.ok) {
//                         return response.text();
//                     } else {
//                         throw new Error('Network response was not ok.');
//                     }
//                 })
//                 .then(data => {
//                     // 在这里处理响应体数据
//                     console.log("fetch 响应体:",data)
//                 })
//                 .catch(error => {
//                     console.error('There has been a problem with your fetch operation: ', error);
//                 })
//         );
//     }
// });

// https://juejin.cn/post/7021444877778944037
// 定义用来存储拦截请求和拦截响应结果的处理和错误结果处理的函数集合
let interceptorsReq = []
let interceptorsReqError = []
let interceptorsRes = []
let interceptorsResError = []

// 复制一份原生fetch的方法，后面我们还是得调用原生的fetch，只是我们在fetch之上做一层封装，添加我们想要的功能
const OriginFetch = window.fetch

function Cfetch(input, init = {}) {
    // interceptorsReq是拦截请求的拦截处理函数集合
    interceptorsReq.forEach(item => {
        init = item(init)
    })

    // 在原生fetch外面封装一个promise，为了在promise里面可以对fetch请求的结果做拦截处理。
    // 同时，保证Cfetch函数返回的结果是个promise对象。
    return new Promise((resolve, reject) => {
        // 发起fetch请求，fetch请求的形参是接收上层函数的形参
        OriginFetch(input, init).then(res => {
            // interceptorsRes是拦截响应结果的拦截处理函数集合
            interceptorsRes.forEach(item => {
                // 拦截器对响应结果做处理，把处理后的结果返回给响应结果。
                res = item(res)
            })
            // 将拦截器处理后的响应结果resolve出去
            resolve(res)
        })
            .catch(err => {
                // interceptorsResError是拦截响应错误结果的拦截处理函数集合
                interceptorsResError.forEach(item => {
                    // 拦截器对响应错误结果做处理，把处理后的结果返回给响应结果。
                    err = item(err)
                })
                reject(err)
            })
    })
}

// interceptors拦截器提供request和response两种拦截器功能。
// 可以通过request和response的use方法来绑定两种拦截器的处理函数。
// use方法接收两个参数，参数为一个callback函数，callback函数用来作为拦截器的成功处理函数，errorCallback作为错误处理函数
// request.use方法会把callback放在interceptorsReq中，等待执行。
// response.use方法会把callback放在interceptorsRes中，等待执行。
// 拦截器的处理函数callback接收一个参数。
// request拦截器的callback接收的是请求发起前的config；
// response拦截器的callback接收的是网络请求的response结果。
const interceptors = {
    request: {
        use(callback, errorCallback) {
            interceptorsReq.push(callback)
            errorCallback && interceptorsReqError.push(errorCallback)
        }
    },
    response: {
        use(callback, errorCallback) {
            interceptorsRes.push(callback)
            errorCallback && interceptorsResError.push(errorCallback)
        }
    }
}

/**
 * config 自定义配置项
 * @param withoutCheck 不使用默认的接口状态校验，直接返回 response
 * @param returnOrigin 是否返回整个 response 对象，为 false 只返回 response.data
 * @param showError 全局错误时，是否使用统一的报错方式
 * @param canEmpty 传输参数是否可以为空
 * @param mock 是否使用 mock 服务
 * @param timeout 接口请求超时时间，默认10秒
 */
let configDefault = {
    showError: true,
    canEmpty: false,
    returnOrigin: false,
    withoutCheck: false,
    mock: false,
    timeout: 10000
}

// 添加请求拦截器
// interceptors.request.use(config => {
//     // 这里是我项目使用到的js-cookie库，主要是为了拿到token，你们这里改成你们获取token的方式即可
//     const token = "Cookies.get('access_token')"
//     configDefault = Object.assign({
//         responseType: 'json',
//         headers: {
//             'Content-Type': 'application/json;charset=utf-8',
//             authorization: `Bearer ${token}`
//         },
//     }, configDefault, config)
//     console.log('添加请求拦截器 configDefalut ==>', configDefault)
//     return configDefault
// })

// 添加响应拦截器
interceptors.response.use(async response => {
    // console.log('拦截器response ==>', response)
    // console.log('configDefault', configDefault)

    console.log("fetch 请求url:",response.url)
    const path = new URL(response.url).pathname
    const route = urlRoutes[path];
    // TODO: 这里是复制一份结果处理，在这里可以做一些操作
    // const res = await resultReduction(response.clone())
    if (route){
        const res = await resultReduction(response.clone())
        console.log("fetch 响应体:",res)
    }
    // HTTP 状态码 2xx 状态入口，data.code 为 200 表示数据正确，无任何错误
    if (response.status >= 200 && response.status < 300) {
        return response
    } else { // 非 2xx 状态入口
        if (configDefault.withoutCheck) { // 不进行状态状态检测
            return Promise.reject(response)
        }
        return Promise.reject(response)
    }
})

// 结果处理，fetch请求响应结果是promise，还得处理
async function resultReduction(response) {
    let res = ''
    switch (configDefault.responseType) {
        case 'json':
            res = await response.json()
            break
        case 'text':
            res = await response.text()
            break
        case 'blod':
            res = await response.blod()
            break
        default:
            res = await response.json()
            break
    }
    console.log('结果处理', res)
    return res
}

function request(method, path, data, config) {
    let myInit = {
        method,
        ...configDefault,
        ...config,
        body: JSON.stringify(data),
    }
    if (method === 'GET') {
        let params = ''
        if (data) {
            // 对象转url参数
            params = JSON.stringify(data).replace(/:/g, '=')
                .replace(/"/g, '')
                .replace(/,/g, '&')
                .match(/\{([^)]*)\}/)[1]
        }
        return Cfetch(`${path}?${params}`, {
            ...configDefault,
            ...config,
        })
    }

    return Cfetch(path, myInit)
}

// get请求方法使用封装
function get(path, data, config) {
    return request('GET', path, data, config)
}

// post请求方法使用封装
function post(path, data, config) {
    return request('POST', path, data, config)
}

// put请求方法使用封装
function put(path, data, config) {
    return request('PUT', path, data, config)
}

// delete请求方法使用封装
function del(path, data, config) {
    return request('DELETE', path, data, config)
}

console.log('注入fetch')
window.fetch = Cfetch
// 删除document.head中的这个标签<script type="module" crossorigin src="//s1.hdslb.com/bfs/static/laputa-home/assets/index.dc4987a1.js"></script>

// let scriptElements = document.head.getElementsByTagName('script');
// let scriptUrl
// for (let i = 0; i < scriptElements.length; i++) {
//     const scriptElement = scriptElements[i];
//     if (scriptElement.src.includes('//s1.hdslb.com/bfs/static/laputa-home/assets/index')) {
//         scriptUrl = scriptElement.src
//         console.log(scriptUrl)
//         console.log('删除js')
//         scriptElement.remove()
//         break;
//     }
// }
// let scriptElement = document.createElement('script');
// scriptElement.src = scriptUrl
// scriptElement.type="module"
// scriptElement.crossOrigin='anonymous'
// console.log('重新加载js')
// document.head.appendChild(scriptElement)

// import {__vite_legacy_guard } from '//s1.hdslb.com/bfs/static/laputa-home/assets/index.dc4987a1.js'
// console.log(__vite_legacy_guard)
// __vite_legacy_guard()
