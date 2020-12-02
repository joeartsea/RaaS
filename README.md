# Substrate Smart Contracts - React App

## Substrate Smart Contaracts

### Setup

Substrateスマートコントラクトの実行環境をコンピュータに構築します。<br>
Substrate DeveloperHub ink! Smart Contracts Tutorial の[Setup](https://substrate.dev/substrate-contracts-workshop/#/0/setup) の手順に従います。

### Buinding Contract

`smart-contacts`フォルダで次のコマンドを実行して、[スマートコントラクト](./smart-contacts)をコンパイルします。

```
cargo +nightly contract build
```

コンパイルに成功すると`target`ファルダの下に`.wasm`ファイルが作成されます。

また、次のコマンドを実行して、メタデータを作成します。

```
cargo +nightly contract generate-metadata
```

メタデータの作成に成功すると、`target`フォルダの下に`metadata.json`ファイルが作成されます。


### Running a Canvas Node

次のコマンドを実行してローカル開発チェーンを開始します。

```
canvas --dev --tmp
```

ターミナルでノードの実行が確認できたら、Canvas UIを使ってノードを操作します。

https://paritytech.github.io/canvas-ui

### Deploying Contract

Canvas UIを使ってノードにコンパイルしたコントラクトコードをアップロード・デプロイします。<br>
コードのアップロード・デプロイ手順は、Substrate DeveloperHub ink! Smart Contracts Tutorial の[Deploying Your Contract](https://substrate.dev/substrate-contracts-workshop/#/0/deploying-your-contract) を参考にします。

## React App

### Setup

このアプリのインストール・実行は、[yarn](https://classic.yarnpkg.com/ja/docs/install) がインストールされていることが前提です。

```
git clone https://github.com/joeartsea/RaaS.git
cd ./RaaS
yarn install
```

### Usage

次のコマンドを実行して、ローカルで実行しているノードに接続します。

```
yarn start
```

### Contract Setting

画面下部`Contract`に次の項目を入力して`Save`ボタンをクリックしてください。

* __Address__ : コントラクトアドレス<br>初期入力されている値とCanvas UIのコントラクトアドレスが異なっている場合、`src/config.js`の`CONTRACT_ADDRESS`の値を書き換えてください。
* __Name__ : 任意の名称
* __Metadata File__ : `smart-contacts/target/metadata.json`

`Save contract to keyring completed.`のメッセージが表示されれば成功です。

## Configuration

ノードとReactアプリの連携にいくつかの変数を`src/config.js`に設定しています。

* __WS_PROVIDER_URL__ : 接続するローカルノードのエンドポイント
* __CONTRACT_ADDRESS__ : ノードにアップロード・デプロイしたコントラクトアドレス

__Note :__ コントラクトアドレスは、Canvas UI の`Execute`ページで確認できます。

## Component

### Contract Caller

すべてのコントラクトを実行するユーザを選択します。

### ポイント発行

`value`に入力したポイントを発行します。

`Success`が表示されれば、成功です。

### 権限付与

`Store`に選択したユーザにポイント付与権限を与えます。

`Success`が表示されれば、成功です。

### ポイント付与

`Store`に選択したユーザが`User`に選択したユーザに`Points`に入力したポイントを付与します。

`Success`が表示されれば、成功です。

__Note :__ 暫定的に「200円で1ポイント」の付与条件を設定しているため、`Amount`に入力した値 / 200 (小数点切り捨て)の値が`Points`に自動入力されるようになっています。`Points`に入力されている値が優先されます。

### ポイント利用

`Store`に選択したユーザで`User`に選択したユーザが`Points`に入力したポイントを利用します。

`Success`が表示されれば、成功です。

### オーナーポイント確認

発行済ポイントが表示されます。

### 店舗ポイント確認

`Store`に選択したユーザが付与したポイント数が表示されます。

### 店舗/ユーザポイント確認

`Store`に選択したユーザが`User`に選択したユーザに付与したポイント数が表示されます。

### ユーザポイント確認

`User`に選択したユーザが保有するポイント数が表示されます。

## Troubleshooting

### Error Connecting to Substrate.

`Error Connecting to Substrate.`のエラーメッセージが表示されたときは、ローカルノードが開始されているか確認してください。<br>
実行されていない場合、ローカルノードを[開始](#running-a-canvas-node)してください。

### No contracts available.

`No contracts available.`のワーニングが表示されたときは、Canvas UIを使用してノードにコントラクトコードがアップロード・デプロイされているか確認してください。
* ノードにアップロード・デプロイされていない場合<br>[Deploying Contract](#deploying-contract)を実施してください。
* ノードにアップロード・デプロイされている場合<br>[Contract Setting](#contract-setting)を実施してください。

### unknown

各コンポーネントの`Call`ボタンをクリックしたときに`unknown`のエラーメッセージが表示された場合、次のことを実施してください。

1. Canvas UI の`Execute`ページでデプロイしたコントラクトの`Forget`ボタンをクリックする。
1. Canvas UI の`Deploy`ページでアップロードしたコントラクトの`Forget`ボタンをクリックする。
1. [Deploying Contract](#deploying-contract)を再実施する。

__Note :__ ローカルノードを再起動した場合に起こる現象のようです。<br>現時点では[Contract Setting](#contract-setting)を再実施する必要があるケースにはあたっていませんが、もしCanvas UIで上の3つを実施しても動作しない場合は[Contract Setting]も再実施してください。
