import { createContext, useContext, useState } from 'react';

interface ICategoryContext {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

const CategoryContext = createContext<ICategoryContext | undefined>(undefined);

export const CatogoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  return (
    <CategoryContext.Provider value={{ selectedCategoryId, setSelectedCategoryId }}>
      {children}
    </CategoryContext.Provider>
  );
};
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
