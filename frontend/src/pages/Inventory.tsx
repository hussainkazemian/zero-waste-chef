import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  expiration_date: z.string().optional(),
});

type IngredientForm = z.infer<typeof schema>;

function Inventory() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IngredientForm>({
    resolver: zodResolver(schema),
  });

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IngredientForm) => {
      const token = localStorage.getItem('token');
      return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ingredients']);
      reset();
    },
  });

  const onSubmit = (data: IngredientForm) => mutation.mutate(data);

  const checkExpiring = (date?: string) => {
    if (!date) return false;
    const expires = new Date(date);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expires < weekFromNow;
  };

  if (isLoading) return (
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <p className="text-gray-700 text-center">Loading...</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section className="form-container">
      <div className="container mx-auto px-4">
        <div className="form-card">
          <div className="p-6">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Inventory</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Ingredient Name:
                </label>
                <input
                  {...register('name')}
                  id="name"
                  placeholder="Enter ingredient name"
                  className="form-input"
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="expiration_date" className="form-label">
                  Expiration Date (optional):
                </label>
                <input
                  {...register('expiration_date')}
                  id="expiration_date"
                  type="date"
                  className="form-input"
                />
                {errors.expiration_date && (
                  <p className="form-error">{errors.expiration_date.message}</p>
                )}
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="form-button"
                >
                  Add
                </button>
              </div>
            </form>
            <div className="mt-6">
              <label className="form-label">Current Inventory:</label>
              <ul className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 space-y-1">
                {ingredients?.length > 0 ? (
                  ingredients.map((item: any) => (
                    <li
                      key={item.id}
                      className={checkExpiring(item.expiration_date) ? 'text-red-500' : 'text-gray-700'}
                    >
                      {item.name} - Expires: {item.expiration_date || 'N/A'}
                      {checkExpiring(item.expiration_date) && ' (Expiring Soon!)'}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No ingredients in inventory yet</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Inventory;