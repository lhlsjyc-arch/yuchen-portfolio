# Yuchen Portfolio

一个无需构建的单页个人作品集，视觉结构参考 `justkamalthings.com` 的编辑器感个人简介与层叠项目卡片，但内容、界面示意图与细节均为本项目重新设计。滚动交互使用项目内置的 GSAP 与 ScrollTrigger。

## 页面结构

- 编辑器式个人简介：身份标签、选择框、协作光标、消息与工作台插画
- 大字号个人陈述：视觉 / 心理学 / AI 产品 / 工程落地
- 三个精选项目：Copilot Mac、Bing App、YC WorkBuddy
- 更多项目切片：使用滚动锁定的 3D Coverflow 展示 China AI Landing、Chinese Keyboard、Bing Screensaver、Bing Blogs 与 Five Mini Games；支持拖拽、方向键、按钮和移动端横滑
- Copilot Mac 独立案例页：产品全貌、核心体验、基础系统、交互式响应式模型与影响反思
- Bing App 独立案例页：用户意图、搜索策略、Motion System、Mobile Foundation 与真实 Build 落地
- Personal Lab 入口与 YC WorkBuddy 独立案例页：展示 AI 如何分析工作信息与记录，并将其转化为可执行任务
- 联系区与深浅色、低噪模式、移动菜单
- 移动端响应式与 `prefers-reduced-motion`

## 本地预览

```bash
node server.js
```

然后打开 `http://127.0.0.1:4173`。

Bing App 案例页：`http://127.0.0.1:4173/bing-app.html`

## 下一步替换

1. 联系邮箱已更新为 `yuchenjmm@163.com`。
2. 将三个 `.project-visual` 内的界面示意图替换为真实截图或视频。
3. 用真实 YC WorkBuddy 截图或操作录屏替换首页 Personal Lab 的媒体占位。
4. 补齐五个“更多项目切片”的可公开截图后，替换目前的项目封面图形。
