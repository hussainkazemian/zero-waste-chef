import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

//define the schema for registration form validation
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

// Infer the type of the form data from the schema
type RegisterForm = z.infer<typeof schema>;

function Register() {
  const navigate = useNavigate();  // Hook to navigate to other pages

    // Initialize the form with validation using Zod
  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

    // Handle form submission
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
      localStorage.setItem('token', result.token);  // Store the token in local storage
      navigate('/');  // Navigate to the home page on successful registration
    } else {
              // Check for duplicate username or email
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
        alert(result.message); // Alert user if there is an error
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
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card registration-form">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username:
                </label>
                <input
                  {...register('username')}
                  id="username"
                  placeholder="Enter username"
                  className="form-input"
                />
                {errors.username && (
                  <p className="form-error">{errors.username.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email:
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  className="form-input"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
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
                <div className="password-requirements">
                  <p className={isLongEnough ? 'valid' : 'invalid'}>
                    At least 8 characters: {isLongEnough ? '✓' : '✗'}
                  </p>
                  <p className={hasUppercase ? 'valid' : 'invalid'}>
                    Uppercase letter: {hasUppercase ? '✓' : '✗'}
                  </p>
                  <p className={hasLowercase ? 'valid' : 'invalid'}>
                    Lowercase letter: {hasLowercase ? '✓' : '✗'}
                  </p>
                  <p className={hasNumber ? 'valid' : 'invalid'}>
                    Number: {hasNumber ? '✓' : '✗'}
                  </p>
                  <p className={hasSpecial ? 'valid' : 'invalid'}>
                    Special character (!@#$%^&*): {hasSpecial ? '✓' : '✗'}
                  </p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password:
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className="form-input"
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name:
                </label>
                <input
                  {...register('name')}
                  id="name"
                  placeholder="Enter name"
                  className="form-input"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="family_name" className="form-label">
                  Family Name:
                </label>
                <input
                  {...register('family_name')}
                  id="family_name"
                  placeholder="Enter family name"
                  className="form-input"
                />
                {errors.family_name && (
                  <p className="form-error">{errors.family_name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="phone_number" className="form-label">
                  Phone Number (optional):
                </label>
                <input
                  {...register('phone_number')}
                  id="phone_number"
                  placeholder="Enter phone number"
                  className="form-input"
                />
                {errors.phone_number && (
                  <p className="form-error">{errors.phone_number.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="profession" className="form-label">
                  Profession (optional):
                </label>
                <input
                  {...register('profession')}
                  id="profession"
                  placeholder="Enter profession"
                  className="form-input"
                />
                {errors.profession && (
                  <p className="form-error">{errors.profession.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  Age (optional):
                </label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  id="age"
                  type="number"
                  placeholder="Enter age"
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