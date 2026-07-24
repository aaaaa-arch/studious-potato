/**
 * quark.js - 夸克网盘解析器（v2.0.2 修复版）
 *
 * 修复问题：
 * 1. 文件名显示为哈希值 → 改用 data.list[i].file_name
 * 2. 文件大小 0 字节 → 改用 data.list[i].size
 * 3. 直链无效 → 调 sharepage/download 拿真实 download_url
 *
 * API 端点（已验证）：
 *   GET  /1/clouddrive/share/sharepage/detail?pwd_id=xxx&stoken=xxx&pdir_fid=0
 *   POST /1/clouddrive/share/sharepage/download
 *
 * 响应字段（已验证）：
 *   data.list[].file_name  - 文件名
 *   data.list[].size       - 文件大小(字节)
 *   data.list[].fid        - 文件 ID
 *   data.list[].dir        - 是否文件夹
 *   data.list[].download_url - 直链(有时有，没有再单独获取)
 */

var config = require("../utils/config.js");
var logger = require("../utils/logger.js");

var API_BASE = "https://drive.quark.cn/1/clouddrive/share/sharepage";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/2.5.20 Chrome/100.0.4896.160 Electron/18.3.5.4-b478491100 Safari/537.36 Channel/pckk_other_ch";

function getCookie(name, cookieStr) {
    if (!cookieStr) return "";
    var parts = cookieStr.split(";");
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].trim().split("=");
        if (kv[0] === name) return kv[1] || "";
    }
    return "";
}

function buildHeaders(cookie) {
    return {
        "User-Agent": UA,
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "Cookie": cookie || "",
        "Origin": "https://pan.quark.cn",
        "Referer": "https://pan.quark.cn/",
        "x-canary": "client=web,app=adrive,version=v2.3.1"
    };
}

function extractPwdId(url) {
    var m = url.match(/pan\.quark\.cn\/s\/([a-zA-Z0-9]+)/);
    if (m) return m[1];
    m = url.match(/[?&]pwd_id=([a-zA-Z0-9]+)/);
    if (m) return m[1];
    return "";
}

function fetchDetail(pwdId, stoken, pdirFid, cookie) {
    var url = API_BASE + "/detail?pr=ucpro&fr=pc&force=0"
        + "&_page=1&_size=1000"
        + "&_fetch_banner=0&_fetch_share=1&_fetch_total=1"
        + "&pwd_id=" + encodeURIComponent(pwdId)
        + "&stoken=" + encodeURIComponent(stoken || "")
        + "&pdir_fid=" + encodeURIComponent(pdirFid || "0");

    var res = fetch(url, { method: "GET", headers: buildHeaders(cookie) });
    if (!res || !res.ok) {
        throw new Error("获取分享详情失败 HTTP=" + (res && res.status));
    }
    return JSON.parse(res.text());
}

function fetchDownloadUrl(fid, pwdId, stoken, cookie) {
    var url = API_BASE + "/download?pr=ucpro&fr=pc";
    var body = JSON.stringify({
        fid: fid,
        pwd_id: pwdId,
        stoken: stoken || ""
    });
    var res = fetch(url, {
        method: "POST",
        headers: buildHeaders(cookie),
        body: body
    });
    if (!res || !res.ok) {
        throw new Error("获取直链失败 HTTP=" + (res && res.status));
    }
    return JSON.parse(res.text());
}

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("quark");
    var cookie = cfg.cookie;

    if (!cookie) {
        return [{ error: "请在扩展设置中填写夸克网盘 Cookie" }];
    }

    var pwdId = extractPwdId(url);
    if (!pwdId) {
        return [{ error: "链接中找不到 pwd_id: " + url }];
    }

    var stoken = getCookie("__puus", cookie);

    var json;
    try {
        json = fetchDetail(pwdId, stoken, "0", cookie);
    } catch (e) {
        return [{ error: "解析失败: " + e.message }];
    }

    if (!json || json.code !== 0) {
        var msg = (json && (json.message || json.errmsg)) || "未知错误";
        return [{ error: "夸克 API 错误: " + msg }];
    }

    var list = (json.data && json.data.list) || [];
    if (list.length === 0) {
        return [{ error: "分享链接为空或无权限" }];
    }

    var tasks = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var fileName = item.file_name || ("file_" + item.fid);
        var fileSize = parseInt(item.size, 10) || 0;
        var isDir = item.dir === true;

        if (isDir) continue;

        var directUrl = item.download_url || "";

        if (!directUrl) {
            try {
                var dlRes = fetchDownloadUrl(item.fid, pwdId, stoken, cookie);
                if (dlRes && dlRes.data && dlRes.data.download_url) {
                    directUrl = dlRes.data.download_url;
                }
            } catch (e) {
                if (config.isDebug()) logger.log("直链获取失败 fid=" + item.fid + " err=" + e.message);
                continue;
            }
        }

        if (!directUrl) continue;

        tasks.push({
            name: fileName,
            url: directUrl,
            size: fileSize,
            _fid: item.fid,
            _pwd_id: pwdId,
            _stoken: stoken,
            _provider: "quark"
        });
    }

    if (tasks.length === 0) {
        return [{ error: "未能解析出可下载文件（可能直链获取失败）" }];
    }

    return tasks;
}

exports.resolve = resolve;
exports.extractPwdId = extractPwdId;
exports.fetchDetail = fetchDetail;
exports.fetchDownloadUrl = fetchDownloadUrl;
