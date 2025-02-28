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
  const { register, handleSubmit, reset } = useForm<IngredientForm>({ resolver: zodResolver(schema) });

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-4">
        <input {...register('name')} placeholder="Ingredient Name" className="p-2 border rounded" />
        <input {...register('expiration_date')} type="date" className="p-2 border rounded" />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Add</button>
      </form>
      <ul>
        {ingredients?.map((item: any) => (
          <li key={item.id} className={checkExpiring(item.expiration_date) ? 'text-red-500' : ''}>
            {item.name} - Expires: {item.expiration_date || 'N/A'}
            {checkExpiring(item.expiration_date) && ' (Expiring Soon!)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inventory;