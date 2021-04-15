
class SplitImage {
  /** ピースの重なる部分の比率横 */
  overlapPerWid = 1;
  /** ピースの重なる部分の比率縦 */
  overlapPerHei = 1;
  /** ピースの重ならない部分の比率横 */
  piecePerWid = 4;
  /** ピースの重ならない部分の比率縦 */
  piecePerHei = 4;
  /*
   * 中央部のピースのサイズは
   * bodyPer : overlapPer = 4:2
   */

  /** 画像の横幅 */
  srcWidth;
  /** 画像の縦幅 */
  srcHeight;

  /** 横のピース数 */
  pieceCol = 4;
  /** 縦のピース数 */
  pieceRow = 4;
  /** ピースの横幅 */
  pieceWidth = 120;
  /** ピースの縦幅 */
  pieceHeight = 120;

  /** ピースの重なる部分の横幅 */
  overlapWidth;// = 3;
  /** ピースの重なる部分の縦幅 */
  overlapHeight;// = 3;
  /** ピース＋重なるの横幅 */
  pow;
  /** ピース＋重なるの縦幅 */
  poh;
  /** ピース＋(重なるの横幅*2) */
  poow;
  /** ピース＋(重なるの縦幅*2) */
  pooh;

  /** 最終的な横幅 */
  lastWidth;
  /** 最終的な縦幅 */
  lastHeight

  /** 画像の切り抜くエリアX */
  bodyX = 0;
  /** 画像の切り抜くエリアY */
  bodyY = 0;

  /** 切り抜く画像 */
  image;
  /** context.canvas がキャンバス */
  context;

  /** 重ねる枠の画像 ２つで１種類 */
  wakus;

  /**
   * お互いに対応するピース型の配列。  
   * IDの小さい側の値が入っている。  
   * `pieceCol` * `pieceRow`  
   * 種類: Math.floor(値/wakuTypes);  
   * 凸: 0, 凹: 1,  
   * 例）0: T0凸, 1: T0凹, 2: T1凸
   * https://i.imgur.com/YPT82Tk.png
   */
  wakuAry;

  /**
   * @param {context} ctx 描画するキャンバス
   * @param {string} src 画像のURL
   */
  constructor(ctx, src) {
    this.context = ctx;
    this.image = new Image();
    this.image.src = src;
    this.image.onload = () => {
      this.changeImage(this.image.src);
      this.image.onload = () => {};
    };
    // 枠の初期化
    // ===================================== ここに枠の種類＊２の値を入れる =====================================
    this.wakus = new Array(2);
    for (let i = 0; i < this.wakus.length; i += 2) {
      this.wakus[i] = new Image();
      this.wakus[i + 1] = new Image();
      this.wakus[i].src = "./" + i + "0.png";
      this.wakus[i + 1].src = "./" + i + "1.png";
    }
  }

  changeImage(img) {
    this.image.src = img;
    this.srcWidth = this.image.width;
    this.srcHeight = this.image.height;
    this.context.canvas.width = this.srcWidth;
    this.context.canvas.height = this.srcHeight;
    this.update();
    this.context.drawImage(this.image, 0, 0);
  }

  /**
   * 値を更新した後に呼ぶ
   */
  update() {
    this.overlapWidth = this.pieceWidth / this.piecePerWid * this.overlapPerWid;
    this.overlapHeight = this.pieceHeight / this.piecePerHei * this.overlapPerHei;
    this.pow = this.pieceWidth + this.overlapWidth;
    this.poh = this.pieceHeight + this.overlapHeight;
    this.poow = this.pow + this.overlapWidth;
    this.pooh = this.poh + this.overlapHeight;
    this.lastWidth = this.poow * this.pieceCol - this.overlapWidth*2;
    this.lastHeight = this.pooh * this.pieceRow - this.overlapHeight*2;
    // this.wakuAry = new Array(32);
    this.wakuAry = new Array(this.pieceCol*2 * this.pieceRow);
  }

  /**
   * `row`, `col` 番目のピースを中心に `angle` 回転させて `img` を描画する
   * @param {number} angle 回転角度。右回り
   * @param {number} img Image
   * @param {number} col ピース横列目
   * @param {number} row ピース縦列目
   */
  rotateFunc(angle, img, col, row) {
    /* 
     * wid  200   hei  400
     * pow  250   poh  500
     * poow 300   pooh 600
     */
    let w = this.poow * col;
    let h = this.pooh * row;
    const translateX = w + this.poow / 2;
    const translateY = h + this.pooh / 2;
    const saW = ((this.pieceWidth-this.pieceHeight)*0.75);
    const saH = ((this.pieceHeight-this.pieceWidth)*0.75);
    // if(col >= 2) r += this.overlapWidth * (col-1);
    // if(row >= 2) h += this.overlapHeight * (row-1);
    this.context.save();    // セーブ
    this.context.translate(translateX, translateY);
    this.context.rotate(angle * (Math.PI / 180));
    // ここめっちゃ悩んだ
    if(angle == 90) {             // 右
      w -= this.overlapWidth;
      h += this.overlapHeight;
      this.context.translate(-translateX + saW, -translateY + saH);
      this.context.drawImage(img, w, h, this.pooh, this.poow);
    } else if (angle == -90) {    // 左
      w += this.overlapWidth;
      h -= this.overlapHeight;
      this.context.translate(-translateX + saW, -translateY + saH);
      this.context.drawImage(img, w, h, this.pooh, this.poow);
    } else {                      // 上か、下
      if(angle == 0) {            // 上
        w -= this.overlapWidth;
        h -= this.overlapHeight;
      } else {                    // 下
        w += this.overlapWidth;
        h += this.overlapHeight;
      }
      this.context.translate(-translateX, -translateY);
      this.context.drawImage(img, w, h, this.poow, this.pooh);
    }
    this.context.restore(); // ロード
  }

