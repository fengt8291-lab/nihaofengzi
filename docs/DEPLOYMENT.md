# 你好丰子生产部署

生产站通过本地命令构建 Astro 静态文件，再使用 SSH 与 rsync 将构建结果发布到 Ubuntu + Nginx：

```bash
npm run deploy:prod
```

脚本固定部署以下目标，避免因临时参数错误影响其他站点：

- Git 分支：`main`
- Git 远端：`git@github.com:fengt8291-lab/nihaofengzi.git`
- SSH：`root@47.250.37.93`
- Nginx 静态目录：`/var/www/nihaofengzi/dist`
- 部署锁目录：`/var/www/nihaofengzi/.deploy-production.lock`
- 生产域名：`https://nihaofengzi.top`

脚本不会修改 Nginx 配置，也不会运行 reload。静态目录切换后 Nginx 会直接读取新文件。

## 首次配置

本机需要提供以下命令：

```bash
git --version
node --version
npm --version
ssh -V
rsync --version
curl --version
```

SSH 必须已经通过本机私钥或 SSH Agent 配置完成。密码、私钥、Token 和 API Key 不得放入仓库。

首次正式部署前，人工执行只读连接检查：

```bash
ssh -o BatchMode=yes root@47.250.37.93 'printf "SSH ready\n"'
```

服务器需要满足：

- `/var/www/nihaofengzi/dist` 是当前生产目录；
- Nginx 的站点 root 指向该目录；
- 存在 `www-data` 用户；
- 存在 `bash`、`find`、`runuser`、`rsync` 和 `nginx`；
- 临时目录、生产目录和备份目录都位于 `/var/www/nihaofengzi`，以便使用同一文件系统的目录重命名。

可以在本机 `~/.ssh/config` 中只配置身份文件，不改变脚本固定的服务器地址：

```sshconfig
Host 47.250.37.93
  User root
  IdentityFile ~/.ssh/your_production_key
  IdentitiesOnly yes
```

不要将 `~/.ssh/config` 或私钥复制到项目目录。

## Dry-run

```bash
npm run deploy:prod:dry
```

Dry-run 只读取：

- 项目根目录；
- 当前分支与 commit；
- origin 地址；
- Git 工作区状态；
- 本地缓存的 `origin/main` ahead/behind 状态。

它只打印正式部署步骤，不会执行 fetch、push、check、build、SSH、rsync、生产 curl 或远程清理，也不会修改任何文件。因为本轮新增部署脚本本身尚未提交，审核阶段的 dry-run 会明确提示“正式部署将因工作区不干净而停止”，但 dry-run 本身仍会安全完成。

## 正常部署

正式运行前确认当前修改已经人工审核并提交：

```bash
git status --short
git branch --show-current
npm run deploy:prod:dry
npm run deploy:prod
```

正式脚本依次执行：

1. 验证项目根目录、`main`、origin 和干净工作区；
2. fetch 最新 `origin/main`，检查 ahead/behind，拒绝落后或已经分叉的本地 main；
3. 运行 `npm run check` 和 `npm run build`；
4. 验证关键静态页面，并从本次 `dist/index.html` 提取一个安全的 `/_astro/` CSS 或 JavaScript 资源；
5. 本地质量门禁全部通过后，push 当前 main；
6. 写入 `.deploy-commit`、`.deploy-time` 和仅用于部署归属校验的 `.deploy-token`；
7. 在服务器原子获取固定部署锁，再创建唯一的 `dist_next_<UTC时间>_<short-sha>`；
8. 上传并验证目录结构、文件权限、`www-data` 可读性和 `nginx -t`；
9. 将当前 dist 重命名为 `dist_backup_<UTC时间>_<short-sha>`；
10. 将临时目录重命名为新的 dist；
11. 使用 short SHA 查询参数验证四个生产 HTTPS 路由、首页身份文案和本次构建的静态资源；
12. 成功后只保留最近三个符合严格命名规则的 `dist_backup_*`，并释放本次部署锁。

现有 `/var/www/nihaofengzi/dist_old_20260722` 不符合脚本的备份前缀，不会被自动删除。

## 部署锁

脚本通过原子执行 `mkdir /var/www/nihaofengzi/.deploy-production.lock` 防止两个正式部署同时操作生产目录。锁目录创建成功后，会写入本次运行独有的 owner token；临时目录也保存同一 token。后续验证、切换、清理和解锁都必须先精确匹配该 token。

如果锁已经存在，部署会在上传前终止并输出锁目录和现有 owner 信息。脚本不会删除无法确认属于本次运行的锁，也不会用 `rm -rf` 解锁。

正常失败、`INT` 或 `TERM` 路径会尝试释放本次创建且 owner 完全匹配的锁。进程被强制终止、SSH 连接在 owner 写入前中断，或机器断电时，可能留下需要人工判断的锁。先确认没有部署进程仍在运行，再检查锁和临时目录：

