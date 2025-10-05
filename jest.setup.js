import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables for testing
process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY = 'test_api_key'
process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test_project_id'
process.env.NEXT_PUBLIC_X402_API_URL = 'https://test-api.tradezen.com'
process.env.NEXT_PUBLIC_TRADEZEN_TREASURY = '0x742d35Cc6634C0532925a3b8D8F7D1d7B2B0C2b2'

// Mock wagmi hooks for testing
jest.mock('wagmi', () => ({
  useWalletClient: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useAccount: jest.fn(() => ({
    isConnected: false,
    address: undefined,
  })),
  WagmiProvider: ({ children }) => children,
  createConfig: jest.fn(),
  http: jest.fn(),
}))

// Mock OnchainKit components
jest.mock('@coinbase/onchainkit/wallet', () => ({
  Wallet: ({ children }) => children,
  ConnectWallet: ({ children }) => children,
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}))

// Mock window.ethereum for wallet testing
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
})