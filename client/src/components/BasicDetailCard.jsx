import React from 'react'
import { PhoneOutgoing, Mail, MapPin, Building2, Edit2, Trash2, UserRoundPlus } from 'lucide-react'

function Tooltip({ label, children }) {
  const id = React.useId ? React.useId() : `tooltip-${Math.random().toString(36).slice(2, 9)}`
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef(null)

  React.useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="relative min-w-0 flex-1">
      <div
        tabIndex={0}
        aria-describedby={id}
        className="min-w-0 w-full"
        onMouseEnter={() => { clearTimeout(timeoutRef.current); setOpen(true) }}
        onMouseLeave={() => { timeoutRef.current = setTimeout(() => setOpen(false), 20) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(prev => !prev)}
        onTouchStart={() => setOpen(true)}
      >
        {children}
      </div>

      {open && (
        <div
          id={id}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 rounded-md bg-gray-800 text-white text-xs px-2 py-1 z-50 shadow-md whitespace-nowrap"
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Status Badge Component - Clean and minimal
const StatusBadge = ({ status }) => {
  if (!status) return null;
  
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200';
      case 'approved':
        return 'bg-green-50 text-green-700 ring-1 ring-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 ring-1 ring-red-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'incomplete':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getStatusStyles(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default function BasicDetailCard({ 
  name, 
  phone, 
  email, 
  event, 
  role, 
  location, 
  org, 
  date, 
  onType, 
  onDelete, 
  editOrAdd, 
  assignedOn, 
  status 
}) {
  const icons = {
    edit: <Edit2 size={14} />,
    add: <UserRoundPlus size={14} />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all min-w-0 overflow-visible">
      {/* ✅ Move Status to Header Row - Better Layout */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-gray-300 shrink-0"
            />

            <div className="flex-1 min-w-0 flex flex-col font-snpro font-extrabold">
              <Tooltip label={name}>
                <h2 className="text-xl tracking-tight text-gray-900 truncate">
                  {name}
                </h2>
              </Tooltip>

              <Tooltip label={`${role} • ${event}`}>
                <p className="text-sm text-gray-500 truncate">
                  {role} • {event}
                </p>
              </Tooltip>
            </div>
          </div>

          {/* ✅ Status Badge in Header - Clean Placement */}
          <div className="flex items-start gap-3 shrink-0">
            {status && <StatusBadge status={status} />}
            
            {/* Contact Icons */}
            <div className="flex flex-col gap-y-2">
              <Tooltip label={phone}>
                <a href={`tel:${phone}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                  <PhoneOutgoing size={16} className="shrink-0" />
                </a>
              </Tooltip>
              <Tooltip label={email}>
                <a href={`mailto:${email}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                  <Mail size={16} className="shrink-0" />
                </a>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-row items-center gap-x-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin size={14} className="shrink-0 text-brand" />
            <Tooltip label={location}>
              <span className="truncate block min-w-0">{location}</span>
            </Tooltip>
          </div>

          {/* Vertical divider */}
          <div className="h-4 w-px bg-gray-300"></div>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 size={14} className="shrink-0 text-brand" />
            <Tooltip label={org}>
              <span className="truncate block min-w-0">{org}</span>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Footer - Date and Action Buttons */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/30">
        {assignedOn ? (
          <div className="text-xs text-gray-500">Assigned on : {assignedOn}</div>
        ) : (
          <div className="text-xs text-gray-500">Added on : {date}</div>
        )}
        
        <div className="flex items-center gap-2">
          {editOrAdd && (
            <Tooltip label={editOrAdd}>
              <button
                onClick={onType}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                {icons[editOrAdd] || null}
              </button>
            </Tooltip>
          )}

          <Tooltip label="Delete">
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
