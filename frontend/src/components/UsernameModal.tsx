import { useState, useEffect, useRef } from 'react'
import './UsernameModal.css'

interface UsernameModalProps {
  defaultUsername: string
  onConfirm: (username: string) => void
}

export default function UsernameModal({ defaultUsername, onConfirm }: UsernameModalProps) {
  const [value, setValue] = useState(defaultUsername)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(defaultUsername)
  }, [defaultUsername])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div className="username-modal-backdrop" role="dialog" aria-modal="true" aria-label="Set your username">
      <div className="username-modal">
        <h2 className="username-modal-title">Welcome to SyncSketch</h2>
        <p className="username-modal-desc">Choose a name so others can see your cursor.</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="username-modal-input"
            placeholder="Your name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={32}
            autoComplete="username"
          />
          <button type="submit" className="username-modal-submit" disabled={!value.trim()}>
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
