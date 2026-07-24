/**
 * xunlei.js - 迅雷云盘解析器（v2.0.2 骨架）
 * 迅雷云盘分享解析需要登录态，非公开 API
 */
var config = require("../utils/config.js");

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("xunlei");
    var cookie = cfg.cookie;

    if (!cookie) return [{ error: "请配置迅雷云盘 Cookie" }];

    // 迅雷分享链接格式：https://pan.xunlei.com/s/XXXX
    // 真实解析需要逆向迅雷 Web 端 API
    // 这里先返回提示，后续补全
    return [{ error: "迅雷云盘解析待完善，需要逆向 Web API" }];
}

exports.resolve = resolve;
