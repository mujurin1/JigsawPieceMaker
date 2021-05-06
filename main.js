
/**
 * 
 * ピースの重ならない部分
 * 比率が縦横１：１だとする
 * サイズは60x60だとする
 * 
 * 重なる部分は、重ならない部分の4分の1だとする
 * サイズが15だとする
 * 
 * 中央部のピース全体のサイズは60 + 15 + 15 = 90
 * 
 * 全体のサイズは、
 * （縦のピース数-1）＊９０ ＋ ６０
 * （横のピース数-1）＊９０ ＋ ６０
 */

let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
let spl;
let info = ["タイトル", "レベル１の情報", "レベル２の情報", "レベル３の情報"];
let size = {wid: 0, hei: 0};

function preview() {
  spl.lineUpPerfect();
  spl.setWaku();
  spl.setSetting();
  // document.querySelector("#setting").value = spl.setting;
}

window.onload = () => {
  spl = new SplitImage(ctx, "./preview1.jpg");
  spl.update();
};

function level1() {
  info[1] = calc();
  update();
}
function level2() {
  info[2] = calc();
  update();
}
function level3() {
  info[3] = calc();
  update();
}

function getSize() {
  size.wid = ctx.canvas.width;
  size.hei = ctx.canvas.height;
}
function calc() {
  getSize();
  let pW = document.querySelector("#pieceW").value;
  let pH = document.querySelector("#pieceH").value;
  let sX = document.querySelector("#bodyX").value;
  let sY = document.querySelector("#bodyY").value;

  let col = Math.floor((size.wid-sX)/pW);
  let row = Math.floor((size.hei-sY)/pH);

  document.querySelector("#row").value = col;
  document.querySelector("#col").value = row;

  let cnt = col*row;

  return cnt+","+pW+","+pH+","+sX+","+sY;
}

function getValue(id) {
  return +document.querySelector("#"+id).value;
}
function update() {
  let pW = document.querySelector("#pieceW").value;
  let pH = document.querySelector("#pieceH").value;
  let sX = document.querySelector("#bodyX").value;
  let sY = document.querySelector("#bodyY").value;

  let col = Math.floor((size.wid-sX)/pW);
  let row = Math.floor((size.hei-sY)/pH);


  document.querySelector("#row").value = col;
  document.querySelector("#col").value = row;





  spl.title = document.querySelector("#title").value;
  spl.context.clearRect(0, 0, canvas.width, canvas.height);
  spl.changeImage(spl.image.src);
  spl.pieceCol = getValue("row");
  spl.pieceRow = getValue("col");
  spl.pieceWidth = getValue("pieceW");
  spl.pieceHeight = getValue("pieceH");
  spl.bodyX = getValue("bodyX");
  spl.bodyY = getValue("bodyY");

  let a = document.querySelector("#preview");
  let b = a.getContext("2d");
  b.canvas.width = spl.pieceWidth * spl.pieceCol;
  b.canvas.height = spl.pieceHeight * spl.pieceRow;
  b.drawImage(spl.image, spl.bodyX, spl.bodyY, spl.lastWidth, spl.lastHeight, 0, 0, spl.lastWidth, spl.lastHeight);

  // 枠を描画
  for(let row=0; row<spl.pieceRow; row++) {
    for(let col=0; col<spl.pieceCol; col++) {
      ctx.beginPath();
      ctx.rect(spl.bodyX, spl.bodyY,
        (col+1)*spl.pieceWidth, (row+1)*spl.pieceHeight);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }
  // 最後は色を変えて分かりやすく
  ctx.strokeStyle = "red";
  ctx.stroke();
  spl.update();


  info[0] = document.querySelector("#title").value;
  document.querySelector("#setting").value  = info[0]+"\n";
  document.querySelector("#setting").value += info[1]+"\n";
  document.querySelector("#setting").value += info[2]+"\n";
  document.querySelector("#setting").value += info[3];
}

// ファイル受付
canvas.addEventListener("dragover", e => {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});
canvas.addEventListener("drop", e => {
  e.stopPropagation();
  e.preventDefault();

  var file = e.dataTransfer.files[0];

  let reader = new FileReader();
  reader.onload = e => {
    spl.context.clearRect(0, 0, canvas.width, canvas.height);
    spl.changeImage(reader.result);
    update();
  };
  reader.readAsDataURL(file);
});