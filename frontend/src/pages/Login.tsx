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
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-group">
                <label htmlFor="usernameOrEmail" className="form-label">
                  Username or Email:
                </label>
                <input
                  {...register('usernameOrEmail')}
                  id="usernameOrEmail"
                  placeholder="Enter username or email"
                  className="form-input"
                />
                {errors.usernameOrEmail && (
                  <p className="form-error">{errors.usernameOrEmail.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password:
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="form-input"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
              <div className="text-center">
                <button type="submit" className="form-button">
                  Login
                </button>
              </div>
              <div className="text-center mt-4">
                <a
                  href="/forgot-password"
                  className="form-link"
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
<<<<<<< HEAD
      </div>
    </section>
=======
        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Login
        </button>
        <a href="/forgot-password" className="text-blue-500">Forgot Password?</a>
      </form>
    </div>
>>>>>>> 8d74306 (Refactor recipe routes and update database dependencies; clean up login form)
  );
}

export default Login;