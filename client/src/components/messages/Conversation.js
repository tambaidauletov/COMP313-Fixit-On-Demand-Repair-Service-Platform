import React, { useState, useEffect } from 'react';
import { messages } from '../../services/api';

const Conversation = ({ conversationId }) => {
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const response = await messages.getMessages(conversationId);
      setMessageList(response.data);
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  const handleSend = async () => {
    try {
      await messages.send({
        conversationId,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleReport = async (messageId) => {
    try {
      await messages.report(messageId, 'inappropriate content');
      alert('Message reported successfully');
    } catch (err) {
      setError('Failed to report message');
    }
  };

  return (
    <div className="conversation">
      {error && <div className="error-message">{error}</div>}
      <div className="message-list">
        {messageList.map(message => (
          <div key={message._id} className="message">
            <div className="message-content">{message.content}</div>
            <div className="message-actions">
              <button onClick={() => handleReport(message._id)}>Report</button>
            </div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Conversation; 