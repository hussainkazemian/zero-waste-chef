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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RecipeForm>({
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

  const resetForm = () => {
    reset();
    setPreviews([]);
  };

  return (
<<<<<<< HEAD
    <section className="form-container-profile">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Add Recipe</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
=======
    <section>
      <div className="container mx-auto mt-8 mb-8 px-4">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Add Recipe</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="my-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                    Name:
                  </label>
                  <input
                    {...register('name')}
                    id="name"
                    placeholder="Enter recipe name"
<<<<<<< HEAD
                    className="form-input"
                  />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
=======
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="category" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                    Category:
                  </label>
                  <select
                    {...register('category')}
                    id="category"
<<<<<<< HEAD
                    className="form-input"
=======
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                    <option value="Anytime">Anytime</option>
                  </select>
<<<<<<< HEAD
                  {errors.category && <p className="form-error">{errors.category.message}</p>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ingredients" className="form-label">
=======
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="ingredients" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Ingredients:
                </label>
                <textarea
                  {...register('ingredients')}
                  id="ingredients"
                  placeholder="Enter ingredients"
<<<<<<< HEAD
                  className="form-input"
                  rows={4}
                />
                {errors.ingredients && <p className="form-error">{errors.ingredients.message}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="instructions" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="instructions" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Instructions:
                </label>
                <textarea
                  {...register('instructions')}
                  id="instructions"
                  placeholder="Enter instructions"
<<<<<<< HEAD
                  className="form-input"
                  rows={4}
                />
                {errors.instructions && <p className="form-error">{errors.instructions.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="dietary_info" className="form-label">
=======
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                {errors.instructions && <p className="text-red-500 text-sm mt-1">{errors.instructions.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="dietary_info" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                    Dietary Info:
                  </label>
                  <input
                    {...register('dietary_info')}
                    id="dietary_info"
                    placeholder="Enter dietary info (optional)"
<<<<<<< HEAD
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prep_time" className="form-label">
=======
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="prep_time" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                    Prep Time:
                  </label>
                  <input
                    type="number"
                    {...register('prep_time', { valueAsNumber: true })}
                    id="prep_time"
                    placeholder="Minutes (optional)"
<<<<<<< HEAD
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cook_time" className="form-label">
=======
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="cook_time" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                    Cook Time:
                  </label>
                  <input
                    type="number"
                    {...register('cook_time', { valueAsNumber: true })}
                    id="cook_time"
                    placeholder="Minutes (optional)"
<<<<<<< HEAD
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="images" className="form-label">
=======
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="images" className="block text-gray-700 font-medium mb-1">
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                  Images:
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  {...register('images')}
                  id="images"
                  onChange={handleFileChange}
<<<<<<< HEAD
                  className="form-input"
=======
                  className="w-full p-2 border border-gray-300 rounded-md"
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                />
                {previews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
<<<<<<< HEAD
              <div className="form-group">
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ marginLeft: '18px', marginRight: '8px' }}
                  className="form-button bg-gray-500 hover:bg-gray-700 focus:ring-gray-500"
=======
              <div>
              <button
                  type="button"
                  onClick={resetForm}
                  style={{ marginLeft: '18px', marginRight: '8px' }}

                  className="w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
                >
                  Reset
                </button>
              </div>
<<<<<<< HEAD
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-10 justify-center">
                <button
                  type="submit"
                  className="form-button bg-a3a36d hover:bg-8a8b5c focus:ring-a3a36d"
                >
                  Add Recipe
                </button>
=======
              <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                 className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-10">
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Recipe
                </button>
                
>>>>>>> f4be7b6 (Add error boundary component, update database, and configure Tailwind CSS)
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddRecipe;