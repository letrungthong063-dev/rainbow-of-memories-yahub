import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4 text-center">
          <div className="bg-accent-red/10 p-4 rounded-2xl text-accent-red mb-6">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>error</span>
          </div>
          <h1 className="text-2xl font-black text-[#121516] mb-2">Có lỗi xảy ra</h1>
          <p className="text-[#67747e] mb-2 max-w-sm">Trang này gặp sự cố không mong muốn.</p>
          <p className="text-xs text-[#67747e]/60 mb-8 font-mono bg-[#f0f0f0] px-3 py-2 rounded">
            {this.state.error?.message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-primary hover:bg-accent-red text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
            >
              Thử lại
            </button>
            <Link to="/" className="border border-[#d8dcdf] text-[#67747e] hover:text-primary px-5 py-2.5 rounded-lg font-bold text-sm transition-colors">
              Về trang chủ
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
