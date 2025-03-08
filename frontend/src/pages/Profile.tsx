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
<<<<<<< HEAD
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile</h3>
            <div className="mb-4 flex justify-center">
              <button
                onClick={() => setTab('info')}
                className={`form-button form-button--tab ${tab === 'info' ? '' : 'inactive'}`}
              >
                Your Profile
              </button>
              <button
                onClick={() => setTab('activities')}
                className={`form-button form-button--tab ${tab === 'activities' ? '' : 'inactive'}`}
              >
                Activities
              </button>
            </div>
            {tab === 'info' ? (
              <div className="bg-white p-4 rounded shadow space-y-2">
                <p className="text-lg"><strong>Username:</strong> {user?.username}</p>
                <p className="text-lg"><strong>Email:</strong> {user?.email}</p>
                <p className="text-lg"><strong>Name:</strong> {user?.name}</p>
                <p className="text-lg"><strong>Family Name:</strong> {user?.family_name}</p>
                {user?.phone_number && <p className="text-lg"><strong>Phone:</strong> {user?.phone_number}</p>}
                {user?.profession && <p className="text-lg"><strong>Profession:</strong> {user?.profession}</p>}
                {user?.age && <p className="text-lg"><strong>Age:</strong> {user?.age}</p>}
              </div>
            ) : (
              <div className="bg-white p-4 rounded shadow space-y-4">
                <h2 className="text-xl mb-2">Your Activities</h2>
                <h3 className="form-label">Likes</h3>
                <ul className="list-disc pl-5">
                  {activities?.likes.map((like: any) => (
                    <li key={like.recipe_id} className="text-base">
                      Recipe ID: {like.recipe_id} - {like.is_like ? 'Liked' : 'Disliked'}
                    </li>
                  ))}
                </ul>
                <h3 className="form-label mt-4">Comments</h3>
                <ul className="list-disc pl-5">
                  {activities?.comments.map((comment: any) => (
                    <li key={comment.created_at} className="text-base">
                      Recipe ID: {comment.recipe_id} - "{comment.text}" - {new Date(comment.created_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
                <h3 className="form-label mt-4">Recipes Added</h3>
                <ul className="list-disc pl-5">
                  {activities?.recipes.map((recipe: any) => (
                    <li key={recipe.id} className="text-base">{recipe.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
=======
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Profile</h3>
      <div className="mb-4">
        <button
          onClick={() => setTab('info')}
          style={{ marginLeft: '8px', marginRight: '8px' }}
          className={`p-2 ${tab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded mr-2 ml-2`}
        >
          Your-Profile
        </button>
        <button
          onClick={() => setTab('activities')}
          style={{ marginLeft: '8px', marginRight: '8px' }}
          className={`p-2 ${tab === 'activities' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded ml-2 mr-2`}
        >
          Activities
        </button>
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
      </div>
    </section>
  );
}

export default Profile;