'use client'

import React from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Skeleton,
  IconButton,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { 
  AccountBalance, 
  Refresh, 
  Warning,
} from '@mui/icons-material';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const TOKENS = {
  DAI: {
    address: '0x1D70D57ccD2798323232B2dD027B3aBcA5C00091' as `0x${string}`,
    decimals: 18,
    symbol: 'DAI',
    color: '#F5AC37',
  },
  USDC: {
    address: '0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47' as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    color: '#2775CA',
  },
} as const;

interface TokenBalanceProps {
  token: typeof TOKENS.DAI | typeof TOKENS.USDC;
}

function TokenBalance({ token }: TokenBalanceProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === 11155111, 
      refetchInterval: 10000,
    },
  });

  const formatBalance = (rawBalance: bigint | undefined) => {
    if (!rawBalance) return '0.00';
    const formatted = formatUnits(rawBalance, token.decimals);
    const number = parseFloat(formatted);
    return number.toFixed(token.decimals === 18 ? 4 : 2); 
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!address) {
    return (
      <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: token.color 
                }} 
              />
              <Typography variant="h6" color="text.secondary">
                {token.symbol}
              </Typography>
            </Box>
            <Typography color="text.secondary">
              Wallet not connected
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (chainId !== 11155111) {
    return (
      <Card variant="outlined" sx={{ backgroundColor: 'warning.light', borderColor: 'warning.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: token.color 
                }} 
              />
              <Typography variant="h6">
                {token.symbol}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              <Typography color="warning.dark">
                Switch to Sepolia
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: token.color 
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {token.symbol}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
            >
              {token.address}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            {isLoading ? (
              <Box>
                <Skeleton variant="text" width={80} height={32} />
                <Skeleton variant="text" width={60} height={20} />
              </Box>
            ) : error ? (
              <Box>
                <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                  Error loading
                </Typography>
                <IconButton 
                  onClick={handleRefresh}
                  size="small"
                  color="error"
                >
                  <Refresh />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatBalance(balance)}
                  </Typography>
                  <IconButton 
                    onClick={handleRefresh}
                    size="small"
                    color="primary"
                    title="Refresh balance"
                  >
                    <Refresh />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {token.symbol}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function TokenBalances() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Token Balances
          </Typography>
        </Box>

        {isConnected && chainId !== 11155111 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Wrong Network</AlertTitle>
            Please switch to Sepolia testnet to view token balances.
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TokenBalance token={TOKENS.DAI} />
          <TokenBalance token={TOKENS.USDC} />
        </Box>

        {!isConnected && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Connect Your Wallet</AlertTitle>
            Connect your wallet to view token balances.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}