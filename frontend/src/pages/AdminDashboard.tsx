import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  family_name: string;
  profession?: string;
  age?: number;
  role: string;
}

interface Recipe {
  id: number;
  user_id: number;
  name: string;
}

interface ActivityData {
  likes: { user_id: number; recipe_id: number; is_like: boolean }[];
  comments: { user_id: number; recipe_id: number; text: string; created_at: string }[];
  recipes: { user_id: number; id: number; name: string }[];
}

const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const fetchActivities = async (): Promise<ActivityData> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/all-activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // Check if user is admin
  const { data: userData, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
  });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!token && userData?.role === 'admin',
  });

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    enabled: !!token && userData?.role === 'admin',
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['activities']);
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => queryClient.invalidateQueries(['activities']),
  });

  if (!token || userError || userData?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  if (usersLoading || activitiesLoading) return <div>Loading...</div>;
  if (usersError) return <div>Error: {(usersError as Error).message}</div>;
  if (activitiesError) return <div>Error: {(activitiesError as Error).message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Users Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Users</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.name} {user.family_name}</td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteUserMutation.mutate(user.id)}
                    className="bg-red-500 text-white p-1 rounded"
                    disabled={user.role === 'admin'} // Prevent deleting admin
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recipes Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Recipes</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">User ID</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities?.recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td className="border p-2">{recipe.id}</td>
                <td className="border p-2">{recipe.name}</td>
                <td className="border p-2">{recipe.user_id}</td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                    className="bg-red-500 text-white p-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Activities Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">All Activities</h2>
        <h3 className="text-xl mb-1">Likes</h3>
        <ul>
          {activities?.likes.map((like, index) => (
            <li key={index}>
              User {like.user_id} {like.is_like ? 'liked' : 'disliked'} Recipe {like.recipe_id}
            </li>
          ))}
        </ul>
        <h3 className="text-xl mb-1 mt-2">Comments</h3>
        <ul>
          {activities?.comments.map((comment) => (
            <li key={comment.created_at + comment.recipe_id}>
              User {comment.user_id} commented on Recipe {comment.recipe_id}: "{comment.text}" ({new Date(comment.created_at).toLocaleString()})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;