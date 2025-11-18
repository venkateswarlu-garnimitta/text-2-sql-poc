import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-red-500 font-semibold">
          <p>Error rendering chart: {this.state.error?.message || "Unknown error"}</p>
          <p>Please select valid X and Y axes or check the data.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;