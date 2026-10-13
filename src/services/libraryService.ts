import { supabase } from '../lib/supabase';
import { UserBook, UserBookStatus } from '../lib/types';
import { booksService } from './booksService';

export const libraryService = {
  /**
   * Kullanıcının kitaplığındaki tüm kitapları getirir (ilişkili kitap bilgisiyle).
   */
  async getUserBooks(userId: string, status?: UserBookStatus): Promise<{ userBooks: UserBook[]; error: string | null }> {
    try {
      let query = supabase
        .from('user_books')
        .select(`
          id,
          user_id,
          book_id,
          status,
          current_page,
          rating,
          notes,
          started_at,
          finished_at,
          created_at,
          updated_at,
          book:books(*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return { userBooks: [], error: error.message };
      }

      return { userBooks: (data as any) || [], error: null };
    } catch (err: any) {
      return { userBooks: [], error: err.message || 'Kitaplık yüklenirken hata oluştu.' };
    }
  },

  /**
   * Kullanıcının belirli bir kitabı kitaplığında olup olmadığını sorgular.
   */
  async getUserBookByBookId(userId: string, bookId: string): Promise<{ userBook: UserBook | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          id,
          user_id,
          book_id,
          status,
          current_page,
          rating,
          notes,
          started_at,
          finished_at,
          created_at,
          updated_at,
          book:books(*)
        `)
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) {
        return { userBook: null, error: error.message };
      }

      return { userBook: (data as any) || null, error: null };
    } catch (err: any) {
      return { userBook: null, error: err.message };
    }
  },

  /**
   * Kitaplığa kitap ekler veya mevcut okuma durumunu günceller.
   * Aynı kullanıcı için ikinci bir kayıt oluşturmaz; mevcut kaydı günceller.
   */
  async addOrUpdateUserBook(
    userId: string,
    bookId: string,
    status: UserBookStatus = 'want_to_read',
    additional?: {
      currentPage?: number;
      rating?: number | null;
      notes?: string | null;
    }
  ): Promise<{ userBook: UserBook | null; error: string | null }> {
    try {
      // 1. Mevcut kayıt var mı kontrol et
      const { userBook: existing } = await this.getUserBookByBookId(userId, bookId);

      const now = new Date().toISOString();
      const payload: any = {
        user_id: userId,
        book_id: bookId,
        status,
        updated_at: now,
      };

      if (additional?.currentPage !== undefined) payload.current_page = additional.currentPage;
      if (additional?.rating !== undefined) payload.rating = additional.rating;
      if (additional?.notes !== undefined) payload.notes = additional.notes;

      // Okuma tarihlerini mantıksal olarak güncelle
      if (status === 'reading' && !existing?.started_at) {
        payload.started_at = now;
      } else if (status === 'completed') {
        payload.finished_at = now;
      }

      if (existing) {
        // Güncelle
        const { data, error } = await supabase
          .from('user_books')
          .update(payload)
          .eq('id', existing.id)
          .select(`
            id,
            user_id,
            book_id,
            status,
            current_page,
            rating,
            notes,
            started_at,
            finished_at,
            created_at,
            updated_at,
            book:books(*)
          `)
          .single();

        if (error) return { userBook: null, error: error.message };
        return { userBook: (data as any) || null, error: null };
      } else {
        // Yeni ekle
        payload.created_at = now;
        const { data, error } = await supabase
          .from('user_books')
          .insert(payload)
          .select(`
            id,
            user_id,
            book_id,
            status,
            current_page,
            rating,
            notes,
            started_at,
            finished_at,
            created_at,
            updated_at,
            book:books(*)
          `)
          .single();

        if (error) return { userBook: null, error: error.message };
        return { userBook: (data as any) || null, error: null };
      }
    } catch (err: any) {
      return { userBook: null, error: err.message || 'Kitaplık işlemi başarısız oldu.' };
    }
  },

  /**
   * Kitaplıktan kaldırır. Katalogdaki ana kitap silinmez!
   */
  async removeUserBook(userBookId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('id', userBookId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Kitaplıktan kaldırılırken hata oluştu.' };
    }
  },
};