```bash
ssh root@47.250.37.93
BASE='/var/www/nihaofengzi'
LOCK="${BASE}/.deploy-production.lock"

test "$BASE" = '/var/www/nihaofengzi'
ls -la -- "$LOCK"
test -f "${LOCK}/owner" && sed -n '1p' "${LOCK}/owner"
find "$BASE" -mindepth 1 -maxdepth 1 -type d -name 'dist_next_*' -print
```

只有在人工确认部署已经终止、锁确实陈旧、目录内仅有格式正确的 owner 文件后，才可以精确移除该文件并用 `rmdir` 删除空锁目录：

```bash
OWNER="$(sed -n '1p' "${LOCK}/owner")"
printf '%s\n' "$OWNER"
find "$LOCK" -mindepth 1 -maxdepth 1 -print

# 必须只有 owner 一个条目，且值由 UTC 时间、40 位 commit SHA 和进程号组成。
test "$(find "$LOCK" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')" = '1'
[[ "$OWNER" =~ ^[0-9]{8}T[0-9]{6}Z_[0-9a-f]{40}_[0-9]+$ ]]

# 完成人工核对后再执行：
rm -- "${LOCK}/owner"
rmdir -- "$LOCK"
```

如果 owner 缺失、格式异常、与相关临时目录不一致，或无法确认是否仍有部署运行，不要删除锁；应先检查服务器进程和部署输出。

## 切换与自动回滚

生产切换使用同一父目录内的 `mv`。每次目录重命名是原子的；脚本在“旧 dist → backup”和“next → dist”之间保留尽可能短的切换窗口。

如果第二次重命名失败，服务器端会立即恢复旧 dist。如果切换后的路由、首页内容或静态资源验证失败，本地脚本会：

1. 确认当前 dist 的 `.deploy-commit` 正是本次 commit；
2. 将失败版本移动为 `dist_failed_<UTC时间>_<short-sha>`；
3. 将本次备份恢复为 dist；
4. 保留失败版本供排查，不执行模糊路径删除。

## 手动回滚

自动回滚失败或需要主动恢复历史版本时，先登录服务器并人工选择确切备份目录：

```bash
ssh root@47.250.37.93
cd /var/www/nihaofengzi
find /var/www/nihaofengzi -mindepth 1 -maxdepth 1 -type d -name 'dist_backup_*' -print
```

确认目标后，将下面的 `BACKUP` 替换为刚才人工核对的完整路径：

```bash
BASE='/var/www/nihaofengzi'
CURRENT="${BASE}/dist"
BACKUP='/var/www/nihaofengzi/dist_backup_YYYYMMDDTHHMMSSZ_COMMIT'
FAILED="${BASE}/dist_failed_manual_$(date -u '+%Y%m%dT%H%M%SZ')"

test "$BASE" = '/var/www/nihaofengzi'
test -d "$CURRENT"
test -d "$BACKUP"
test ! -e "$FAILED"

mv -- "$CURRENT" "$FAILED"
mv -- "$BACKUP" "$CURRENT"
/usr/sbin/nginx -t
curl -fsS -o /dev/null https://nihaofengzi.top/
```

不要对 `/var/www`、`/var/www/nihaofengzi` 或未经前缀检查的变量执行 `rm -rf`。

## 常见错误

### 工作区不干净

正式部署会立即停止。使用 `git status --short` 检查，完成审核和 commit 后再部署。脚本不会自动创建 commit，也不会执行 `git add`。

### 本地 main 落后于 origin/main

脚本 fetch 后会停止，不会自动 merge、rebase 或 reset。人工同步并审核 main 后重新运行。

### SSH BatchMode 失败

说明本机现有 SSH 认证不足或需要交互式密码。检查 SSH Agent、私钥权限和 `~/.ssh/config`，不要把密码写入脚本。

### rsync 不存在

macOS 通常自带 rsync。若本机缺失，应由人工安装系统工具；部署脚本不会自动安装依赖。

### nginx -t 失败

切换发生前脚本就会停止并删除本次临时目录，当前生产 dist 保持不变。脚本不会修改 Nginx 配置。

### 生产 URL 验证失败

脚本会尝试自动恢复当前备份，并把失败版本保留为 `dist_failed_*`。检查命令输出和服务器 Nginx 日志后再处理。

生产验证不只判断 HTTP 状态：

- `/`、`/about/`、`/work/`、`/work/daily-tasks/` 必须返回 HTTP 200；
- 请求统一添加基于本次 short SHA 的 `deploy` 查询参数，降低缓存误判；
- 首页响应必须包含“你好丰子”，且不得包含旧占位文案“你好疯子个人主页建设中”；
- 本地构建时从 `dist/index.html` 提取的 `/_astro/` CSS 或 JavaScript 资源必须符合安全路径格式、存在于本地 dist，并在生产域名返回 HTTP 200；
- 服务器内部的 `.deploy-commit` 用于确认当前版本和自动回滚归属，不要求通过公网访问。
