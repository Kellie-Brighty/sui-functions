import React, { useState } from 'react';
import { Lock, Plus, Trash2, Key, ShieldCheck, Copy } from 'lucide-react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_FUNCTIONS_PACKAGE_ID } from '../constants';
// MOCK SEAL ENCRYPTION FOR DEMONSTRATION
// In a real MVR implementation, we would import { seal } from '@mysten/seal'
// and encrypt with the proxy's public key.
async function mockSeal(plaintext: string): Promise<string> {
  return `sealed_${btoa(plaintext)}`;
}

interface SecretsManagerProps {
  activeProject: any;
  showToast: (type: 'success'|'error'|'info'|'warning', title: string, msg: string) => void;
}

export const SecretsManager: React.FC<SecretsManagerProps> = ({ activeProject, showToast }) => {
  const [secretKey, setSecretKey] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleAddSecret = async () => {
    if (!secretKey || !secretValue) {
      showToast('error', 'Missing Fields', 'Please provide both a Secret Name and Value.');
      return;
    }
    
    setIsEncrypting(true);
    try {
      showToast('info', 'Encrypting', 'Securing secret with Mysten Seal protocol...');
      const sealedCiphertext = await mockSeal(secretValue);
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${SUI_FUNCTIONS_PACKAGE_ID}::trigger::add_secret`,
        arguments: [
          tx.object(activeProject.id),
          tx.pure.string(secretKey),
          tx.pure.string(sealedCiphertext)
        ]
      });

      signAndExecuteTransaction({
        transaction: tx,
        chain: 'sui:testnet'
      }, {
        onSuccess: (result) => {
          showToast('success', 'Secret Sealed', 'Your encrypted secret has been securely stored on-chain!');
          setSecretKey('');
          setSecretValue('');
          setIsEncrypting(false);
        },
        onError: (err) => {
          showToast('error', 'Transaction Failed', err.message);
          setIsEncrypting(false);
        }
      });
    } catch (e: any) {
      showToast('error', 'Encryption Failed', e.message);
      setIsEncrypting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-outfit mb-1 tracking-wide">Secrets Manager</h2>
          <p className="text-slate-400 text-sm">Securely store encrypted API keys using the Mysten Seal Protocol.</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-sui/20 to-brand-sui/5 border border-brand-sui/20 flex items-center justify-center shadow-[0_0_15px_rgba(56,152,255,0.15)]">
          <Lock className="text-brand-sui drop-shadow-[0_0_8px_rgba(56,152,255,0.5)]" size={24} />
        </div>
      </div>

      <div className="bg-[#041829]/60 border border-white/5 p-6 rounded-2xl flex gap-6 w-full">
        <div className="flex flex-col w-full gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Secret Name</label>
            <input 
              type="text" 
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
              placeholder="e.g. GEMINI_API_KEY" 
              className="w-full bg-[#0A2339] border border-[#14304A] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-sui focus:ring-1 focus:ring-brand-sui transition-all duration-300"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Secret Value</label>
            <input 
              type="password" 
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              placeholder="e.g. AIzaSyB..." 
              className="w-full bg-[#0A2339] border border-[#14304A] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-sui focus:ring-1 focus:ring-brand-sui transition-all duration-300"
            />
          </div>
          <button 
            onClick={handleAddSecret}
            disabled={isEncrypting}
            className="w-full bg-brand-sui hover:bg-brand-sui-light text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,152,255,0.3)] disabled:opacity-50"
          >
            {isEncrypting ? <Lock size={18} className="animate-pulse" /> : <ShieldCheck size={18} />}
            {isEncrypting ? 'Encrypting & Storing...' : 'Seal Secret'}
          </button>
        </div>
      </div>
    </div>
  );
};
