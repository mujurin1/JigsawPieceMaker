# JigsawPieceMaker
ジグソーパズルのピースを作るやつ  
専用ページ  
https://mujurin1.github.io/JigsawPieceMaker/

# 準備
まず、パズルにする画像を探します。  
ここから探して下さい。　https://pixabay.com/ja/

## 画像の制約
拡張子は .jpg  
画像のサイズは　400x400 以上が望ましいです。  
容量は 200KB 以下でお願いします。  


# 使い方
１．用意した画像を最初から表示されている画像部分にドラッグアンドドロップ  
２．更新ボタンを押す。
３．難易度は３つ 用意するので、それぞれピースサイズと行列数を調整して、
　　「ピース数,ピース横幅,ピース縦幅,開始位置X,開始位置Y」
　　の情報を１行で、計３行用意して下さい。
４．最終的なデータは以下の用になります

【画像】  
画像名.jpg  になります。  
画像名は全て半角文字で、アルファベット＋数字。  
空白文字は使わないで下さい。

【難易度情報】  
パズルのタイトル 画像名  
ピース数,ピース横幅,ピース縦幅,開始位置X,開始位置Y（レベル１）  
ピース数,ピース横幅,ピース縦幅,開始位置X,開始位置Y（レベル２）  
ピース数,ピース横幅,ピース縦幅,開始位置X,開始位置Y（レベル３）

例）  
サル monkey  
40,80,85,0,0  
70,64,60,0,0  
126,45,45,0,0

