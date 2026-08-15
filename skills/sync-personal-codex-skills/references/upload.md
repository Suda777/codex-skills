# Upload workflow

Use this workflow for one explicitly isolated named Skill or all managed non-system Skills, including self-created, third-party, installed, and newly created repository Skills. A general request to upload or push Skills always means a full upload. Restrict the scope to one Skill only when the user explicitly says to upload only that named Skill.

## 1. Establish the source of truth

1. Enumerate ordinary child directories and links under `~/.codex/skills/`, excluding `.system` and plugin-managed paths. Include third-party Skills installed directly in this directory.
2. Resolve the expected repository root by the main Skill's location rules, then enumerate its `skills/` directory.
3. Resolve links and Junctions before comparing paths.
4. Handle each Skill as follows:
   - Correct link to the repository directory: use the repository entity.
   - Present only in the repository: keep it there and create the Codex link after validation.
   - Present only as a real directory under `~/.codex/skills/`: copy it to a new, non-existing repository directory, preserve the original as a backup, and do not replace it with a link during the same operation unless the user explicitly authorizes removal of that backup.
   - Independent entities at both locations, an incorrect link, or a same-name destination: stop for that Skill and report the conflict. Do not compare-and-overwrite automatically.

## 2. Protect the repository

1. Verify the repository root, `origin`, current branch, upstream, and authentication.
2. Fetch the remote.
3. Require the requested local work to be based on the fetched remote branch. If local `HEAD` is behind and the worktree is clean, update with `git pull --ff-only`. Stop on a dirty-behind state, divergence, or unexplained unpushed commits. Allow explained, already-reviewed local commits only when the fetched remote is their ancestor and every unpushed commit belongs to the requested upload.
4. Record the fetched remote commit as the upload base. This is the version the current device's working-tree changes or allowed local commits are building on.
5. Preserve unrelated working-tree changes. Do not stage them.

## 3. Validate what will be published

For every requested Skill:

1. Require `SKILL.md` and validate its frontmatter and folder name.
2. Review the complete file list, including hidden files and links.
3. Search the target files for likely secrets, tokens, cookies, passwords, private paths, customer information, logs, exports, and raw chat records. Treat findings as reasons for manual review, not automatic redaction.
4. Reject links that escape the Skill directory or files that do not belong in a reusable Skill.
5. For a third-party Skill, identify the upstream project and license, confirm redistribution is permitted, and include every required license, copyright, attribution, and notice file. Stop instead of publishing when the source or license cannot be verified.

## 4. Commit only the intended change

1. Stage explicit Skill paths and any directly required repository index or install documentation. Never stage the whole repository by convenience when unrelated changes exist.
2. Inspect `git diff --cached --stat`, `git diff --cached`, and `git status`.
3. Inspect `origin/<branch>..HEAD` before and after committing. A push sends all unpushed commits, not only the latest staged files.
4. Use a concise commit message naming the operation or Skill.
5. Immediately before pushing, fetch the remote again and compare its branch tip with the recorded upload base.
6. If the remote still equals the upload base, push normally. Never use `--force` or `--force-with-lease`.
7. If the remote moved, inspect `upload-base..origin/<branch>` before changing the local branch. Report the remote commits and changed paths, then classify the result:
   - **Clearly disjoint:** the remote changed only different Skill directories and did not touch repository indexes, install documentation, shared scripts, or any path in the current local commits. Create a normal merge commit with the fetched remote branch. Never rebase. If Git reports a conflict or an unexpected changed path, abort the merge and stop.
   - **Potential conflict:** the remote changed the same Skill, a shared file, an overlapping path, or anything whose semantic relationship is uncertain. Preserve both sides, show the relevant diff, and ask the user how to reconcile them. A clean Git merge is not proof of semantic compatibility.
8. After a clearly disjoint merge, rerun the complete Skill validation, secret and license checks, staged/unpushed-commit inspection, and any real or minimal behavior validation required by the changed Skill. Treat the integrated remote commit as the new upload base.
9. Fetch once more immediately before pushing. Push only if the remote still equals the integrated upload base. If it moved again, stop and report the new change; do not start a second automatic merge cycle.
10. If the push is rejected because the remote moved after the final fetch, fetch once to report the same comparison, then stop. Treat the rejection as concurrency protection, not as permission to override the remote.

## 5. Verify the result

1. Fetch or query the remote without exposing credentials.
2. Confirm the remote branch points to the expected commit.
3. Confirm every requested Skill path and file is present remotely.
4. Confirm local branch tracking and working-tree status.
5. Create missing Codex links only when the target path is absent. Verify every resulting link target.

For a concurrency stop, success means that neither side was discarded: the already-published remote change remains on GitHub and the current device's work remains in its local commit or working tree. Do not report the upload itself as complete. For a disjoint integration, report the remote commit integrated, the merge commit, the validations rerun, and the final remote commit verified.

When uploading all Skills, separately list self-created Skills, third-party Skills, and system, plugin-managed, conflicting, or skipped entries.
