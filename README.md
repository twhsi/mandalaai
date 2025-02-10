# Mandala AI - 曼陀罗思维导图工具

这是一个基于 Next.js 开发的曼陀罗思维导图工具，帮助用户通过九宫格和八十一宫格的方式进行思维发散和创意构思。

## 主要功能

- 🎯 九宫格模式：核心主题展开为八个方向
- 🌟 八十一宫格模式：每个方向进一步展开为八个子主题
- 💾 数据本地存储：使用 localStorage 保存编辑内容
- 📤 导出功能：支持导出为图片和文本格式
- 📥 导入功能：支持从文本文件导入内容
- 🔍 缩放功能：支持内容的放大和缩小显示

## 技术栈

- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - 样式框架
- [Framer Motion](https://www.framer.com/motion/) - 动画效果
- [TypeScript](https://www.typescriptlang.org/) - 类型检查
- [ESLint](https://eslint.org/) - 代码规范检查

## 开始使用

首先，安装项目依赖：

```bash
npm install
```

然后，运行开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看运行结果。

## 代码规范检查

项目使用 ESLint 进行代码规范检查，包含以下主要规则：

- TypeScript 未使用变量检查
- React Hooks 使用规范检查
- 模块导入规范检查
- Next.js 最佳实践检查

运行代码检查：

```bash
# 使用 npm 脚本运行
npm run lint

# 或直接使用 ESLint
npx eslint .
```

## 部署说明

项目支持多种部署方式：

1. Vercel 部署：
   - 访问 [Vercel Platform](https://vercel.com/new) 
   - 导入你的 Git 仓库
   - 点击部署即可

2. Cloudflare Pages 部署：
   - 在 Cloudflare Pages 中创建新项目
   - 选择你的 Git 仓库
   - 构建命令使用：`npm run build`
   - 构建输出目录：`.next`

更多部署细节，请参考 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 开发建议

1. 推荐使用 VS Code 作为开发工具
2. 安装 ESLint 插件以获得实时代码检查
3. 提交代码前运行 `npm run lint` 确保代码规范
4. 使用 TypeScript 严格模式编写代码

## 贡献指南

欢迎提交 Pull Request 或创建 Issue。在提交代码前，请确保：

1. 代码通过 ESLint 检查（`npm run lint`）
2. 新功能包含适当的测试和文档
3. 提交信息清晰明了

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
