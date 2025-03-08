import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
<<<<<<< HEAD
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faEdit } from '@fortawesome/free-solid-svg-icons';
=======
import React from 'react';
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
=======

>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const commentSchema = z.object({ text: z.string().min(1, 'Required') });
type CommentForm = z.infer<typeof commentSchema>;

const recipeSchema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Anytime']),
  ingredients: z.string().min(1, 'Required'),
  instructions: z.string().min(1, 'Required'),
  dietary_info: z.string().nullable().optional(),
  prep_time: z.number().nullable().optional(),
  cook_time: z.number().nullable().optional(),
  images: z.any().optional(),
});
type RecipeForm = z.infer<typeof recipeSchema>;

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
<<<<<<< HEAD
  created_at?: string;
=======
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
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

<<<<<<< HEAD
const fetchSuggestedRecipes = async (searchQuery?: string): Promise<Recipe[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/suggested-recipes${searchQuery ? `?search=${searchQuery}` : ''}`, {
=======
const fetchSuggestedRecipes = async (): Promise<Recipe[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/suggested-recipes`, {
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previews, setPreviews] = useState<string[]>(recipe.images || []);

  // Check if user is admin
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user`, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });
  const isAdmin = userData?.role === 'admin';

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

  const likeMutation = useMutation({
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentForm>({ resolver: zodResolver(commentSchema) });
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

  const { register: registerRecipe, handleSubmit: handleRecipeSubmit, formState: { errors: recipeErrors }, reset: resetRecipe } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: recipe.name,
      category: recipe.category as any,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      dietary_info: recipe.dietary_info || '',
      prep_time: recipe.prep_time || undefined,
      cook_time: recipe.cook_time || undefined,
    },
  });

  const onCommentSubmit = (data: CommentForm) => commentMutation.mutate({ ...data, recipe_id: recipe.id });

  const onRecipeSubmit = async (data: RecipeForm) => {
    if (!isAdmin) return;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && value) {
        Array.from(value as FileList).forEach((file) => formData.append('images', file));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const res = await fetch(`${API_BASE_URL}/api/recipes/${recipe.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      queryClient.invalidateQueries(['recipes']);
      queryClient.invalidateQueries(['suggestedRecipes']);
      setIsEditing(false);
      setIsExpanded(true); // Keep expanded after save
    } else {
      alert('Failed to update recipe');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files)
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

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
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h2 className="text-xl">{recipe.name}</h2>
      <p>{recipe.category}</p>
      {recipe.images && !isExpanded && (
        <div className="mt-2 flex space-x-2">
          {recipe.images.map((img, index) => (
            <img
              key={index}
              src={`${API_BASE_URL}${img}`}
              alt={recipe.name}
<<<<<<< HEAD
              className="object-cover rounded"
              style={{ height: '300px', width: '350px', borderRadius: '15px' }}
=======
              className="w-24 h-24 object-cover rounded"
<<<<<<< HEAD
              
>>>>>>> 8d74306 (Refactor recipe routes and update database dependencies; clean up login form)
=======
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
            />
          ))}
        </div>
      )}
      {token && !isExpanded && (
        <div className="mt-2">
          <button
<<<<<<< HEAD
            onClick={(e) => { e.stopPropagation(); likeMutation.mutate(true); }}
            style={{ marginLeft: '8px', marginRight: '18px' }}
=======
            onClick={() => mutation.mutate(true)}
            style={{ marginLeft: '8px', marginRight: '18px' }}

>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
            className={`p-1 ${likeStatus?.liked === true ? 'bg-green-500' : 'bg-gray-300'} text-white rounded mr-2`}
          >
            <FontAwesomeIcon icon={faThumbsUp} /> Like ({likeCounts?.likes || 0})
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); likeMutation.mutate(false); }}
            className={`p-1 ${likeStatus?.liked === false ? 'bg-red-500' : 'bg-gray-300'} text-white rounded`}
          >
            <FontAwesomeIcon icon={faThumbsDown} /> Dislike ({likeCounts?.dislikes || 0})
          </button>
        </div>
      )}
