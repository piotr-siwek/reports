import { afterEach, vi } from 'vitest';

// Global afterEach hook to clean up after each test
afterEach(() => {
  // Reset all mocks
  vi.restoreAllMocks();
});

// Define types for our mock functions
type MockFunction = ReturnType<typeof vi.fn>;

// Export type for the mock Supabase client
export type MockSupabaseClient = {
  rpc: MockFunction;
  from: MockFunction & {
    (): {
      select: MockFunction & {
        (): {
          eq: MockFunction & {
            (): {
              single: MockFunction;
            };
          };
        };
      };
    };
  };
  auth: {
    getSession: MockFunction;
  };
};

// Export function to create a properly typed mock Supabase client
export function createMockSupabaseClient(): MockSupabaseClient {
  const mockSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  const client = {
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    from: Object.assign(mockFrom, {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle
    }),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
    }
  };

  return client;
}

// Global mock for supabase-server
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(() => createMockSupabaseClient())
}));

// Extend Vitest's expect with custom matchers if needed
// For example:
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return {
//       pass,
//       message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
//     };
//   },
// });

// Export any utilities that might be needed across test files
// export function createMockSupabaseClient() {
//   return {
//     rpc: vi.fn(() => ({ error: null })),
//     from: vi.fn(() => ({
//       select: vi.fn(() => ({
//         eq: vi.fn(() => ({
//           single: vi.fn(() => Promise.resolve({ data: null, error: null }))
//         }))
//       }))
//     })),
//     auth: {
//       getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null }))
//     }
//   };
// }