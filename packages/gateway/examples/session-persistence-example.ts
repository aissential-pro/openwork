/**
 * Example: Using SessionStore for persistent session management
 *
 * This example demonstrates how to use the SessionStore to maintain
 * session mappings across restarts.
 */

import { SessionStore } from '../src/session-store.js'
import { join } from 'path'

async function main() {
  console.log('=== Session Persistence Example ===\n')

  // Create a SessionStore instance
  const storePath = join(process.cwd(), 'data', 'examples', 'example-sessions.json')
  const store = new SessionStore(storePath)

  console.log('1. Loading existing sessions from disk...')
  await store.load()
  console.log(`   Loaded ${store.size()} session(s)\n`)

  // Simulate receiving a message from a chat
  console.log('2. Handling message from chat "chat_123"...')
  let sessionId = store.get('chat_123')

  if (!sessionId) {
    // First message from this chat - create new session
    sessionId = `telegram_chat_123_${Date.now()}`
    store.set('chat_123', sessionId)
    console.log(`   Created new session: ${sessionId}`)
  } else {
    // Existing session found - update timestamp
    store.touch('chat_123')
    console.log(`   Reusing existing session: ${sessionId}`)
  }
  console.log()

  // Simulate another chat
  console.log('3. Handling message from chat "chat_456"...')
  sessionId = store.get('chat_456')

  if (!sessionId) {
    sessionId = `telegram_chat_456_${Date.now()}`
    store.set('chat_456', sessionId)
    console.log(`   Created new session: ${sessionId}`)
  } else {
    store.touch('chat_456')
    console.log(`   Reusing existing session: ${sessionId}`)
  }
  console.log()

  // Show all sessions
  console.log('4. Current sessions:')
  const allSessions = store.getAll()
  for (const session of allSessions) {
    const age = Math.floor((Date.now() - session.createdAt) / 1000)
    console.log(`   - ${session.externalId} -> ${session.sessionId}`)
    console.log(`     Created: ${new Date(session.createdAt).toISOString()}`)
    console.log(`     Age: ${age} seconds`)
    console.log(`     Last active: ${new Date(session.lastActiveAt).toISOString()}`)
  }
  console.log()

  // Get detailed info about a specific session
  console.log('5. Getting detailed info for chat_123...')
  const info = store.getSessionInfo('chat_123')
  if (info) {
    console.log('   Session Info:')
    console.log(`   - External ID: ${info.externalId}`)
    console.log(`   - Session ID: ${info.sessionId}`)
    console.log(`   - Created: ${new Date(info.createdAt).toISOString()}`)
    console.log(`   - Last Active: ${new Date(info.lastActiveAt).toISOString()}`)
    console.log(`   - Message Count: ${info.messageCount || 0}`)
  }
  console.log()

  // Simulate /reset command
  console.log('6. Handling /reset command for chat_123...')
  store.delete('chat_123')
  console.log(`   Session deleted for chat_123`)
  console.log()

  // Force save before exit
  console.log('7. Saving sessions to disk...')
  await store.forceSave()
  console.log(`   Saved ${store.size()} session(s) to ${storePath}`)
  console.log()

  console.log('=== Example Complete ===')
  console.log()
  console.log('To see persistence in action:')
  console.log('1. Run this script again')
  console.log('2. Notice that the session for chat_456 is still loaded')
  console.log('3. The session for chat_123 will be gone (we deleted it)')
}

// Run the example
main().catch(console.error)
