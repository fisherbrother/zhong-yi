#!/usr/bin/env node

/**
 * GitHub Pages 部署辅助脚本
 * 用于验证部署配置和提供部署指导
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  if (existsSync(filePath)) {
    log(`✅ ${description} 已找到`, 'green')
    return true
  } else {
    log(`❌ ${description} 未找到`, 'red')
    return false
  }
}

function checkGitHubActionsConfig() {
  log('\n📋 检查GitHub Actions配置...', 'blue')
  
  const configPath = '.github/workflows/deploy.yml'
  if (!existsSync(configPath)) {
    log('❌ GitHub Actions配置文件不存在', 'red')
    return false
  }

  try {
    const content = readFileSync(configPath, 'utf-8')
    
    // 检查关键配置
    const checks = [
      { name: 'Node.js版本', pattern: /node-version:\s*['"]18['"]/ },
      { name: '构建命令', pattern: /npm run build/ },
      { name: '上传artifact', pattern: /upload-pages-artifact/ },
      { name: '部署步骤', pattern: /Deploy to GitHub Pages/ }
    ]

    checks.forEach(check => {
      if (check.pattern.test(content)) {
        log(`✅ ${check.name} 配置正确`, 'green')
      } else {
        log(`⚠️  ${check.name} 配置可能有问题`, 'yellow')
      }
    })

    return true
  } catch (error) {
    log(`❌ 读取配置文件失败: ${error.message}`, 'red')
    return false
  }
}

function checkPackageJson() {
  log('\n📦 检查package.json配置...', 'blue')
  
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    
    const hasBuildScript = pkg.scripts && pkg.scripts['build:gh-pages']
    const hasDependencies = pkg.dependencies && Object.keys(pkg.dependencies).length > 0
    
    if (hasBuildScript) {
      log('✅ GitHub Pages构建脚本已配置', 'green')
    } else {
      log('❌ GitHub Pages构建脚本未配置', 'red')
    }
    
    if (hasDependencies) {
      log('✅ 项目依赖已配置', 'green')
    } else {
      log('❌ 项目依赖未配置', 'red')
    }
    
    return hasBuildScript && hasDependencies
  } catch (error) {
    log(`❌ 读取package.json失败: ${error.message}`, 'red')
    return false
  }
}

function checkViteConfig() {
  log('\n⚡ 检查Vite配置...', 'blue')
  
  const configPath = 'vite.config.gh-pages.ts'
  if (!existsSync(configPath)) {
    log('❌ GitHub Pages专用Vite配置文件不存在', 'red')
    return false
  }

  try {
    const content = readFileSync(configPath, 'utf-8')
    
    const checks = [
      { name: '基础路径', pattern: /base:\s*['"]\/['"]/ },
      { name: '输出目录', pattern: /outDir:\s*['"]dist['"]/ },
      { name: '代码压缩', pattern: /minify:\s*['"]terser['"]/ },
      { name: 'console清理', pattern: /drop_console:\s*true/ }
    ]

    checks.forEach(check => {
      if (check.pattern.test(content)) {
        log(`✅ ${check.name} 配置正确`, 'green')
      } else {
        log(`⚠️  ${check.name} 配置可能有问题`, 'yellow')
      }
    })

    return true
  } catch (error) {
    log(`❌ 读取Vite配置失败: ${error.message}`, 'red')
    return false
  }
}

function provideDeploymentSteps() {
  log('\n🚀 GitHub Pages部署步骤：', 'blue')
  log('1. 创建GitHub仓库并推送代码', 'yellow')
  log('2. 在GitHub仓库设置中启用Pages服务', 'yellow')
  log('3. 配置环境变量（VITE_SUPABASE_URL等）', 'yellow')
  log('4. 推送代码触发自动部署', 'yellow')
  log('5. 访问 https://[用户名].github.io/[仓库名]/', 'yellow')
}

function main() {
  log('🏥 中医数据库 - GitHub Pages部署检查', 'blue')
  log('=' .repeat(50), 'blue')

  // 检查必要文件
  const files = [
    { path: '.github/workflows/deploy.yml', desc: 'GitHub Actions配置' },
    { path: 'vite.config.gh-pages.ts', desc: 'GitHub Pages Vite配置' },
    { path: 'package.json', desc: '项目配置' }
  ]

  let allFilesExist = true
  files.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false
    }
  })

  if (!allFilesExist) {
    log('\n❌ 必要文件缺失，请先创建这些文件', 'red')
    return
  }

  // 详细检查各项配置
  const githubActionsOk = checkGitHubActionsConfig()
  const packageJsonOk = checkPackageJson()
  const viteConfigOk = checkViteConfig()

  log('\n' + '='.repeat(50), 'blue')
  
  if (githubActionsOk && packageJsonOk && viteConfigOk) {
    log('✅ 所有配置检查通过！可以开始部署', 'green')
  } else {
    log('⚠️  部分配置有问题，请检查上述警告', 'yellow')
  }

  provideDeploymentSteps()
  
  log('\n📖 详细部署指南请查看：GitHub-Pages部署指南.md', 'blue')
}

// 运行检查
try {
  main()
} catch (error) {
  log(`❌ 检查过程出错: ${error.message}`, 'red')
  process.exit(1)
}