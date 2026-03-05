import { TonClient, Address, toNano, fromNano } from '@ton/ton';
import { MatrixTON } from './MatrixTON';

const CONTRACT_ADDRESS = process.env.MATRIX_CONTRACT_ADDRESS || '';
const TON_API_KEY = process.env.TON_API_KEY || '';
const IS_TESTNET = process.env.TON_NETWORK === 'testnet';

const ENDPOINT = IS_TESTNET
  ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
  : 'https://toncenter.com/api/v2/jsonRPC';

export const tonClient = new TonClient({ endpoint: ENDPOINT, apiKey: TON_API_KEY });

export function getContract() {
  const address = Address.parse(CONTRACT_ADDRESS);
  return tonClient.open(MatrixTON.fromAddress(address));
}

export async function getContractStats() {
  try {
    const contract = getContract();
    const stats = await (contract as any).getGetStats();
    return {
      totalUsers: Number(stats.totalUsers),
      totalVolume: fromNano(stats.totalVolume),
      totalPayouts: fromNano(stats.totalPayouts),
      totalSystemFees: fromNano(stats.totalSystemFees),
    };
  } catch (error) {
    console.error('getContractStats error:', error);
    return null;
  }
}

export async function getUserAllTables(walletAddress: string) {
  try {
    const contract = getContract();
    const address = Address.parse(walletAddress);
    const tables = await (contract as any).getGetUserAllTables(address);
    const result: Record<number, { active: boolean; slotsFilled: number; cycleCount: number }> = {};
    for (let i = 1; i <= 12; i++) {
      const encoded = tables.get(BigInt(i));
      if (encoded !== null && encoded !== undefined) {
        const n = Number(encoded);
        result[i] = {
          active: n >= 1000000,
          slotsFilled: Math.floor((n % 1000000) / 10000),
          cycleCount: n % 10000,
        };
      }
    }
    return result;
  } catch (error) {
    console.error('getUserAllTables error:', error);
    return null;
  }
}

export async function isUserRegistered(walletAddress: string): Promise<boolean> {
  const tables = await getUserAllTables(walletAddress);
  if (!tables) return false;
  return tables[1] !== undefined;
}

export const TABLE_PRICES_TON: Record<number, number> = {
  1: 10, 2: 20, 3: 40, 4: 80, 5: 160, 6: 320,
  7: 640, 8: 1280, 9: 2560, 10: 5120, 11: 10240, 12: 20480,
};

export function getTablePrice(tableNum: number): bigint {
  const price = TABLE_PRICES_TON[tableNum];
  if (!price) throw new Error(`Invalid table: ${tableNum}`);
  return toNano(String(price + 1));
}

export function getTableActivationUrl(tableNum: number): string {
  const price = getTablePrice(tableNum);
  return `https://app.tonkeeper.com/transfer/${CONTRACT_ADDRESS}?amount=${price}&text=table${tableNum}`;
}

export function getContractUrl(): string {
  const base = IS_TESTNET ? 'https://testnet.tonscan.org/address/' : 'https://tonscan.org/address/';
  return base + CONTRACT_ADDRESS;
}

let lastProcessedLt: string | null = null;

export async function getLatestContractEvents(limit = 20) {
  try {
    const address = Address.parse(CONTRACT_ADDRESS);
    return await tonClient.getTransactions(address, { limit });
  } catch (error) {
    console.error('getLatestContractEvents error:', error);
    return [];
  }
}
