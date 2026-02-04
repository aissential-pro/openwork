/**
 * Tests for SessionStore
 * Run with: bun test session-store.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { SessionStore } from './session-store.js'
import { unlink } from 'fs/promises'
import { join } from 'path'

describe('SessionStore', () => {
  const testFilePath = join(process.cwd(), 'data', 'test-sessions.json')
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore(testFilePath)
  })

  afterEach(async () => {
    // Clean up test file
    try {
      await unlink(testFilePath)
    } catch {
      // Ignore if file doesn't exist
    }
  })

  it('should start with empty mappings', () => {
    expect(store.size()).toBe(0)
    expect(store.get('test')).toBeUndefined()
  })

  it('should set and get mappings', () => {
    store.set('chat1', 'session1')
    expect(store.get('chat1')).toBe('session1')
    expect(store.size()).toBe(1)
  })

  it('should update existing mappings', () => {
    store.set('chat1', 'session1')
    store.set('chat1', 'session2')
    expect(store.get('chat1')).toBe('session2')
    expect(store.size()).toBe(1)
  })

  it('should delete mappings', () => {
    store.set('chat1', 'session1')
    store.delete('chat1')
    expect(store.get('chat1')).toBeUndefined()
    expect(store.size()).toBe(0)
  })

  it('should touch mappings to update lastActiveAt', async () => {
    store.set('chat1', 'session1')
    const before = store.getAll()[0].lastActiveAt

    // Wait a bit to ensure timestamp changes
    await new Promise((resolve) => setTimeout(resolve, 10))

    store.touch('chat1')
    const after = store.getAll()[0].lastActiveAt

    expect(after).toBeGreaterThan(before)
  })

  it('should return all mappings', () => {
    store.set('chat1', 'session1')
    store.set('chat2', 'session2')

    const all = store.getAll()
    expect(all).toHaveLength(2)
    expect(all.map((m) => m.externalId)).toContain('chat1')
    expect(all.map((m) => m.externalId)).toContain('chat2')
  })

  it('should persist and load mappings', async () => {
    // Set some mappings
    store.set('chat1', 'session1')
    store.set('chat2', 'session2')

    // Force save
    await store.forceSave()

    // Create a new store instance
    const newStore = new SessionStore(testFilePath)
    await newStore.load()

    // Check that mappings were loaded
    expect(newStore.size()).toBe(2)
    expect(newStore.get('chat1')).toBe('session1')
    expect(newStore.get('chat2')).toBe('session2')
  })

  it('should handle corrupted files gracefully', async () => {
    // Write invalid JSON
    const { writeFile, mkdir } = await import('fs/promises')
    const { dirname } = await import('path')
    await mkdir(dirname(testFilePath), { recursive: true })
    await writeFile(testFilePath, 'invalid json{[', 'utf-8')

    // Should not throw
    await expect(store.load()).resolves.toBeUndefined()
    expect(store.size()).toBe(0)
  })

  it('should handle missing files gracefully', async () => {
    // Should not throw when file doesn't exist
    await expect(store.load()).resolves.toBeUndefined()
    expect(store.size()).toBe(0)
  })

  it('should clear all mappings', async () => {
    store.set('chat1', 'session1')
    store.set('chat2', 'session2')
    expect(store.size()).toBe(2)

    store.clear()
    expect(store.size()).toBe(0)
  })

  it('should validate mapping format', async () => {
    // Create a file with mixed valid/invalid data
    const { writeFile, mkdir } = await import('fs/promises')
    const { dirname } = await import('path')
    await mkdir(dirname(testFilePath), { recursive: true })

    const data = [
      { externalId: 'chat1', sessionId: 'session1', createdAt: 123, lastActiveAt: 456 }, // valid
      { externalId: 'chat2', sessionId: 'session2' }, // missing timestamps
      { externalId: 'chat3' }, // missing sessionId
      'invalid', // not an object
      null, // null
    ]

    await writeFile(testFilePath, JSON.stringify(data), 'utf-8')
    await store.load()

    // Should only load the valid mapping
    expect(store.size()).toBe(1)
    expect(store.get('chat1')).toBe('session1')
  })
})
