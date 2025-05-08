import { useState } from 'react';

interface UseNavigation {
  isNavOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
}

export function useNavigation(): UseNavigation {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);

  return { isNavOpen, toggleNav, closeNav };
}