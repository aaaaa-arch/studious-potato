# Gopeed 全网盘直链下载器 v2.0.2

支持夸克/UC/阿里/百度/迅雷/115/蓝奏/天翼网盘，下载完自动清理转存。

## 修复记录 (v2.0.2)

✅ **文件名显示为哈希值** → 改用 `data.list[i].file_name` 正确提取
✅ **文件大小 0 字节** → 改用 `data.list[i].size`，不再返回空
✅ **直链无效** → 调 `sharepage/download` 拿真实 `download_url`
✅ **配置页空白** → `settings` 改为 Gopeed 官方扁平格式
✅ **自动删除默认关闭** → 所有网盘 `autodelete` 默认 `true`
✅ **goja 兼容性** → 全部 `var/function`，无 ES6+

## 支持的网盘

| 网盘 | 状态 | 说明 |
|------|------|------|
| 夸克 | ✅ 完整 | Cookie 获取后自动解析 + 自动删转存 |
| UC | ✅ 完整 | 同夸克系 API |
| 蓝奏 | ✅ 完整 | 页面提取，无需登录 |
| 阿里 | ⚠️ 部分 | 需要 OpenAPI Token |
| 百度 | ⚠️ 部分 | 需要 BDUSS，直链待补全 |
| 迅雷 | 🚧 骨架 | 待逆向 Web API |
| 115 | 🚧 骨架 | 待逆向 Web API |
| 天翼 | 🚧 骨架 | 待逆向 Web API |

## 安装

1. Gopeed → 扩展 → 开发者模式
2. 从 Git 安装：`https://github.com/aaaaa-arch/studious-potato`
3. 扩展设置 → 填对应网盘的 Cookie/Token
4. 保存，完事

## Cookie 获取

浏览器登录网盘 → F12 → Application → Cookies → 复制所有 Cookie

## 自动删除

下载完成后默认 30 秒自动删除转存文件（移至回收站，可恢复）。
每个网盘独立开关和延迟，在设置里调。

## 已知问题

- 百度/迅雷/115/天翼的完整直链获取需要逆向各网盘 Web API
- 夸克/UC 的 `__puus` Cookie 过期后需手动更新

## License

MIT
