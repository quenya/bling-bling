import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

interface ComboboxProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const Combobox = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "선택하거나 입력하세요",
  className = "",
  disabled = false
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    )
    setFilteredOptions(filtered)
  }, [inputValue, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleOptionSelect = (option: string) => {
    setInputValue(option)
    onChange(option)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  const handleInputFocus = () => {
    updateDropdownPosition()
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          />
          <button
            type="button"
            onClick={() => {
              if (!isOpen) updateDropdownPosition()
              setIsOpen(!isOpen)
            }}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            marginTop: '4px'
          }}
        >
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                option === inputValue ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <span>{option}</span>
              {option === inputValue && <Check className="w-4 h-4" />}
            </button>
          ))}
          
          {/* 새 이름 추가 옵션 */}
          {inputValue && !options.includes(inputValue) && (
            <button
              type="button"
              onClick={() => handleOptionSelect(inputValue)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-blue-600 border-t border-gray-200"
            >
              <span className="font-medium">"{inputValue}" 추가</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  )
}