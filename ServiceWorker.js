// 打开indexDb，创建几个对象储存：
// 1. followList 用于储存关注列表。
let indexDBRequest = indexedDB.open('service', 2)
indexDBRequest.onerror = function (event) {
    console.log('数据库打开报错')

}
let serviceIndexDB
indexDBRequest.onsuccess = function (event) {
    serviceIndexDB = event.target.result
    console.log('数据库打开成功')

}
indexDBRequest.onupgradeneeded = function (event) {
    let db = event.target.result
    let followList = db.createObjectStore('followList', {keyPath: 'id'})
    followList.createIndex('webSiteId', 'webSiteId', {unique: false})
    followList.createIndex('authorWebUid', 'authorWebUid', {unique: false})
    followList.createIndex('authorName', 'authorName', {unique: false})
    followList.createIndex('avatar', 'avatar', {unique: false})
    followList.createIndex('desc', 'desc', {unique: false})
}

// 获取所有关注列表，并把数据储存在indexDB中。服务器返回的全量数据，需要对比双方的数据，如果有不一致的数据，需要更新。
async function getProgramFollowList() {

    let res = await fetch('http://localhost:8000/api/program/follow/list')
    // res 结构 [{id:"",webSiteId:"",authorWebUid:"",authorName:"",avatar:"",desc:""}]
    console.log(res)
    res = await res.json()
    console.log(res)
    let transaction = serviceIndexDB.transaction('followList', 'readwrite')
    let followListStore = transaction.objectStore('followList')
    for (let follow of res) {
        let request = followListStore.get(follow.id)
        request.onsuccess = function (event) {
            let result = event.target.result
            if (result !== undefined) {
                if (result.authorName !== follow.authorName || result.avatar !== follow.avatar || result.desc !== follow.desc) {
                    followListStore.put(follow)
                }
            } else {
                followListStore.add(follow)
            }
        }
    }
    // 没有遍历到的数据需要删除
    let request = followListStore.getAll()
    request.onsuccess = function (event) {
        let result = event.target.result
        for (let follow of result) {
            let flag = false
            for (let newFollow of res) {
                if (follow.id === newFollow.id) {
                    flag = true
                    break
                }
            }
            if (!flag) {
                followListStore.delete(follow.id)
            }
        }
    }
}

function testReadIndexDb() {
    let transaction = serviceIndexDB.transaction('followList', 'readonly')
    let followListStore = transaction.objectStore('followList')
    let request = followListStore.getAll()
    console.log('testReadIndexDb')
    console.log(request)

    request.onsuccess = function (event) {
        console.log(event.target.result)
    }
}

async function getFollowListLength() {
    let transaction = serviceIndexDB.transaction('followList', 'readonly')
    let followListStore = transaction.objectStore('followList')
    let request = followListStore.getAll()
    let res = new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result); // 查询成功时，将结果传递给resolve函数
        request.onerror = () => reject(request.error); // 查询失败时，将错误传递给reject函数
    })
    let result = await res;
    return result.length
}

async function getFollowList() {
    let transaction = serviceIndexDB.transaction('followList', 'readonly')
    let followListStore = transaction.objectStore('followList')
    let request = await followListStore.getAll()
    let res = new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result); // 查询成功时，将结果传递给resolve函数
        request.onerror = () => reject(request.error); // 查询失败时，将错误传递给reject函数
    })
    let result = await res;
    console.log(request)
    console.log(result)
    return result
}

async function migrateFollow(userMid) {
    let res = await fetch('http://localhost:8000/api/program/follow/migrate/' + userMid)
    console.log(res)
    if (res.status === 200) {
        return 'ok'
    } else {
        return 'error'
    }
}


setTimeout(testReadIndexDb, 1000 * 5)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request)
        if (request.type === 'getFollowList') {
            getFollowList().then(res => {
                console.log('getFollowList: ', res)
                sendResponse(res)
            })
            return true
        } else if (request.type === 'getFollowListLength') {
            getFollowListLength().then(res => {
                sendResponse(res)
            })
            return true
        } else if (request.type === 'migrateFollow') {
            migrateFollow(request.userMid).then(res => {
                sendResponse(res)
            })
            return true
        }
    }
)
