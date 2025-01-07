# 哔哩哔哩辅助截屏

一个简单的油猴脚本，为B站视频播放器添加截屏功能。

## 功能特点

- 在视频播放器控制栏添加截图按钮
- 支持快捷键截图（默认为 S 键）
- 可自定义快捷键
- 截图时自动保存并显示提示
- 文件名自动包含视频时间戳

## 安装方法

1. 首先安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击 [安装脚本](bilibili-screenshot.user.js)

## 使用说明

1. 打开任意B站视频页面
2. 点击播放器左下角的相机图标即可截图
3. 右键点击相机图标可以打开设置面板
4. 在设置面板中可以自定义快捷键

## 快捷键设置

1. 右键点击截图按钮打开设置面板
2. 点击输入框，按下想要设置的按键
3. 点击保存即可应用新的快捷键设置

## 兼容性

- 支持最新版本的B站播放器
- 需要浏览器支持 Canvas API
- 需要安装 Tampermonkey 或兼容的用户脚本管理器

## 更新日志

### v0.1
- 初始版本发布
- 实现基本截图功能
- 添加快捷键支持
- 添加设置面板
- 添加截图提示

## 许可证

MIT License

## 作者

d0ublecl1ck

## 问题反馈

如果您发现任何问题或有功能建议，欢迎提交 Issue。

## 贡献代码

欢迎提交 Pull Request 来改进这个脚本。

1. Fork 这个项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request 