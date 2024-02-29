let crossX, crossY;
let previousText = "Previous text";
let blinkTimer = 0;
let blinkDuration = 20;
let crossTextList = [];
let currentLabelIndex = 0;
let uniqueLabelValues = [];
let maxText = 0;
let tweetTexts = [];
let tweetLabel = [];
let selectedLabel;
let updateInterval;
let barWidth;
let updateDuration = 30 * 1000;
let points = [];
let spacing;
let elapsedTime;
let colorSchemes = [];
let selectedColorScheme;

function preload() {
  table = loadTable(
    "dreams-labeled-sublabeled-edited-cleaned.csv",
    "csv",
    "header"
  );
  customFont = loadFont("OpenSans-VariableFont_wdth,wght.ttf");
}
function draw() {
  drawBackgroundSpectrumAndGrid();
  drawLine();
  drawNextCrossAndText2();
  loadBar();
}

function drawBackgroundSpectrumAndGrid() {
  background(0);
  drawDataSpectrum(selectedColorScheme.spectrumColor);
  spacing = width / 400;
  drawGrid(spacing, color(0));
}

function setup() {
  colorSchemes = [
    {
      spectrumColor: color(119, 38, 0),
      labelColor: color(255, 80, 80),
      labelRectColor: color(87, 0, 0),
      postTextColor: color(87, 255, 147),
      rectStoke: color(44, 111, 68),
      lineOneColor: color(87, 215, 147),
      lineTwoColor: color(244, 134, 22),
    },
    {
      spectrumColor: color(10, 109, 22),
      labelColor: color(0, 0, 0),
      labelRectColor: color(179, 82, 255),
      postTextColor: color(50, 189, 62),
      rectStoke: color(5, 64, 0),
      lineOneColor: color(179, 82, 255),
      lineTwoColor: color(255, 51, 71),
    },
  ];

  selectedColorScheme = random(colorSchemes);
  createCanvasAndData();
  setInterval(saveCrossAndText, 200);
  updateInterval = setInterval(updateSketchAndBar, updateDuration);
}

function updateSketchAndBar() {
  barWidth = width;
  elapsedTime = 0;
  elapsedTime = remainingTime;
  updateSketch();
}

function createCanvasAndData() {
  let canvasWidth = windowWidth;
  let canvasHeight = 800;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvasp");
  let labelYColumn = table.getColumn("label_y");
  uniqueLabelValues = Array.from(new Set(labelYColumn));

  getAllTweetTexts();
  saveCrossAndText();
  createDataSpectrum();
}

function updateSketch() {
  crossTextList = [];
  maxText = 0;
  tweetTexts = [];
  tweetLabel = [];
  points = [];
  selectedColorScheme = random(colorSchemes);

  getAllTweetTexts();
  saveCrossAndText();
  createDataSpectrum();
}

function loadBar() {
  stroke(255);
  noFill();
  rect(0, 0, width, 6);

  fill(150);
  noStroke();
  rect(0, 1, barWidth, 4);
  barWidth = width;

  elapsedTime = millis() % updateDuration;
  remainingTime = updateDuration - elapsedTime;
  barWidth = map(remainingTime, 0, updateDuration, 0, width);
}

function getAllTweetTexts() {
  selectedLabel =
    uniqueLabelValues[Math.floor(Math.random() * uniqueLabelValues.length)];

  for (let i = 0; i < table.getRowCount(); i++) {
    if (table.getString(i, "label_y") === selectedLabel) {
      tweetTexts.push(table.getString(i, "tweet_text"));
      tweetLabel.push(table.getString(i, "new_label"));
    }
  }
}

function saveCrossAndText() {
  if (maxText < tweetTexts.length) {
    let crossX = random(width);
    let crossY = random(10, height - 100);
    let selectedTweetText = tweetTexts[maxText];
    let selectedLabelText = tweetLabel[maxText];
    let speed = map(textWidth(selectedTweetText), 0, 250, 0.1, 0.3);

    crossTextList.push({
      x: crossX,
      y: crossY,
      previousText: previousText,
      postText: selectedTweetText,
      label: selectedLabelText,
      blinked: false,
      speed: speed,
    });
    blinkTimer = 0;
    maxText++;
  }
  invertSpeed(crossTextList);
}

function drawBlinkingCrossAndText(x, y, postText, index, label) {
  stroke(255, 0, 0);
  strokeWeight(2);
  if (blinkTimer < blinkDuration) {
    drawPreviousText(x, y, index, label);
    blinkTimer++;
  } else {
    crossTextList[index].blinked = true;
    drawPostText(x, y, postText, label);
    crossTextList[index].x += 10;
  }
}

