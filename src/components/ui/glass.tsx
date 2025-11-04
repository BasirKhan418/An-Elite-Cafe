import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "light"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass effect
          "backdrop-blur-md border rounded-xl shadow-lg transition-all duration-300",
          // Variants
          {
            "bg-white/90 border-gray-200/50 text-gray-900 shadow-gray-200/20": variant === "default",
            "bg-gray-50/95 border-gray-300/50 text-gray-800 shadow-gray-300/20": variant === "light", 
            "bg-gray-900/95 border-gray-700/50 text-white shadow-gray-900/30": variant === "dark",
          },
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "backdrop-blur-md border rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          // Size variants
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md", 
            "px-6 py-3 text-lg": size === "lg",
          },
          // Color variants
          {
            "bg-gray-900/90 border-gray-800/50 text-white hover:bg-gray-800/90 focus:ring-gray-600/50": variant === "primary",
            "bg-white/90 border-gray-300/50 text-gray-800 hover:bg-gray-50/90 focus:ring-gray-400/50": variant === "secondary",
            "bg-red-500/90 border-red-400/50 text-white hover:bg-red-600/90 focus:ring-red-500/50": variant === "danger",
            "bg-transparent border-transparent text-gray-700 hover:bg-gray-100/80 focus:ring-gray-300/50": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full backdrop-blur-md bg-white/90 border border-gray-300/50 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-transparent transition-all duration-300",
            error && "border-red-500/50 focus:ring-red-500/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </GlassCard>
      </div>
    </div>
  )
}

interface GlassTableProps {
  headers: string[]
  data: any[]
  onRowAction?: (row: any, action: string) => void
  actions?: { label: string; key: string; variant?: "primary" | "secondary" | "danger" }[]
}

const GlassTable: React.FC<GlassTableProps> = ({ headers, data, onRowAction, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-gray-700 font-medium text-sm whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
              {headers.map((header, colIndex) => {
                // Skip the Actions column data rendering if it's the actions header
                if (header === 'Actions' && actions) {
                  return (
                    <td key={colIndex} className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        {actions.map((action) => (
                          <GlassButton
                            key={action.key}
                            size="sm"
                            variant={action.variant || "secondary"}
                            onClick={() => onRowAction?.(row, action.key)}
                          >
                            {action.label}
                          </GlassButton>
                        ))}
                      </div>
                    </td>
                  )
                }
                return (
                  <td key={colIndex} className="py-3 px-4 text-gray-600 text-sm">
                    {row[header]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { GlassCard, GlassButton, GlassInput, GlassModal, GlassTable }