import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Anytime']),
  ingredients: z.string().min(1, 'Required'),
  instructions: z.string().min(1, 'Required'),
  dietary_info: z.string().nullable().optional(),
  prep_time: z.number().nullable().optional(),
  cook_time: z.number().nullable().optional(),
  images: z.any().optional(),
});

type RecipeForm = z.infer<typeof schema>;

function AddRecipe() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RecipeForm>({
    resolver: zodResolver(schema),
  });
  const [previews, setPreviews] = useState<string[]>([]);

  const onSubmit = async (data: RecipeForm) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && value) {
        Array.from(value as FileList).forEach((file) => formData.append('images', file));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      navigate('/');
    } else {
      alert('Failed to add recipe');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files)
        .filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))
        .map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add Recipe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register('name')} placeholder="Recipe Name" className="w-full p-2 border rounded" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <select {...register('category')} className="w-full p-2 border rounded">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
            <option value="Snack">Snack</option>
            <option value="Anytime">Anytime</option>
          </select>
          {errors.category && <p className="text-red-500">{errors.category.message}</p>}
        </div>
        <div>
          <textarea {...register('ingredients')} placeholder="Ingredients" className="w-full p-2 border rounded" />
          {errors.ingredients && <p className="text-red-500">{errors.ingredients.message}</p>}
        </div>
        <div>
          <textarea {...register('instructions')} placeholder="Instructions" className="w-full p-2 border rounded" />
          {errors.instructions && <p className="text-red-500">{errors.instructions.message}</p>}
        </div>
        <div>
          <input
            {...register('dietary_info')}
            placeholder="Dietary Info (optional)"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="number"
            {...register('prep_time', { valueAsNumber: true })}
            placeholder="Prep Time (minutes, optional)"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="number"
            {...register('cook_time', { valueAsNumber: true })}
            placeholder="Cook Time (minutes, optional)"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            {...register('images')}
            onChange={handleFileChange}
            className="w-full p-2"
          />
          {previews.length > 0 && (
            <div className="mt-2 flex space-x-2">
              {previews.map((preview, index) => (
                <img key={index} src={preview} alt="Preview" className="w-24 h-24 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Add Recipe
        </button>
      </form>
    </div>
  );
}

export default AddRecipe;