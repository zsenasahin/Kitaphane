import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Profile, ProfileStats, UserBook } from '../lib/types';

const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count || 0;

export const socialService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return (data as Profile) || null;
  },

  /** Profil sayaçları: kitap, takip, inceleme, alıntı, ileti ve yıllık hedef ilerlemesi. */
  async getStats(userId: string): Promise<ProfileStats> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const postCount = (type: string) =>
      count(
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('post_type', type)
      );

    const [books, followers, following, reviews, quotes, thoughts, readingUpdates, completedThisYear] =
      await Promise.all([
        count(supabase.from('user_books').select('id', { count: 'exact', head: true }).eq('user_id', userId)),
        count(supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId)),
        count(supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId)),
        postCount('review'),
        postCount('quote'),
        postCount('thought'),
        postCount('reading_update'),
        count(
          supabase
            .from('user_books')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'read')
            .gte('finished_at', yearStart)
        ),
      ]);

    return { books, followers, following, reviews, quotes, thoughts, readingUpdates, completedThisYear };
  },

  async getCurrentlyReading(userId: string): Promise<UserBook[]> {
    const { data } = await supabase
      .from('user_books')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .eq('status', 'reading')
      .order('updated_at', { ascending: false })
      .limit(5);
    return (data as any) || [];
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .limit(1);
    return !!data && data.length > 0;
  },

  async follow(followerId: string, followingId: string): Promise<{ error: string | null }> {
    if (followerId === followingId) return { error: 'Kendini takip edemezsin.' };
    if (await this.isFollowing(followerId, followingId)) return { error: null };
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return { error: error?.message || null };
  },

  async unfollow(followerId: string, followingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    return { error: error?.message || null };
  },

  async getFollowingIds(userId: string): Promise<string[]> {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
    return (data || []).map((r: any) => r.following_id);
  },

  /** Takipçi veya takip edilen listesini profil bilgisiyle döndürür. */
  async getFollowList(userId: string, mode: 'followers' | 'following'): Promise<Profile[]> {
    const column = mode === 'followers' ? 'following_id' : 'follower_id';
    const other = mode === 'followers' ? 'follower_id' : 'following_id';
    const { data } = await supabase
      .from('follows')
      .select(other)
      .eq(column, userId)
      .order('created_at', { ascending: false });
    const ids = (data || []).map((r: any) => r[other]);
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
    const byId = new Map((profiles || []).map((p: any) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Profile[];
  },

  async searchUsers(query: string, limit = 25): Promise<Profile[]> {
    const q = query.replace(/[,()%*\\:"'@]/g, ' ').trim();
    if (!q) return [];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(limit);
    return (data as Profile[]) || [];
  },

  /** Henüz takip edilmeyen, yakın zamanda katılmış okurlar. */
  async getSuggestedReaders(userId: string, limit = 10): Promise<Profile[]> {
    const followingIds = await this.getFollowingIds(userId);
    const exclude = new Set([userId, ...followingIds]);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit + exclude.size + 10);
    return ((data as Profile[]) || [])
      .filter((p) => !exclude.has(p.id) && p.username && !/test|debug|admin|demo|check/i.test(p.username))
      .slice(0, limit);
  },

  async updateProfile(
    userId: string,
    patch: Partial<Pick<Profile, 'full_name' | 'username' | 'bio' | 'reading_goal_yearly' | 'avatar_url'>>
  ): Promise<{ error: string | null }> {
    if (patch.username !== undefined) {
      const username = (patch.username || '').trim().toLowerCase();
      if (!/^[a-z0-9_.]{3,24}$/.test(username)) {
        return { error: 'Kullanıcı adı 3-24 karakter olmalı; harf, rakam, nokta ve _ içerebilir.' };
      }
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .limit(1);
      if (taken && taken.length > 0) return { error: 'Bu kullanıcı adı başka bir okur tarafından alınmış.' };
      patch.username = username;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return { error: error?.message || null };
  },

  /**
   * Galeriden kare bir fotoğraf seçtirir, "avatars" deposuna yükler ve profile işler.
   * Kullanıcı vazgeçerse { url: null, error: null } döner.
   */
  async pickAndUploadAvatar(userId: string): Promise<{ url: string | null; error: string | null }> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return { url: null, error: 'Fotoğraf seçebilmek için galeri izni vermelisin.' };

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (picked.canceled || !picked.assets?.[0]) return { url: null, error: null };

    const asset = picked.assets[0];
    try {
      const body = await (await fetch(asset.uri)).arrayBuffer();
      const contentType = asset.mimeType || 'image/jpeg';
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from('avatars').upload(path, body, { contentType, upsert: true });
      if (upErr) return { url: null, error: upErr.message };

      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      const { error } = await this.updateProfile(userId, { avatar_url: url });
      return { url: error ? null : url, error };
    } catch (err: any) {
      return { url: null, error: err.message || 'Fotoğraf yüklenemedi.' };
    }
  },

  async removeAvatar(userId: string): Promise<{ error: string | null }> {
    return this.updateProfile(userId, { avatar_url: null });
  },
};
