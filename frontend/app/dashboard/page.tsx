'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import type { Booking } from '@/lib/types';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Booking[]>('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => setError('Impossible de charger vos réservations'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-bold text-slate-900">Historique de mes réservations</h1>
        <p className="mt-1 text-sm text-slate-500">
          {bookings.length} réservation{bookings.length > 1 ? 's' : ''} au total
        </p>

        {loading && <p className="mt-6 text-sm text-slate-500">Chargement…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aucune réservation pour le moment. Rendez-vous dans la rubrique « Salles &amp;
            Réservation ».
          </div>
        )}

        {bookings.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Salle</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Début</th>
                  <th className="px-4 py-3 font-medium">Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{b.room_name}</td>
                    <td className="px-4 py-3 text-slate-600">{b.date}</td>
                    <td className="px-4 py-3 text-slate-600">{b.heure_debut}</td>
                    <td className="px-4 py-3 text-slate-600">{b.heure_fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
