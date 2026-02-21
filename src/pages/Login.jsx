import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [error, setError] = useState('');
  const { requestOTP, verifyOTP } = useContext(AuthContext);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      await requestOTP(phone);
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.message || 'OTP ပို့၍မရပါ။ ပြန်ကြိုးစားပါ');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(phone, otp);
      // Login အောင်မြင်ရင် Dashboard ကို auto ရောက်သွားပါလိမ့်မယ်
    } catch (err) {
      setError(err.message || 'OTP ကုဒ်မှားနေပါသည်');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>SimpleHR Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {step === 1 ? (
        <form onSubmit={handleRequestOTP}>
          <label>ဖုန်းနံပါတ် ရိုက်ထည့်ပါ</label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09..."
            required 
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#4F46E5', color: 'white' }}>
            OTP ကုဒ်တောင်းမည်
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <p>ဖုန်းနံပါတ် {phone} သို့ ပို့ထားသော ၆ လုံးကုဒ်ကို ရိုက်ထည့်ပါ</p>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP Code"
            required 
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#10B981', color: 'white' }}>
            Login ဝင်မည်
          </button>
          <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: 'blue' }}>
            ဖုန်းနံပါတ် ပြန်ပြင်မည်
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;