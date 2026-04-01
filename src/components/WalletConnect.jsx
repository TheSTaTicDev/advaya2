import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnect() {
  return <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />;
}
