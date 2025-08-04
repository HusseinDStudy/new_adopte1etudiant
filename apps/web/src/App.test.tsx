import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    )
    // Just check that the app renders without throwing
    expect(document.body).toBeTruthy()
  })
})
