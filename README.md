# 辽宁大学人工智能教学与科研实践：GitHub 部署包

现有网站最新版的独立部署副本，包含照片、项目图片、微信小程序码、课程样例和三项 DeepSeek 交互。原网站不受影响。包内没有真实密钥，没有 ChatGPT 登录或托管依赖。

## 1. 发布到 GitHub Pages

1. 登录 https://github.com ，点击右上角“+”→ New repository。
2. 仓库名可用 `lnu-ai-practice`，选择 Public，勾选 Add a README file，创建仓库。如需 `https://用户名.github.io/` 地址，则仓库名填写 `用户名.github.io`。
3. 解压此包，进入 `lnu-ai-github`。上传**文件夹里面的内容**到仓库根目录，不要多上传一层外层文件夹。
4. 点击 Add file → Upload files，拖入 site、api、server、scripts 文件夹以及 README.md、package.json、vercel.json 等文件，提交。不要上传真实 .env 文件。
5. 确认仓库存在 `.github/workflows/pages.yml`。若网页上传漏了 .github 文件夹：点击 Add file → Create new file，文件名填写 `.github/workflows/pages.yml`；用记事本打开包内同名文件，全文粘贴后提交。
6. Settings → Pages → Build and deployment → Source，选择 **GitHub Actions**。
7. Actions → Publish website to GitHub Pages → Run workflow，选择 main 并运行。等待变绿，在 Settings → Pages 查看网址。

普通仓库地址为 `https://用户名.github.io/lnu-ai-practice/`；同名用户仓库为 `https://用户名.github.io/`。图片与脚本均采用相对路径，两种地址都支持。

此时案例、图片、小程序码和课程预设交互可以使用。实时生成尚未连接，会明确提示，不会把预设内容冒充实时生成。

## 2. 连接 DeepSeek 后台

GitHub Pages 发布网页，Vercel 运行后台，无需购买云服务器。收费与适用条款以平台当前政策为准，DeepSeek 调用按你的账户计费。

1. 登录 https://vercel.com 并连接 GitHub，Add New → Project，导入刚才的仓库。
2. Root Directory 保持仓库根目录，Framework Preset 选择 Other。vercel.json 已指定构建命令与输出目录，不要把 site 设为根目录。
3. 添加环境变量，至少勾选 Production：

| 变量 | 值 |
|---|---|
| DEEPSEEK_API_KEY | 在 DeepSeek 控制台新建的密钥 |
| DEEPSEEK_MODEL | deepseek-flash；也可填账号当前支持的模型 ID |
| ALLOWED_ORIGINS | https://你的用户名.github.io |

ALLOWED_ORIGINS 不带仓库路径、尾部斜杠或通配符；多个来源用英文逗号分隔，例如 `https://用户名.github.io,https://www.example.com`。

4. 点击 Deploy，取得生产地址，例如 `https://你的项目.vercel.app`。
5. 在 GitHub 编辑 site/config.js：

```javascript
window.LNU_CONFIG = {
  hosting: 'github-pages',
  apiEndpoint: 'https://你的项目.vercel.app/api/teaching'
};
```

6. 提交后网页自动更新。在备课助教、学习助教、数字人讲稿中分别点击生成，核对“DeepSeek实时生成”和生成内容。
7. 修改环境变量后需重新部署 Vercel。生产接口必须允许网站访客访问；若返回登录页，检查 Deployment Protection。前端地址须与 ALLOWED_ORIGINS 匹配。

密钥只放后台环境变量，不能写进 config.js、网页、README 或仓库。此前贴出的密钥建议撤销并重新生成。

可选：这份 Vercel 部署也包含完整网页；若以后希望网页和后台使用同一个域名，可直接给 Vercel 绑定自己的域名。构建会自动采用同源 `/api/teaching`，GitHub 仍负责管理代码。

## 3. 绑定自己的域名到 GitHub Pages

1. Settings → Pages → Custom domain 填 `www.你的域名.com` 并保存。
2. 到域名商 DNS 管理添加：类型 CNAME，主机记录 www，记录值 `你的用户名.github.io`。记录值不含 https 或仓库路径。
3. DNS 检查通过后启用 Enforce HTTPS。
4. 在后台 ALLOWED_ORIGINS 追加 `https://www.你的域名.com`，重新部署后台。
5. 按 GitHub 官方说明验证域名。如要使用裸域名，再按官方说明设置对应 DNS 记录。

## 本地验证与目录

需要 Node.js 22 或以上，无第三方运行依赖：

```bash
npm test
npm run build
```

- site：GitHub Pages 发布目录，包括完整图片。
- api/teaching.mjs：Vercel 后台入口。
- server/teaching.mjs：教学提示词、输入校验和模型调用。
- .github/workflows/pages.yml：自动发布工作流。
- public：Vercel 构建生成，不需上传。

本地浏览网页：`python -m http.server 8000 --directory site`，打开 http://localhost:8000 。该命令不会启动后台。

## 排查

- 404：检查 Actions 是否成功、仓库根目录是否多了一层文件夹、Pages 是否选择 GitHub Actions。
- 图片缺失：确认 site/assets 完整、文件名大小写一致。
- 实时生成未连接：填写 site/config.js 的 apiEndpoint。
- 来源不匹配：ALLOWED_ORIGINS 填实际网页的协议与域名，不含路径，重新部署。
- 密钥或余额错误：核对 DeepSeek 账户与后台变量。
- 接口返回登录页：检查生产部署访问限制。

来源校验限制浏览器跨域请求，不等于身份认证。公开实时生成会使用你的模型额度，可在模型账户与托管平台配置演示用量控制。

## 验证范围

静态资源完整、JavaScript 语法和构建已检查；模拟模型响应覆盖三类生成、跨域预检、来源限制、输入校验、未配置及安全错误。未使用真实密钥，尚未发布到你的 GitHub/Vercel 账户。在线生成需部署后检查。

## 官方资料

- GitHub Pages 工作流：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- 自定义域名：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Vercel 配置：https://vercel.com/docs/project-configuration
- 环境变量：https://vercel.com/docs/environment-variables
- DeepSeek 接口：https://api-docs.deepseek.com/api/create-chat-completion/
