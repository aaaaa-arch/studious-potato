/**
 * logger.js - 日志封装（v2.0.2）
 * goja 兼容
 */
var config = require("./config.js");

function log(msg) {
    if (config.isDebug() && typeof console !== "undefined") {
        console.log("[pan] " + msg);
    }
}

function warn(msg) {
    if (typeof console !== "undefined") {
        console.warn("[pan] " + msg);
    }
}

function error(msg) {
    if (typeof console !== "undefined") {
        console.error("[pan] " + msg);
    }
}

exports.log = log;
exports.warn = warn;
exports.error = error;
