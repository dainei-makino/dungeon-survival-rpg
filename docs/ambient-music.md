# Ambient Music Generation

このプロジェクトではゲーム内の環境に合わせてアンビエントなBGMを自動生成するシステムを導入しています。

## 概要
- `AmbientPad` クラスを使い、ゆったりとしたパッド音を鳴らします。
- `MusicGenerator.generateAmbientTracks` で長い音価を中心としたシーケンスを生成します。
- `biomeMusic.ts` では各バイオームのデフォルト楽器として `AmbientPad` を利用します。

詳細はコードを参照してください。
