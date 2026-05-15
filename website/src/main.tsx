import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ConfigProvider } from 'antd'
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mysten/dapp-kit/dist/index.css'

const { networkConfig } = createNetworkConfig({
	testnet: { url: 'https://fullnode.testnet.sui.io:443', network: 'testnet' },
	mainnet: { url: 'https://fullnode.mainnet.sui.io:443', network: 'mainnet' },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1F2937',
                borderRadius: 8,
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              },
            }}
          >
            <App />
          </ConfigProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
