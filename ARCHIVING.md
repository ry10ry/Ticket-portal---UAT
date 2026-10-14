# 一年归档：部署和使用

初始目录：`C:\Users\momcc06\Documents\MOMCC-ServiceDesk\MOMCC_Archive`。
这是 C 盘目录，复制归档不会释放 C 盘空间。默认只复制并验证，**不删除线上附件**。

## 安装

将更新包按相同路径覆盖项目文件；不要替换原有 `.env`、数据库或附件卷。在项目目录运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Initialize-Archive.ps1 -ConfigurePortal
docker compose -f compose.yaml -f compose.override.yaml -f compose.ssl.yaml up -d --build --force-recreate web scheduler
```

初始化程序创建归档目录和 `.momcc-archive-target` 标记，只修改 `.env` 的三个归档选项，保存 `.env.before-archive` 备份，保留其他设置。默认路径相对于项目目录。数据库启动时自动增加归档索引表，不删除旧数据，无额外 Python 依赖。

浏览器 Ctrl+F5，进入 **Admin → One-year Archive**，可立即生成归档。自动任务每日新加坡时间 03:00 时段执行，每日最多复制 20 张单；错过该时段可手动运行或等下一日。不会自动清理线上附件。

## 归档范围

- Fault Ticket：Closed 或 Cancelled，结束已满一年。
- CR：Closed，关闭已满一年。
- SR：Approved，批准已满一年。

按完成日期计算一年，不按单号中的日期计算；活跃单和最近完成的单不会归档。包括完整内容、评论、审批记录、全部历史版本和附件，含 CR 完成证明、SR 已移除的历史附件、截图。归档后单据只读，不能再编辑或删除，原业务状态保留。

初始状态 `copied` 表示归档已验证、线上副本尚未清理；`archived` 表示已经清理线上附件。Portal 保留文字、历史和报表记录，Monthly Report CSV 增加 Archive State / Archive Path，不因附件归档而丢失历史报表。

## 离线查看和导出

打开归档根目录的 `index.html`，可按单号、标题、提交人搜索，按类型及完成日期筛选，下载筛选后的 CSV；`archive.csv` 是完整目录报表。进入对应单据可查看内容、审批和评论，打开附件及截图，也可查看完整 `record.json`。页面和附件均在该目录内，不依赖 Portal、数据库或互联网。

CSV 包含描述、范围、审批摘要、附件名称及路径。实际在 Windows 双击打开的行为需要部署后确认；云环境已用独立静态页面验证搜索、导出、历史记录和截图，浏览器策略禁止直接测试 file://。

## 搬到外接硬盘并释放线上附件空间

1. 复制**整个** `MOMCC_Archive` 到外接硬盘，例如 `E:\MOMCC_Archive`，包括隐藏的 `.momcc-archive-target`。不要重新生成此标记。
2. 保留另一份独立备份，并验证复制结果：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Archive.ps1 -ArchivePath "E:\MOMCC_Archive"
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Initialize-Archive.ps1 -ArchivePath "E:\MOMCC_Archive" -ConfigurePortal
docker compose -f compose.yaml -f compose.override.yaml -f compose.ssl.yaml up -d --force-recreate web scheduler
```

3. 确认 Admin 页面可访问新目录，打开历史单及附件验证。初始化始终设 `ARCHIVE_PURGE_ENABLED=false`。
4. 准备清理时，将 `.env` 中 `ARCHIVE_PURGE_ENABLED` 改为 `true`，再次 recreate web 和 scheduler。Admin 页面手动执行清理，每张单均重新验证归档完整性和源文件，验证通过才清理其线上附件。不会删除单据文字或报表数据。

清理 CR/SR 的数据库附件后，空间可供 MySQL 内部复用，但 Windows/Docker VHDX 的占用不一定立即缩小。本功能不会自动执行数据库重建或磁盘压缩。C 盘临时归档副本只有在外接副本及独立备份确认后才应由管理员处理。

## 故障和恢复

归档先写临时目录、验证 SHA256，再登记成功；空间不足（预留 100 MiB）、目标未连接、标记不符或校验失败会停止。清理失败保持可重试状态；文件系统和数据库不是同一个事务，先前已验证并登记的归档作为恢复依据。Warning/Error 写入现有日志。

外接盘不可用时，已运行 Portal 的文字及报表仍可查询，清理后的附件需重新连接对应归档目录。**容器创建/重建需要挂载目录可用**，Docker 在硬盘缺席时可能无法启动挂载；维护时可关闭归档并临时改成本地目录恢复服务，附件访问等待原归档重新挂回。

现有数据库/附件周备份不自动包含此归档目录，归档应另做独立备份。恢复时同时恢复数据库和对应归档目录，保留相同标记，再配置挂载路径。

## 更新文件

新增：`app/archive.py`、`app/static/archive.js`、`scripts/Initialize-Archive.ps1`、`scripts/Test-Archive.ps1`、本说明。

替换：`compose.yaml`、`app/main.py`、`app/changes.py`、`app/services.py`、`app/internal_views.py`、`app/scheduler.py`、`app/static/app.js`、`app/static/changes.js`、`app/static/services.js`、`app/static/index.html`。`.gitignore` 同时排除本地归档及环境文件。

更新包不包含 `.env`、数据库或业务附件，不修改原始完整安装 ZIP。
