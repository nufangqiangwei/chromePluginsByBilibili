pageIndex = 1

class videoInfo {
    constructor() {
        this.AuthorName = ""
        this.AuthorUrl = ""
        this.AuthorUuid = ""
        this.CoverUrl = ""
        this.PushTime = 0
        this.Title = ""
        this.Url = ""
        this.VideoUuid = ""
        this.WebSite = ""
    }
}

function clickTo(url) {
    //跳转新页面
    window.open(url, "_blank")
}

function generationVideoCard(videoInfoData) {
    const videoElement = document.createElement("div");
    videoElement.classList.add("pluginVideo");

    const videoImage = document.createElement("img");
    videoImage.src = videoInfoData.CoverUrl;
    videoImage.alt = videoInfoData.Title;
    videoImage.addEventListener("click", () => {
        clickTo(`https://www.bilibili.com/video/${videoInfoData.VideoUuid}`);
    });

    const videoInfo = document.createElement("div");
    videoInfo.classList.add("pluginVideoInfo");

    const videoTitle = document.createElement("h2");
    videoTitle.classList.add("pluginVideoTitle");
    videoTitle.textContent = videoInfoData.title;

    const videoDescription = document.createElement("p");
    videoDescription.classList.add("pluginVideoDescription");
    videoDescription.textContent = videoInfoData.description;

    const videoViews = document.createElement("a");
    videoViews.classList.add("pluginVideoAuthor");
    videoViews.textContent = videoInfoData.AuthorName;
    videoViews.addEventListener("click", () => {
        clickTo(`https://space.bilibili.com/${videoInfoData.AuthorUuid}`);
    });

    videoInfo.appendChild(videoTitle);
    videoInfo.appendChild(videoDescription);
    videoInfo.appendChild(videoViews);

    videoElement.appendChild(videoImage);
    videoElement.appendChild(videoInfo);
    return videoElement;
}


function dealWithResponse(response) {
    for (const info of response.data) {
        videoGrid.appendChild(generationVideoCard(info))
    }
}

function getVideo() {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", `http://127.0.0.1:8000/getVideoList?page=${pageIndex}`)
    xhr.addEventListener("load", (e) => {
        dealWithResponse(JSON.parse(xhr.responseText))
        pageIndex++
    })
    xhr.send()
}

videoMotion = document.getElementsByClassName('bili-dyn-list')
leftDom = document.getElementsByClassName('left')
rightDom = document.getElementsByClassName('right')
mainDom = document.getElementsByTagName('main')
videoGrid = document.createElement('div')
videoGrid.className = "videoListGridContainer"
if (videoMotion.length > 0) {
    let dynList = videoMotion[0]
    let section = dynList.parentNode

    mainDom[0].style.width = (window.screen.width * 0.9) + 'px'
    dynList.remove()
    rightDom[0].remove()
    leftDom[0].remove()
    section.appendChild(videoGrid)
    getVideo()
    // 触底加载列表
    // document.body.onscroll = loadDynamicVideo
}


(function (xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {

        this.addEventListener('load', function () {
            var endTime = (new Date()).toISOString();

            var myUrl = this._url ? this._url.toLowerCase() : this._url;
            if (myUrl) {

                if (postData) {
                    if (typeof postData === 'string') {
                        try {
                            // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
                            this._requestHeaders = postData;
                        } catch (err) {
                            console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
                            console.log(err);
                        }
                    } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
                        // do something if you need
                    }
                }

                // here you get the RESPONSE HEADERS
                var responseHeaders = this.getAllResponseHeaders();
                if (this._url.startsWith('//api.bilibili.com/x/polymer/web-dynamic/v1/feed/all')) {
                    // console.log(this.responseText)
                    getVideo()
                }
                // if ( this.responseType != 'blob' && this.responseText) {
                //     // responseText is string or null
                //     try {
                //
                //         // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
                //         var arr = this.responseText;
                //
                //         // printing url, request headers, response headers, response body, to console
                //
                //         console.log(this._url);
                //         console.log(JSON.parse(this._requestHeaders));
                //         console.log(responseHeaders);
                //         console.log(JSON.parse(arr));
                //
                //     } catch(err) {
                //         console.log("Error in responseType try catch");
                //         console.log(err);
                //     }
                // }

            }
        });

        return send.apply(this, arguments);
    };

})(XMLHttpRequest)
