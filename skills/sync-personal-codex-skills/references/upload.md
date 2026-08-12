# Upload workflow

Use this workflow for one named personal Skill or all personal Skills.

## 1. Establish the source of truth

1. Enumerate ordinary child directories under `~/.codex/skills/`, excluding `.system` and plugin-managed paths.
2. Enumerate directories under `~/codex-skills/skills/`.
3. Resolve links and Junctions before comparing paths.
4. Handle each Skill as follows:
   - Correct link to the repository directory: use the repository entity.
   - Present only in the repository: keep it there and create the Codex link after validation.
   - Present only as a real directory under `~/.codex/skills/`: copy it to a new, non-existing repository directory, preserve the original as a backup, and do not replace it with a link during the same operation unless the user explicitly authorizes removal of that backup.
   - Independent entities at both locations, an incorrect link, or a same-name destination: stop for that Skill and report the conflict. Do not compare-and-overwrite automatically.

## 2. Protect the repository

1. Verify the repository root, `origin`, current branch, upstream, and authentication.
2. Fetch the remote.
3. Require a clean fast-forward relationship before adding work. Stop if the branch is behind, diverged, or contains unexplained unpushed commits.
4. Preserve unrelated working-tree changes. Do not stage them.

## 3. Validate what will be published

For every requested Skill:

1. Require `SKILL.md` and validate its frontmatter and folder name.
2. Review the complete file list, including hidden files and links.
3. Search the target files for likely secrets, tokens, cookies, passwords, private paths, customer information, logs, exports, and raw chat records. Treat findings as reasons for manual review, not automatic redaction.
4. Reject links that escape the Skill directory or files that do not belong in a reusable Skill.

## 4. Commit only the intended change

1. Stage explicit Skill paths and any directly required repository index or install documentation. Never stage the whole repository by convenience when unrelated changes exist.
2. Inspect `git diff --cached --stat`, `git diff --cached`, and `git status`.
3. Inspect `origin/<branch>..HEAD` before and after committing. A push sends all unpushed commits, not only the latest staged files.
4. Use a concise commit message naming the operation or Skill.
5. Push normally. Never use `--force` or `--force-with-lease`.

## 5. Verify the result

1. Fetch or query the remote without exposing credentials.
2. Confirm the remote branch points to the expected commit.
3. Confirm every requested Skill path and file is present remotely.
4. Confirm local branch tracking and working-tree status.
5. Create missing Codex links only when the target path is absent. Verify every resulting link target.

When uploading all Skills, list every personal Skill included and separately list system, plugin-managed, conflicting, or skipped entries.
