import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

/**
 * Gets the path to the agent.md file. Prefers the current working directory.
 * If the file doesn't exist, defaults to ~/.openwork/agent.md
 */
async function getAgentMemoryPath(): Promise<string> {
	const cwdPath = join(process.cwd(), 'agent.md');
	const homePath = join(homedir(), '.openwork', 'agent.md');

	// Check if file exists in current directory
	try {
		await readFile(cwdPath, 'utf-8');
		return cwdPath;
	} catch {
		// File doesn't exist in cwd, use home directory
		return homePath;
	}
}

/**
 * Loads the agent.md file content from the filesystem.
 *
 * Searches for agent.md in the following order:
 * 1. Current working directory (process.cwd())
 * 2. User's home directory at ~/.openwork/agent.md
 *
 * @returns The content of agent.md if found, or null if not found
 */
export async function loadAgentMemory(): Promise<string | null> {
	const paths = [
		join(process.cwd(), 'agent.md'),
		join(homedir(), '.openwork', 'agent.md'),
	];

	for (const path of paths) {
		try {
			const content = await readFile(path, 'utf-8');
			return content;
		} catch (error) {
			// File doesn't exist at this path, try next one
			continue;
		}
	}

	// No agent.md file found in any location
	return null;
}

/**
 * Updates the agent.md file by appending content to the Memory section.
 * If the file doesn't exist, creates it with a basic structure.
 * If the Memory section doesn't exist, creates it.
 *
 * @param content - The content to append to the Memory section
 */
export async function updateAgentMemory(content: string): Promise<void> {
	const path = await getAgentMemoryPath();

	let fileContent: string;
	try {
		fileContent = await readFile(path, 'utf-8');
	} catch (error) {
		// File doesn't exist, create it with basic structure
		fileContent = `# Agent Memory

This file contains persistent memory for the OpenWork agent.

## Memory

`;
	}

	// Find the Memory section
	const memoryHeaderRegex = /^## Memory\s*$/m;
	const match = memoryHeaderRegex.exec(fileContent);

	if (match) {
		// Memory section exists, find where to insert
		const memoryStart = match.index + match[0].length;

		// Find the next section header (##) or end of file
		const nextSectionRegex = /^## /m;
		const restOfFile = fileContent.slice(memoryStart);
		const nextSectionMatch = nextSectionRegex.exec(restOfFile);

		let insertPosition: number;
		if (nextSectionMatch) {
			// Insert before the next section
			insertPosition = memoryStart + nextSectionMatch.index;
		} else {
			// Insert at the end of the file
			insertPosition = fileContent.length;
		}

		// Add the new content with proper formatting
		const timestamp = new Date().toISOString();
		const newEntry = `\n- [${timestamp}] ${content}\n`;
		fileContent = fileContent.slice(0, insertPosition) + newEntry + fileContent.slice(insertPosition);
	} else {
		// Memory section doesn't exist, append it
		const timestamp = new Date().toISOString();
		fileContent += `\n## Memory\n\n- [${timestamp}] ${content}\n`;
	}

	// Ensure directory exists
	await mkdir(dirname(path), { recursive: true });

	// Write the updated content
	await writeFile(path, fileContent, 'utf-8');
}
