'use client';

import type { Room } from '@/lib/types';

export default function RoomCard({ room }: { room: Room }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{room.name}</h3>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {room.capacity} places
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Salle #{room.id}</p>
    </div>
  );
}
