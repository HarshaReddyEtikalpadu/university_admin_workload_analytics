import { useState } from 'react';
import { 
  Clock, 
  Calendar,
  User,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

const TaskDetailsPanel = ({ task, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  // Determine status color
  const getStatusColor = (status) => {
    const statusMap = {
      completed: 'text-green-500',
      pending: 'text-yellow-500',
      overdue: 'text-red-500',
      'in-progress': 'text-blue-500'
    };
    return statusMap[status.toLowerCase()] || 'text-gray-500';
  };

  // Format date with time
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{task.title || 'Task Details'}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={'pb-4 font-medium ' + 
                  (activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700')
                }
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={'pb-4 font-medium ' + 
                  (activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700')
                }
              >
                History
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'details' ? (
              <>
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)} bg-opacity-10`}>
                    {task.status === 'completed' && <CheckCircle size={16} className="mr-1" />}
                    {task.status === 'pending' && <AlertCircle size={16} className="mr-1" />}
                    {task.status === 'overdue' && <AlertTriangle size={16} className="mr-1" />}
                    {task.status}
                  </span>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={18} />
                    <span>Due: {formatDateTime(task.dueDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={18} />
                    <span>Created: {formatDateTime(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User size={18} />
                    <span>Assignee: {task.assignee}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Tag size={18} />
                    <span>Type: {task.type}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                {/* Additional Details */}
                {task.additionalDetails && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Additional Details</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {task.additionalDetails}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Task History/Timeline */}
                {task.history?.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="mt-1 bg-blue-100 rounded-full p-1">
                        <MessageSquare size={16} className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{event.user}</span>
                        <span className="text-gray-500"> {event.action}</span>
                      </div>
                      <p className="text-sm text-gray-600">{event.details}</p>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                {(!task.history || task.history.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No history available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          {task.status !== 'completed' && (
            <button
              onClick={() => {/* Handle update status */}}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPanel;