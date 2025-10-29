import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '@/components/Footer'

describe('Footer Component', () => {
  it('renders footer with correct content', () => {
    render(<Footer />)
    
    // Check if footer element exists
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    
    // Check if MUSE MUSIC title is displayed
    expect(screen.getByText('MUSE MUSIC')).toBeInTheDocument()
    
    // Check if tagline is displayed
    expect(screen.getByText(/Because music means more than sound/i)).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('w-full')
  })

  it('has correct inline styles', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveStyle({
      backgroundColor: '#3E1E68',
      height: '150px'
    })
  })

  it('renders footer text in white color', () => {
    render(<Footer />)
    
    const title = screen.getByText('MUSE MUSIC')
    const tagline = screen.getByText(/Because music means more than sound/i)
    
    expect(title).toHaveClass('text-white')
    expect(tagline).toHaveClass('text-white')
  })

  it('has proper text sizing', () => {
    render(<Footer />)
    
    const title = screen.getByText('MUSE MUSIC')
    const tagline = screen.getByText(/Because music means more than sound/i)
    
    expect(title).toHaveClass('text-2xl')
    expect(title).toHaveClass('font-bold')
    expect(tagline).toHaveClass('text-sm')
  })
})
