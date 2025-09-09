"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert, 
  AlertTitle,
  CircularProgress,
  Link
} from '@mui/material';
import { 
  Add, 
  CheckCircle, 
  HourglassEmpty,
  Send
} from '@mui/icons-material';
import { useAppStore } from "../../store/lib";

interface MintFormProps {
    token: {
        address: `0x${string}`;
        decimals: number;
        symbol: string;
    };
}

export function MintForm({ token }: MintFormProps) {
    const { address } = useAccount();
    const mintTo = useAppStore((s) => s.mint.mintTo);
    const mintAmount = useAppStore((s) => s.mint.mintAmount);
    const setMintTo = useAppStore((s) => s.setMintTo);
    const setMintAmount = useAppStore((s) => s.setMintAmount);

    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleMint = async () => {
        if (!mintTo || !isAddress(mintTo)) return alert("Invalid recipient address");
        if (!mintAmount) return alert("Enter an amount");

        try {
            const amount = parseUnits(mintAmount, token.decimals);
            await writeContract({
                address: token.address,
                abi: [
                    {
                        inputs: [
                            { name: "to", type: "address" },
                            { name: "amount", type: "uint256" },
                        ],
                        name: "mint",
                        outputs: [],
                        stateMutability: "nonpayable",
                        type: "function",
                    },
                ],
                functionName: "mint",
                args: [mintTo as `0x${string}`, amount],
            });
        } catch (err) {
            console.error("Mint failed:", err);
        }
    };

    return (
        <Card sx={{ backgroundColor: 'secondary.light' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Add sx={{ mr: 1, color: 'secondary.dark' }} />
                    <Typography variant="h6" sx={{ color: 'secondary.dark', fontWeight: 600 }}>
                        Mint {token.symbol}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Recipient address"
                        placeholder="0x..."
                        value={mintTo}
                        onChange={(e) => setMintTo(e.target.value)}
                        variant="outlined"
                        size="small"
                        error={!!(mintTo && !isAddress(mintTo))}
                        helperText={mintTo && !isAddress(mintTo) ? 'Invalid address' : ''}
                        inputProps={{ 'data-testid': `mint-address-${token.symbol}` }}
                    />
                    
                    <TextField
                        fullWidth
                        label={`Amount (${token.symbol})`}
                        placeholder="0.0"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 'any', 'data-testid': `mint-amount-${token.symbol}` }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={handleMint}
                        disabled={isPending || !mintTo || !mintAmount || !isAddress(mintTo)}
                        startIcon={isPending ? <CircularProgress size={16} /> : <Add />}
                        data-testid={`mint-submit-${token.symbol}`}
                    >
                        {isPending ? "Minting..." : "MINT"}
                    </Button>
                </Box>

                {hash && (
                    <Alert 
                        severity={isSuccess ? 'success' : isConfirming ? 'info' : 'warning'}
                        sx={{ mt: 2 }}
                    >
                        <AlertTitle>Transaction Status</AlertTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {isConfirming ? (
                                <>
                                    <HourglassEmpty />
                                    <Typography>Waiting for confirmation...</Typography>
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle />
                                    <Typography>Mint confirmed!</Typography>
                                </>
                            ) : (
                                <>
                                    <Send />
                                    <Typography>Transaction submitted</Typography>
                                </>
                            )}
                        </Box>
                        <Link
                            href={`https://sepolia.etherscan.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View on Etherscan
                        </Link>
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        <AlertTitle>Error</AlertTitle>
                        {error.message}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
