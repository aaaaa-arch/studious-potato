/**
 * config.js - 配置读取（v2.0.2）
 * 每个网盘独立 key，带默认值，goja 兼容（var/function）
 */

var DEFAULTS = {
    "quark_enabled": true,
    "quark_cookie": "",
    "quark_autodelete": true,
    "quark_delay": 30,
    "uc_enabled": true,
    "uc_cookie": "",
    "uc_autodelete": true,
    "uc_delay": 30,
    "aliyun_enabled": true,
    "aliyun_token": "",
    "aliyun_tokentype": "refresh",
    "aliyun_autodelete": true,
    "aliyun_delay": 30,
    "baidu_enabled": true,
    "baidu_cookie": "",
    "baidu_autodelete": true,
    "baidu_delay": 30,
    "xunlei_enabled": true,
    "xunlei_cookie": "",
    "xunlei_autodelete": true,
    "xunlei_delay": 30,
    "pan115_enabled": true,
    "pan115_cookie": "",
    "pan115_autodelete": true,
    "pan115_delay": 30,
    "lanzou_enabled": true,
    "lanzou_autodelete": false,
    "tianyi_enabled": true,
    "tianyi_cookie": "",
    "tianyi_autodelete": true,
    "tianyi_delay": 30,
    "debug_log": false,
    "default_delay": 30
};

function getCfg(key) {
    var def = DEFAULTS[key];
    if (typeof gopeed !== "undefined" && gopeed.config) {
        var val = gopeed.config.get(key);
        if (val !== undefined && val !== null && val !== "") {
            return val;
        }
    }
    return def;
}

// 返回某个网盘的完整配置对象（parser 直接用）
function getProviderCfg(prefix) {
    return {
        enabled: getCfg(prefix + "_enabled"),
        cookie: getCfg(prefix + "_cookie"),
        token: getCfg(prefix + "_token"),
        tokentype: getCfg(prefix + "_tokentype"),
        autodelete: getCfg(prefix + "_autodelete"),
        delay: getCfg(prefix + "_delay")
    };
}

function isDebug() {
    return getCfg("debug_log") === true;
}
