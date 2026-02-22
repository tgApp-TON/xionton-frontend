export default function PrivacyPolicy() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px', 
      fontFamily: 'system-ui', 
      lineHeight: '1.6',
      backgroundColor: '#ffffff' as any, position: 'relative' as any, zIndex: 9999,
      color: '#333333' as any,
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#0088CC' }}>Privacy Policy for XionTon</h1>
      <p><em>Last updated: February 22, 2026</em></p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>1. Introduction</h2>
      <p>XionTon operates a decentralized matrix system on the TON blockchain. This Privacy Policy explains how we collect, use, and protect your information.</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>2. Information We Collect</h2>
      <p>We collect: Telegram user ID, username, TON wallet address, and language preference. All blockchain transactions are publicly visible.</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>3. How We Use Your Information</h2>
      <p>We use information to operate the system, process transactions via smart contracts, provide support, and send notifications.</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>4. Data Security</h2>
      <p>We use industry-standard security. Your private keys are never collected. All operations are transparent on blockchain.</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>5. Your Rights</h2>
      <p>You can access, correct, or request deletion of your data (subject to blockchain immutability).</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>6. Contact</h2>
      <p>Telegram: @XionTonBot</p>
      <h2 style={{ color: '#0088CC', marginTop: '2rem' }}>7. Disclaimer</h2>
      <p>XionTon is decentralized. Participation involves risk. We do not guarantee profits. All transactions are irreversible.</p>
    </div>
  );
}
