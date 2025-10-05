import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the notification hook
jest.mock('../components/Notification', () => ({
  useNotification: () => ({
    NotificationContainer: () => null
  })
}))

const MockedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

describe('App', () => {
  test('renders login page by default', () => {
    render(<MockedApp />)
    
    // Should redirect to login page
    expect(window.location.pathname).toBe('/login')
  })

  test('renders without crashing', () => {
    render(<MockedApp />)
    // If we get here, the component rendered without throwing
    expect(true).toBe(true)
  })
})