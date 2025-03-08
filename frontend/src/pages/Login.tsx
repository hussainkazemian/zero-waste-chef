import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

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
    <section>
      <div className="container mx-auto mt-8 mb-8 px-4">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="my-6">
              <div className="mb-4">
                <label htmlFor="usernameOrEmail" className="block text-gray-700 font-medium mb-1">
                  Username or Email:
                </label>
                <input
                  {...register('usernameOrEmail')}
                  id="usernameOrEmail"
                  placeholder="Enter username or email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.usernameOrEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.usernameOrEmail.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                  Password:
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}> 
                <button
                  type="submit"
    
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Login
                </button>
               
              </div>
              <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '1rem',
                }}>
                <a
                  href="/forgot-password"
                  

                  className="text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/forgot-password');
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;