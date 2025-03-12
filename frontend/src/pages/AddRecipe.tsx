import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


// Define the schema for form validation using Zod
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

// Infer the type of the form data from the schema
type RecipeForm = z.infer<typeof schema>;

function AddRecipe() {
  const navigate = useNavigate(); // Hook to navigate to other pages
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RecipeForm>({
    resolver: zodResolver(schema), // Use Zod for form validation
  });
  const [previews, setPreviews] = useState<string[]>([]); // State to store image previews

    // Handle form submission
  const onSubmit = async (data: RecipeForm) => {
    const token = localStorage.getItem('token'); // Retrieve authentication token

    const formData = new FormData(); // Create a new FormData object

        // Append form data to FormData object
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images' && value) {
        Array.from(value as FileList).forEach((file) => formData.append('images', file));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

        // Send POST request to add the recipe
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      navigate('/'); // Navigate to the home page on success
    } else {
      alert('Failed to add recipe');  // Alert user if the request fails
    }
  };

  // Handle file input change to preview images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files)
        .filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))
        .map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);  // Update state with new previews
    }
  };

    // Reset the form and image previews
  const resetForm = () => {
    reset();
    setPreviews([]);
  };

  return (
    <section className="form-container-profile">
      <div className="container mx-auto px-4">
        <div className="form-card add-recipe-form">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Add Recipe</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input
                    {...register('name')}
                    id="name"
                    placeholder="Enter recipe name"
                    className="form-input"
                  />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category:
                  </label>
                  <select
                    {...register('category')}
                    id="category"
                    className="form-input"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                  {errors.category && <p className="form-error">{errors.category.message}</p>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ingredients" className="form-label">
                  Ingredients:
                </label>
                <textarea
                  {...register('ingredients')}
                  id="ingredients"
                  placeholder="Enter ingredients"
                  className="form-input"
                  rows={4}
                />
                {errors.ingredients && <p className="form-error">{errors.ingredients.message}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="instructions" className="form-label">
                  Instructions:
                </label>
                <textarea
                  {...register('instructions')}
                  id="instructions"
                  placeholder="Enter instructions"
                  className="form-input"
                  rows={4}
                />
                {errors.instructions && <p className="form-error">{errors.instructions.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="dietary_info" className="form-label">
                    Dietary Info:
                  </label>
                  <input
                    {...register('dietary_info')}
                    id="dietary_info"
                    placeholder="Enter dietary info (optional)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prep_time" className="form-label">
                    Prep Time:
                  </label>
                  <input
                    type="number"
                    {...register('prep_time', { valueAsNumber: true })}
                    id="prep_time"
                    placeholder="Minutes (optional)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cook_time" className="form-label">
                    Cook Time:
                  </label>
                  <input
                    type="number"
                    {...register('cook_time', { valueAsNumber: true })}
                    id="cook_time"
                    placeholder="Minutes (optional)"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="images" className="form-label">
                  Images:
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  {...register('images')}
                  id="images"
                  onChange={handleFileChange}
                  className="form-input"
                />
                {previews.length > 0 && (
                  <div className="preview-images">
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
              <div className="form-group">
                <button
                  type="button"
                  onClick={resetForm}
                  className="form-button bg-gray-500 hover:bg-gray-700 focus:ring-gray-500"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-10 justify-center">
                <button
                  type="submit"
                  className="form-button bg-a3a36d hover:bg-8a8b5c focus:ring-a3a36d"
                >
                  Add Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
  }

export default AddRecipe;