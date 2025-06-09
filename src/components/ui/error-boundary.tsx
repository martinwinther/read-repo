'use client'

import React from 'react'
import { EmptyState } from './empty-state'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={() => this.setState({ hasError: false, error: undefined })}
          />
        )
      }

      return (
        <div className="container mx-auto py-10">
          <EmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            description="An error occurred while loading this page. Please try refreshing or contact support if the problem persists."
            action={{
              label: "Reload page",
              onClick: () => window.location.reload()
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}

// Simple error fallback component
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error
  resetError: () => void 
}) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description={error?.message || "An unexpected error occurred"}
      action={{
        label: "Try again",
        onClick: resetError
      }}
    />
  )
} 