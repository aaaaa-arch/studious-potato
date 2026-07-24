/**
 * refresh.js - 下载开始前检查直链是否过期（v2.0.2）
 * goja 兼容
 */

var config = require("./utils/config.js");

function onStart(ctx) {
    var task = ctx.task || ctx;
    if (!task || !task.url) return;

    // 只检查夸克/UC 的 CDN 链接
    var url = task.url;
    var isQuarkOrUc = (url.indexOf("drive.quark.cn") !== -1) || (url.indexOf("drive.uc.cn") !== -1);
    if (!isQuarkOrUc) return;

    try {
        var res = fetch(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } });
        if (res && res.ok) return; // 直链还有效

        // 过期了，尝试刷新
        if (config.isDebug()) logger.log("直链过期，尝试刷新: " + url);
    } catch (e) {
        // 网络错误，交给 Gopeed 自己处理
    }
}

exports.onStart = onStart;
