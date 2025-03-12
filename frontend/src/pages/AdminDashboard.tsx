import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the structure of a User object
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
// Define the structure of activitiesData
interface ActivityData {
  likes: { user_id: number; recipe_id: number; is_like: boolean }[];
  comments: { user_id: number; recipe_id: number; text: string; created_at: string }[];
  recipes: { user_id: number; id: number; name: string }[];
}
//function to fetch all users
const fetchUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};
//function to fetch all activities
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

  // Fetch the current user's data to check if they are an admin
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

    // Fetch all users if the current user is an admin
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!token && userData?.role === 'admin',
  });

    // Fetch all activities if the current user is an admin
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    enabled: !!token && userData?.role === 'admin',
  });

    // Mutation to delete a user
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
    },
  });

        // Mutation to delete a recipe
  const deleteRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });

    // Redirect to login if not an admin
  if (!token || userError || userData?.role !== 'admin') {
    navigate('/login');
    return null;
  }

    // Display loading state while fetching data
  if (usersLoading || activitiesLoading) return <div>Loading...</div>;

    // Display error if fetching users fails
  if (usersError) return <div>Error: {(usersError as Error).message}</div>;

    // Display error if fetching activities fails
  if (activitiesError) return <div>Error: {(activitiesError as Error).message}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Users Section */}
      <section className="mb-8">
        <h2>Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.name} {user.family_name}</td>
                <td>
                  <button
                    onClick={() => deleteUserMutation.mutate(user.id)}
                    className="action-button"
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
        <h2>Recipes</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>User ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities?.recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.id}</td>
                <td>{recipe.name}</td>
                <td>{recipe.user_id}</td>
                <td>
                  <button
                    onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                    className="action-button"
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
        <h2>All Activities</h2>
        <div className="activities-list">
          <h3>Likes</h3>
          <ul>
            {activities?.likes.map((like, index) => (
              <li key={index}>
                User {like.user_id} {like.is_like ? 'liked' : 'disliked'} Recipe {like.recipe_id}
              </li>
            ))}
          </ul>
          <h3>Comments</h3>
          <ul>
            {activities?.comments.map((comment) => (
              <li key={comment.created_at + comment.recipe_id}>
                User {comment.user_id} commented on Recipe {comment.recipe_id}: "{comment.text}" ({new Date(comment.created_at).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
  
};

export default AdminDashboard;