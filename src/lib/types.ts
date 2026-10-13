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
  subtitle?: string | null;
  authors: string[] | null;
  publisher: string | null;
  published_date: string | null;
  description: string | null;
  page_count: number | null;
  categories: string[] | null;
  thumbnail_url: string | null;
  isbn: string | null;
  language?: string | null;
  average_rating?: number | null;
  ratings_count?: number | null;
  created_at?: string;
}

export type UserBookStatus = 'want_to_read' | 'reading' | 'completed' | 'dropped';

export const USER_BOOK_STATUS_LABELS: Record<UserBookStatus, string> = {
  want_to_read: 'Kitaplıkta / Başlamadım',
  reading: 'Okuyorum',
  completed: 'Okudum',
  dropped: 'Yarım Bıraktım',
};

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: UserBookStatus;
  current_page: number;
  rating: number | null;
  notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at?: string;
  updated_at?: string;
  book?: Book;
}

export type PostType = 'quote' | 'review' | 'reading_update' | 'thought';

export const POST_TYPE_LABELS: Record<PostType, string> = {
  quote: 'Alıntı',
  review: 'İnceleme',
  reading_update: 'Okuma Durumu',
  thought: 'Serbest İleti',
};

export interface Post {
  id: string;
  user_id: string;
  post_type: PostType;
  book_id: string | null;
  content: string;
  quote_page: number | null;
  review_rating: number | null;
  created_at: string;
  updated_at?: string;
  user?: Profile;
  book?: Book;
  likes_count?: number;
  is_liked_by_me?: boolean;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}
