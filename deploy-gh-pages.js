#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

console.log('🚀 开始部署到 GitHub Pages...')

try {
  // 检查是否在git仓库中
  execSync('git rev-parse --git-dir', { stdio: 'ignore' })
} catch (error) {
  console.error('❌ 当前目录不是git仓库，请先初始化git仓库')
  process.exit(1)
}

// 创建构建输出目录
const distDir = join(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

console.log('📦 构建项目...')
try {
  execSync('npm run build:gh-pages', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

console.log('📁 创建404.html用于SPA路由...')
const indexHtml = join(distDir, 'index.html')
const notFoundHtml = join(distDir, '404.html')

if (existsSync(indexHtml)) {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>中医数据库 - 404</title>
  <script>
    // 单页应用路由处理
    sessionStorage.redirect = location.pathname;
    location.replace('/');
  </script>
</head>
<body>
  <p>页面跳转中...</p>
</body>
</html>
`
  writeFileSync(notFoundHtml, content)
}

console.log('📝 创建CNAME文件（可选）...')
const cnameFile = join(distDir, 'CNAME')
if (!existsSync(cnameFile)) {
  // 如果需要自定义域名，可以在这里设置
  // writeFileSync(cnameFile, 'your-domain.com')
}

console.log('🎯 部署说明：')
console.log('1. 确保您已经创建了GitHub仓库')
console.log('2. 在GitHub仓库设置中启用GitHub Pages')
console.log('3. 选择部署源为GitHub Actions')
console.log('4. 推送代码到main分支触发自动部署')
console.log('')
console.log('📋 手动部署步骤：')
console.log('git add dist -f')
console.log('git commit -m "Deploy to GitHub Pages"')
console.log('git subtree push --prefix=dist origin gh-pages')

console.log('✅ GitHub Pages部署准备完成！')