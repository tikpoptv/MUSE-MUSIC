import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MusicCard from '@/components/MusicCard'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    // Strip Next.js-specific props not valid on <img>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...rest } = props as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} {...rest} />
  }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href}>{children}</a>
  }
})

describe('MusicCard Component', () => {
  const mockProps = {
    image: '/test-image.jpg',
    title: 'Test Song',
    artist: 'Test Artist',
    href: '/song/test-song'
  }

  it('renders music card with correct content', () => {
    render(<MusicCard {...mockProps} />)
    
    // Check if image is rendered
    const image = screen.getByAltText(mockProps.title)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProps.image)
    
    // Check if title is displayed
    expect(screen.getByText(mockProps.title)).toBeInTheDocument()
    
    // Check if artist is displayed
    expect(screen.getByText(mockProps.artist)).toBeInTheDocument()
  })

  it('renders as a clickable link', () => {
    render(<MusicCard {...mockProps} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', mockProps.href)
  })

  it('has correct accessibility attributes', () => {
    render(<MusicCard {...mockProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', `Listen to ${mockProps.title} by ${mockProps.artist}`)
    expect(button).toHaveAttribute('tabIndex', '0')
  })

  it('applies expected wrapper classes', () => {
    render(<MusicCard {...mockProps} />)
    const card = screen.getByRole('button')
    expect(card).toHaveClass('group')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('renders gradient image container with aspect ratio and overlay', () => {
    render(<MusicCard {...mockProps} />)
    const card = screen.getByRole('button')
    const container = card.querySelector('.aspect-square') as HTMLElement
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bg-gradient-to-br')
    expect(container).toHaveClass('from-[#7B61FF]')
    expect(container).toHaveClass('to-[#6B51EF]')
  })

  it('renders smile icon', () => {
    render(<MusicCard {...mockProps} />)
    
    // Check if the icon container exists
    const iconContainer = screen.getByRole('button').querySelector('.bg-white\\/80')
    expect(iconContainer).toBeInTheDocument()
  })

  it('handles long titles with truncation', () => {
    const longTitleProps = {
      ...mockProps,
      title: 'This is a very long song title that should be truncated'
    }
    
    render(<MusicCard {...longTitleProps} />)
    
    const titleElement = screen.getByText(longTitleProps.title)
    expect(titleElement).toHaveClass('truncate')
  })

  it('renders artist name with expected styling', () => {
    render(<MusicCard {...mockProps} />)
    
    const artistElement = screen.getByText(mockProps.artist)
    expect(artistElement).toHaveClass('text-xs')
    expect(artistElement).toHaveClass('text-[#7B61FF]')
  })

  it('renders title with expected styling', () => {
    render(<MusicCard {...mockProps} />)
    
    const titleElement = screen.getByText(mockProps.title)
    expect(titleElement).toHaveClass('text-sm')
    expect(titleElement).toHaveClass('font-bold')
    expect(titleElement).toHaveClass('truncate')
  })
})
