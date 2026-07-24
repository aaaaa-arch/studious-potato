/**
 * uc.js - UC 网盘解析器（v2.0.2）
 * UC 网盘和夸克同属 UC 系，API 结构类似但域名不同
 * drive.uc.cn 分享链接解析
 */

var config = require("../utils/config.js");
var logger = require("../utils/logger.js");

var API_BASE = "https://drive.uc.cn/1/clouddrive/share/sharepage";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function buildHeaders(cookie) {
    return {
        "User-Agent": UA,
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "Cookie": cookie || "",
        "Origin": "https://drive.uc.cn",
        "Referer": "https://drive.uc.cn/"
    };
}

function extractPwdId(url) {
    var m = url.match(/drive\.uc\.cn\/s\/([a-zA-Z0-9]+)/);
    if (m) return m[1];
    m = url.match(/[?&]pwd_id=([a-zA-Z0-9]+)/);
    if (m) return m[1];
    return "";
}

function fetchDetail(pwdId, stoken, cookie) {
    var apiUrl = API_BASE + "/detail?pr=ucpro&fr=pc&force=0"
        + "&_page=1&_size=1000"
        + "&_fetch_banner=0&_fetch_share=1&_fetch_total=1"
        + "&pwd_id=" + encodeURIComponent(pwdId)
        + "&stoken=" + encodeURIComponent(stoken || "")
        + "&pdir_fid=0";

    var res = fetch(apiUrl, { method: "GET", headers: buildHeaders(cookie) });
    if (!res || !res.ok) throw new Error("UC 获取详情失败 HTTP=" + (res && res.status));
    return JSON.parse(res.text());
}

function fetchDownloadUrl(fid, pwdId, stoken, cookie) {
    var apiUrl = API_BASE + "/download?pr=ucpro&fr=pc";
    var body = JSON.stringify({ fid: fid, pwd_id: pwdId, stoken: stoken || "" });
    var res = fetch(apiUrl, { method: "POST", headers: buildHeaders(cookie), body: body });
    if (!res || !res.ok) throw new Error("UC 获取直链失败 HTTP=" + (res && res.status));
    return JSON.parse(res.text());
}

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("uc");
    var cookie = cfg.cookie;

    if (!cookie) return [{ error: "请配置 UC 网盘 Cookie" }];

    var pwdId = extractPwdId(url);
    if (!pwdId) return [{ error: "UC 链接中找不到 pwd_id" }];

    var stoken = "";
    var m = url.match(/[?&]stoken=([a-zA-Z0-9]+)/);
    if (m) stoken = m[1];

    var json;
    try {
        json = fetchDetail(pwdId, stoken, cookie);
    } catch (e) {
        return [{ error: "UC 解析失败: " + e.message }];
    }

    if (!json || json.code !== 0) {
        var msg = (json && (json.message || json.errmsg)) || "未知错误";
        return [{ error: "UC API 错误: " + msg }];
    }

    var list = (json.data && json.data.list) || [];
    if (list.length === 0) return [{ error: "UC 分享为空" }];

    var tasks = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var fileName = item.file_name || ("uc_file_" + item.fid);
        var fileSize = parseInt(item.size, 10) || 0;
        if (item.dir === true) continue;

        var directUrl = item.download_url || "";
        if (!directUrl) {
            try {
                var dl = fetchDownloadUrl(item.fid, pwdId, stoken, cookie);
                if (dl && dl.data && dl.data.download_url) directUrl = dl.data.download_url;
            } catch (e) { continue; }
        }
        if (!directUrl) continue;

        tasks.push({
            name: fileName,
            url: directUrl,
            size: fileSize,
            _fid: item.fid,
            _pwd_id: pwdId,
            _provider: "uc"
        });
    }

    if (tasks.length === 0) return [{ error: "UC 未解析出可下载文件" }];
    return tasks;
}

exports.resolve = resolve;
