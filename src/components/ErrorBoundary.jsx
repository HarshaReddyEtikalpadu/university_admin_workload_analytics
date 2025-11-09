import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error info for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for errors
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">âš ï¸</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                An error occurred in the application. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                  <p className="text-sm font-mono text-gray-700 break-words">
                    {this.state.error.toString()}
                  </p>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-primary-blue text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;