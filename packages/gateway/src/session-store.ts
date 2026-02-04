/**
 * Persistent storage for session mappings
 * Saves mapping between external IDs (chat/channel IDs) and internal session IDs
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'

export interface SessionMapping {
  externalId: string
  sessionId: string
  createdAt: number
  lastActiveAt: number
  messageCount?: number // Optional message counter
}

/**
 * Stores session mappings persistently to disk
 * Handles concurrent access safely and recovers from corrupted files
 */
export class SessionStore {
  private filePath: string
  private mappings: Map<string, SessionMapping> = new Map()
  private saveTimeout: Timer | null = null
  private readonly SAVE_DEBOUNCE_MS = 1000 // Debounce saves to avoid excessive disk I/O
  private isDirty = false
  private isSaving = false

  constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * Load mappings from disk
   * If the file doesn't exist or is corrupted, starts with an empty mapping
   */
  async load(): Promise<void> {
    try {
      console.log(`[SessionStore] Loading session mappings from ${this.filePath}`)
      const data = await readFile(this.filePath, 'utf-8')
      const parsed = JSON.parse(data)

      if (!Array.isArray(parsed)) {
        console.warn('[SessionStore] Invalid session data format, starting fresh')
        return
      }

      // Validate and load each mapping
      let loadedCount = 0
      for (const item of parsed) {
        if (this.isValidMapping(item)) {
          this.mappings.set(item.externalId, item)
          loadedCount++
        } else {
          console.warn('[SessionStore] Skipping invalid mapping:', item)
        }
      }

      console.log(`[SessionStore] Loaded ${loadedCount} session mapping(s)`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('[SessionStore] No existing session file found, starting fresh')
      } else {
        console.error('[SessionStore] Error loading session mappings, starting fresh:', error)
      }
    }
  }

  /**
   * Save mappings to disk (debounced)
   * Multiple rapid calls will be batched into a single write
   */
  async save(): Promise<void> {
    this.isDirty = true

    // Clear existing timeout if any
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    // Debounce: wait for a quiet period before saving
    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          await this.performSave()
          resolve()
        } catch (error) {
          reject(error)
        }
      }, this.SAVE_DEBOUNCE_MS)
    })
  }

  /**
   * Force immediate save (bypasses debouncing)
   * Use this for graceful shutdown or critical operations
   */
  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }

    if (this.isDirty || this.mappings.size > 0) {
      await this.performSave()
    }
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<void> {
    // Prevent concurrent saves
    if (this.isSaving) {
      console.log('[SessionStore] Save already in progress, skipping')
      return
    }

    this.isSaving = true
    try {
      // Ensure directory exists
      const dir = dirname(this.filePath)
      await mkdir(dir, { recursive: true })

      // Convert map to array
      const data = Array.from(this.mappings.values())

      // Write to disk
      console.log(`[SessionStore] Saving ${data.length} session mapping(s) to ${this.filePath}`)
      await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')

      this.isDirty = false
      console.log('[SessionStore] Session mappings saved successfully')
    } catch (error) {
      console.error('[SessionStore] Error saving session mappings:', error)
      throw error
    } finally {
      this.isSaving = false
    }
  }

  /**
   * Get session ID for external ID
   */
  get(externalId: string): string | undefined {
    const mapping = this.mappings.get(externalId)
    return mapping?.sessionId
  }

  /**
   * Set mapping between external ID and session ID
   */
  set(externalId: string, sessionId: string): void {
    const now = Date.now()
    const existing = this.mappings.get(externalId)

    if (existing) {
      // Update existing mapping
      existing.sessionId = sessionId
      existing.lastActiveAt = now
    } else {
      // Create new mapping
      this.mappings.set(externalId, {
        externalId,
        sessionId,
        createdAt: now,
        lastActiveAt: now,
        messageCount: 0,
      })
    }

    // Trigger debounced save
    this.save().catch((err) => {
      console.error('[SessionStore] Failed to save after set:', err)
    })
  }

  /**
   * Delete mapping for external ID
   */
  delete(externalId: string): void {
    const deleted = this.mappings.delete(externalId)

    if (deleted) {
      console.log(`[SessionStore] Deleted mapping for ${externalId}`)
      // Trigger debounced save
      this.save().catch((err) => {
        console.error('[SessionStore] Failed to save after delete:', err)
      })
    }
  }

  /**
   * Update last active timestamp for external ID
   */
  touch(externalId: string): void {
    const mapping = this.mappings.get(externalId)
    if (mapping) {
      mapping.lastActiveAt = Date.now()
      // Increment message count
      mapping.messageCount = (mapping.messageCount || 0) + 1
      // Trigger debounced save
      this.save().catch((err) => {
        console.error('[SessionStore] Failed to save after touch:', err)
      })
    }
  }

  /**
   * Get detailed session information for an external ID
   */
  getSessionInfo(externalId: string): SessionMapping | undefined {
    return this.mappings.get(externalId)
  }

  /**
   * Get all mappings (useful for cleanup operations)
   */
  getAll(): SessionMapping[] {
    return Array.from(this.mappings.values())
  }

  /**
   * Get the count of stored mappings
   */
  size(): number {
    return this.mappings.size
  }

  /**
   * Clear all mappings (use with caution)
   */
  clear(): void {
    this.mappings.clear()
    this.save().catch((err) => {
      console.error('[SessionStore] Failed to save after clear:', err)
    })
  }

  /**
   * Validate that an object is a valid SessionMapping
   */
  private isValidMapping(obj: any): obj is SessionMapping {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.externalId === 'string' &&
      typeof obj.sessionId === 'string' &&
      typeof obj.createdAt === 'number' &&
      typeof obj.lastActiveAt === 'number' &&
      (obj.messageCount === undefined || typeof obj.messageCount === 'number')
    )
  }
}
