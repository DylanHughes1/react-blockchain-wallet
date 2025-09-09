'use client'

import { useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { formatUnits } from 'viem'
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Link,
  Alert
} from '@mui/material'
import { 
  Timeline, 
  OpenInNew,
  SwapHoriz,
  Security
} from '@mui/icons-material'

const ERC20_ABI = [
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
    },
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'spender', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
    },
] as const

interface EventTableProps {
    token: {
        address: `0x${string}`
        symbol: string
        decimals: number
    }
}

export function EventTable({ token }: EventTableProps) {
    const [events, setEvents] = useState<any[]>([])

    useWatchContractEvent({
        address: token.address,
        abi: ERC20_ABI,
        eventName: 'Transfer',
        onLogs(logs) {
            const newEvents = logs.map((log) => ({
                type: 'Transfer',
                from: log.args?.from,
                to: log.args?.to,
                value: formatUnits(log.args?.value || 0n, token.decimals),
                txHash: log.transactionHash,
            }))
            setEvents((prev) => [...newEvents, ...prev].slice(0, 20)) 
        },
    })

    useWatchContractEvent({
        address: token.address,
        abi: ERC20_ABI,
        eventName: 'Approval',
        onLogs(logs) {
            const newEvents = logs.map((log) => ({
                type: 'Approval',
                owner: log.args?.owner,
                spender: log.args?.spender,
                value: formatUnits(log.args?.value || 0n, token.decimals),
                txHash: log.transactionHash,
            }))
            setEvents((prev) => [...newEvents, ...prev].slice(0, 20))
        },
    })

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {token.symbol} – Recent Events
                    </Typography>
                </Box>

                {events.length === 0 ? (
                    <Alert severity="info">
                        No events detected yet. Events will appear here when transactions occur.
                    </Alert>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>From / Owner</TableCell>
                                    <TableCell>To / Spender</TableCell>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Transaction</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((ev, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell>
                                            <Chip 
                                                label={ev.type}
                                                color={ev.type === 'Transfer' ? 'primary' : 'secondary'}
                                                size="small"
                                                icon={ev.type === 'Transfer' ? <SwapHoriz /> : <Security />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                    maxWidth: 120,
                                                    display: 'block'
                                                }}
                                            >
                                                {ev.from || ev.owner}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                    maxWidth: 120,
                                                    display: 'block'
                                                }}
                                            >
                                                {ev.to || ev.spender}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {ev.value} {token.symbol}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={`https://sepolia.etherscan.io/tx/${ev.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 0.5,
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <OpenInNew fontSize="small" />
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    )
}
