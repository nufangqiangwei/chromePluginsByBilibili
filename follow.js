// let programFollow = document.createElement('span')
// programFollow.innerText = '程序关注'
// programFollow.style.marginLeft = "10px"
// let followTabs = document.getElementsByClassName('follow-tabs')
// observerOptions = {
//     childList: false, // 观察目标子节点的变化，是否有添加或者删除
//     attributes: true, // 观察属性变动
//     subtree: false, // 观察后代节点，默认为 false
//     attributeFilter: ['class', 'style']
// }
// let followTabsObserver = undefined
// let followTabsFlag = false
// function clearProgramFollowClassname() {
// if(followTabsFlag){[@class=]
//     return
// }
// followTabsFlag = true
// console.log("clearProgramFollowClassname")
// if (followTabs[0].children[0].className === "active" || followTabs[0].children[1].className === "active") {
//     programFollow.className = ""
// }
// followTabsFlag = false
// }
// if (followTabs.length > 0) {
//     programFollow.onclick = function () {
//         console.log("程序关注")
//         for (let node of followTabs[0].children) {
//             node.className = ""
//         }
//         programFollow.className = "active"
//     }
//     followTabs[0].appendChild(programFollow)
//     followTabsObserver = new MutationObserver(clearProgramFollowClassname)
//     followTabsObserver.observe(followTabs[0].children[0], observerOptions)
// }
let  numericPattern = /^\d+$/
function newProgramButton() {
    let programButton = document.createElement('span')
    programButton.className = "fans-action-text"
    programButton.innerText = "程序关注"
    programButton.style.marginLeft = "10px"
    programButton.onclick = function (event) {
        let userInfoUrl = event.target.parentNode.parentNode.parentNode.querySelector('a').href
        let userMid = userInfoUrl.split('/')[3]
        if (numericPattern.test(userMid)){
            console.log(userMid)
            chrome.runtime.sendMessage(
                {
                    type: 'migrateFollow',
                    userMid:userMid,
                },
                response => {
                    if(response==='ok') {
                        console.log('ok')
                    }else{
                        console.log('error')
                    }
                }
            )
        }

        console.log("修改程序关注")
    }
    return programButton
}

let relationList = document.getElementsByClassName('relation-list')[0]

