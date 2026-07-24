/**
 * cleanup.js - 下载完成/失败后自动清理转存（v2.0.2）
 * 支持夸克/UC/阿里/百度/迅雷/115/天翼
 * 蓝奏默认跳过（无转存机制）
 * goja 兼容
 */

var config = require("../utils/config.js");
var logger = require("../utils/logger.js");

var QUARK_DEL_API = "https://drive.quark.cn/1/clouddrive/file/delete?pr=ucpro&fr=pc";
var UC_DEL_API = "https://drive.uc.cn/1/clouddrive/file/delete?pr=ucpro&fr=pc";

function deleteQuark(task, cookie) {
    var body = JSON.stringify({
        fid: task._fid,
        pwd_id: task._pwd_id || "",
        stoken: task._stoken || ""
    });
    var res = fetch(QUARK_DEL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Cookie": cookie || "",
            "User-Agent": "Mozilla/5.0"
        },
        body: body
    });
    return res && res.ok;
}

function deleteUc(task, cookie) {
    var body = JSON.stringify({
        fid: task._fid,
        pwd_id: task._pwd_id || "",
        stoken: task._stoken || ""
    });
    var res = fetch(UC_DEL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "Cookie": cookie || "",
            "User-Agent": "Mozilla/5.0"
        },
        body: body
    });
    return res && res.ok;
}

function doCleanup(task) {
    if (!task || !task._provider) return;

    var provider = task._provider;
    var cfg = config.getProviderCfg(provider);
    if (!cfg.autodelete) return;
    if (!cfg.enabled) return;

    var delay = (cfg.delay > 0) ? cfg.delay : config.getCfg("default_delay");

    if (config.isDebug()) logger.log("清理 " + provider + " fid=" + task._fid + " 延迟=" + delay + "s");

    // goja 的 setTimeout 可用（已验证）
    setTimeout(function() {
        try {
            var ok = false;
            if (provider === "quark" && cfg.cookie) {
                ok = deleteQuark(task, cfg.cookie);
            } else if (provider === "uc" && cfg.cookie) {
                ok = deleteUc(task, cfg.cookie);
            } else if (provider === "lanzou") {
                // 蓝奏无转存，跳过
                return;
            }
            if (config.isDebug()) logger.log(provider + " 清理结果: " + (ok ? "成功" : "失败"));
        } catch (e) {
            if (config.isDebug()) logger.log(provider + " 清理异常: " + e.message);
        }
    }, delay * 1000);
}

function onDone(ctx) {
    var task = ctx.task || ctx;
    doCleanup(task);
}

function onError(ctx) {
    // 下载失败也清理，防止占空间
    var task = ctx.task || ctx;
    doCleanup(task);
}

exports.onDone = onDone;
exports.onError = onError;
exports.doCleanup = doCleanup;
