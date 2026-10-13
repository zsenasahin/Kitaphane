import { supabase } from '../lib/supabase';
import { Post, PostType } from '../lib/types';

export const postsService = {
  /**
   * Sosyal akışı getirir (kullanıcı profili ve kitap bilgileriyle birlikte).
   */
  async getFeed(
    currentUserId?: string,
    limit = 20,
    offset = 0
  ): Promise<{ posts: Post[]; error: string | null }> {
    try {
      // 1. Postları profil ve kitap ilişkisiyle çek
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          post_type,
          book_id,
          content,
          quote_page,
          review_rating,
          created_at,
          updated_at,
          user:profiles(*),
          book:books(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postsError) {
        return { posts: [], error: postsError.message };
      }

      if (!postsData || postsData.length === 0) {
        return { posts: [], error: null };
      }

      const postIds = postsData.map((p) => p.id);

      // 2. Beğenileri çekerek beğeni sayılarını ve mevcut kullanıcının beğenip beğenmediğini hesapla
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      const likesCountMap: Record<string, number> = {};
      const myLikesSet = new Set<string>();

      (likesData || []).forEach((like: any) => {
        likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
        if (currentUserId && like.user_id === currentUserId) {
          myLikesSet.add(like.post_id);
        }
      });

      const enrichedPosts: Post[] = postsData.map((raw: any) => ({
        ...raw,
        likes_count: likesCountMap[raw.id] || 0,
        is_liked_by_me: myLikesSet.has(raw.id),
      }));

      return { posts: enrichedPosts, error: null };
    } catch (err: any) {
      return { posts: [], error: err.message || 'Akış yüklenemedi.' };
    }
  },

  /**
   * Yeni bir paylaşım oluşturur.
   */
  async createPost(params: {
    userId: string;
    postType: PostType;
    content: string;
    bookId?: string | null;
    quotePage?: number | null;
    reviewRating?: number | null;
  }): Promise<{ post: Post | null; error: string | null }> {
    const { userId, postType, content, bookId, quotePage, reviewRating } = params;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { post: null, error: 'Paylaşım içeriği boş olamaz.' };
    }

    if (postType !== 'thought' && !bookId) {
      return { post: null, error: 'Bu paylaşım türü için bir kitap seçilmelidir.' };
    }

    try {
      const payload: any = {
        user_id: userId,
        post_type: postType,
        content: trimmedContent,
        book_id: bookId || null,
        quote_page: quotePage || null,
        review_rating: reviewRating || null,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select(`
          id,
          user_id,
          post_type,
          book_id,
          content,
          quote_page,
          review_rating,
          created_at,
          updated_at,
          user:profiles(*),
          book:books(*)
        `)
        .single();

      if (error) {
        return { post: null, error: error.message };
      }

      return {
        post: {
          ...(data as any),
          likes_count: 0,
          is_liked_by_me: false,
        },
        error: null,
      };
    } catch (err: any) {
      return { post: null, error: err.message || 'Paylaşım yapılamadı.' };
    }
  },

  /**
   * Gönderiyi beğenir veya beğeniyi kaldırır.
   */
  async toggleLike(
    userId: string,
    postId: string
  ): Promise<{ isLiked: boolean; error: string | null }> {
    try {
      // Önce mevcut beğeni var mı kontrol et
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (existing) {
        // Beğeniyi kaldır
        const { error: delErr } = await supabase
          .from('likes')
          .delete()
          .eq('id', existing.id);

        if (delErr) return { isLiked: true, error: delErr.message };
        return { isLiked: false, error: null };
      } else {
        // Beğen
        const { error: insErr } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });

        if (insErr) return { isLiked: false, error: insErr.message };
        return { isLiked: true, error: null };
      }
    } catch (err: any) {
      return { isLiked: false, error: err.message };
    }
  },

  /**
   * Kullanıcının kendi paylaşımını silmesini sağlar.
   */
  async deletePost(
    userId: string,
    postId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
