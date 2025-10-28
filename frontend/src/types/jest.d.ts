import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string | string[]): R
      toHaveStyle(style: Record<string, string>): R
      toHaveAttribute(attribute: string, value?: string): R
      toContainText(text: string): R
    }
  }
}
