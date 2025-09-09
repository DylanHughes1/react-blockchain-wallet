'use client'

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { formatUnits, parseUnits, isAddress } from 'viem';
import {
    Card,
    CardContent,
    Typography,
    Box,
    TextField,
    Button,
    Alert,
    AlertTitle,
    Chip,
    CircularProgress,
    Link,
} from '@mui/material';
import { Grid as Grid } from '@mui/material';
import {
    CheckCircle,
    HourglassEmpty,
    Send,
    Security
} from '@mui/icons-material';

const ERC20_ABI = [
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

const TOKENS = {
    DAI: {
        address: '0x1D70D57ccD2798323232B2dD027B3aBcA5C00091' as `0x${string}`,
        decimals: 18,
        symbol: 'DAI',
    },
    USDC: {
        address: '0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47' as `0x${string}`,
        decimals: 6,
        symbol: 'USDC',
    },
} as const;


type TokenKey = keyof typeof TOKENS;

interface ApproveTransferProps {
    tokenKey: TokenKey;
}

function ApproveTransferForm({ tokenKey }: ApproveTransferProps) {
    const token = TOKENS[tokenKey];
    const { address } = useAccount();
    const chainId = useChainId();

    const [approveAmount, setApproveAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [spenderAddress, setSpenderAddress] = useState('');

    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: !!address && chainId === 11155111 },
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address && spenderAddress && isAddress(spenderAddress)
            ? [address, spenderAddress as `0x${string}`]
            : undefined,
        query: {
            enabled: !!address && !!spenderAddress && isAddress(spenderAddress) && chainId === 11155111
        },
    });

    useEffect(() => {
        if (isSuccess) {
            refetchBalance();
            refetchAllowance();

            setApproveAmount('');
            setTransferAmount('');
            setTransferTo('');
        }
    }, [isSuccess, refetchBalance, refetchAllowance]);

    const validateAmount = (amount: string, maxBalance?: bigint): string | null => {
        if (!amount || amount === '0') return 'Amount must be greater than 0';

        try {
            const parsedAmount = parseUnits(amount, token.decimals);
            if (maxBalance && parsedAmount > maxBalance) {
                return 'Insufficient balance';
            }
            return null;
        } catch {
            return 'Invalid amount format';
        }
    };

    const validateAddress = (addr: string): string | null => {
        if (!addr) return 'Address is required';
        if (!isAddress(addr)) return 'Invalid Ethereum address';
        if (addr.toLowerCase() === address?.toLowerCase()) return 'Cannot send to yourself';
        return null;
    };

    const handleApprove = async () => {
        const amountError = validateAmount(approveAmount);
        const addressError = validateAddress(spenderAddress);

        if (amountError || addressError) return;

        try {
            const amount = parseUnits(approveAmount, token.decimals);
            await writeContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [spenderAddress as `0x${string}`, amount],
            });
        } catch (err) {
            console.error('Approve failed:', err);
        }
    };

    const handleTransfer = async () => {
        const amountError = validateAmount(transferAmount, balance);
        const addressError = validateAddress(transferTo);

        if (amountError || addressError) return;

        try {
            const amount = parseUnits(transferAmount, token.decimals);
            await writeContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [transferTo as `0x${string}`, amount],
            });
        } catch (err) {
            console.error('Transfer failed:', err);
        }
    };

    const formatBalance = (bal: bigint | undefined) => {
        if (!bal) return '0';
        return formatUnits(bal, token.decimals);
    };

    const { switchChain, isPending: isSwitching } = useSwitchChain();

    if (!address || chainId !== 11155111) {
        return (
            <Card sx={{ backgroundColor: 'grey.50' }}>
                <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {token.symbol} Operations
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography color="text.secondary" variant="body2">
                            {!address ? 'Connect wallet to use' : 'Switch to Sepolia network'}
                        </Typography>
                        {!!address && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => switchChain({ chainId: 11155111 })}
                                disabled={isSwitching}
                            >
                                {isSwitching ? 'Switching…' : 'Switch to Sepolia'}
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const approveAmountError = validateAmount(approveAmount);
    const transferAmountError = validateAmount(transferAmount, balance);
    const spenderError = spenderAddress ? validateAddress(spenderAddress) : null;
    const transferToError = transferTo ? validateAddress(transferTo) : null;

    const isApproveDisabled = !approveAmount || !spenderAddress || !!approveAmountError || !!spenderError || isPending;
    const isTransferDisabled = !transferAmount || !transferTo || !!transferAmountError || !!transferToError || isPending;

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {token.symbol} Operations
                    </Typography>
                    <Chip
                        label={`Balance: ${formatBalance(balance)}`}
                        variant="outlined"
                        size="small"
                        sx={{ fontFamily: 'monospace' }}
                    />
                </Box>

                <Card variant="outlined" sx={{ backgroundColor: 'primary.light', mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Security sx={{ mr: 1, color: 'primary.dark' }} />
                            <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 600 }}>
                                Approve
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label={`Amount to approve (${token.symbol})`}
                                value={approveAmount}
                                onChange={(e) => setApproveAmount(e.target.value)}
                                error={!!approveAmountError}
                                helperText={approveAmountError}
                                variant="outlined"
                                size="small"
                            />

                            <TextField
                                fullWidth
                                label="Spender address (0x...)"
                                value={spenderAddress}
                                onChange={(e) => setSpenderAddress(e.target.value)}
                                error={!!spenderError}
                                helperText={spenderError}
                                variant="outlined"
                                size="small"
                            />

                            {allowance && spenderAddress && isAddress(spenderAddress) && (
                                <Typography variant="caption" color="text.secondary">
                                    Current allowance: {formatBalance(allowance)} {token.symbol}
                                </Typography>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleApprove}
                                disabled={isApproveDisabled}
                                startIcon={isPending && hash ? <CircularProgress size={16} /> : <Security />}
                            >
                                {isPending && hash ? 'Approving...' : 'APPROVE'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ backgroundColor: 'rgba(46, 125, 50, 0.06)', mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Send sx={{ mr: 1, color: 'success.dark' }} />
                            <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                Transfer
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label={`Amount to transfer (${token.symbol})`}
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                error={!!transferAmountError}
                                helperText={transferAmountError}
                                variant="outlined"
                                size="small"
                            />

                            <TextField
                                fullWidth
                                label="Recipient address (0x...)"
                                value={transferTo}
                                onChange={(e) => setTransferTo(e.target.value)}
                                error={!!transferToError}
                                helperText={transferToError}
                                variant="outlined"
                                size="small"
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                onClick={handleTransfer}
                                disabled={isTransferDisabled}
                                startIcon={isPending && hash ? <CircularProgress size={16} /> : <Send />}
                            >
                                {isPending && hash ? 'Transferring...' : 'TRANSFER'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {hash && (
                    <Alert
                        severity={isSuccess ? 'success' : isConfirming ? 'info' : 'warning'}
                        sx={{ mb: 2 }}
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
                                    <Typography>Transaction confirmed!</Typography>
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
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {error.message}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}

export function ApproveTransfer() {
    return (
        <Box>
            {/* Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    Approve & Transfer
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Manage token approvals and transfers securely from your wallet.
                </Typography>
            </Box>

            {/* Forms */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <ApproveTransferForm tokenKey="DAI" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <ApproveTransferForm tokenKey="USDC" />
                </Grid>
            </Grid>

            <Card sx={{ backgroundColor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                            💡 How it works
                        </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1, color: 'primary.dark' }}>
                            <strong>Approve:</strong> Allow another address to spend your tokens (used by DEXes, contracts)
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1, color: 'primary.dark' }}>
                            <strong>Transfer:</strong> Send tokens directly from your wallet to another address
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ color: 'primary.dark' }}>
                            <strong>Validation:</strong> Ensure balance, addresses, and amounts are correct
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
