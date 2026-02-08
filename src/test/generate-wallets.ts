import { mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';
import { WalletContractV4 } from '@ton/ton';

async function generateWallet() {
  // Генерируем мнемонику
  const mnemonic = await mnemonicNew();
  
  // Получаем ключи
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  
  // Создаём кошелёк V4
  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey
  });
  
  const address = wallet.address.toString({ testOnly: true });
  
  console.log('\n🔑 НОВЫЙ TESTNET КОШЕЛЁК:\n');
  console.log('Address:', address);
  console.log('\nMnemonic (СОХРАНИ!):', mnemonic.join(' '));
  console.log('\nPrivate Key:', keyPair.secretKey.toString('hex'));
  
  return { address, mnemonic, privateKey: keyPair.secretKey.toString('hex') };
}

async function main() {
  console.log('🏦 INCOME WALLET (доход платформы):');
  const income = await generateWallet();
  
  console.log('\n' + '='.repeat(80));
  console.log('💼 OPERATIONS WALLET (операции):');
  const operations = await generateWallet();
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📝 ДОБАВЬ В .env:\n');
  console.log(`INCOME_WALLET=${income.address}`);
  console.log(`OPERATIONS_WALLET=${operations.address}`);
  console.log(`TON_NETWORK=testnet`);
  
  console.log('\n💰 ПОПОЛНИ TESTNET кошельки:');
  console.log('https://testnet.toncoin.org/faucet');
}

main();