function relationListAppendProgramButton(mutationList, observer) {
    console.log("relationListObserver")
    for (let node of relationList.children) {
        // class="fans-action-text" 如果咋node中这个出现了两个，就说明已经添加过了，不在添加。方法退出
        let flag = document.evaluate(".//span[text()='程序关注']", node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        if (flag !== null) {
            continue
        }
        node.querySelector('.content .fans-action-btn .fans-action-text').insertAdjacentElement('afterend', newProgramButton())
    }
}

// let relationListObserver = new MutationObserver(relationListAppendProgramButton)
// relationListObserver.observe(relationList, {
//     childList: true, // 观察目标子节点的变化，是否有添加或者删除
// })
function pageEvent() {
    let pagerUl = document.getElementsByClassName('be-pager')
    if (pagerUl.length > 0) {
        pagerUl = pagerUl[0]
        pagerUl.addEventListener('click', function (event) {
            console.log('子元素被点击了:', event.target.textContent);
            setTimeout(relationListAppendProgramButton,1000)
        })
    }
}

class AuthorInfo {
    constructor() {
        this.authorId = 0
        this.authorName = ""
        this.authorDescription = ""
        this.authorAvatarUrl = ""
    }
}

function NewAuthorInfoLiDom(authorInfo) {
    // 创建一个li节点html代码如下
    /*
<li class="list-item clearfix">
    <div class="follow-select" style="display: none;">
        <div class="icon icon-follow-watched"></div>
    </div>
    <div class="cover-container">
        <a href="//space.bilibili.com/{{authorId}}" target="_blank" class="up-cover-components">
            <div class="bili-avatar" style="width: 100%;height:100%;">
                <img class="bili-avatar-img bili-avatar-face bili-avatar-img-radius"
                     data-src="{{authorAvatarUrl}}@96w_96h_1c_1s_!web-avatar-space-list.avif"
                     alt=""
                     src="{{authorAvatarUrl}}@96w_96h_1c_1s_!web-avatar-space-list.avif">
                <span class="bili-avatar-icon bili-avatar-right-icon  bili-avatar-icon-personal "></span>
            </div>
        </a>
    </div>
    <div class="content">
        <a href="//space.bilibili.com/{{authorId}}/" target="_blank" class="title">
            <span class="fans-name" style="color: rgb(251, 114, 153);">{{authorName}}</span>
        </a>
        <p title="{{authorDescription}}" class="auth-description">
            {{authorDescription}}
        </p>
        <div class="fans-action">
            <div class="be-dropdown fans-action-btn fans-action-follow">
                <span class="fans-action-text" style="margin-left: 10px">程序关注</span>
            </div>
        </div>
    </div>
</li>
    */

    let li = document.createElement('li')
    li.className = "list-item clearfix program"
    let followSelect = document.createElement('div')
    followSelect.className = "follow-select"
    followSelect.style.display = "none"
    let icon = document.createElement('div')
    icon.className = "icon icon-follow-watched"
    followSelect.appendChild(icon)
    li.appendChild(followSelect)
    let coverContainer = document.createElement('div')
    coverContainer.className = "cover-container"
    let a = document.createElement('a')
    a.href = "//space.bilibili.com/" + authorInfo.authorId
    a.target = "_blank"
    a.className = "up-cover-components"
    let biliAvatar = document.createElement('div')
    biliAvatar.className = "bili-avatar"
    biliAvatar.style.width = "100%"
    biliAvatar.style.height = "100%"
    let img = document.createElement('img')
    img.className = "bili-avatar-img bili-avatar-face bili-avatar-img-radius"
    img.src = authorInfo.authorAvatarUrl + "@96w_96h_1c_1s_!web-avatar-space-list.avif"
    img.alt = ""
    img.dataset.src = authorInfo.authorAvatarUrl + "@96w_96h_1c_1s_!web-avatar-space-list.avif"
    let span = document.createElement('span')
    span.className = "bili-avatar-icon bili-avatar-right-icon  bili-avatar-icon-personal"
    biliAvatar.appendChild(img)
    biliAvatar.appendChild(span)
    a.appendChild(biliAvatar)
    coverContainer.appendChild(a)
    li.appendChild(coverContainer)
    let content = document.createElement('div')
    content.className = "content"
    a = document.createElement('a')
    a.href = "//space.bilibili.com/" + authorInfo.authorId + "/"
    a.target = "_blank"
    a.className = "title"
    let span2 = document.createElement('span')
    span2.className = "fans-name"
    span2.style.color = "rgb(251, 114, 153)"
    span2.innerText = authorInfo.authorName
    a.appendChild(span2)
    content.appendChild(a)
    let p = document.createElement('p')
    p.title = authorInfo.authorDescription
    p.className = "auth-description"
    p.innerText = authorInfo.authorDescription
    content.appendChild(p)
    let div = document.createElement('div')
    div.className = "fans-action"
    let div2 = document.createElement('div')
    div2.className = "be-dropdown fans-action-btn fans-action-follow"
    let span3 = document.createElement('span')
    span3.className = "fans-action-text"
    span3.style.marginLeft = "10px"
    span3.innerText = "程序关注"
    div2.appendChild(span3)
    div.appendChild(div2)
    content.appendChild(div)
    li.appendChild(content)
    return li

}

let showProgramFollowList = false
let followList = document.getElementsByClassName('follow-list')[0]
for (let liNode of followList.children) {
    // 获取liNode的子标签a,判断文本是不是 程序关注 ，如果是，就添加点击事件。不是就添加清理class='program'的事件
    let a = liNode.querySelector('a')
    if (a.innerText === "程序关注") {
        a.addEventListener('click', function () {
            console.log("调用修改程序关注")
            showProgramFollowList = true
            chrome.runtime.sendMessage(
                {
                    type: 'getFollowList',
                    page:1,
                },
                response => {
                    console.log(response)
                    for (let follow of response) {
                        let d = NewAuthorInfoLiDom({
                            authorId: follow.id,
                            authorName: follow.authorName,
                            authorDescription: follow.desc,
                            authorAvatarUrl: follow.avatar
                        })
                        relationList.appendChild(d)
                    }
                }
            )
        })
    } else {
        a.addEventListener('click', function () {
            console.log("清理程序关注")
            let childNodes = [];
            for (let node of relationList.children) {
                if (node.className === "list-item clearfix program") {
                    childNodes.push(node)
                } else {
                    let flag = document.evaluate(".//span[text()='程序关注']", node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                    if (flag !== null) {
                        continue
                    }
                    node.querySelector('.content .fans-action-btn .fans-action-text').insertAdjacentElement('afterend', newProgramButton())
                }
            }
            for (let node of childNodes) {
                relationList.removeChild(node)
            }
            pageEvent()
            setTimeout(relationListAppendProgramButton,1000)
        })
    }

}

pageEvent()
relationListAppendProgramButton()
function main() {
    console.log("f")
}

export {main}
