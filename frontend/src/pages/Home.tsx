import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const commentSchema = z.object({ text: z.string().min(1, 'Required') });
type CommentForm = z.infer<typeof commentSchema>;

interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: string;
  instructions: string;
  dietary_info?: string;
  prep_time?: number;
  cook_time?: number;
  images?: string[];
  created_at?: string;
}

const fetchRecipes = async (): Promise<Recipe[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  return res.json();
};

const fetchComments = async (recipeId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/comments/${recipeId}`);
  return res.json();
};

const fetchSuggestedRecipes = async (searchQuery?: string): Promise<Recipe[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/suggested-recipes${searchQuery ? `?search=${searchQuery}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  return res.json();
};

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const { data: likeStatus } = useQuery({
    queryKey: ['likes', recipe.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/likes/${recipe.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: likeCounts } = useQuery({
    queryKey: ['likeCounts', recipe.id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/likes/count/${recipe.id}`);
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (is_like: boolean) =>
      fetch(`${API_BASE_URL}/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipe_id: recipe.id, is_like }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['likes', recipe.id]);
      queryClient.invalidateQueries(['likeCounts', recipe.id]);
    },
  });

  const { register, handleSubmit, reset } = useForm<CommentForm>({ resolver: zodResolver(commentSchema) });
  const commentMutation = useMutation({
    mutationFn: (data: CommentForm & { recipe_id: number }) =>
      fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', recipe.id]);
      reset();
    },
  });

  const onSubmit = (data: CommentForm) => commentMutation.mutate({ ...data, recipe_id: recipe.id });

  return (
    <div
      className="card"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
        margin: 'auto',
        background: '#a3a36d',
      }}
    >
      <h2 className="text-xl">{recipe.name}</h2>
      <p>{recipe.category}</p>
      <p>{recipe.ingredients}</p>
      {recipe.images && (
        <div className="mt-2 flex space-x-2">
          {recipe.images.map((img, index) => (
            <img
              key={index}
              src={`${API_BASE_URL}${img}`}
              alt={recipe.name}
              className="object-cover rounded"
              style={{ height: '300px', width: '350px', borderRadius: '15px' }}
            />
          ))}
        </div>
      )}
      {token && (
        <div className="mt-2">
          <button
            onClick={() => mutation.mutate(true)}
            style={{ marginLeft: '8px', marginRight: '18px' }}
            className={`p-1 ${likeStatus?.liked === true ? 'bg-green-500' : 'bg-gray-300'} text-white rounded mr-2`}
          >
            <FontAwesomeIcon icon={faThumbsUp} /> Like ({likeCounts?.likes || 0})
          </button>
          <button
            onClick={() => mutation.mutate(false)}
            className={`p-1 ${likeStatus?.liked === false ? 'bg-red-500' : 'bg-gray-300'} text-white rounded`}
          >
            <FontAwesomeIcon icon={faThumbsDown} /> Dislike ({likeCounts?.dislikes || 0})
          </button>
        </div>
      )}
      <Comments recipeId={recipe.id} />
      {token && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <textarea {...register('text')} placeholder="Add a comment" className="w-full p-2 border rounded" />
          <button type="submit" style={{ marginLeft: '8px', marginRight: '18px' }} className="p-2 bg-blue-500 text-white rounded">
            <FontAwesomeIcon icon={faComment} /> Comment
          </button>
        </form>
      )}
    </div>
  );
}

function Comments({ recipeId }: { recipeId: number }) {
  const { data: comments } = useQuery({
    queryKey: ['comments', recipeId],
    queryFn: () => fetchComments(recipeId),
  });
  return (
    <ul className="mt-2">
      {comments?.map((comment: any) => (
        <li key={comment.id} className="text-sm">
          {comment.text} - {new Date(comment.created_at).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });
  const { data: suggestedRecipes, isLoading: suggestedLoading, error: suggestedError } = useQuery({
    queryKey: ['suggestedRecipes'],
    queryFn: () => fetchSuggestedRecipes(searchQuery),
    enabled: !!token,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    if (error.message === 'Unauthorized') {
      localStorage.removeItem('token');
      navigate('/login');
    }
    return <div>{error.message}</div>;
  }

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Anytime'];

  const filteredRecipes = recipes?.filter(recipe =>
    (recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedCategory || recipe.category === selectedCategory)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Zero Waste Chef</h1>
      <input
        type="text"
        placeholder="Type an ingredient to find similar suggested recipes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-1/2 p-2 border rounded mb-4"
        style={{ width: '50%', padding: '10px', fontSize: '14px' }}
      />
          <div className="button-container">
  <button
    onClick={() => setSelectedCategory(undefined)}
    className={`category-button ${selectedCategory === undefined ? 'active' : ''}`}
  >
    All
  </button>
  {categories.map(category => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={`category-button ${selectedCategory === category ? 'active' : ''}`}
    >
      {category}
    </button>
  ))}
</div>


      {token && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Suggested Recipes</h2>
          {suggestedLoading ? (
            <p>Loading suggestions...</p>
          ) : suggestedError ? (
            <p>{suggestedError.message}</p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'space-between',
              }}
            >
              {suggestedRecipes?.map((recipe: Recipe) => (
                <div key={recipe.id} style={{ flexBasis: 'calc(50% - 10px)' }}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'space-between',
        }}
      >
        {filteredRecipes?.map((recipe: Recipe) => (
          <div key={recipe.id} style={{ flexBasis: 'calc(50% - 10px)' }}>
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
