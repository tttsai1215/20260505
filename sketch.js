let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟動攝影機擷取影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設的 HTML 影片元素，確保影像只會繪製在畫布上
  capture.hide();
  
  // 設定影像繪製模式為中心點，方便置中對齊
  imageMode(CENTER);
  
  // 設定文字對齊方式為正中心，並調整文字大小
  textAlign(CENTER, CENTER);
  textSize(32);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 計算影像寬高為畫布寬高的 50%
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  // 在畫布正中間繪製擷取的影像
  image(capture, width / 2, height / 2, imgWidth, imgHeight);
  
  // 在影像上方的背景區域顯示文字，左右置中
  fill(0); // 設定文字顏色為黑色 (可依需求修改)
  let textY = (height / 2 - imgHeight / 2) / 2; // 計算畫面頂端到影像頂端之間的正中央位置
  text('教科414730134', width / 2, textY);
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
