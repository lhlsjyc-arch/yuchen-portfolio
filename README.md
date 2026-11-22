# Yuchen Portfolio

一个零依赖的单页个人作品集，视觉结构参考 `justkamalthings.com` 的编辑器感个人简介与层叠项目卡片，但内容、界面示意图与细节均为本项目重新设计。

## 页面结构

- 编辑器式个人简介：身份标签、选择框、协作光标、消息与工作台插画
- 大字号个人陈述：视觉 / 心理学 / AI 产品 / 工程落地
- 三张层叠项目卡：Copilot for Mac、Mobile AI Motion System、China AI Search
- Copilot for Mac 独立案例页：产品全貌、核心体验、基础系统、交互式响应式模型与影响反思
- Bing App 独立案例页：用户意图、搜索策略、Motion System、Mobile Foundation 与真实 Build 落地
- Personal Lab 入口与 YC Dashboard 独立案例页：以语音输入为起点，展示意图确认、智能体状态与人工接管
- 联系区与深浅色、低噪模式、移动菜单
- 移动端响应式与 `prefers-reduced-motion`

## 本地预览

```bash
node server.js
```

然后打开 `http://127.0.0.1:4173`。

Bing App 案例页：`http://127.0.0.1:4173/bing-app.html`

## 下一步替换

1. 在 `index.html` 中把两个 `yuchen.portfolio@example.com` 替换为真实邮箱。
2. 将三个 `.project-visual` 内的界面示意图替换为真实截图或视频。
3. 用真实 YC Dashboard 截图或操作录屏替换首页 Personal Lab 的媒体占位。
4. 继续为 Mobile AI Motion System 与 China AI Search 补充案例详情页。