function drawNextCrossAndText2() {
  for (let index = 0; index < crossTextList.length; index++) {
    let crossData = crossTextList[index];
    if (!crossData.blinked) {
      drawBlinkingCrossAndText(
        crossData.x,
        crossData.y,
        crossData.postText,
        index,
        crossData.label
      );
    } else {
      drawPostText(
        crossData.x,
        crossData.y,
        crossData.postText,
        crossData.label
      );
      crossData.x += crossData.speed;

      if (crossData.x > width) {
        crossData.x = -300;
      }
    }
  }
}

function drawPreviousText(x, y, previousText, label) {
  textFont(customFont);
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();

  line(0, y, width, y);
  line(x, 0, x, height);
  ellipse(x, y, 100, 100);

  textSize(100);
  textAlign(LEFT, BOTTOM);
  text(label, x, y);

  fill(255);
  textAlign(RIGHT, BOTTOM);
  text(previousText, x, y);
}

function drawPostText(x, y, postText, label) {
  let textHeight =
    (textAscent() + textDescent()) * ceil(textWidth(postText) / 200);
  textFont(customFont);
  textSize(16);
  textAlign(LEFT, TOP);

  fill(selectedColorScheme.labelRectColor);
  noStroke();
  rect(x, y, textWidth(label) + 10, 15);

  fill(0, 0, 0);
  stroke(selectedColorScheme.rectStoke);
  rect(x, y + 20, 255, textHeight);

  noStroke();
  fill(selectedColorScheme.labelColor);
  text(label, x + 5, y - 5);

  fill(selectedColorScheme.postTextColor);
  text(postText, x + 5, y + 20, 250);
}

////////////////////////////////////////////////////////////// LINE STUFF //////////////////////////////////////////////////////////////

function drawLine() {
  for (let index = 1; index < crossTextList.length; index++) {
    if (isNaN(crossTextList[index].x)) {
      crossTextList[index].x = 0;
    }
    // Draw the line
    strokeWeight(2);
    stroke(selectedColorScheme.lineOneColor);
    line(
      crossTextList[index].x,
      crossTextList[index].y,
      crossTextList[index - 1].x,
      crossTextList[index - 1].y
    );
    noFill();
    strokeWeight(1);
    stroke(selectedColorScheme.lineTwoColor);
    if (index > 1) {
      let x1 = crossTextList[index - 2].x;
      let y1 = crossTextList[index - 2].y;
      let x2 = crossTextList[index - 1].x;
      let y2 = crossTextList[index - 1].y;
      let x3 = crossTextList[index].x;
      let y3 = crossTextList[index].y;
      let x4 = (x1 + x2) / 2;
      let y4 = (y1 + y2) / random(2, 2.05);
      let x5 = (x2 + x3) / 2;
      let y5 = (y2 + y3) / 2;
      bezier(x1, y1, x4, y4, x5, y5, x3, y3);
    }
  }
}

////////////////////////////////////////////////////////////// BACKGROUND STUFF //////////////////////////////////////////////////////////////

function createDataSpectrum() {
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      let p = {
        x: x + random(-10, 10),
        y: y + random(-10, 10),
        noiseValue: noise(x * 0.01, y * 0.01),
      };
      points.push(p);
    }
  }
}

function drawDataSpectrum(color) {
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    p.x += 0.2;

    fill(color);
    if (p.noiseValue < 0.35) {
      if (p.x > width) {
        p.x = p.x - width - 30;
      }
      rect(p.x, p.y, 30, 30);
    }
  }
}

function drawGrid(spacing, color) {
  stroke(color);
  strokeWeight(1);
  for (let x = 0; x <= width; x += spacing) {
    line(x, 0, x, height);
  }
  for (let y = 0; y <= height; y += spacing) {
    line(0, y, width, y);
  }
}

////////////////////////////////////////////////////////////// INVERT OBJECTS SPEED //////////////////////////////////////////////////////////////

function invertSpeed(crossTextList) {
  // Find the maximum and minimum text widths across all objects
  let maxWidth = -Infinity;
  let minWidth = Infinity;
  crossTextList.forEach((item) => {
    let textWidthValue = textWidth(item.postText);
    maxWidth = max(maxWidth, textWidthValue);
    minWidth = min(minWidth, textWidthValue);
  });

  crossTextList.forEach((item) => {
    let textWidthValue = textWidth(item.postText);
    let itemWidthRatio = map(textWidthValue, minWidth, maxWidth, 0, 1);
    let invertedSpeed = map(itemWidthRatio, 0, 1, 1.5, 0.1);
    item.speed = invertedSpeed;
  });
}
