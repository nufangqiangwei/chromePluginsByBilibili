function injectedJS(scriptName) {
    let script = document.createElement('script')
    script.src = chrome.runtime.getURL(scriptName)
    console.log(script.src)
    script.crossOrigin = 'anonymous'
    // (document.head || document.documentElement).appendChild(script)
    let firstChild = document.head.firstChild
    document.head.insertBefore(script, firstChild)
    // document.head.appendChild(script)
    // script.remove();
}

function main() {
    let tabUrl = window.location.href;
    tabUrl = new URL(tabUrl);
    let tabPath = tabUrl.pathname
    if (tabPath.startsWith('/video')) {
        console.log("video")
        injectedJS('videoPlay.js')
    } else if (tabPath.startsWith('/')) {
        console.log("index")
        injectedJS('indexPage.js')
    }
}


setTimeout(main, 1000)


// 需要发送请求的地方
chrome.runtime.sendMessage(
    {
        // 里面的值应该可以自定义，用于判断哪个请求之类的
        type: 'fetch',
        url: "url" // 需要请求的url
    },
    response => JSON.parse(response.text()));
