"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
} from 'wagmi/chains';

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const config = getDefaultConfig({
    appName: "Wonderland Challenge",
    projectId: wcProjectId,
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
});
