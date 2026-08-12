# Personal Codex Skills

这是一个用于多设备共享和版本管理的个人 Codex Skills 仓库，不是 OpenAI 官方项目。

## Skills

| Skill | 用途 |
| --- | --- |
| `discuss-and-align` | 在执行前讨论问题、检验假设并形成明确共识 |
| `research-and-apply` | 调研可靠来源和优秀案例，并应用到原始任务 |
| `write-project-agents-md` | 创建、更新并审计项目级 `AGENTS.md` |
| `write-project-handoff` | 创建项目本地交接快照，帮助新任务继续工作 |

## 在另一台设备安装

克隆仓库：

```bash
git clone https://github.com/Suda777/codex-skills.git ~/codex-skills
cd ~/codex-skills
./install.sh
```

安装脚本会把仓库中的 Skill 软链接到：

```text
${CODEX_HOME:-~/.codex}/skills/
```

如果目标位置已经存在同名文件或目录，脚本会保留现有内容并停止，不会强制覆盖。

安装或更新后，请新建 Codex 任务；如果仍未识别到新版本，请重启 Codex。

## 日常同步

在修改前先同步：

```bash
git pull --ff-only
```

修改并检查完成后提交：

```bash
git add skills
git commit -m "update skill workflow"
git push
```

其他设备再次运行：

```bash
git pull --ff-only
```

由于 Codex 使用软链接读取这些文件，拉取成功后不需要重新复制 Skill。

## 安全约定

- 不提交 API Key、Token、Cookie、密码、客户资料或聊天原文。
- 不提交 `~/.codex/skills/.system/` 和插件缓存。
- 设备专属配置和凭据保留在各设备本地。
- 修改同一个 Skill 前先拉取远端，避免多设备产生分叉。
