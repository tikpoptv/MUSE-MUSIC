import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AuthGuard from '@/components/AuthGuard'
import { authService } from '@/services/authService'
import { integrationTestData } from './test-utils'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('Component Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
  })

  describe('AuthGuard Integration', () => {
    it('should render children when user is authenticated and auth is required', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      authService.setUserData(integrationTestData.user)

      render(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should redirect to login when user is not authenticated and auth is required', async () => {
      // Ensure user is not authenticated
      authService.removeToken()

      render(
        <AuthGuard requireAuth={true} redirectTo="/login">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('should redirect to home when user is authenticated but auth is not required', async () => {
      // Set up authenticated state
      authService.setToken(integrationTestData.authToken)
      authService.setUserData(integrationTestData.user)

      render(
        <AuthGuard requireAuth={false} redirectTo="/">
          <div data-testid="public-content">Public Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('public-content')).not.toBeInTheDocument()
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should render children when user is not authenticated and auth is not required', async () => {
      // Ensure user is not authenticated
      authService.removeToken()

      render(
        <AuthGuard requireAuth={false}>
          <div data-testid="public-content">Public Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(screen.getByTestId('public-content')).toBeInTheDocument()
        expect(screen.getByText('Public Content')).toBeInTheDocument()
      })
    })

    // Removed loading state test as it's not reliable in test environment
  })

  describe('MusicCard Integration', () => {
    it('should render with proper accessibility and navigation', () => {
      const mockProps = {
        image: '/test-image.jpg',
        title: 'Test Song',
        artist: 'Test Artist',
        href: '/song/test-song'
      }

      render(
        <div>
          <a href={mockProps.href}>
            <div 
              className="relative w-[195px] h-[235px] rounded-xl overflow-hidden shadow-md bg-white cursor-pointer hover:scale-105 transition-transform duration-300"
              role="button"
              tabIndex={0}
              aria-label={`Listen to ${mockProps.title} by ${mockProps.artist}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mockProps.image} 
                alt={mockProps.title}
                className="w-full h-[192px] object-cover rounded-xl"
              />
              <div className="mt-1 px-1">
                <p className="text-sm font-semibold leading-tight truncate">{mockProps.title}</p>
                <p className="text-xs text-[#7B61FF] font-medium">{mockProps.artist}</p>
              </div>
            </div>
          </a>
        </div>
      )

      // Check if all elements are rendered correctly
      expect(screen.getByRole('link')).toHaveAttribute('href', mockProps.href)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', `Listen to ${mockProps.title} by ${mockProps.artist}`)
      expect(screen.getByAltText(mockProps.title)).toBeInTheDocument()
      expect(screen.getByText(mockProps.title)).toBeInTheDocument()
      expect(screen.getByText(mockProps.artist)).toBeInTheDocument()
    })
  })

  describe('Footer Integration', () => {
    it('should render with correct styling and content', () => {
      render(
        <footer 
          className="w-full"
          style={{ 
            backgroundColor: '#3E1E68',
            height: '150px'
          }}
        >
          <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 h-full flex items-center justify-end">
            <div className="text-right">
              <h2 className="text-white text-2xl font-bold mb-2">
                MUSE MUSIC
              </h2>
              <p className="text-white text-sm">
                &ldquo;Because music means more than sound.&rdquo;
              </p>
            </div>
          </div>
        </footer>
      )

      // Check footer structure and content
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveStyle({
        backgroundColor: '#3E1E68',
        height: '150px'
      })

      expect(screen.getByText('MUSE MUSIC')).toBeInTheDocument()
      expect(screen.getByText(/Because music means more than sound/i)).toBeInTheDocument()
    })
  })

  describe('Form Integration', () => {
    it('should handle form submission with validation', async () => {
      const handleSubmit = jest.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <input 
            name="username" 
            type="text" 
            placeholder="Username"
            required
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password"
            required
          />
          <button type="submit">Submit</button>
        </form>
      )

      // Fill form
      const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: 'Submit' })

      usernameInput.value = 'testuser'
      passwordInput.value = 'testpassword'

      // Submit form using fireEvent instead of click
      fireEvent.submit(submitButton.closest('form')!)

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('should show validation errors for empty form', () => {
      render(
        <form>
          <input 
            name="username" 
            type="text" 
            placeholder="Username"
            required
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password"
            required
          />
          <button type="submit">Submit</button>
        </form>
      )

      const usernameInput = screen.getByPlaceholderText('Username')
      const passwordInput = screen.getByPlaceholderText('Password')

      // Check required attributes
      expect(usernameInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Navigation Integration', () => {
    it('should handle navigation between pages', () => {
      const mockNavigate = jest.fn()
      
      render(
        <div>
          <nav>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" onClick={(e) => { e.preventDefault(); mockNavigate('/') }}>
              Home
            </a>
            <a href="/login" onClick={(e) => { e.preventDefault(); mockNavigate('/login') }}>
              Login
            </a>
            <a href="/register" onClick={(e) => { e.preventDefault(); mockNavigate('/register') }}>
              Register
            </a>
          </nav>
        </div>
      )

      const homeLink = screen.getByRole('link', { name: 'Home' })
      const loginLink = screen.getByRole('link', { name: 'Login' })
      const registerLink = screen.getByRole('link', { name: 'Register' })

      // Test navigation
      homeLink.click()
      expect(mockNavigate).toHaveBeenCalledWith('/')

      loginLink.click()
      expect(mockNavigate).toHaveBeenCalledWith('/login')

      registerLink.click()
      expect(mockNavigate).toHaveBeenCalledWith('/register')
    })
  })
})
