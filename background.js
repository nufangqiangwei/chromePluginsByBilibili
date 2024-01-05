let dbName = "bilibiliVideo";
let request = indexedDB.open(dbName, 1);
let DB
request.onerror = function (event) {
    console.log("Error loading database.");
    console.log(event);
}
request.onsuccess = function (event) {
    console.log("Success loading database.");
    DB = event.target.result;
}

function saveRecommendVideo(data) {
    let transaction = DB.transaction("recommendVideo", "readwrite");
    let objectStore = transaction.objectStore("recommendVideo");
    let request = objectStore.add(data);
    request.onerror = function (event) {
        console.log("Error saving data.");
        console.log(event);
    }
    request.onsuccess = function (event) {
        console.log("Success saving data.");
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    request = JSON.parse(request)
    console.log(request)
    if (request.type === 'recommendVideo') {
        saveRecommendVideo(request.data)
    }else if (request.type === 'fetch') {
        // WARNING: SECURITY PROBLEM - a malicious webpage may abuse
        // the message handler to get access to arbitrary cross-origin
        // resources.
        fetch(request.url)
            .then(response => response.text())
            .then(text => sendResponse(text))
            .catch(error => sendResponse(error))
        return true;  // Will respond asynchronously.
    }
})
