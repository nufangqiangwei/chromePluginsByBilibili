(function (xhr) {

    const XHR = XMLHttpRequest.prototype;

    const open = XHR.open;
    const send = XHR.send;
    const setRequestHeader = XHR.setRequestHeader;

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
            const endTime = (new Date()).toISOString();

            const myUrl = this._url ? this._url.toLowerCase() : this._url;
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
                const responseHeaders = this.getAllResponseHeaders();
                if (this._url.startsWith('//api.bilibili.com/x/polymer/web-dynamic/v1/feed/all')) {
                    // console.log(this.responseText)
                    dealWithNativeResponse(JSON.parse(this.responseText))
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

pageIndex = 1

function generationVideoCard(VideoUuid, CoverUrl, Title, VideoDesc, AuthorName, AuthorUuid) {
    const videoElement = document.createElement("div");
    videoElement.classList.add("pluginVideo");
    const videoA = document.createElement("a");
    videoA.href = `//www.bilibili.com/video/${VideoUuid}`;
    videoA.target = "_blank";

    const videoImage = document.createElement("img");
    videoImage.src = CoverUrl;
    videoImage.alt = Title;

    const videoInfo = document.createElement("div");
    videoInfo.classList.add("pluginVideoInfo");

    const videoTitle = document.createElement("h2");
    videoTitle.classList.add("pluginVideoTitle");
    videoTitle.textContent = Title;

    const videoDescription = document.createElement("p");
    videoDescription.classList.add("pluginVideoDescription");
    videoDescription.textContent = VideoDesc;

    const videoAuthorA = document.createElement("a");
    videoAuthorA.href = `https://space.bilibili.com/${AuthorUuid}`;
    videoAuthorA.target = "_blank";

    const videoViews = document.createElement("a");
    videoViews.classList.add("pluginVideoAuthor");
    videoViews.textContent = AuthorName;

    videoInfo.appendChild(videoTitle);
    videoInfo.appendChild(videoDescription);
    videoAuthorA.appendChild(videoViews);
    videoInfo.appendChild(videoAuthorA);
    videoA.appendChild(videoImage);


    videoElement.appendChild(videoA);
    videoElement.appendChild(videoInfo);
    return videoElement;
}

// 从自己的服务器获取数据源
function dealWithSelfResponse(response) {
    for (const info of response.data) {
        videoGrid.appendChild(generationVideoCard(info))
    }
}

function getSelfVideo() {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", `http://127.0.0.1:8000/getVideoList?page=${pageIndex}`)
    xhr.addEventListener("load", (e) => {
        dealWithSelfResponse(JSON.parse(xhr.responseText))
        pageIndex++
    })
    xhr.send()
}


// 从b站获取数据源
async function dealWithNativeResponse(dynamicResponseData) {
    if (dynamicResponseData.data.items === undefined) {
        return
    }
    for (const videoInfoData of dynamicResponseData.data.items) {
        videoGrid.appendChild(generationVideoCard(
            videoInfoData.modules.module_dynamic.major.archive.bvid,
            videoInfoData.modules.module_dynamic.major.archive.cover,
            videoInfoData.modules.module_dynamic.major.archive.title,
            videoInfoData.modules.module_dynamic.major.archive.desc,
            videoInfoData.modules.module_author.name,
            videoInfoData.modules.module_author.mid
        ))
    }
}

function getNativeFirstVideo() {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?type=video&page=1`)
    xhr.addEventListener("load", (e) => {
        dealWithNativeResponse(JSON.parse(xhr.responseText))
    })
    xhr.withCredentials = true
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
    getNativeFirstVideo()
    // console.log(document.cookie)
}



