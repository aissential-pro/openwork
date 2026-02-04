import z from "zod"
import { Tool } from "./tool"
import { updateAgentMemory } from "../agent/agent-memory"
import DESCRIPTION from "./update-memory.txt"

export const UpdateMemoryTool = Tool.define("update_memory", {
  description: DESCRIPTION,
  parameters: z.object({
    content: z.string().describe("The information to remember for future sessions"),
  }),
  async execute(params, ctx) {
    await updateAgentMemory(params.content)

    return {
      title: "Memory updated",
      output: "Successfully saved the information to agent memory. This will be available in future sessions.",
      metadata: {},
    }
  },
})
