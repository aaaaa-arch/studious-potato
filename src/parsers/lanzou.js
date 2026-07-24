/**
 * lanzou.js - 蓝奏云解析器（v2.0.2）
 * 蓝奏云分享页面可以直接提取直链，通常无需登录
 * 这是最简单的网盘，优先搞定
 */
var config = require("../utils/config.js");

function extractFileId(url) {
    var m = url.match(/lanzou\.com\/([a-zA-Z0-9]+)/);
    if (m) return m[1];
    return "";
}

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var fileId = extractFileId(url);
    if (!fileId) return [{ error: "蓝奏云链接格式不对" }];

    try {
        // 请求分享页
        var res = fetch(url, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        if (!res || !res.ok) return [{ error: "蓝奏云页面请求失败" }];

        var html = res.text();

        // 提取文件名
        var nameMatch = html.match(/var fname = "([^"]+)"/);
        var fileName = nameMatch ? nameMatch[1] : ("lanzou_" + fileId);

        // 提取直链（蓝奏的直链通常在 data 属性或 JS 变量里）
        var urlMatch = html.match(/href="(https:\/\/[^"]+\.lanzou\.com\/[^"]+)"/);
        var directUrl = urlMatch ? urlMatch[1] : "";

        // 备选：从 iframe src 提取
        if (!directUrl) {
            urlMatch = html.match(/iframe[^>]+src="([^"]+)"/);
            if (urlMatch) directUrl = urlMatch[1];
        }

        if (!directUrl) {
            return [{ error: "蓝奏云未能提取直链（可能需要密码）" }];
        }

        return [{
            name: fileName,
            url: directUrl,
            size: 0,  // 蓝奏页面里 size 提取较麻烦，让 Gopeed 自己探测
            _provider: "lanzou"
        }];
    } catch (e) {
        return [{ error: "蓝奏云解析异常: " + e.message }];
    }
}

exports.resolve = resolve;
