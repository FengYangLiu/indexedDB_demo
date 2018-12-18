const databaseName = 'test'
const databaseVersion = 3;
/**
 * 数据库注意：
 * 1.indexedDB是一个事务性数据库，意味着错一个就会回回滚
 * 2.更改表增加表要更改数据版本号来处理
 * 3.存储理论上不小于250M
 * 4.浏览器内是异步api，防止浏览器卡死
 */
let DBOpenRequest = window.indexedDB.open(databaseName, databaseVersion) // 打开数据库

function log(msg) {
    console.log(`${msg}`)
    document.write(`\n[${new Date().toLocaleDateString()}]--${msg}`)
}

/**
 * 数据库打开报错处理
 */
DBOpenRequest.error = (event) => {
    log(`【错误】:数据库打开报错`)
}

var db;
/** 数据库打开成功回调 */
DBOpenRequest.onsuccess = (event) => {
    db = DBOpenRequest.result; // 数据库对象
    log(`【成功】:数据库成功打开`)
}

/** 
 * 更新数据库的版本的时候触发
 * 在打开的数据库的过程会触发这个事件
 */
DBOpenRequest.onupgradeneeded = (event) => {
    var db = event.target.result; // 数据库实例

    /**
     * 创建一个person的表
     * 主键是 id
     * autoIncrenment:true 这个可以自动生成主键
     */
    let objectStore;
    if (!db.objectStoreNames.contains('person')) { // 判断是否存在
        objectStore = db.createObjectStore('person', {
            autoIncrement: true,
            keyPath: 'id',
        })
        objectStore.createIndex('id', 'id', {
            unique: true
        });
        objectStore.createIndex('name', 'name', {
            unique: false
        }); // 新增索引，可否重复
        objectStore.createIndex('email', 'email', {
            unique: false
        });
    }

}

let method = {
    add: item => { // 新增数据
        let transaction = db.transaction(['person'], 'readwrite')
            .objectStore('person')
            .add(item)
        // .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });

        transaction.onsuccess = function (event) {
            log('【成功】:数据写入成功');
        };

        transaction.onerror = function (event) {
            log('【失败】数据写入失败');
            console.log(event)
        }

        // 在所有数据添加完毕后的处理
        transaction.oncomplete = function (event) {
            console.log("【结束】add done!");
        };
    },
    read: (key) => { // 读取数据
        let transaction = db.transaction(['person'], 'readwrite')
        let objectStore = transaction.objectStore('person');
        let objectStoreRequest = objectStore.get(key)
        objectStoreRequest.error = (event) => {
            log('【失败】：读取数据失败')
        }
        objectStoreRequest.onsuccess = () => {

            if (objectStoreRequest.result) {
                console.table(objectStoreRequest.result)
            } else {
                console.log('未获得数据记录');
            }
        }
        transaction.onerror = function (event) {
            console.log('【错误】：游标尺出错')
        };
        // 在所有数据添加完毕后的处理
        transaction.oncomplete = function (event) {
            console.log("【结束】：read done!");
        };
    },
    readAll: () => { // 获取表中所有数据 
        // 可以使用getAll也可以使用游标尺，但是getAll需要一次性生成所有数据消耗极大，用游标尺处理可根据需要来处理性能消耗小点
        let transaction = db.transaction(['person'])
        let objectStore = transaction.objectStore('person');
        objectStore.openCursor().onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                // console.log(cursor)
                cursor.continue();
            } else {
                console.log('没有更多数据')
            }
        }
        transaction.onerror = function (event) {
            console.log('【错误】：游标尺出错')
        };
        // 在所有数据添加完毕后的处理
        transaction.oncomplete = function (event) {
            console.log("【结束】：readAll done!");
        };
    },
    update: (key, data) => {
        let transaction = db.transaction(['person'], 'readwrite')
        let objectStore = transaction.objectStore('person');
        let objectStoreRequest = objectStore.get(key)
        objectStoreRequest.onsuccess = (event) => {
            // 当前数据
            let info = objectStoreRequest.result;
            // 遍历替换
            for (let keyName in data) {
                if (typeof info[keyName] != 'undefined') {
                    info[keyName] = data[keyName];
                }
            }
            // 更新数据库存储数据                
            objectStore.put(info);
        }
        transaction.onerror = function (event) {
            console.log('【错误】：游标尺出错')
        };
        // 在所有数据添加完毕后的处理
        transaction.oncomplete = function (event) {
            console.log("【结束】：update done!");
        };
    },
    del: (key) => { // 删除数据
        let transaction = db.transaction(['person'], 'readwrite')
        let objectStore = transaction.objectStore('person');
        let objectStoreRequest = objectStore.delete(key)
        objectStoreRequest.onsuccess = (event) => {
            log('【成功】删除数据成功')
        }

        transaction.onerror = function (event) {
            console.log('【错误】：游标尺出错')
        };


        // 在所有数据添加完毕后的处理
        transaction.oncomplete = function (event) {
            console.log("【结束】：del done!");
        };
    }
}




setTimeout(() => {
    method.add({
        // id: 1,
        name: '张三',
        age: 24,
        email: 'zhangsan@example.com'
    })

    method.read(1)

    method.readAll()

    method.update(2, {
        // id: 222,
        name: '虾米',
        age: 222,
        email: 'ss@example.com'
    })
}, 3000);

setTimeout(() => {

    // method.del(222)
}, 5000);