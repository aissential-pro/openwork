import { Ripgrep } from "../file/ripgrep"
import os from "os"

import { Instance } from "../project/instance"
import { loadAgentMemory } from "../agent/agent-memory"

import PROMPT_ANTHROPIC from "./prompt/anthropic.txt"
import PROMPT_ANTHROPIC_WITHOUT_TODO from "./prompt/qwen.txt"
import PROMPT_BEAST from "./prompt/beast.txt"
import PROMPT_GEMINI from "./prompt/gemini.txt"

import PROMPT_CODEX from "./prompt/codex_header.txt"
import type { Provider } from "@/provider/provider"

export namespace SystemPrompt {
  export function instructions() {
    return PROMPT_CODEX.trim()
  }

  export function provider(model: Provider.Model) {
    if (model.api.id.includes("gpt-5")) return [PROMPT_CODEX]
    if (model.api.id.includes("gpt-") || model.api.id.includes("o1") || model.api.id.includes("o3"))
      return [PROMPT_BEAST]
    if (model.api.id.includes("gemini-")) return [PROMPT_GEMINI]
    if (model.api.id.includes("claude")) return [PROMPT_ANTHROPIC]
    return [PROMPT_ANTHROPIC_WITHOUT_TODO]
  }

  /**
   * Get system environment information for the agent
   */
  function getSystemInfo(): string[] {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const memUsedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100)

    return [
      `  Platform: ${process.platform}`,
      `  OS: ${os.type()} ${os.release()}`,
      `  Hostname: ${os.hostname()}`,
      `  User: ${os.userInfo().username}`,
      `  Home directory: ${os.homedir()}`,
      `  Memory: ${Math.round(freeMem / 1024 / 1024)}MB free / ${Math.round(totalMem / 1024 / 1024)}MB total (${memUsedPercent}% used)`,
      `  CPUs: ${os.cpus().length} cores`,
      `  Uptime: ${Math.round(os.uptime() / 3600)} hours`,
    ]
  }

  /**
   * Calculate context usage percentage based on token counts
   */
  export function getContextUsage(input: {
    tokens: { input: number; output: number; cache: { read: number } }
    model: Provider.Model
  }): { used: number; limit: number; percent: number; warning: string | null } {
    const context = input.model.limit.context || 200000
    const outputReserve = Math.min(input.model.limit.output || 32000, 32000)
    const usableContext = (input.model.limit.input || context - outputReserve)

    const used = input.tokens.input + input.tokens.cache.read + input.tokens.output
    const percent = Math.round((used / usableContext) * 100)

    let warning: string | null = null
    if (percent >= 90) {
      warning = "CRITICAL: Context nearly full. Compaction imminent. Complete current task or summarize."
    } else if (percent >= 75) {
      warning = "WARNING: Context at 75%+. Consider completing current task soon."
    } else if (percent >= 50) {
      warning = "NOTE: Context at 50%+. Plan remaining work accordingly."
    }

    return { used, limit: usableContext, percent, warning }
  }

  export async function environment(model: Provider.Model, tokens?: { input: number; output: number; cache: { read: number } }) {
    const project = Instance.project
    const agentMemory = await loadAgentMemory()

    const parts = [
      `You are powered by the model named ${model.api.id}. The exact model ID is ${model.providerID}/${model.api.id}`,
      ``,
      `<env>`,
      `  Working directory: ${Instance.directory}`,
      `  Is directory a git repo: ${project.vcs === "git" ? "yes" : "no"}`,
      `  Today's date: ${new Date().toISOString().split('T')[0]}`,
      `  Current time: ${new Date().toLocaleTimeString()}`,
      ``,
      `  --- System ---`,
      ...getSystemInfo(),
      `</env>`,
    ]

    // Add context usage info if tokens are provided
    if (tokens && (tokens.input > 0 || tokens.output > 0)) {
      const usage = getContextUsage({ tokens, model })
      parts.push(``)
      parts.push(`<context-usage>`)
      parts.push(`  Tokens used: ${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()} (${usage.percent}%)`)
      if (usage.warning) {
        parts.push(`  ${usage.warning}`)
      }
      parts.push(`</context-usage>`)
    }

    // Add file tree if needed (currently disabled)
    parts.push(`<files>`)
    parts.push(`  ${
      project.vcs === "git" && false
        ? await Ripgrep.tree({
            cwd: Instance.directory,
            limit: 200,
          })
        : ""
    }`)
    parts.push(`</files>`)

    if (agentMemory) {
      parts.push(`<agent-memory>`, agentMemory, `</agent-memory>`)
    }

    return [parts.join("\n")]
  }
}
