import { vi } from 'vitest'

// Mock crypto.randomUUID for consistent testing
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-12345678-1234-1234-1234-123456789abc'
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}
