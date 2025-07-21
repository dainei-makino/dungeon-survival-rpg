
const content = document.getElementById('content') as HTMLElement;

type Tab = 'top' | 'novel' | 'game' | 'three';

async function loadTab(tab: Tab) {
  // update location hash so reloading the page keeps the current tab
  location.hash = tab;

  if (tab === 'top') {
    const { default: showTop } = await import('./top');
    showTop(content, loadTab);
  } else if (tab === 'novel') {
    const { default: showNovel } = await import('../novel/novel');
    showNovel(content, loadTab);
  } else if (tab === 'game') {
    const { default: initGame } = await import('../games/dungeon-rpg/game');
    initGame(content, loadTab);
  } else if (tab === 'three') {
    const { default: initThreeGame } = await import('../games/dungeon-rpg-three/game');
    initThreeGame(content, loadTab);
  }
}

// load initial tab based on URL hash, defaulting to "top"
const initialTab = (location.hash.replace('#', '') as Tab) || 'top';
loadTab(initialTab);
