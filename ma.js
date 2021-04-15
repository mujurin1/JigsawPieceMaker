
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
  pieceCol = 16;
  /** 縦のピース数 */
  pieceRow = 10;
  /** ピースの横幅 */
  pieceWidth = 40;
  /** ピースの縦幅 */
  pieceHeight = 40;

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
  lastHeight;

  /** パズルのタイトル。 */
  title;
  /** パズルの設定。 */
  setting = "";

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
   * `setting.txt` を作成する。
   */
  setSetting() {
    const col = this.pieceCol;
    const row = this.pieceRow;
    const pCnt = col * row;

    /** 設定ファイルの情報。 */
    // タイトル
    this.setting = this.title+"\n";
    // ピースの数
    this.setting += pCnt+"\n";
    // 完成時のピースの座標
    let y = 0;
    for(let r=0; r<row; r++) {
    let x = 0;
    for(let c=0; c<col; c++) {
      let db = this.getDekoBoko(r*col + c);
      let mx = x;
      let my = y;
      if(db[0] == false) my += this.overlapHeight;
      if(db[1] == false) mx += this.overlapWidth;
      this.setting += mx+","+my+"\n";
      x += this.pieceWidth;
      if(c == 0) x -= this.overlapWidth;
    }
      y += this.pieceHeight;
      if(r == 0) y -= this.overlapHeight;
    }
    // くっ付くピースID
    // [0番目のピースが繋がるIDs, 2番目の.. , ..]
    let cIds = [];
    for(let i=0; i<pCnt; i++)
      cIds[i] = [];
    
    let fnc = (a, b) => {
      cIds[a].push(b);
      cIds[b].push(a);
    };
    for(let r=0; r<row; r++) {
    for(let c=0; c<col; c++) {
      let id = r*col + c;
      if(id == col*row-1) break;
      if(c == col-1){}
      else fnc(id, id+1);
      if(r == row-1){}
      else fnc(id, id+col);
    }
    }
    for(let i=0; i<cIds.length; i++) {
      cIds[i].sort((a, b) => a - b);
      this.setting += cIds[i].join()+"\n";
    }

    // １枚の画像からピースに切り分けるための情報
    // X,Y,Width,Height
    y = 0;
    for(let r=0; r<row; r++) {
    let x = 0;
    for(let c=0; c<col; c++) {
      let db = this.getDekoBoko(r*col + c);
      let mx = x;
      let my = y;
      let wid = this.pieceWidth;
      let hei = this.pieceHeight;
      if(db[0] == true) hei += this.overlapHeight;
      if(db[0] == false) my += this.overlapHeight;
      if(db[1] == true) wid += this.overlapWidth;
      if(db[1] == false) mx += this.overlapWidth;
      if(db[2] == true) wid += this.overlapWidth;
      if(db[3] == true) hei += this.overlapHeight;
      this.setting += mx+","+my+","+wid+","+hei+"\n";
      x += this.pieceWidth + this.overlapWidth;
      if(c != 0) x += this.overlapWidth;
    }
      y += this.pieceHeight + this.overlapHeight;
      if(r != 0) y += this.overlapHeight;
    }
  }

  /**
   * 指定位置ピースの、上、下、左、右の出っ張りを取得する。  
   * true: 凸  false: 凹
   * @param {number} pId ピースID
   * @returns 真偽値の配列 [上, 左, 右, 下]
   */
  getDekoBoko(pId) {
    let ret = [];
    // まず自分の右側の wakuAry[] のインデックスを計算
    let migi = this.pieceCol*2 * Math.floor(pId/this.pieceCol) + pId%this.pieceCol;
    // 上
    if(pId >= this.pieceCol) {
      ret[0] = this.wakuAry[migi - this.pieceCol] == 1;
    }
    // 左
    if(pId%this.pieceCol != 0) {
      ret[1] = this.wakuAry[migi - 1] == 1;
    }
    // 右
    if(pId%this.pieceCol != this.pieceCol-1) {
      ret[2] = this.wakuAry[migi] == 0;
    }
    // 下
    if(pId < this.pieceCol*(this.pieceRow-1)) {
      ret[3] = this.wakuAry[migi + this.pieceCol] == 0;
    }
    return ret;
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