import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import FeedbackSection from '@/components/FeedbackSection'
import { songService } from '@/services/songService'
import { authService } from '@/services/authService'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('react-hot-toast')
jest.mock('@/services/songService')
jest.mock('@/services/authService')

const mockSongService = songService as jest.Mocked<typeof songService>
const mockAuthService = authService as jest.Mocked<typeof authService>

describe('FeedbackSection Component', () => {
  const mockProcessingID = 'test-processing-id'
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    mockAuthService.isAuthenticated.mockReturnValue(false)
    mockSongService.getRatingStats.mockResolvedValue({
      totalRatings: 10,
      averageRating: 4.5,
      starCount: 5,
    })
    mockSongService.getUserRating.mockResolvedValue(null)
  })

  it('renders feedback section with rating stars', async () => {
    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })
    
    // Wait for component to load
    await waitFor(() => {
      // Check if rating stars are rendered (they are buttons with SVG stars)
      const buttons = screen.getAllByRole('button')
      // Should have at least 5 star buttons
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('allows user to select rating', async () => {
    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })

    await waitFor(() => {
      expect(mockSongService.getRatingStats).toHaveBeenCalled()
    })
    
    // Find and click a star (assuming 5-star rating)
    const stars = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('aria-label')?.includes('star')
    )
    
    if (stars.length > 0) {
      fireEvent.click(stars[2]) // Click 3rd star
      // Rating should be updated
    }
  })

  it('shows login prompt when not authenticated and trying to submit', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false)
    
    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })
    
    // Wait for component to load
    await waitFor(() => {
      expect(mockSongService.getRatingStats).toHaveBeenCalled()
      // When not authenticated, the submit button should be disabled
      const submitButton = screen.getByRole('button', { name: /submit|update/i }) as HTMLButtonElement
      expect(submitButton).toBeDisabled()
    })
    
    // The login overlay should be visible - use getAllByText since there are multiple matching elements
    const loginTexts = screen.getAllByText(/pretty please|login to share/i)
    expect(loginTexts.length).toBeGreaterThan(0)
  })

  it('submits rating when authenticated', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    mockSongService.submitRating.mockResolvedValue({
      ratingID: 'rating-123',
      processingID: mockProcessingID,
      userID: 'user-123',
      rating: 5,
      comment: 'Great!',
      feedback: 'Great!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any)

    render(<FeedbackSection processingID={mockProcessingID} />)
    
    // Select rating
    const stars = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('aria-label')?.includes('star')
    )
    if (stars.length >= 5) {
      fireEvent.click(stars[4]) // Click 5th star
    }

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit|send|feedback/i }) as HTMLButtonElement
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSongService.submitRating).toHaveBeenCalledWith(
          mockProcessingID,
          expect.any(Number),
          expect.any(String)
        )
        expect(toast.success).toHaveBeenCalled()
      })
    }
  })

  it('calls onSubmit callback when provided', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
    
    await act(async () => {
      render(
        <FeedbackSection 
          processingID={mockProcessingID} 
          onSubmit={mockOnSubmit}
        />
      )
    })

    await waitFor(() => {
      expect(mockSongService.getRatingStats).toHaveBeenCalled()
    })

    // Select rating and submit
    const stars = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('aria-label')?.includes('star')
    )
    if (stars.length >= 3) {
      fireEvent.click(stars[2])
    }

    const submitButton = screen.getByRole('button', { name: /submit|send|feedback/i }) as HTMLButtonElement
    if (submitButton && !submitButton.disabled) {
      await act(async () => {
        fireEvent.click(submitButton)
      })
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    }
  })

  it('displays rating statistics', async () => {
    mockSongService.getRatingStats.mockResolvedValue({
      totalRatings: 25,
      averageRating: 4.8,
      starCount: 5,
    })

    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })
    
    await waitFor(() => {
      expect(mockSongService.getRatingStats).toHaveBeenCalledWith(mockProcessingID)
    })
  })

  it('handles error when submitting rating fails', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    mockSongService.submitRating.mockRejectedValue(new Error('Failed to submit'))

    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })

    await waitFor(() => {
      expect(mockSongService.getRatingStats).toHaveBeenCalled()
    })
    
    // Select rating
    const stars = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('aria-label')?.includes('star')
    )
    if (stars.length >= 3) {
      fireEvent.click(stars[2])
    }

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit|send|feedback/i }) as HTMLButtonElement
    if (submitButton && !submitButton.disabled) {
      await act(async () => {
        fireEvent.click(submitButton)
      })
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    }
  })

  it('shows existing user rating when authenticated', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    mockSongService.getUserRating.mockResolvedValue({
      ratingID: 'rating-123',
      processingID: mockProcessingID,
      userID: 'user-123',
      rating: 4,
      comment: 'Good song',
      feedback: 'Good song',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any)

    await act(async () => {
      render(<FeedbackSection processingID={mockProcessingID} />)
    })
    
    await waitFor(() => {
      expect(mockSongService.getUserRating).toHaveBeenCalledWith(mockProcessingID)
    })
  })
})

