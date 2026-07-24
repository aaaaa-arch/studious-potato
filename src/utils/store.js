/**
 * store.js - 任务记录持久化（v2.0.2）
 * goja 兼容
 */
var config = require("./config.js");

var RECORDS_KEY = "_pan_records";

function getRecords() {
    if (typeof gopeed === "undefined" || !gopeed.storage) return {};
    var raw = gopeed.storage.get(RECORDS_KEY);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
}

function saveRecord(taskId, data) {
    if (typeof gopeed === "undefined" || !gopeed.storage) return;
    var records = getRecords();
    records[String(taskId)] = data;
    gopeed.storage.set(RECORDS_KEY, JSON.stringify(records));
}

function getRecord(taskId) {
    var records = getRecords();
    return records[String(taskId)] || null;
}

function removeRecord(taskId) {
    if (typeof gopeed === "undefined" || !gopeed.storage) return;
    var records = getRecords();
    delete records[String(taskId)];
    gopeed.storage.set(RECORDS_KEY, JSON.stringify(records));
}

exports.getRecords = getRecords;
exports.saveRecord = saveRecord;
exports.getRecord = getRecord;
exports.removeRecord = removeRecord;
