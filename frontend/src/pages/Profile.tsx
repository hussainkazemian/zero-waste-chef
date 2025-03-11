import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

function Profile() {
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState<'info' | 'activities'>('info');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/user/activities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  if (userLoading || activitiesLoading) return <div>Loading...</div>;

  return (
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card profile-section">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile</h3>
            <div className="tab-buttons">
              <button
                onClick={() => setTab('info')}
                className={`tab-button ${tab === 'info' ? 'active' : ''}`}
              >
                Your Profile
              </button>
              <button
                onClick={() => setTab('activities')}
                className={`tab-button ${tab === 'activities' ? 'active' : ''}`}
              >
                Activities
              </button>
            </div>
            {tab === 'info' ? (
              <div className="content-section">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Family Name:</strong> {user?.family_name}</p>
                {user?.phone_number && <p><strong>Phone:</strong> {user?.phone_number}</p>}
                {user?.profession && <p><strong>Profession:</strong> {user?.profession}</p>}
                {user?.age && <p><strong>Age:</strong> {user?.age}</p>}
              </div>
            ) : (
              <div className="content-section">
                <h2>Your Activities</h2>
                <h3>Likes</h3>
                <ul>
                  {activities?.likes.map((like: any) => (
                    <li key={like.recipe_id}>
                      Recipe ID: {like.recipe_id} - {like.is_like ? 'Liked' : 'Disliked'}
                    </li>
                  ))}
                </ul>
                <h3>Comments</h3>
                <ul>
                  {activities?.comments.map((comment: any) => (
                    <li key={comment.created_at}>
                      Recipe ID: {comment.recipe_id} - "{comment.text}" - {new Date(comment.created_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
                <h3>Recipes Added</h3>
                <ul>
                  {activities?.recipes.map((recipe: any) => (
                    <li key={recipe.id}>{recipe.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
  
}

export default Profile;