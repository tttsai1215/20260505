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
  // 設定背景顏色為 fdf0d5
  background('#fdf0d5');
  
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
      
      // 臉部最外圍輪廓特徵點 (首尾皆為 10，形成封閉圓圈)
      let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
      
      // 繪製充滿輪廓外背景的遮罩
      fill('#fdf0d5');
      noStroke();
      beginShape();
      // 外部矩形，涵蓋整個畫布 (順時針)
      vertex(0, 0);
      vertex(width, 0);
      vertex(width, height);
      vertex(0, height);
      
      // 內部臉部輪廓挖空 (逆時針)
      beginContour();
      for (let i = faceOval.length - 1; i >= 0; i--) {
        let p = keypoints[faceOval[i]];
        let x = map(p.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
        let y = map(p.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
        vertex(x, y);
      }
      endContour();
      endShape(CLOSE);

      // 【特效 1】在臉上點綴半透明的科技感數據星點
      fill(0, 255, 255, 120);
      noStroke();
      for (let i = 0; i < keypoints.length; i += 5) {
        let p = keypoints[i];
        let x = map(p.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
        let y = map(p.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
        circle(x, y, 2);
      }

      // 將需要連線的特徵點放入陣列中方便一起繪製
      let linesToDraw = [
        [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291], // 嘴唇外圈
        [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184], // 嘴唇內圈
        [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],           // 右眼內圈 (編號 246，首尾相連)
        [130, 25, 110, 24, 23, 22, 26, 112, 243, 190, 56, 28, 27, 29, 30, 247, 130],                 // 右眼外圍 (編號 247，首尾相連)
        [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],       // 左眼內圈 (首尾相連)
        [359, 255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467, 359]        // 左眼外圍 (首尾相連)
      ];
      
      
      // 依序串接這幾組特徵點
      noFill();
      for (let j = 0; j < linesToDraw.length; j++) {
        let indices = linesToDraw[j];
        
        // 判斷是否為眼睛外圈 (第3組: 右眼外圍, 第5組: 左眼外圍)
        if (j === 3 || j === 5) {
          drawingContext.shadowBlur = 0; // 關閉發光
          stroke(50, 50, 50, 200); // 灰色偏黑 (加上一點透明度效果更像自然的黑眼圈)
          strokeWeight(15);        // 粗細改為 15
        } else {
          // 【特效 2】讓嘴唇與眼睛內圈變成帶有發光效果的霓虹粉
          drawingContext.shadowBlur = 10;
          drawingContext.shadowColor = '#FF3296';
          stroke(255, 50, 150);
          strokeWeight(2);
        }
        
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

      // 【特效 3】發光的臉部外框線 (使用 beginShape 使線條連續平滑)
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = '#00FFFF';
      stroke(0, 255, 255);
      strokeWeight(3);
      beginShape();
      for (let i = 0; i < faceOval.length; i++) {
        let p = keypoints[faceOval[i]];
        let x = map(p.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
        let y = map(p.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
        vertex(x, y);
      }
      endShape(CLOSE);
      
      // 【特效 4】額頭中央的動態跳動魔法寶石 (第三隻眼)
      let forehead = keypoints[151];
      let fx = map(forehead.x, 0, capture.width, width / 2 - imgWidth / 2, width / 2 + imgWidth / 2);
      let fy = map(forehead.y, 0, capture.height, height / 2 - imgHeight / 2, height / 2 + imgHeight / 2);
      let pulse = sin(frameCount * 0.1) * 8 + 12; // 大小隨時間改變
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = '#FFFF00'; 
      fill(255, 255, 100);
      noStroke();
      circle(fx, fy, pulse);
      
      // 復原發光設定，以免影響後續文字或背景的繪製
      drawingContext.shadowBlur = 0;
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
