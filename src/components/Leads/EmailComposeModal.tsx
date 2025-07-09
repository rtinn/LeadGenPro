import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Lead } from '../../types';

interface EmailComposeModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; message: string }) => void;
}

const EmailComposeModal: React.FC<EmailComposeModalProps> = ({ 
  lead, 
  isOpen, 
  onClose, 
  onSend 
}) => {
  const [subject, setSubject] = useState(`Partnership Opportunity - ${lead.company}`);
  const [message, setMessage] = useState(`Hi ${lead.name.split(' ')[0]},

I hope this email finds you well. I came across your profile and was impressed by your work at ${lead.company}.

I'd love to discuss how our solutions could benefit your team. Would you be available for a brief 15-minute call next week?

Best regards,
John Smith`);

  if (!isOpen) return null;

  const handleSend = () => {
    onSend({
      to: lead.email,
      subject,
      message,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              To:
            </label>
            <input
              id="to"
              type="email"
              value={lead.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject:
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailComposeModal;