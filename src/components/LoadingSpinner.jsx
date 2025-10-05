import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ 
  size = 'sm', 
  variant = 'primary', 
  text = 'Юкланмоқда...',
  centered = false,
  className = ''
}) => {
  const containerClass = centered 
    ? `d-flex flex-column align-items-center justify-content-center ${className}`
    : `d-flex align-items-center ${className}`

  return (
    <div className={containerClass}>
      <Spinner 
        animation="border" 
        size={size} 
        variant={variant}
        className={centered ? 'mb-3' : 'me-2'}
      />
      {text && (
        <span className={centered ? 'text-muted' : 'text-muted small'}>
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner