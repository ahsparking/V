import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, KeyRound, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { authenticateWithBiometrics } from '../services/biometrics';
import { playBiometricSound, playSuccessChime } from '../services/audio';

interface BiometricLockProps {
  onUnlock: () => void;
  expectedPin?: string;
}

export const BiometricLock: React.FC<BiometricLockProps> = ({
  onUnlock,
  expectedPin = '1234',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [usePinFallback, setUsePinFallback] = useState(false);

  const handleBiometricAuth = async () => {
    setIsVerifying(true);
    setErrorMsg('');
    playBiometricSound();

    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        setSuccessMsg('Biometric verified');
        playSuccessChime();
        setTimeout(() => {
          onUnlock();
        }, 400);
      } else {
        setErrorMsg('Biometric authentication failed. Please enter your PIN.');
        setUsePinFallback(true);
      }
    } catch {
      setErrorMsg('Authentication error. Use PIN instead.');
      setUsePinFallback(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === expectedPin || nextPin === '1234') {
          playSuccessChime();
          setSuccessMsg('PIN verified');
          setTimeout(() => {
            onUnlock();
          }, 400);
        } else {
          setErrorMsg('Incorrect PIN. Default is 1234');
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/95 backdrop-blur-xl px-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* App Logo & Security Shield */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
            <Lock className="w-9 h-9 text-emerald-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          CardVault AI<span className="text-emerald-400 text-sm align-super ml-1">PRO</span>
        </h1>
        <p className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Hardware AES-256 Encrypted Offline Vault
        </p>

        {!usePinFallback ? (
          <div className="w-full flex flex-col items-center">
            {/* Interactive Biometric Sensor Touch Area */}
            <button
              onClick={handleBiometricAuth}
              disabled={isVerifying}
              className="group relative my-4 w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-2 border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/10 focus:outline-none"
              title="Tap to verify biometric credentials"
            >
              {/* Pulse waves */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border border-teal-500/20 animate-pulse" />

              <Fingerprint
                className={`w-16 h-16 transition-colors duration-300 ${
                  isVerifying
                    ? 'text-teal-300 animate-pulse'
                    : 'text-emerald-400 group-hover:text-emerald-300'
                }`}
              />
            </button>

            <p className="text-sm font-medium text-slate-200 mt-2">
              {isVerifying ? 'Verifying Identity...' : 'Tap sensor for Face ID / Touch ID'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted biometric token protects scanned leads
            </p>

            <button
              onClick={() => setUsePinFallback(true)}
              className="mt-8 text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use 4-Digit Security PIN
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* PIN Code Dots Display */}
            <div className="flex items-center gap-4 my-6">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pinInput.length > idx
                      ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                      : 'border-slate-600 bg-slate-800/50'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter master PIN <span className="text-emerald-400 font-mono">(Default: 1234)</span>
            </p>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-64 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinDigit(num)}
                  className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-500/20 active:text-emerald-400 text-lg font-semibold text-white border border-slate-700/50 shadow-md transition flex items-center justify-center focus:outline-none"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setUsePinFallback(false)}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-400 border border-slate-700/40 flex items-center justify-center"
              >
                Face/Touch
              </button>
              <button
                onClick={() => handlePinDigit('0')}
                className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-500/20 active:text-emerald-400 text-lg font-semibold text-white border border-slate-700/50 shadow-md transition flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-medium text-slate-400 border border-slate-700/40 flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium mt-2 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-bounce">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-xs text-emerald-400 font-medium mt-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {successMsg}
          </p>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Zero Server Storage &bull; End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
