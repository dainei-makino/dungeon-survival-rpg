export default function showNovel(
  container: HTMLElement,
  loadTab: (tab: 'top') => void
) {
  container.innerHTML = `
    <h1>小説</h1>
    <p>ここに小説コンテンツを読み込みます。</p>
    <button id="back-to-top">トップへ戻る</button>
  `;
  const back = container.querySelector('#back-to-top') as HTMLButtonElement;
  back.addEventListener('click', () => loadTab('top'));
}
