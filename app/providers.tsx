'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet, walletConnect } from 'wagmi/connectors';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: 'TradeZen' }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo' }),
  ],
  transports: {
    [base.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider 
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || 'cdp_demo_key'} 
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
