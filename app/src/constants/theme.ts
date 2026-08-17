// Tokens visuels — repris des mockups validés (palette crème / corail / bleu nuit /
// vert sauge pour Local / or pour Voyageur). Garder ce fichier comme unique source
// de vérité pour les couleurs : éviter les hex en dur dans les écrans.

export const colors = {
  background: '#FAF6F0',
  surface: '#FFFFFF',
  border: '#ECE6D9',
  textPrimary: '#1B2A4A',
  textSecondary: '#6B7280',
  textMuted: '#8A8579',
  accent: '#D85A30',
  accentDark: '#993C1D',
  navy: '#1B2A4A',
  navyDark: '#0E1B33',
  modeLocalBg: '#EAF3E4',
  modeLocalBorder: '#B9D6AC',
  modeLocalText: '#3B6D11',
  modeTravelerBg: '#FBEFDC',
  modeTravelerBorder: '#EFCB8E',
  modeTravelerText: '#854F0B',
  success: '#3B6D11',
  danger: '#993C1D',
};

export const categoryStyle: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  cafe: { bg: '#FFE4D9', color: '#993C1D', icon: 'cup', label: 'Café' },
  balade: { bg: '#E8EEFB', color: '#185FA5', icon: 'walk', label: 'Balade' },
  resto: { bg: '#FAECE7', color: '#993C1D', icon: 'tools-kitchen-2', label: 'Resto' },
  sport: { bg: '#FFE4D9', color: '#993C1D', icon: 'run', label: 'Sport' },
  afterwork: { bg: '#EAF3E4', color: '#3B6D11', icon: 'glass', label: 'Afterwork' },
  culture: { bg: '#EEEDFE', color: '#3C3489', icon: 'building-arch', label: 'Culture' },
  autre: { bg: '#F1EFE8', color: '#5F5E5A', icon: 'dots', label: 'Autre' },
};
