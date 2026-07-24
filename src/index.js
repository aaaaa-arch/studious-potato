/**
 * index.js - 入口路由（v2.0.2）
 * 识别网盘类型 → 分发到对应 parser
 * goja 兼容：var/function，无箭头函数，无解构
 */

var config = require("./utils/config.js");
var logger = require("./utils/logger.js");

function getUrl(ctx) {
    return (ctx.req && ctx.req.url) || ctx.url || "";
}

function onResolve(ctx) {
    var url = getUrl(ctx);

    if (url.indexOf("pan.quark.cn") !== -1) {
        if (!config.getCfg("quark_enabled")) return null;
        return require("./parsers/quark.js").resolve(ctx);
    }

    if (url.indexOf("uc.cn") !== -1 && url.indexOf("drive") !== -1) {
        if (!config.getCfg("uc_enabled")) return null;
        return require("./parsers/uc.js").resolve(ctx);
    }

    if (url.indexOf("aliyundrive.com") !== -1 || url.indexOf("alipan.com") !== -1) {
        if (!config.getCfg("aliyun_enabled")) return null;
        return require("./parsers/aliyun.js").resolve(ctx);
    }

    if (url.indexOf("pan.baidu.com") !== -1) {
        if (!config.getCfg("baidu_enabled")) return null;
        return require("./parsers/baidu.js").resolve(ctx);
    }

    if (url.indexOf("pan.xunlei.com") !== -1) {
        if (!config.getCfg("xunlei_enabled")) return null;
        return require("./parsers/xunlei.js").resolve(ctx);
    }

    if (url.indexOf("115.com") !== -1) {
        if (!config.getCfg("pan115_enabled")) return null;
        return require("./parsers/pan115.js").resolve(ctx);
    }

    if (url.indexOf("lanzou.com") !== -1) {
        if (!config.getCfg("lanzou_enabled")) return null;
        return require("./parsers/lanzou.js").resolve(ctx);
    }

    if (url.indexOf("cloud.189.cn") !== -1 || url.indexOf("189.cn") !== -1) {
        if (!config.getCfg("tianyi_enabled")) return null;
        return require("./parsers/tianyi.js").resolve(ctx);
    }

    return null;
}
