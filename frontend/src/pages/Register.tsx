import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  email: z.string().email('Must be a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/,
      'Password must include uppercase, lowercase, numbers, and special characters'
    ),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  name: z.string().min(1, 'Name is required'),
  family_name: z.string().min(1, 'Family name is required'),
  phone_number: z.string().optional(),
  profession: z.string().optional(),
  age: z.number().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof schema>;

function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        family_name: data.family_name,
        phone_number: data.phone_number,
        profession: data.profession,
        age: data.age,
      }),
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem('token', result.token);
      navigate('/');
    } else {
      if (result.message === 'Username or email already exists') {
        const dbCheck = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check-duplicates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: data.username, email: data.email }),
        });
        const checkResult = await dbCheck.json();
        if (checkResult.usernameExists) {
          setError('username', { type: 'manual', message: 'This username is already taken' });
        }
        if (checkResult.emailExists) {
          setError('email', { type: 'manual', message: 'This email is already registered' });
        }
      } else {
        alert(result.message);
      }
    }
  };

  // Real-time password complexity check using watch
  const passwordValue = watch('password') || '';
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecial = /[!@#$%^&*]/.test(passwordValue);
  const isLongEnough = passwordValue.length >= 8;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('username')}
            placeholder="Username (min 4 characters)"
            className="w-full p-2 border rounded"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>
        <div>
          <input
            {...register('email')}
            placeholder="example@website.com"
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input
            type="password"
            {...register('password')}
            placeholder="Password (min 8 chars, mixed)"
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          <div className="mt-2 text-sm">
            <p className={isLongEnough ? 'text-green-500' : 'text-red-500'}>
              At least 8 characters: {isLongEnough ? '✓' : '✗'}
            </p>
            <p className={hasUppercase ? 'text-green-500' : 'text-red-500'}>
              Uppercase letter: {hasUppercase ? '✓' : '✗'}
            </p>
            <p className={hasLowercase ? 'text-green-500' : 'text-red-500'}>
              Lowercase letter: {hasLowercase ? '✓' : '✗'}
            </p>
            <p className={hasNumber ? 'text-green-500' : 'text-red-500'}>
              Number: {hasNumber ? '✓' : '✗'}
            </p>
            <p className={hasSpecial ? 'text-green-500' : 'text-red-500'}>
              Special character (!@#$%^&*): {hasSpecial ? '✓' : '✗'}
            </p>
          </div>
        </div>
        <div>
          <input
            type="password"
            {...register('confirmPassword')}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded"
          />
          {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <div>
          <input
            {...register('name')}
            placeholder="Name"
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <input
            {...register('family_name')}
            placeholder="Family Name"
            className="w-full p-2 border rounded"
          />
          {errors.family_name && <p className="text-red-500">{errors.family_name.message}</p>}
        </div>
        <div>
          <input
            type="number"
            {...register('age', { valueAsNumber: true })}
            placeholder="Age (optional)"
            className="w-full p-2 border rounded"
          />
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
        </div>
      
        <div>
          <input
            {...register('profession')}
            placeholder="Profession (optional)"
            className="w-full p-2 border rounded"
          />
          {errors.profession && <p className="text-red-500">{errors.profession.message}</p>}
        </div>
        
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;