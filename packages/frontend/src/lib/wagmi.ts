import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, base, arbitrum, polygon, bsc } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'ChainForge',
  projectId: 'chainforge-default', // Replace with WalletConnect project ID
  chains: [sepolia, mainnet, base, arbitrum, polygon, bsc],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
