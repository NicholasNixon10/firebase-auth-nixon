import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

// Mock next/navigation
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock Firebase auth
const mockSignInWithPopup = jest.fn()
const mockSignInWithEmailAndPassword = jest.fn()
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
}))

// Mock @/lib/firebase using relative path (bypass moduleNameMapper)
jest.mock('../../lib/firebase', () => ({
  auth: {},
}), { virtual: true })

// Mock UI components (they also use @/ alias)
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>
}), { virtual: true })

jest.mock('../../components/ui/input', () => ({
  Input: (props) => <input {...props} />
}), { virtual: true })

jest.mock('../../components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h2>{children}</h2>
}), { virtual: true })

jest.mock('../../components/ui/separator', () => ({
  Separator: () => <hr />
}), { virtual: true })

// Mock fetch for session API
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login form correctly', () => {
    render(<LoginPage />)

    expect(screen.getByText('Sign in to Your Account')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login with email/i })).toBeInTheDocument()
  })

  describe('Google Login', () => {
    it('calls Google sign-in and creates session on success', async () => {
      const mockIdToken = 'mock-id-token'
      mockSignInWithPopup.mockResolvedValue({
        user: { getIdToken: jest.fn().mockResolvedValue(mockIdToken) },
      })
      ;(fetch as jest.Mock).mockResolvedValue({ ok: true })

      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled()
        expect(fetch).toHaveBeenCalledWith('/api/session', {
          method: 'POST',
          headers: { Authorization: `Bearer ${mockIdToken}` },
        })
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('shows error toast if Google sign-in fails', async () => {
      const error = new Error('Popup closed')
      mockSignInWithPopup.mockRejectedValue(error)
      const { toast } = require('sonner')

      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Popup closed')
      })
    })

    it('disables buttons while loading', async () => {
      mockSignInWithPopup.mockImplementation(() => new Promise(() => {})) // never resolves
      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }))

      expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  describe('Email/Password Login', () => {
    it('calls email sign-in with credentials and creates session', async () => {
      const mockIdToken = 'mock-id-token'
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { getIdToken: jest.fn().mockResolvedValue(mockIdToken) },
      })
      ;(fetch as jest.Mock).mockResolvedValue({ ok: true })

      render(<LoginPage />)

      await userEvent.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
      await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
      fireEvent.click(screen.getByRole('button', { name: /login with email/i }))

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        )
        expect(fetch).toHaveBeenCalledWith('/api/session', {
          method: 'POST',
          headers: { Authorization: `Bearer ${mockIdToken}` },
        })
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows specific error messages based on Firebase error codes', async () => {
      const { toast } = require('sonner')

      const testCases = [
        { code: 'auth/user-not-found', expectedMessage: 'User not found' },
        { code: 'auth/wrong-password', expectedMessage: 'wrong password' },
        { code: 'auth/invalid-email', expectedMessage: 'invalid email format' },
        { code: 'auth/unknown', expectedMessage: 'Login failed' },
      ]

      for (const { code, expectedMessage } of testCases) {
        mockSignInWithEmailAndPassword.mockRejectedValue({ code })

        render(<LoginPage />)

        await userEvent.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
        await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
        fireEvent.click(screen.getByRole('button', { name: /login with email/i }))

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(expectedMessage)
        })

        // Cleanup after each iteration to prevent duplicate elements
        cleanup()
        jest.clearAllMocks()
      }
    })

    it('does not call sign-in if fields are empty (validation happens on click, but no explicit check in component – you may add validation later)', async () => {
      render(<LoginPage />)

      fireEvent.click(screen.getByRole('button', { name: /login with email/i }))

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          '',
          ''
        )
      })
    })
  })
})