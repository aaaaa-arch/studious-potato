/**
 * pan115.js - 115 网盘解析器（v2.0.2 骨架）
 */
var config = require("../utils/config.js");

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("pan115");
    var cookie = cfg.cookie;

    if (!cookie) return [{ error: "请配置 115 网盘 Cookie" }];

    // 115 分享链接：https://115.com/s/swxxxxx
    // 需要逆向 115 Web API（非公开）
    return [{ error: "115 网盘解析待完善，需要逆向 Web API" }];
}

exports.resolve = resolve;
