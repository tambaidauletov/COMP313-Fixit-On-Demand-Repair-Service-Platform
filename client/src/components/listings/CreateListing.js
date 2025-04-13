import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listings } from '../../services/api';

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    deadline: '',
    images: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({...formData, images: files});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(image => {
            formDataToSend.append('images', image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await listings.create(formDataToSend);
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="create-listing">
      <h2>Create New Listing</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
        <input
          type="number"
          placeholder="Budget"
          value={formData.budget}
          onChange={(e) => setFormData({...formData, budget: e.target.value})}
        />
        <input
          type="date"
          placeholder="Deadline"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
};

export default CreateListing; 