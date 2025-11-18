import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { PaperResponse } from '../types/explore';
import { libraryService } from '../services/libraryService';
import { useAuth } from './AuthContext';

interface LibraryContextValue {
  savedPapers: PaperResponse[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  isPaperSaved: (paperId: string) => boolean;
  addPaperToLibrary: (paper: PaperResponse) => Promise<void>;
  removePaperFromLibrary: (paperId: string) => Promise<void>;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'object' && err !== null) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    const message = axiosError.response?.data?.message;
    if (message) {
      return message;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong. Please try again.';
};

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedPapers, setSavedPapers] = useState<PaperResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLibrary = useCallback(async () => {
    if (!user?.id) {
      setSavedPapers([]);
      setError(null);
      setHydrated(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const libraryItems = await libraryService.getUserLibrary(user.id);
      // Deduplicate and keep newest uploads first
      const uniqueItems = Array.from(new Map(libraryItems.map(paper => [paper.id, paper])).values());
      uniqueItems.sort((a, b) => {
        const left = new Date(a.uploadedAt).getTime();
        const right = new Date(b.uploadedAt).getTime();
        return right - left;
      });
      setSavedPapers(uniqueItems);
      setError(null);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      console.error('[library] Failed to refresh library', err);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshLibrary();
  }, [refreshLibrary]);

  const savedPaperIds = useMemo(() => new Set(savedPapers.map(paper => paper.id)), [savedPapers]);

  const isPaperSaved = useCallback(
    (paperId: string) => savedPaperIds.has(paperId),
    [savedPaperIds]
  );

  const addPaperToLibrary = useCallback(
    async (paper: PaperResponse) => {
      if (!user?.id) {
        throw new Error('You need to be signed in to save papers.');
      }

      try {
        await libraryService.addToLibrary(paper.id);
        setSavedPapers(prev => (prev.some(saved => saved.id === paper.id) ? prev : [paper, ...prev]));
        setError(null);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        console.error('[library] Failed to add paper to library', err);
        throw err;
      }
    },
    [user?.id]
  );

  const removePaperFromLibrary = useCallback(
    async (paperId: string) => {
      if (!user?.id) {
        throw new Error('You need to be signed in to manage your library.');
      }

      try {
        await libraryService.removeFromLibrary(paperId);
        setSavedPapers(prev => prev.filter(paper => paper.id !== paperId));
        setError(null);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        console.error('[library] Failed to remove paper from library', err);
        throw err;
      }
    },
    [user?.id]
  );

  const contextValue: LibraryContextValue = {
    savedPapers,
    loading,
    error,
    hydrated,
    isPaperSaved,
    addPaperToLibrary,
    removePaperFromLibrary,
    refreshLibrary,
  };

  return <LibraryContext.Provider value={contextValue}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryContextValue => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