<<<<<<< HEAD

      {isExpanded && (
        <div onClick={(e) => e.stopPropagation()} className="p-4 bg-white rounded-lg mt-2">
          <h3 className="text-lg font-bold">Recipe Details</h3>
          <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
          <p><strong>Instructions:</strong> {recipe.instructions}</p>
          {recipe.dietary_info && <p><strong>Dietary Info:</strong> {recipe.dietary_info}</p>}
          {recipe.prep_time && <p><strong>Prep Time:</strong> {recipe.prep_time} minutes</p>}
          {recipe.cook_time && <p><strong>Cook Time:</strong> {recipe.cook_time} minutes</p>}
          {recipe.images && (
            <div className="mt-2 flex space-x-2">
              {recipe.images.map((img, index) => (
                <img
                  key={index}
                  src={`${API_BASE_URL}${img}`}
                  alt={recipe.name}
                  className="object-cover rounded"
                  style={{ height: '150px', width: '150px', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </button>
          )}

          {/* Editable Form (Admin Only, when editing) */}
          {isAdmin && isEditing && (
            <form onSubmit={handleRecipeSubmit(onRecipeSubmit)} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Name:</label>
                  <input
                    {...registerRecipe('name')}
                    className="w-full p-2 border rounded"
                  />
                  {recipeErrors.name && <p className="text-red-500 text-sm">{recipeErrors.name.message}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Category:</label>
                  <select
                    {...registerRecipe('category')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                  {recipeErrors.category && <p className="text-red-500 text-sm">{recipeErrors.category.message}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Ingredients:</label>
                <textarea
                  {...registerRecipe('ingredients')}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
                {recipeErrors.ingredients && <p className="text-red-500 text-sm">{recipeErrors.ingredients.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Instructions:</label>
                <textarea
                  {...registerRecipe('instructions')}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
                {recipeErrors.instructions && <p className="text-red-500 text-sm">{recipeErrors.instructions.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Dietary Info:</label>
                  <input
                    {...registerRecipe('dietary_info')}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Prep Time:</label>
                  <input
                    type="number"
                    {...registerRecipe('prep_time', { valueAsNumber: true })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Cook Time:</label>
                  <input
                    type="number"
                    {...registerRecipe('cook_time', { valueAsNumber: true })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Images:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  {...registerRecipe('images')}
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
                {previews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { resetRecipe(); setPreviews(recipe.images || []); setIsEditing(false); }}
                  className="p-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Comments */}
          <Comments recipeId={recipe.id} />
          {token && (
            <form onSubmit={handleSubmit(onCommentSubmit)} className="mt-2">
              <textarea {...register('text')} placeholder="Add a comment" className="w-full p-2 border rounded" />
              <button type="submit" style={{ marginLeft: '8px', marginRight: '18px' }} className="p-2 bg-blue-500 text-white rounded">
                <FontAwesomeIcon icon={faComment} /> Comment
              </button>
            </form>
          )}
        </div>
=======
      <Comments recipeId={recipe.id} />
      {token && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <textarea {...register('text')} placeholder="Add a comment" className="w-full p-2 border rounded" />
          
          <button type="submit"
          style={{ marginLeft: '8px', marginRight: '18px' }} className="p-2 bg-blue-500 text-white rounded">Comment</button>
        </form>
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
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
<<<<<<< HEAD
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
=======
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });
  const { data: suggestedRecipes, isLoading: suggestedLoading, error: suggestedError } = useQuery({
    queryKey: ['suggestedRecipes'],
<<<<<<< HEAD
    queryFn: () => fetchSuggestedRecipes(searchQuery),
=======
    queryFn: fetchSuggestedRecipes,
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)
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
<<<<<<< HEAD

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Anytime'];

  const filteredRecipes = recipes?.filter(recipe =>
    (recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedCategory || recipe.category === selectedCategory)
  );
=======
>>>>>>> 5633347 (Enhance recipe suggestions by including image paths and handle unauthorized access in the Home component)

  return (
    <div className="container mx-auto p-4">
      <input
        type="text"
        placeholder="Type an ingredient to find similar recipe suggestions...."
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