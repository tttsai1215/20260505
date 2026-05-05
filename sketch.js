let capture;
let facemesh;
let predictions = [];

// ⭐ 如果您沒有攝影機，請將此變數設為 false，並在資料夾內準備一張 face.jpg
let useCamera = false; 

function preload() {
  // 載入 ml5.js 的 faceMesh 模型 (ml5.js v1.0+ 新版寫法)
  facemesh = ml5.faceMesh();
  
  // 若不使用攝影機，則在程式載入前先讀取靜態圖片
  if (!useCamera) {
    capture = loadImage('face.jpg'); 
  }
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  if (useCamera) {
    // 啟動攝影機擷取影像
    capture = createCapture(VIDEO);
    capture.hide();
    facemesh.detectStart(capture, gotFaces); // 影片連續辨識
  } else {
    // 針對靜態圖片進行單次辨識
    facemesh.detect(capture, gotFaces); 
  }
  
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
  
  // 計算影像寬高為畫布寬高的 50%
  let imgWidth = width * 0.5;
  let imgHeight = height * 0.5;
  
  // 在畫布正中間繪製擷取的影像
  image(capture, width / 2, height / 2, imgWidth, imgHeight);
  
  // 繪製 Facemesh 臉部特徵點連線
  if (predictions.length > 0 && capture.width > 0) {
    let keypoints = predictions[0].keypoints; // 新版屬性名稱為 keypoints
    // 您所指定的特徵點陣列
    let indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    
    stroke(255, 0, 0); // 設定線條為紅色
    strokeWeight(15);  // 設定線條粗細為 15
    
    // 依序串接這些特徵點
    for (let i = 0; i < indices.length - 1; i++) {
      let p1 = keypoints[indices[i]];
      let p2 = keypoints[indices[i + 1]];
      
      // 新版的 keypoints 結構為 {x, y, z}，取代舊版的 p1[0] 與 p1[1]
      let x1 = map(p1.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
      let y1 = map(p1.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
      let x2 = map(p2.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
      let y2 = map(p2.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
      
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
