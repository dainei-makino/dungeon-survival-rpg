const content = document.getElementById('content') as HTMLElement;

type Tab = 'top' | 'novel' | 'game';

async function loadTab(tab: Tab) {
  if (tab === 'top') {
    const { default: showTop } = await import('./top');
    showTop(content, loadTab);
  } else if (tab === 'novel') {
    const { default: showNovel } = await import('./novel');
    showNovel(content, loadTab);
  } else if (tab === 'game') {
    const { default: initGame } = await import('./game');
    initGame(content, loadTab);
  }
}

// load default tab
loadTab('top');
