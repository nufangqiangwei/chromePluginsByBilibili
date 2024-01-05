const recommendVideoUrl = 'https://bilproxy.lushen.click/recommendVideo';
console.log("videoPlay run")

function getRecommendVideo() {
    let button = null
    button = document.getElementsByClassName('rec-footer')
    if (button.length > 0) {
        button[0].click()
        console.log("click rec-footer")
    } else {
        console.log("代码需要更新，找不到", 'rec-footer', "节点")
    }
    setTimeout(function () {
        let videoCard = document.getElementsByClassName('card-box')
        let result = []
        for (let card of videoCard) {
            let videoInfo = {}
            videoInfo.bvid = card.children[1].firstChild.href
            if (videoInfo.bvid.indexOf('video/BV') === -1) {
                continue
            }
            videoInfo.title = card.children[1].firstChild.firstChild.title
            videoInfo.authorId = card.children[1].children[1].firstChild.href
            videoInfo.authorName = card.children[1].children[1].firstChild.children[1].innerText
            if (videoInfo.bvid !== undefined) {
                videoInfo.bvid = videoInfo.bvid.split('/')[4]
            }
            if (videoInfo.authorId !== undefined) {
                videoInfo.authorId = videoInfo.authorId.split('/')[3]
            }
            result.push(videoInfo)
        }
        if (result.length > 0) {
            console.log(result)
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(result),
                mode: 'no-cors'
            }
            fetch(recommendVideoUrl, requestOptions)
                .then(response => {
                    // 在这里处理后端返回的JSON数据
                    console.log(response);
                    lastRequestOff = false
                })
                .catch(error => {
                    // 处理请求错误
                    console.error('Error:', error);
                })
        }
    }, 1000)
}

getRecommendVideo()
let videoBvid
let tabUrl = window.location.href;
videoBvid = tabUrl.split('/')[4]
function pollingUrl() {
    console.log("pollingUrl")
    let tabUrl = window.location.href;
    let newVideoBvid = tabUrl.split('/')[4]
    if (newVideoBvid !== videoBvid) {
        videoBvid = newVideoBvid
        setTimeout(getRecommendVideo, 2000)
    }
}
setInterval(pollingUrl, 1000)
