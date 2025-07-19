const content = document.getElementById('content') as HTMLElement;
const menu = document.getElementById('menu') as HTMLElement;
const menuButton = document.getElementById('menu-button') as HTMLButtonElement;

type Tab = 'top' | 'novel' | 'game';

menuButton.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
});

menu.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest('li');
  if (!target) return;
  const tab = target.dataset.tab as Tab;
  menu.hidden = true;
  loadTab(tab);
});

async function loadTab(tab: Tab) {
  if (tab === 'top') {
    const { default: showTop } = await import('./top');
    showTop(content);
  } else if (tab === 'novel') {
    const { default: showNovel } = await import('./novel');
    showNovel(content);
  } else if (tab === 'game') {
    const { default: initGame } = await import('./game');
    initGame(content);
  }
}

// load default tab
loadTab('top');
