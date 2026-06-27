# Word Scene Trainer / 单词场景训练器

一个“背单词 + 像素 RPG 场景”的网页 App 原型。用户在左侧输入英文单词，右侧生成办公室会议室场景，通过点击 NPC、阅读英文对话、完成任务和拼写练习来记忆单词。

## 当前版本

v0.4 grid demo

## 功能

- Next.js + TypeScript + Tailwind CSS
- 左侧现代控制台 UI，支持输入单词、选择学习目标和难度
- 右侧 HTML/CSS/React 模拟 2D 像素 RPG 场景
- 20x20 固定方格地图 demo
- 固定 10 个角色素材和一组像素道具素材
- mock AI 关卡配置会根据词表生成 NPC、物品、任务和故事文本
- 玩家支持方向键 / WASD / D-pad 一格一格移动
- NPC 会在小范围内巡逻
- 站到 NPC 或物品旁边后可以互动并推进剧情
- NPC / 物品相邻互动，目标词高亮
- WORDS 面板支持 `new / seen / mastered` 三种学习状态
- Tasks 面板自动更新任务完成状态
- 完成 3 个任务后解锁拼写练习
- 拼写练习支持 Correct / Incorrect、总分、错词和推荐复习词
- localStorage 保存最近场景和学习进度
- 历史记录显示单词进度、任务进度和最佳拼写分数

## 本地启动

```bash
npm install
npm run dev
```

打开：

```txt
http://127.0.0.1:3000
```

## 常用命令

```bash
npm run typecheck
npm run build
```

## 技术约束

第一阶段不接真实 AI、不做登录、不接数据库、不使用 Phaser.js。像素游戏界面暂时由 HTML、CSS 和 React state 实现。

## 后续方向

- 增加 Airport Check-in、Cafe Order、Hotel Reception 等 20x20 地图模板
- 让 AI 只生成结构化 `SceneSpec` JSON，前端统一渲染
- 增加复习队列、错词本和学习报告
- 支持键盘移动、碰撞和简单网格寻路
- 部署到 Vercel，补线上 Demo 链接和截图
