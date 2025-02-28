import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../src/pages/Login'; 

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Username or Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows error on invalid input', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /login/i })); // Target the button specifically
    expect(await screen.findByText('Required')).toBeInTheDocument();
  });
});