import { supabase } from '../lib/supabase';
import { Post, PostType } from '../lib/types';
import { isUuid } from './booksService';

const POST_SELECT = `
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
`;

// Geliştirme sırasında oluşturulmuş test paylaşımları (genel akışta gizlenir)
const TEST_POST_IDS = new Set([
  '66ca62b9-ae76-414b-b8bc-386645948ee0',
  '030d9d15-245f-4f7b-8fa5-ca944a703a00',
  '63392e10-5b46-4f19-87f1-722a14928929',
]);

const isTestPost = (p: any) =>
  TEST_POST_IDS.has(p.id) ||
  /test|debug/i.test(p.user?.username || '') ||
  (p.content || '').toLowerCase().includes('bağlantısı başarıyla test edildi');

export interface GetPostsParams {
  currentUserId?: string;
  /** Yalnızca bu kullanıcıların paylaşımları (takip akışı için). */
  authorIds?: string[];
  bookId?: string;
  postType?: PostType;
  limit?: number;
  offset?: number;
}

async function attachLikes(rows: any[], currentUserId?: string): Promise<Post[]> {
  if (rows.length === 0) return [];
  const { data: likes } = await supabase
    .from('likes')
    .select('post_id, user_id')
    .in('post_id', rows.map((p) => p.id));

  const counts: Record<string, number> = {};
  const mine = new Set<string>();
  (likes || []).forEach((l: any) => {
    counts[l.post_id] = (counts[l.post_id] || 0) + 1;
    if (currentUserId && l.user_id === currentUserId) mine.add(l.post_id);
  });

  return rows.map((p) => ({ ...p, likes_count: counts[p.id] || 0, is_liked_by_me: mine.has(p.id) }));
}

export const postsService = {
  async getPosts(params: GetPostsParams = {}): Promise<{ posts: Post[]; error: string | null }> {
    const { currentUserId, authorIds, bookId, postType, limit = 20, offset = 0 } = params;
    try {
      let query = supabase
        .from('posts')
        .select(POST_SELECT)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (authorIds) {
        if (authorIds.length === 0) return { posts: [], error: null };
        query = query.in('user_id', authorIds);
      }
      if (bookId) {
        if (!isUuid(bookId)) return { posts: [], error: null };
        query = query.eq('book_id', bookId);
      }
      if (postType) query = query.eq('post_type', postType);

      const { data, error } = await query;
      if (error) return { posts: [], error: error.message };

      // Kullanıcının kendi paylaşımları hiçbir zaman gizlenmez
      const visible = (data || []).filter(
        (p: any) => p.user_id === currentUserId || (authorIds?.length === 1 ? true : !isTestPost(p))
      );
      return { posts: await attachLikes(visible, currentUserId), error: null };
    } catch (err: any) {
      return { posts: [], error: err.message || 'Paylaşımlar yüklenemedi.' };
    }
  },

  async createPost(params: {
    userId: string;
    postType: PostType;
    content: string;
    bookId?: string | null;
    quotePage?: number | null;
    reviewRating?: number | null;
  }): Promise<{ post: Post | null; error: string | null }> {
    const { userId, postType, content, bookId, quotePage, reviewRating } = params;
    const trimmed = content.trim();
    if (!trimmed) return { post: null, error: 'Paylaşım içeriği boş olamaz.' };
    if (postType !== 'thought' && !(bookId && isUuid(bookId))) {
      return { post: null, error: 'Bu paylaşım için bir kitap seçmelisin.' };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        post_type: postType,
        content: trimmed,
        book_id: bookId && isUuid(bookId) ? bookId : null,
        quote_page: quotePage || null,
        review_rating: reviewRating || null,
      })
      .select(POST_SELECT)
      .single();

    if (error) return { post: null, error: error.message };
    return { post: { ...(data as any), likes_count: 0, is_liked_by_me: false }, error: null };
  },

  async toggleLike(userId: string, postId: string): Promise<{ isLiked: boolean; error: string | null }> {
    try {
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('likes').delete().eq('id', existing[0].id);
        return { isLiked: !!error, error: error?.message || null };
      }
      const { error } = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
      return { isLiked: !error, error: error?.message || null };
    } catch (err: any) {
      return { isLiked: false, error: err.message };
    }
  },

  async deletePost(userId: string, postId: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', userId);
    return { success: !error, error: error?.message || null };
  },
};
