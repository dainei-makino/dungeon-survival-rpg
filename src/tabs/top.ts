export default function showTop(
  container: HTMLElement,
  loadTab: (tab: 'novel' | 'game') => void
) {
  container.innerHTML = `
    <header>牧野大寧公式サイト</header>
    <div class="tiles">
      <div class="tile" data-tab="novel">小説</div>
      <div class="tile" data-tab="game">ビデオゲーム</div>
    </div>
    <footer>&copy; 牧野大寧</footer>
  `;
  const tiles = container.querySelectorAll('.tile');
  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const tab = (tile as HTMLElement).dataset.tab as 'novel' | 'game';
      loadTab(tab);
    });
  });
}
