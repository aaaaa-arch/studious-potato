/**
 * tianyi.js - 天翼云盘解析器（v2.0.2 骨架）
 */
var config = require("../utils/config.js");

function resolve(ctx) {
    var url = (ctx.req && ctx.req.url) || ctx.url || "";
    var cfg = config.getProviderCfg("tianyi");
    var cookie = cfg.cookie;

    if (!cookie) return [{ error: "请配置天翼云盘 Cookie" }];

    // 天翼云盘分享：https://cloud.189.cn/t/xxxxxx
    // 需要逆向天翼 API
    return [{ error: "天翼云盘解析待完善" }];
}

exports.resolve = resolve;
