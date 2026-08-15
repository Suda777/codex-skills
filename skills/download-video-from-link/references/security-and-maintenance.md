# Security and maintenance

## Session handling

- Create browser contexts without a persistent profile.
- Write session data only below `.runtime/jobs/<job-id>/` with owner-only permissions.
- Never display cookie values in command output, final responses, manifests, or Git diffs.
- Delete the complete job directory after success or failure unless debugging retention was explicitly requested.
- Never copy browser databases or use `--cookies-from-browser` without explicit permission.

## Tool ownership

- Keep vendored source under `tools/` and generated dependencies under `.runtime/`.
- Do not place downloader source, virtual environments, or browser binaries in the user's project.
- Keep third-party license files with their vendored distributions.
- Record upstream, pinned version, source checksum, and any local adjustment in `tools/tool-manifest.json`.

## Updating tools

Treat a tool update as a Skill-content change:

1. Confirm the current failure with a public test URL and sanitized logs.
2. Research the upstream release, maintenance activity, license, and security notes.
3. Propose the version or tool change and its evidence to the user.
4. Apply only after approval.
5. Re-run dry routing tests, metadata extraction tests, and one authorized real download per affected platform.
6. Update `tool-manifest.json` and preserve existing output/manifest compatibility.

Do not auto-update vendored tools during an ordinary video download. Reproducibility is more important than silently tracking upstream `main`.
