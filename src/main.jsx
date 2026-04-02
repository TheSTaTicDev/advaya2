import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains'; 
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { RoleProvider } from './context/RoleContext';

const config = getDefaultConfig({
  appName: 'AgriChain',
  projectId: '3efbc5fdd6fa88e8766f48f7e81ed034',
  chains: [sepolia], 
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoleProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          
          <RainbowKitProvider theme={darkTheme()} initialChain={sepolia}>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </RoleProvider>
  </React.StrictMode>,
);