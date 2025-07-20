export default function showTop(
  container: HTMLElement,
  loadTab: (tab: 'novel' | 'game') => void
) {
  container.innerHTML = `
    <h1>トップページ</h1>
    <div class="tiles">
      <div class="tile" data-tab="novel">小説</div>
      <div class="tile" data-tab="game">ビデオゲーム</div>
    </div>
  `;
  const tiles = container.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const tab = (tile as HTMLElement).dataset.tab as 'novel' | 'game';
      loadTab(tab);
    });
  });
}
