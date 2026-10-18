'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import RoomCard from '@/components/RoomCard';
import BookingForm from '@/components/BookingForm';
import { api } from '@/lib/api';
import type { Room } from '@/lib/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Room[]>('/rooms')
      .then(({ data }) => setRooms(data))
      .catch(() => setError('Impossible de charger les salles'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900">Salles disponibles</h1>
        <p className="mt-1 text-sm text-slate-500">
          Consultez les salles et réservez un créneau
        </p>

        {loading && <p className="mt-6 text-sm text-slate-500">Chargement…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <section>
              <div className="grid gap-3">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </section>

            <section>
              {rooms.length > 0 ? (
                <BookingForm rooms={rooms} />
              ) : (
                <p className="text-sm text-slate-500">Aucune salle disponible.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
