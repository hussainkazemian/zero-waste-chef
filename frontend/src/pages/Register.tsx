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

  // Real-time password complexity check
  const passwordValue = watch('password') || '';
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecial = /[!@#$%^&*]/.test(passwordValue);
  const isLongEnough = passwordValue.length >= 8;

  return (
<<<<<<< HEAD
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
=======
    <section>
      <div className="container mx-auto mt-8 mb-8 px-4">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="my-6">
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Username:
                </label>
                <input
                  {...register('username')}
                  id="username"
                  placeholder="Enter username"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.username && (
                  <p className="form-error">{errors.username.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Email:
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="Enter email"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Password:
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="Enter password"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
                <div className="mt-2 text-sm space-y-1">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
                <div className="mt-2 text-sm">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
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
<<<<<<< HEAD
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
=======

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Confirm Password:
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Name:
                </label>
                <input
                  {...register('name')}
                  id="name"
                  placeholder="Enter name"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="family_name" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="family_name" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Family Name:
                </label>
                <input
                  {...register('family_name')}
                  id="family_name"
                  placeholder="Enter family name"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.family_name && (
                  <p className="form-error">{errors.family_name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phone_number" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.family_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.family_name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Phone Number (optional):
                </label>
                <input
                  {...register('phone_number')}
                  id="phone_number"
                  placeholder="Enter phone number"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.phone_number && (
                  <p className="form-error">{errors.phone_number.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="profession" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="profession" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Profession (optional):
                </label>
                <input
                  {...register('profession')}
                  id="profession"
                  placeholder="Enter profession"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.profession && (
                  <p className="form-error">{errors.profession.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="age" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.profession && (
                  <p className="text-red-500 text-sm mt-1">{errors.profession.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="age" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Age (optional):
                </label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  id="age"
                  type="number"
                  placeholder="Enter age"
<<<<<<< HEAD
                  className="form-input"
                />
                {errors.age && (
                  <p className="form-error">{errors.age.message}</p>
                )}
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="form-button"
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
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
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;