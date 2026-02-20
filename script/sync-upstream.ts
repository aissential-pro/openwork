#!/usr/bin/env bun

import { $ } from "bun"
import { parseArgs } from "util"

const UPSTREAM = "upstream/dev"
const REF_FILE = ".upstream-ref"

// Paths we keep — only changes to these are relevant
const TRACKED = ["packages/opencode/", "packages/sdk/", "packages/util/", "packages/plugin/", "packages/script/"]

// Within tracked paths, these subdirs were stripped — warn if upstream touches them
const STRIPPED = [
  "packages/opencode/src/cli/cmd/tui/",
  "packages/opencode/src/ide/",
  "packages/opencode/src/share/",
  "packages/opencode/src/pty/",
  "packages/opencode/src/worktree/",
  "packages/opencode/src/server/routes/tui.ts",
  "packages/opencode/src/server/routes/pty.ts",
  "packages/opencode/src/server/routes/file.ts",
  "packages/opencode/src/server/mdns.ts",
]

async function lastRef() {
  const file = Bun.file(REF_FILE)
  if (!(await file.exists())) return null
  return (await file.text()).trim() || null
}

async function saveRef(sha: string) {
  await Bun.write(REF_FILE, sha + "\n")
}

async function upstreamHead() {
  return (await $`git rev-parse ${UPSTREAM}`.text()).trim()
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      apply: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  })

  if (values.help) {
    console.log(`
Usage: bun script/sync-upstream.ts [options]

Syncs changes from upstream anomalyco/opencode into tracked core paths.

Options:
  --apply    Apply upstream changes (without this, only shows a preview)
  -h, --help Show this help

Tracked paths:
${TRACKED.map((p) => "  " + p).join("\n")}

Workflow:
  1. First run: bun script/sync-upstream.ts --apply   (initializes .upstream-ref)
  2. Later:     bun script/sync-upstream.ts            (preview what changed)
  3. To apply:  bun script/sync-upstream.ts --apply    (patches tracked paths)
`)
    process.exit(0)
  }

  console.log("Fetching upstream...")
  await $`git fetch upstream dev 2>&1`

  const head = await upstreamHead()
  const ref = await lastRef()

  if (!ref) {
    console.log(`No .upstream-ref found.`)
    console.log(`Run with --apply to initialize (marks current upstream HEAD as sync point).`)
    if (values.apply) {
      await saveRef(head)
      console.log(`Initialized at ${head.slice(0, 7)}. Future syncs will track changes from here.`)
    }
    return
  }

  if (ref === head) {
    console.log("Already up to date with upstream.")
    return
  }

  // Commits in tracked paths
  const log = await $`git log ${ref}..${head} --format=%H\t%s -- ${TRACKED}`.text()
  const commits = log
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, ...rest] = line.split("\t")
      return { sha: sha!.slice(0, 7), msg: rest.join("\t") }
    })

  console.log(`\nUpstream changes since ${ref.slice(0, 7)} → ${head.slice(0, 7)}`)
  console.log(`Tracked commits: ${commits.length}\n`)

  if (commits.length === 0) {
    console.log("No changes to tracked paths upstream.")
    if (values.apply) {
      await saveRef(head)
      console.log(`Ref updated to ${head.slice(0, 7)}.`)
    }
    return
  }

  for (const c of commits) console.log(`  ${c.sha}  ${c.msg}`)

  // Diff stats
  console.log()
  await $`git diff --stat ${ref}..${head} -- ${TRACKED}`

  // Warn about stripped paths touched upstream
  const strippedLog = await $`git diff --name-only ${ref}..${head} -- ${STRIPPED}`.text()
  const strippedFiles = strippedLog.split("\n").filter(Boolean)
  if (strippedFiles.length > 0) {
    console.log(`\nWARNING: upstream touched ${strippedFiles.length} file(s) in stripped paths.`)
    console.log("These will NOT be applied, but you may want to review for re-coupling:")
    for (const f of strippedFiles) console.log(`  ${f}`)
  }

  if (!values.apply) {
    console.log(`\nRun with --apply to apply these changes.`)
    return
  }

  // Generate patch for tracked paths, excluding stripped ones
  const excludeArgs = STRIPPED.flatMap((p) => [`:(exclude)${p}`])
  const patch = await $`git diff ${ref}..${head} -- ${TRACKED} ${excludeArgs}`.text()

  if (!patch.trim()) {
    console.log("\nNothing to apply after excluding stripped paths.")
    await saveRef(head)
    return
  }

  console.log("\nApplying patch...")
  const result = await $`git apply --3way`.stdin(patch).nothrow()

  if (result.exitCode !== 0) {
    console.error("Patch apply had conflicts. Resolve them manually, then update .upstream-ref:")
    console.error(`  echo "${head}" > .upstream-ref`)
    console.error(result.stderr.toString())
    process.exit(1)
  }

  await saveRef(head)
  console.log(`\nApplied. Ref updated to ${head.slice(0, 7)}.`)
  console.log("Review the changes, then commit.")
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
