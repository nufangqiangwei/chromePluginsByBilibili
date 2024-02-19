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
    }  else if (tabPath.endsWith('fans/follow')) {
        // console.log("follow")
        // injectedJS('follow.js')
        (async () => {
            const src = chrome.runtime.getURL("./follow.js");
            const contentMain = await import(src);
            contentMain.main();
        })();
    }else{
        console.log("index")
        injectedJS('indexPage.js')
    }
}


setTimeout(main, 1000)



