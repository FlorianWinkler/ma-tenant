const azure = require('azure-storage');
const promisify = require('./utils').promisify;


class Table {
    // assumes that ENV variables are loaded
    constructor(tableName) {
        this.tableName = tableName;
        this.tableService = azure.createTableService();
    }

    createTableIfNotExists() {
        return promisify(callback => {
            this.tableService.createTableIfNotExists(this.tableName, callback)
        });
    }

    get(partitionKey, rowKey) {
        return promisify(callback => {
            this.tableService.retrieveEntity(this.tableName, partitionKey, rowKey, callback);
        });
    }

    find(querySpec) {
        return promisify(callback => {
            this.tableService.queryEntities(this.tableName, querySpec, null, callback);
        });
    }

    insert(entity) {
        return promisify(callback => {
            this.tableService.insertEntity(this.tableName, entity, {echoContent: true}, callback);
        });
    }

    replace(entity) {
        return promisify(callback => {
            this.tableService.replaceEntity(this.tableName, entity, {echoContent: true}, callback);
        });
    }

    merge(entity) {
        return promisify(callback => {
            this.tableService.mergeEntity(this.tableName, entity, {echoContent: true}, callback);
        });
    }

    insertOrReplace(entity) {
        return promisify(callback => {
            this.tableService.insertOrReplaceEntity(this.tableName, entity, {echoContent: true}, callback);
        });
    }

    insertOrMerge(entity) {
        return promisify(callback => {
            this.tableService.insertOrMergeEntity(this.tableName, entity, {echoContent: true}, callback);
        });
    }

}

module.exports = Table;