let s = document.createElement('script')
s.src = chrome.runtime.getURL('injected.js')
(document.head || document.documentElement).appendChild(s)
