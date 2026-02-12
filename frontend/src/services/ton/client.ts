import { TonClient, Address } from '@ton/ton';
import { SYSTEM_WALLETS } from './config';

// Testnet endpoint
const TESTNET_ENDPOINT = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const MAINNET_ENDPOINT = 'https://toncenter.com/api/v2/jsonRPC';

const isTestnet = process.env.TON_NETWORK === 'testnet';

// Инициализация TON клиента
export const tonClient = new TonClient({
  endpoint: isTestnet ? TESTNET_ENDPOINT : MAINNET_ENDPOINT,
  apiKey: process.env.TON_API_KEY || ''
});

// Получить транзакции кошелька
export async function getWalletTransactions(
  walletAddress: string,
  limit: number = 10
) {
  try {
    const address = Address.parse(walletAddress);
    
    const transactions = await tonClient.getTransactions(address, { limit });
    
    return transactions;
  } catch (error) {
    console.error('❌ Ошибка получения транзакций:', error);
    return [];
  }
}

// Парсинг comment из транзакции
export function parseTransactionComment(tx: any): string | null {
  try {
    if (!tx.inMessage?.body) return null;
    
    const body = tx.inMessage.body;
    
    // Декодируем body
    if (typeof body === 'string') {
      return body;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Проверить что транзакция подходит для активации
export function validateTransaction(
  tx: any,
  expectedAmount: number,
  expectedRecipient: string
): boolean {
  try {
    if (!tx.inMessage) return false;
    
    const amount = parseInt(tx.inMessage.value) / 1e9;
    const recipient = tx.inMessage.destination?.toString();
    
    return amount >= expectedAmount && recipient === expectedRecipient;
  } catch (error) {
    return false;
  }
}
