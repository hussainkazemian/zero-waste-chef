import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
}

const fetchRecipes = async (): Promise<Recipe[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const fetchComments = async (recipeId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/comments/${recipeId}`);
  return res.json();
};

function RecipeCard({ recipe }: { recipe: Recipe & { images?: string[] } }) {
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
      queryClient.invalidateQueries(['likeCounts', recipe.id]); // Refresh counts
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
    <div className="card">
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
              className="w-24 h-24 object-cover rounded"
              
            />
          ))}
        </div>
      )}
      {token && (
        <div className="mt-2">
          <button
            onClick={() => mutation.mutate(true)}
            className={`p-1 ${likeStatus?.liked === true ? 'bg-green-500' : 'bg-gray-300'} text-white rounded mr-2`}
          >
            Like ({likeCounts?.likes || 0})
          </button>
          <button
            onClick={() => mutation.mutate(false)}
            className={`p-1 ${likeStatus?.liked === false ? 'bg-red-500' : 'bg-gray-300'} text-white rounded`}
          >
            Dislike ({likeCounts?.dislikes || 0})
          </button>
        </div>
      )}
      <Comments recipeId={recipe.id} />
      {token && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <textarea {...register('text')} placeholder="Add a comment" className="w-full p-2 border rounded" />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">Comment</button>
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
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });
  const { data: suggestedRecipes, isLoading: suggestedLoading } = useQuery({
    queryKey: ['suggestedRecipes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/suggested-recipes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Zero Waste Chef</h1>
      {token && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Suggested Recipes</h2>
          {suggestedLoading ? (
            <p>Loading suggestions...</p>
          ) : (
            suggestedRecipes?.map((recipe: Recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
          )}
        </div>
      )}
      {recipes?.map((recipe: Recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  );
}

export default Home;