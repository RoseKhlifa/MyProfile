# 部署 MyProfile

本项目使用 Next.js 常驻 Node 服务，贡献刷新 API 和 SQLite 访问计数需要服务器运行时。推荐 Node.js **24 LTS**，最低 **22.18**，使用 **pnpm 11.24.0**，并为计数数据库提供可写、持久保存的本地目录。

以下以 Linux + systemd 为例。`/srv/myprofile`、服务账号 `myprofile` 和本机端口 `4324` 都是部署示例，可按环境调整。仓库当前没有 Dockerfile；若后续容器化，同样需要将计数目录挂载为持久卷。

## 准备代码

由部署账号克隆和构建代码：

```sh
git clone git@github.com:RoseKhlifa/MyProfile.git
cd MyProfile
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify
```

先修改 `src/data/resume-data.ts` 中的正式 `siteUrl`、个人信息与联系方式，以及 `src/data/projects.ts`、`src/data/stack.ts` 和头像，再构建。更换 GitHub 用户时同时更新对应用户名与真实快照。

将构建完成的项目放到 `/srv/myprofile`。运行目录至少保留 `.next`、`public`、`node_modules`、`package.json` 与 `next.config.js`；也可保留完整源码目录。服务账号需要读取这些文件，并可写入 `.next` 中的运行时缓存。更新版本时继续沿用同一数据库目录。

## 使用普通服务账号运行

由管理员创建专用系统账号，不使用 root 运行应用：

```sh
sudo useradd --system --home-dir /var/lib/myprofile --shell /usr/sbin/nologin myprofile
sudo chown -R myprofile:myprofile /srv/myprofile
```

如果账号已存在，跳过创建。确认 `command -v node` 的输出；下面示例使用 `/usr/bin/node`，应替换为服务器实际安装的 Node 可执行文件路径。

保存以下配置为 `/etc/systemd/system/myprofile.service`：

```ini
[Unit]
Description=MyProfile personal website
After=network.target

[Service]
Type=simple
User=myprofile
Group=myprofile
WorkingDirectory=/srv/myprofile
Environment=NODE_ENV=production
Environment=VISIT_COUNTER_DB=/var/lib/myprofile/visits.sqlite
StateDirectory=myprofile
StateDirectoryMode=0750
UMask=0027
ExecStart=/usr/bin/node /srv/myprofile/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4324
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

systemd 会创建并授权 `/var/lib/myprofile`。`VISIT_COUNTER_DB` 是绝对路径，目录放在代码之外，重新构建或替换代码不会清空计数。

启用并检查服务：

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now myprofile
sudo systemctl status myprofile --no-pager
curl -fsS http://127.0.0.1:4324/api/visits
```

最后一个命令仅查询，不增加访问量，返回形如 `{"total":0}` 的 JSON。日志可通过 `sudo journalctl -u myprofile -n 100 --no-pager` 查看。

## 接入域名

在 Nginx、OpenResty 或 1Panel 中将域名反向代理到 `http://127.0.0.1:4324`，启用 HTTPS，并保留原始 `Host` 与转发协议。示例 Nginx 配置：

```nginx
location / {
    proxy_pass http://127.0.0.1:4324;
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

计数接口检查请求 Origin 与站点 URL／Host 的对应关系，保留 Host 可使 HTTPS 公网入口与内部 HTTP 上游正常配合。`/api/visits` 响应为 `no-store`，反代不要为此接口额外开启缓存；贡献 API 可按自身响应头缓存。

如果反向代理运行在隔离容器中，需让它能够访问 Node 服务地址，再相应调整上游配置；示例中的回环地址用于与应用共用宿主网络的反代。

## 数据持久化与备份

访问总数和 24 小时内的去重事件保存在 SQLite，使用 WAL。生产环境持续保留 `/var/lib/myprofile`，不要将它加入 Git 或在发布脚本中覆盖。多个 Node 进程可在同一宿主共享此文件；当前存储设计使用本地持久磁盘。

以下方式短暂停止服务，备份完整数据目录，避免只复制正在写入的主数据库而遗漏 WAL：

```sh
profile_backup_dir="/var/backups/myprofile/$(date -u +%Y%m%dT%H%M%SZ)"
sudo systemctl stop myprofile
sudo install -d -m 0750 "$profile_backup_dir"
sudo cp -a /var/lib/myprofile/. "$profile_backup_dir/"
sudo systemctl start myprofile
```

恢复时同样先停止服务，保留当前数据目录副本，再完整恢复选定备份并确保所有者为 `myprofile:myprofile`；不要混用不同备份的主数据库、`-wal` 和 `-shm` 文件。代码回退也继续使用持久目录，避免把累计访问数回退到旧版本副本。

## 更新

在发布前完成安装、检查和构建，替换运行代码后执行：

```sh
sudo systemctl restart myprofile
curl -fsS http://127.0.0.1:4324/api/visits
curl -fsS http://127.0.0.1:4324/api/contributions
```

确认页面、两个 API 与正式域名都可访问。GitHub 贡献和公开项目 Star 数无需 token，暂时访问不到 GitHub 时使用已保存的真实数据；计数数据库和站点运行目录应保持原有权限。
