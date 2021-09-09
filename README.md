# twitter_tree_images

自己リプライによるツイートツリーから画像一覧を取得する。

開発者コンソール（F12）上で実行する。

出力は以下のような形式になる。

```
twitter/username_status_tweetid
URL1 twitter/username_status_tweetid/tweetid_001_imageid.ext
URL2 twitter/username_status_tweetid/tweetid_002_imageid.ext
```

以下の`wgetf`で2行目以降のフォーマットを入力としてダウンロードできる。

- https://github.com/aoirint/scripts/blob/main/wgetf/wgetf

```shell
tee | wgetf /dev/stdin
```

