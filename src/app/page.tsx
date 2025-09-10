import {
  Container,
  Typography,
  Box,
  Paper,
  AppBar,
  Toolbar,
  Chip
} from '@mui/material';
import { Grid as Grid } from '@mui/material'
import { AccountPanel } from "./components/AccountPanel";
import { TokenBalances } from './components/TokenBalances';
import { ApproveTransfer } from './components/ApproveTransfer';
import { EventTable } from './components/EventTable';
import { MintForm } from './components/MintForm';

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

function Page() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Blockchain Wallet
          </Typography>
          <Chip
            label="Sepolia Testnet"
            color="secondary"
            size="small"
            sx={{ color: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            DeFi Token Manager
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Manage your token balances, approve transfers, and monitor blockchain events
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AccountPanel />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TokenBalances />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ApproveTransfer />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <EventTable token={TOKENS.DAI} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <EventTable token={TOKENS.USDC} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MintForm token={TOKENS.DAI} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MintForm token={TOKENS.USDC} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Page;
