import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const forgotSchema = z.object({ email: z.string().email('Invalid email') });
const resetSchema = z.object({ newPassword: z.string().min(6, 'Password must be at least 6 characters') });

type ForgotForm = z.infer<typeof forgotSchema>;
type ResetForm = z.infer<typeof resetSchema>;

function ForgotPassword() {
  const [resetToken, setResetToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const forgotForm = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onForgotSubmit = async (data: ForgotForm) => {
    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setResetToken(result.resetToken); // Simulate email link click
    } else {
      alert(result.message);
    }
  };

  const onResetSubmit = async (data: ResetForm) => {
    const res = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: data.newPassword }),
    });
    if (res.ok) {
      navigate('/login');
    } else {
      alert('Failed to reset password');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
       <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot password</h3>
    
      {!resetToken ? (
        <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
          <div>
            <input
              {...forgotForm.register('email')}
              placeholder="Enter Your Email Address"
              className="w-full p-2 border rounded"
            />
            {forgotForm.formState.errors.email && (
              <p className="text-red-500">{forgotForm.formState.errors.email.message}</p>
            )}
          </div>
          <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '10px'
                }}>
          <button type="submit"  className="w-full p-2 bg-blue-500 text-white rounded">
            Send Reset Link
          </button>
          </div>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
          <div>
            <input
              {...resetForm.register('newPassword')}
              type="password"
              placeholder="New Password"
              className="w-full p-2 border rounded"
            />
            {resetForm.formState.errors.newPassword && (
              <p className="text-red-500">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <button type="submit"
           className="w-full p-2 bg-blue-500 text-white rounded" >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;