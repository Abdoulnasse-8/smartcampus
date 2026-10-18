export interface User {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
}

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  room_name: string;
  capacity?: number;
  created_at?: string;
}
