import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';

const ModeratorManagement = () => {
  const [moderators, setModerators] = useState([]);
  const [newModerator, setNewModerator] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadModerators();
  }, []);

  const loadModerators = async () => {
    try {
      const response = await admin.getModeratorList();
      setModerators(response.data);
    } catch (err) {
      setError('Failed to load moderators');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await admin.createModerator(newModerator);
      setNewModerator({ name: '', email: '', password: '' });
      loadModerators();
    } catch (err) {
      setError('Failed to create moderator');
    }
  };

  const handleRemove = async (id) => {
    try {
      await admin.removeModerator(id);
      loadModerators();
    } catch (err) {
      setError('Failed to remove moderator');
    }
  };

  return (
    <div className="moderator-management">
      <h2>Manage Moderators</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="create-moderator">
        <h3>Create New Moderator</h3>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Name"
            value={newModerator.name}
            onChange={(e) => setNewModerator({...newModerator, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            value={newModerator.email}
            onChange={(e) => setNewModerator({...newModerator, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={newModerator.password}
            onChange={(e) => setNewModerator({...newModerator, password: e.target.value})}
          />
          <button type="submit">Create Moderator</button>
        </form>
      </div>

      <div className="moderator-list">
        <h3>Current Moderators</h3>
        {moderators.map(moderator => (
          <div key={moderator._id} className="moderator-item">
            <span>{moderator.name} ({moderator.email})</span>
            <button onClick={() => handleRemove(moderator._id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeratorManagement; 