'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import type { Booking, Room } from '@/lib/types';

interface Props {
  rooms: Room[];
  onBooked?: (booking: Booking) => void;
}

export default function BookingForm({ rooms, onBooked }: Props) {
  const [roomId, setRoomId] = useState<number | ''>(rooms[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (roomId === '') return;
    setLoading(true);
    try {
      const { data } = await api.post<Booking>('/bookings', {
        room_id: roomId,
        date,
        heure_debut: heureDebut,
        heure_fin: heureFin,
      });
      setMessage({ type: 'ok', text: `Réservation confirmée : ${data.room_name} le ${data.date}` });
      onBooked?.(data);
    } catch (err: unknown) {
      const text =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erreur lors de la réservation';
      setMessage({ type: 'err', text });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">Nouvelle réservation</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Salle</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(Number(e.target.value))}
            className={inputClass}
            required
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.capacity} places)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Heure de début</label>
          <input
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Heure de fin</label>
          <input
            type="time"
            value={heureFin}
            onChange={(e) => setHeureFin(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      {message && (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {loading ? 'Réservation…' : 'Réserver'}
      </button>
    </form>
  );
}
