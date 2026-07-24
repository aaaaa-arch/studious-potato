/**
 * aliyun.js - 阿里云盘解析器（v2.0.2）
 * 使用阿里云盘 OpenAPI
 * 需要 refresh_token 或 access_token
 */
var config = require("../utils/config.js");

var API_BASE = "https://api.aliyundrive.com/adrive/v1.0";

function getToken(cfg) {
    return cfg.token || "";
}

function apiPost(path, body, token) {
    var res = fetch(API_BASE + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            "User-Agent": "Mozilla/5.0"
        },
        body: JSON.stringify(body)
    });
    if (!res || !res.ok) throw new Error("阿里 API 失败 HTTP=" + (res && res.status));
    return JSON.parse(res.text());
}

function resolveShare(shareUrl, token) {
    // 简化版：提取 share_id 和 file_id 后调 OpenAPI
    var shareId = "";
    var m = shareUrl.match(/aliyundrive\.com\/s\/([a-zA-Z0-9]+)/);
    if (m) shareId = m[1];

    var body = {
        share_id: shareId,
        share_pwd: ""
    };
    return apiPost("/share_link/get_share_by_anonymous", body, token);
}

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("aliyun");
    var token = getToken(cfg);

    if (!token) return [{ error: "请配置阿里云盘 Token" }];

    var json;
    try {
        json = resolveShare(url, token);
    } catch (e) {
        return [{ error: "阿里解析失败: " + e.message }];
    }

    var items = (json && json.data && json.data.items) || [];
    if (items.length === 0) return [{ error: "阿里分享为空" }];

    var tasks = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var name = item.name || item.file_name || ("aliyun_" + i);
        var size = parseInt(item.size, 10) || 0;
        var dlUrl = item.download_url || item.url || "";

        if (!dlUrl && item.file_id) {
            try {
                var dl = apiPost("/file/get_download_url", { file_id: item.file_id }, token);
                dlUrl = (dl && dl.data && dl.data.url) || "";
            } catch (e) { continue; }
        }
        if (!dlUrl) continue;

        tasks.push({
            name: name,
            url: dlUrl,
            size: size,
            _provider: "aliyun",
            _file_id: item.file_id || ""
        });
    }

    if (tasks.length === 0) return [{ error: "阿里未解析出文件" }];
    return tasks;
}

exports.resolve = resolve;
