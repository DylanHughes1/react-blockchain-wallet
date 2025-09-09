"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useChains } from "wagmi";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { AccountBalanceWallet, Link } from '@mui/icons-material';

export function AccountPanel() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const chains = useChains();

    const currentChain = chains.find(chain => chain.id === chainId);

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                        Account Panel
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <ConnectButton />
                </Box>

                {isConnected && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ space: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Wallet Address
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontFamily: 'monospace', 
                                        wordBreak: 'break-all',
                                        backgroundColor: 'grey.100',
                                        p: 1,
                                        borderRadius: 1
                                    }}
                                >
                                    {address}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Network
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Link sx={{ fontSize: 16 }} />
                                    <Chip 
                                        label={currentChain?.name || `Chain ID: ${chainId}`}
                                        color={chainId === 11155111 ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            {chainId !== 11155111 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <AlertTitle>Wrong Network</AlertTitle>
                                    Please switch to Sepolia testnet to use this application.
                                </Alert>
                            )}
                        </Box>
                    </>
                )}

                {!isConnected && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>Connect Your Wallet</AlertTitle>
                        Connect your wallet to start managing your tokens and interacting with the blockchain.
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
