import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof schema>;

function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem('token', result.token);
      navigate('/');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('usernameOrEmail')}
            placeholder="Username or Email"
            className="w-full p-2 border rounded"
          />
          {errors.usernameOrEmail && <p className="text-red-500">{errors.usernameOrEmail.message}</p>}
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="Password"
            className="w-full p-2 border rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Login
        </button>
        <a href="/forgot-password" className="text-blue-500">Forgot Password?</a>
      </form>
    </div>
  );
}

export default Login;