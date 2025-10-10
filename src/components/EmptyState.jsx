import { Card, Button } from 'react-bootstrap'
import { FaPlus } from 'react-icons/fa'

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  variant = 'primary' 
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        {Icon && <Icon size={64} className="text-muted mb-3 opacity-50" />}
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-4">{description}</p>
        {onAction && actionText && (
          <Button variant={variant} onClick={onAction}>
            <FaPlus className="me-2" />
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default EmptyState
