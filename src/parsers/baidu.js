/**
 * baidu.js - 百度网盘解析器（v2.0.2）
 * 百度网盘分享链接解析较复杂，需要 BDUSS + 转存 + 获取直链
 * 这里提供基础框架，核心直链获取走百度开放接口
 */
var config = require("../utils/config.js");

var API = "https://pan.baidu.com/rest/2.0/xpan/share";

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("baidu");
    var cookie = cfg.cookie;

    if (!cookie) return [{ error: "请配置百度网盘 Cookie（含 BDUSS）" }];

    // 提取 shareid 和 uk
    var shareId = "";
    var uk = "";
    var m = url.match(/s\/(\d+)/);
    if (m) shareId = m[1];
    m = url.match(/uk=(\d+)/);
    if (m) uk = m[1];

    // 基础实现：尝试从分享页获取文件列表
    var apiUrl = API + "/list?shareid=" + encodeURIComponent(shareId)
        + "&uk=" + encodeURIComponent(uk)
        + "&channel=chunlei&clienttype=0&web=1&num=100";

    try {
        var res = fetch(apiUrl, {
            method: "GET",
            headers: { "Cookie": cookie, "User-Agent": "Mozilla/5.0" }
        });
        if (!res || !res.ok) return [{ error: "百度 API 失败 HTTP=" + (res && res.status) }];
        var json = JSON.parse(res.text());

        var list = (json && json.list) || [];
        var tasks = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var name = item.server_filename || item.name || ("baidu_" + i);
            var size = parseInt(item.size, 10) || 0;
            // 百度直链需要额外步骤（dlink），这里先留空
            // 实际使用时需要调 /multimedia 接口拿 dlink
            tasks.push({
                name: name,
                url: "",  // 需要后续填 dlink
                size: size,
                _provider: "baidu",
                _fs_id: item.fs_id || ""
            });
        }

        if (tasks.length === 0) return [{ error: "百度分享为空或无权限" }];
        // 注意：百度直链获取需要 BDUSS + fs_id → dlink 接口
        // 这里先返回占位，后续补全 dlink 逻辑
        return tasks;
    } catch (e) {
        return [{ error: "百度解析失败: " + e.message }];
    }
}

exports.resolve = resolve;
