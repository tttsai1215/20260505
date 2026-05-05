let capture;
let facemesh;
let predictions = [];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟動攝影機擷取影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設的 HTML 影片元素，確保影像只會繪製在畫布上
  capture.hide();
  
  // 載入 ml5.js 的 Facemesh 模型
  facemesh = ml5.facemesh(capture, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });
  
  // 設定影像繪製模式為中心點，方便置中對齊
  imageMode(CENTER);
  
  // 設定文字對齊方式為正中心，並調整文字大小
  textAlign(CENTER, CENTER);
  textSize(32);
}

function modelReady() {
  console.log('Facemesh 模型載入完成！');
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 計算影像寬高為畫布寬高的 50%
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  // 在畫布正中間繪製擷取的影像
  image(capture, width / 2, height / 2, imgWidth, imgHeight);
  
  // 繪製 Facemesh 臉部特徵點連線
  if (predictions.length > 0 && capture.width > 0) {
    let keypoints = predictions[0].scaledMesh;
    // 您所指定的特徵點陣列
    let indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    
    stroke(255, 0, 0); // 設定線條為紅色
    strokeWeight(15);  // 設定線條粗細為 15
    
    // 依序串接這些特徵點
    for (let i = 0; i < indices.length - 1; i++) {
      let p1 = keypoints[indices[i]];
      let p2 = keypoints[indices[i + 1]];
      
      // 因為畫面上影像有進行等比例縮放 (50%) 且置中，所以我們也必須將特徵點對應 (map) 到對應的畫布座標上
      let x1 = map(p1[0], 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
      let y1 = map(p1[1], 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
      let x2 = map(p2[0], 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
      let y2 = map(p2[1], 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
      
      line(x1, y1, x2, y2);
    }
  }
  
  // 在影像上方的背景區域顯示文字，左右置中
  fill(0); // 設定文字顏色為黑色 (可依需求修改)
  noStroke(); // 確保文字不被剛剛 Facemesh 的紅色粗線條影響
  let textY = (height / 2 - imgHeight / 2) / 2; // 計算畫面頂端到影像頂端之間的正中央位置
  text('教科414730134', width / 2, textY);
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
