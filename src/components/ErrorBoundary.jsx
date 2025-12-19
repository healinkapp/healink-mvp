import { Component } from 'react';
import { XCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-black mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs font-mono text-red-700 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reload App
            </button>

            <p className="text-xs text-gray-500 mt-6">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
