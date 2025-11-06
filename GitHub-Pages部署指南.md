# GitHub Pages部署指南 - 中国大陆可访问

## 🎯 目标
将中医数据库网站部署到GitHub Pages，确保在中国大陆可以稳定访问。

## 📋 前置条件
1. GitHub账号
2. 本项目代码已推送到GitHub仓库

## 🚀 部署步骤

### 第一步：创建GitHub仓库
1. 登录GitHub (https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `tcm-database` (或其他你喜欢的名称)
   - Description: `中医数据库网站`
   - 选择 Public (GitHub Pages需要公开仓库)
   - 不要初始化README
4. 点击 "Create repository"

### 第二步：推送代码到GitHub
在本地项目目录执行：
```bash
# 初始化git仓库（如果还没初始化）
git init

# 添加远程仓库地址（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit - 中医数据库网站"

# 推送到GitHub
git push -u origin main
```

### 第三步：启用GitHub Pages
1. 进入你的GitHub仓库页面
2. 点击 "Settings" 选项卡
3. 向下滚动到 "Pages" 部分
4. 在 "Source" 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/(root)`
   - 点击 "Save"

### 第四步：配置GitHub Actions
GitHub Actions会自动部署，配置已经准备好：

1. 进入仓库的 "Actions" 选项卡
2. 第一次会提示你启用Actions，点击 "Set up this workflow"
3. 系统会自动运行部署流程

### 第五步：配置环境变量（重要）
1. 进入仓库的 "Settings" → "Secrets and variables" → "Actions"
2. 点击 "New repository secret"
3. 添加以下密钥：
   - `VITE_SUPABASE_URL`: 你的Supabase项目URL
   - `VITE_SUPABASE_ANON_KEY`: 你的Supabase匿名访问密钥

## 📊 部署状态检查

### 查看部署状态
1. 进入仓库的 "Actions" 选项卡
2. 查看最新的工作流运行状态
3. 绿色✅表示部署成功，红色❌表示失败

### 访问网站
部署成功后，你的网站地址将是：
```
https://[你的用户名].github.io/[仓库名]/
```

例如：`https://zhangsan.github.io/tcm-database/`

## 🔧 常见问题解决

### 1. 页面空白或404错误
- 确认GitHub Actions部署成功
- 检查环境变量是否正确配置
- 等待几分钟让GitHub Pages生效

### 2. 数据不显示
- 检查Supabase配置是否正确
- 确认数据导入成功
- 查看浏览器控制台错误信息

### 3. 访问速度慢
- GitHub Pages在中国大陆访问速度一般
- 可以考虑使用Gitee Pages作为替代方案

## 🌟 备选方案：Gitee Pages（国内访问更快）

如果GitHub Pages访问速度不理想，可以考虑使用Gitee Pages：

1. 注册Gitee账号 (https://gitee.com)
2. 导入GitHub仓库到Gitee
3. 启用Gitee Pages服务
4. 需要进行实名认证

## 📞 技术支持
如果部署过程中遇到问题，可以：
1. 查看GitHub Actions日志
2. 检查浏览器控制台错误
3. 确认所有配置文件正确

---
**注意**：GitHub Pages是静态网站托管服务，适合展示类网站。对于需要后端服务的功能，可能需要额外配置或使用其他服务。