import { createContext, useContext } from 'react';
import { Book, PostType } from '../lib/types';

export type TabName = 'home' | 'search' | 'library' | 'profile';

export type Route =
  | { name: 'book'; book: Book }
  | { name: 'profile'; userId: string }
  | { name: 'author'; author: string; authorKey?: string | null }
  | { name: 'follows'; userId: string; mode: 'followers' | 'following' }
  | { name: 'settings' }
  | { name: 'editProfile' };

/** Veri değiştiğinde ilgili ekranların yeniden yüklenmesi için sürüm sayaçları. */
export interface DataVersions {
  library: number;
  posts: number;
  profile: number;
}

export interface AppContextType {
  push: (route: Route) => void;
  pop: () => void;
  goTab: (tab: TabName) => void;
  openComposer: (type?: PostType, book?: Book | null) => void;
  /** Okuma durumu / ilerleme güncelleme sayfasını açar. */
  openStatusSheet: (book: Book) => void;
  versions: DataVersions;
  bump: (...kinds: Array<keyof DataVersions>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within MainContainer');
  return ctx;
};
