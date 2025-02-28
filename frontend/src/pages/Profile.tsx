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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <button
          onClick={() => setTab('info')}
          className={`p-2 ${tab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded mr-2`}
        >
          Info
        </button>
        <button
          onClick={() => setTab('activities')}
          className={`p-2 ${tab === 'activities' ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded`}
        >
          Activities
        </button>
      </div>
      {tab === 'info' ? (
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Family Name:</strong> {user?.family_name}</p>
          {user?.phone_number && <p><strong>Phone:</strong> {user?.phone_number}</p>}
          {user?.profession && <p><strong>Profession:</strong> {user?.profession}</p>}
          {user?.age && <p><strong>Age:</strong> {user?.age}</p>}
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2">Your Activities</h2>
          <h3 className="font-semibold">Likes</h3>
          <ul>
            {activities?.likes.map((like: any) => (
              <li key={like.recipe_id}>
                Recipe ID: {like.recipe_id} - {like.is_like ? 'Liked' : 'Disliked'}
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mt-4">Comments</h3>
          <ul>
            {activities?.comments.map((comment: any) => (
              <li key={comment.created_at}>
                Recipe ID: {comment.recipe_id} - "{comment.text}" - {new Date(comment.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mt-4">Recipes Added</h3>
          <ul>
            {activities?.recipes.map((recipe: any) => (
              <li key={recipe.id}>{recipe.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profile;