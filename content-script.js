function injectedJS() {
    let script = document.createElement('script')
    script.src = chrome.runtime.getURL('indexPage.js')
    console.log(script.src)
    script.crossOrigin='anonymous'
    // (document.head || document.documentElement).appendChild(script)
    let firstChild = document.head.firstChild
    document.head.insertBefore(script, firstChild)
    // document.head.appendChild(script)
    // script.remove();
}

injectedJS()