  /**
   * 対応するピース枠をランダムで設定する
   */
  randomWaku() {
    for (let i = 0; i < this.wakuAry.length; i++) {
      this.wakuAry[i] = Math.floor(Math.random() * this.wakus.length);
    }
  }

  /**
   * 画像にピース枠を重ねるためのもの  
   * 一度に２箇所重ねる
   * @param {number} i 重ねる場所の番号
   */
  pieceWaku(i) {
    const type = this.wakuAry[i];
    let p1 = this.wakus[type];
    let p2 = this.wakus[(type + 1) % 2];

    // 最初の重ねる枠のピース位置
    const col = i % this.pieceCol;
    const row = Math.floor(i / (this.pieceCol*2));
    // p1 と p2 は縦か横か true: 横  false: 縦
    const yoko = i % (this.pieceCol*2) < this.pieceCol;

    // 枠の向きが
    if (yoko) {     // 横
      this.rotateFunc(90, p1, col, row);
      this.rotateFunc(-90, p2, col + 1, row);
    } else {        // 縦
      this.rotateFunc(180, p1, col, row);
      this.rotateFunc(0, p2, col, row + 1);
    }
  }

  /**
   * 枠を配置する
   */
  setWaku() {
    this.context.globalCompositeOperation = "destination-out";
    // this.pieceWaku(0);
    // this.pieceWaku(1);
    for(var i=0; i<this.wakuAry.length - this.pieceCol; i++) {
      if(i % (this.pieceCol*2) == this.pieceCol-1) continue;
      this.pieceWaku(i);
    }
    this.context.globalCompositeOperation = "source-over";
  }

  /**
   * 画像を切って並べて表示  
   * 全部おんなじサイズでいい感じのやつ
   */
  lineUpPerfect() {
    this.randomWaku();
    // キャンバスを削除
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    // キャンバスをリサイズ
    this.context.canvas.width = this.lastWidth;
    this.context.canvas.height = this.lastHeight;

    /* 
     * 本体４０ 重複１０だとすると、
     * 角は本体５０ 重複１０になる（計６０）
     * 中央は本体４０ 重複１０＋１０になる（計６０）
     * 
     * 位置は角から、
     * ０（０～５０：６０）、
     * ５０（５０～６０：６０～１００：１００～１１０）、
     * １００（１００～１１０、１１０～１５０、１５０～１６０）、
     * １５０（１５０～１６０、１６０～２００、２００～２１０）、…
     * Ｎ（Ｎ～Ｎ＋５０：６０）、
     * Ｎ（Ｎ～Ｎ＋１０、Ｎ＋１０～Ｎ＋５０、Ｎ＋５０～Ｎ＋６０）、
     */
    // 初期座標X
    for (let col = 0; col < this.pieceCol; col++) {
      // 初期座標Y
      for (let row = 0; row < this.pieceRow; row++) {
        // 元画像の切り抜き始める座標XY
        let sx = spl.bodyX + this.pieceWidth * col;
        let sy = spl.bodyY + this.pieceHeight * row;
        sx -= this.overlapWidth;
        sy -= this.overlapHeight;

        // 元画像の切り抜くサイズ
        let sw = this.poow;
        let sh = this.pooh;

        // キャンバスに描画する座標XY
        let dx = this.poow * col - this.overlapWidth;
        let dy = this.pooh * row - this.overlapHeight;

        // 貼る
        this.context.drawImage(this.image, sx, sy, sw, sh, dx, dy, sw, sh);

        // 更新
      }
    }// ここまで ２重 for
  }



  // /**
  //  * 画像を切って並べて表示  
  //  * 全部同じサイズVer
  //  */
  // lineUpAll() {
  //   this.randomWaku();
  //   // キャンバスを削除
  //   this.context.clearRect(0, 0, 10000, 10000);
  //   // キャンバスをリサイズ
  //   this.context.canvas.width = this.lastWidth;
  //   this.context.canvas.height = this.lastHeight;

  //   // ピース１つ分のX幅
  //   const wid = this.pow;
  //   // ピース１つ分のY幅
  //   const hei = this.poh;
  //   for (let col = 0; col < this.pieceCol; col++) {
  //     for (let row = 0; row < this.pieceRow; row++) {
  //       // 元画像の切り抜き始める座標XY
  //       const sx = this.pow * col - this.overlapWidth;
  //       const sy = this.poh * row - this.overlapHeight;

  //       // 元画像の切り抜くサイズ
  //       let sw = this.pow;
  //       let sh = this.poh;
  //       if(col < this.pieceCol-1)
  //         sw += this.overlapWidth;
  //       if(row < this.pieceRow-1)
  //         sh += this.overlapHeight;

  //       // キャンバスに描画する座標XY
  //       const dx = this.bodyX + this.poow * col;
  //       const dy = this.bodyY + this.pooh * row;

  //       // キャンバスに描画するサイズ
  //       const dw = sw;
  //       const dh = sh;

  //       // 貼る
  //       this.context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
  //     }
  //   }
  //   // ここまで ２重 for
  // }
}