/**
 * http.js - HTTP 封装（v2.0.2）
 * goja 兼容：无 Object.assign，手动合并
 * 提供重试/UA/超时
 */
var logger = require("./logger.js");

function buildHeaders(custom) {
    var headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
    };
    if (custom) {
        for (var key in custom) {
            if (custom.hasOwnProperty(key)) {
                headers[key] = custom[key];
            }
        }
    }
    return headers;
}

function get(url, opts) {
    opts = opts || {};
    var headers = buildHeaders(opts.headers);
    var res = fetch(url, { method: "GET", headers: headers });
    if (!res) throw new Error("GET 无响应: " + url);
    return res;
}

function post(url, body, opts) {
    opts = opts || {};
    var headers = buildHeaders(opts.headers);
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json;charset=UTF-8";
    var res = fetch(url, { method: "POST", headers: headers, body: body });
    if (!res) throw new Error("POST 无响应: " + url);
    return res;
}

// 带重试的 GET
function getWithRetry(url, maxRetry, opts) {
    maxRetry = maxRetry || 3;
    var lastErr = "";
    for (var i = 0; i < maxRetry; i++) {
        try {
            var res = get(url, opts);
            if (res && res.ok) return res;
            lastErr = "HTTP " + (res && res.status);
        } catch (e) {
            lastErr = e.message;
        }
        if (config && config.isDebug()) logger.log("重试 " + (i + 1) + "/" + maxRetry + " " + url);
    }
    throw new Error("GET 失败(重试" + maxRetry + "次): " + lastErr);
}

exports.get = get;
exports.post = post;
exports.getWithRetry = getWithRetry;
exports.buildHeaders = buildHeaders;
