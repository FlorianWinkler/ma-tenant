
// transform Azure Table Storage entity back to "normal" object form
function entityToObject(entity) {
    let obj = {};
    for (let name of Object.getOwnPropertyNames(entity)) {
        if (name === '.metadata')
            obj[name] = entity[name];
        else
            obj[name] = entity[name]._;
    }
    return obj;
}

function promisify(func) {
    return new Promise((resolve, reject) => {
        func(function (error, results) {
            if (error) {
                reject(error);
            } else {
                resolve(results)
            }
        });
    })
}

function prettyPrintBlobList(listing) {
    for (let entry of listing) {
        console.log(entry.name + ' (' + entry.blobType + ': ' + entry.contentLength + ' bytes) - ' + entry.lastModified);
    }
}


module.exports = {
    entityToObject: entityToObject,
    promisify: promisify,
    prettyPrintBlobList: prettyPrintBlobList,
};