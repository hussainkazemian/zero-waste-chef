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
    <section>
      <div className="container mx-auto mt-8 mb-8 px-4">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <p className="text-gray-700 text-center">Loading...</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section>
      <div className="container mx-auto mt-8 mb-8 px-4">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Inventory</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="my-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                  Ingredient Name:
                </label>
                <input
                  {...register('name')}
                  id="name"
                  placeholder="Enter ingredient name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="expiration_date" className="block text-gray-700 font-medium mb-1">
                  Expiration Date (optional):
                </label>
                <input
                  {...register('expiration_date')}
                  id="expiration_date"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.expiration_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiration_date.message}</p>
                )}
              </div>

              <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </form>

            <div className="mt-6">
              <label className="block text-gray-700 font-medium mb-1">Current Inventory:</label>
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