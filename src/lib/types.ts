export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  reading_goal_yearly: number | null;
  reading_frequency: string | null;
  favorite_genres: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: string;
  google_book_id: string | null;
  title: string;
  authors: string[] | null;
  publisher: string | null;
  published_date: string | null;
  description: string | null;
  page_count: number | null;
  categories: string[] | null;
  thumbnail_url: string | null;
  isbn: string | null;
  created_at?: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: 'reading' | 'completed' | 'want_to_read';
  current_page: number;
  rating: number | null;
  notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at?: string;
  updated_at?: string;
  book?: Book;
}
