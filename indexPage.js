observerOptions = {
    childList: true, // 观察目标子节点的变化，是否有添加或者删除
    attributes: false, // 观察属性变动
    subtree: false, // 观察后代节点，默认为 false
}
observer = undefined
RecommendVideo = []
const recommendVideoUrl = 'https://bilproxy.lushen.click/recommendVideo';
const videoCardBodyClassName = "container is-version8"
var lastRequestOff = false
function indexPage() {
    let videoCardBody = document.getElementsByClassName(videoCardBodyClassName)
    console.log("indexPage run")
    console.log(videoCardBody)
    if (videoCardBody.length > 0) {
        videoCardBody = videoCardBody[0]
        if (observer === undefined) {
            observer = new MutationObserver(indexVideoCardAppend)
        }
        observer.observe(videoCardBody, observerOptions)
    } else {
        console.log("代码需要更新，找不到", videoCardBodyClassName, "节点")
    }
}

// observer.disconnect()
function indexVideoCardAppend(mutationList, observer) {
    console.log("indexVideoCardAppend")
    let childList = false
    for (let childDom of mutationList) {
        // childDom结构 https://developer.mozilla.org/zh-CN/docs/Web/API/MutationRecord
        switch (childDom.type) {
            case "childList":
                childList = true
        }
    }
    if (!lastRequestOff) {
        lastRequestOff = true
        setTimeout(function () {
            if (childList){
                extractVideoCardInfo()
            }
        }, 4000)
    }

}

/**
 提取class=container is-version8节点的所有子节点。
 只取出class='feed-card'、'bili-video-card is-rcmd'、'floor-single-card'这些类的子节点。
 在这些子节点中取出视频信息，包含视频的bvid、作者名称、视频类型
 **/
const childClassName = ['feed-card', 'bili-video-card is-rcmd', 'floor-single-card']
const videoBid = new Set()
function extractVideoCardInfo() {
    let videoCardBody = document.getElementsByClassName(videoCardBodyClassName)[0]
    for (let childDom of videoCardBody.children) {
        let videoPlayUrl,videoOwnerUrl,videoOwnerName,xpathNode
        if (childClassName.includes(childDom.className)) {
            let xpathResult = document.evaluate('.//a[@class="bili-video-card__image--link"]/@href', childDom, null, XPathResult.ANY_TYPE, null)
            xpathNode = xpathResult.iterateNext()
            if (xpathNode) {
                videoPlayUrl = xpathNode.value
            }
            xpathResult = document.evaluate('.//a[@class="bili-video-card__info--owner"]/@href', childDom, null, XPathResult.ANY_TYPE, null)
            xpathNode = xpathResult.iterateNext()
            if (xpathNode) {
                videoOwnerUrl = xpathNode.value
            }
            xpathResult = document.evaluate('.//span[@class="bili-video-card__info--author"]/@title', childDom, null, XPathResult.ANY_TYPE, null)
            xpathNode = xpathResult.iterateNext()
            if (xpathNode) {
                videoOwnerName = xpathNode.value
            }
            if (videoPlayUrl !== undefined && videoPlayUrl.startsWith("https://www.bilibili.com/video")){
                videoPlayUrl = videoPlayUrl.replace("https://www.bilibili.com/video/","")
                if (!videoBid.has(videoPlayUrl)){
                    videoBid.add(videoPlayUrl)
                    videoOwnerUrl = videoOwnerUrl.replace("https://space.bilibili.com/","")
                    RecommendVideo.push({
                        Bvid:videoPlayUrl,
                        AuthorId:videoOwnerUrl,
                        AuthorName:videoOwnerName,
                    })
                }
            }
        }
    }
    console.log(RecommendVideo)
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(RecommendVideo),
        mode: 'no-cors'
    }
    fetch(recommendVideoUrl, requestOptions)
        .then(response => {
            // 在这里处理后端返回的JSON数据
            console.log(response);
            RecommendVideo.splice(0)
            lastRequestOff = false
        })
        .catch(error => {
            // 处理请求错误
            console.error('Error:', error);
        })
}


console.log("content-script.js run")
setTimeout(function () {
    indexPage()
}, 5000)
