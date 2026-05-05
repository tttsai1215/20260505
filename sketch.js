let capture;
let facemesh;
let predictions = [];

function preload() {
  // 載入 ml5.js 的 faceMesh 模型 (ml5.js v1.0+ 新版寫法)
  facemesh = ml5.faceMesh();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟動攝影機擷取影像
  capture = createCapture(VIDEO);
  capture.hide();
  facemesh.detectStart(capture, gotFaces); // 影片連續辨識
  
  // 設定影像繪製模式為中心點，方便置中對齊
  imageMode(CENTER);
  
  // 設定文字對齊方式為正中心，並調整文字大小
  textAlign(CENTER, CENTER);
  textSize(32);
}

// 取得辨識結果的回呼函式
function gotFaces(results) {
  predictions = results;
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');
  
  if (capture.width > 0 && capture.height > 0) {
    // 取得攝影機真實長寬比例，避免手機上影像被過度擠壓變形
    let videoRatio = capture.width / capture.height;
    let canvasRatio = width / height;
    let imgWidth, imgHeight;
    
    // 依據手機（直向）或電腦（橫向）自動調整大小，維持比例不變形
    if (canvasRatio > videoRatio) {
      imgHeight = height * 0.7; // 電腦橫向：以高度 70% 為基準
      imgWidth = imgHeight * videoRatio;
    } else {
      imgWidth = width * 0.9;   // 手機直向：以寬度 90% 為基準
      imgHeight = imgWidth / videoRatio;
    }
    
    // 在畫布正中間繪製擷取的影像
    image(capture, width / 2, height / 2, imgWidth, imgHeight);
    
    // 繪製 Facemesh 臉部特徵點連線
    if (predictions.length > 0) {
      let keypoints = predictions[0].keypoints; // 新版屬性名稱為 keypoints
      
      // 將需要連線的特徵點放入陣列中方便一起繪製
      let linesToDraw = [
        [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291], // 嘴唇外圈
        [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184], // 嘴唇內圈
        [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],           // 右眼內圈 (編號 246，首尾相連)
        [130, 25, 110, 24, 23, 22, 26, 112, 243, 190, 56, 28, 27, 29, 30, 247, 130],                 // 右眼外圍 (編號 247，首尾相連)
        [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],       // 左眼內圈 (首尾相連)
        [359, 255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467, 359]        // 左眼外圍 (首尾相連)
      ];
      
      stroke(255, 0, 0); // 設定線條為紅色
      strokeWeight(1);   // 設定線條粗細為 1
      
      // 依序串接這兩組特徵點
      for (let indices of linesToDraw) {
        for (let i = 0; i < indices.length - 1; i++) {
          let p1 = keypoints[indices[i]];
          let p2 = keypoints[indices[i + 1]];
          
          let x1 = map(p1.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
          let y1 = map(p1.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
          let x2 = map(p2.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
          let y2 = map(p2.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
          
          line(x1, y1, x2, y2);
        }
      }
    }
    
    // 在影像上方的背景區域顯示文字，左右置中
    fill(0); // 設定文字顏色為黑色
    noStroke(); // 確保文字不被剛剛 Facemesh 的紅色粗線條影響
    let textY = (height / 2 - imgHeight / 2) / 2; // 計算畫面頂端到影像頂端之間的正中央位置
    text('教科414730134', width / 2, textY);
  }
}

// 當視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
