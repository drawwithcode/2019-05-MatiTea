let mic;
let capture;
let analyzer;
let speech = new p5.SpeechRec();

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  textFont('VT323');

  // microphone
  mic = new p5.AudioIn();
  mic.start();

  // frequence
  fft = new p5.FFT(0.7, 512);
  fft.setInput(mic);

  // webcam
  capture = createCapture(VIDEO);
  capture.size(windowWidth, windowHeight);
  capture.hide();

  // give a name to speech.onResult
  speech.onResult = exportCamera.processVoiceCommand;
  speech.continuous = true;
  speech.start();

  exportCamera.createButton();
}

function draw() {
  clear();
  background(5);

  showVideo();
  keyTyped();
  showInterface();
  audioVisualizer();

  exportCamera.drawVoiceCommandHint();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function showVideo() {
  this.showCamera = function () {
    const myVideo = capture.loadPixels();
    image(myVideo, 0, 0, 1280, 960);
    // filter('GRAY');
  }

  // horizontal lines to create the image filter
  this.filterLinesAlternateStyle = false;
  this.filterLines = function () {
    for (let y = 0; y < windowHeight; y += 4) {
      stroke(1, 1, 1, 200);

      if (frameCount % 10 == 0) {
        this.filterLinesAlternateStyle = !this.filterLinesAlternateStyle
      }

      if (this.filterLinesAlternateStyle == true) {
        line(0, y, windowWidth, y)
      } else {
        line(0, y + 1, windowWidth, y + 1)
      }
    }
  }

  this.vignetting = function () {
    for (let i = 0; i < 500; i++) {
      stroke(0, 0, 0, i / 8);
      ellipse(windowWidth / 2, windowHeight / 2, windowWidth + i, 1.1 * windowHeight + i);
    }
  }

  // initialize camera
  this.initialize = function () {
    this.showCamera();
    this.filterLines();
    this.vignetting();
  }

  this.initialize();
}

function showInterface() {
  // draw date
  this.showDate = function () {
    const date = new Date();

    let day = date.getDate().toString();
    if (day.length == 1) day = '0' + day;

    let month = (date.getMonth() + 1).toString();
    //console.log(month);
    if (month.length == 1) month = '0' + month;

    let year = date.getFullYear();

    this.textOverlay(day + '/' + month + '/' + year, 40, height - 45, 'white');
  }

  // draw time
  this.showTime = function () {
    let h = hour().toString();
    if (h.length == 1) h = '0' + h;

    let m = minute().toString();
    if (m.length == 1) m = '0' + m;

    let s = second().toString();
    if (s.length == 1) s = '0' + s;

    this.textOverlay(h + ':' + m + ':' + s, 40, height - 85, 'white');
  }

  // text overlay
  this.textOverlay = function (_string, _x, _y, _color) {
    noStroke();
    this.textSize(30);
    this.fill(_color);
    text(_string, _x, _y);
  }

  // initialize interface
  this.initialize = function () {
    this.showDate();
    this.showTime();

    this.textOverlay('● REC', 40, 60, 'red');
    this.textOverlay('CAM 1', 40, 95, 'white');

    push();
    textAlign(CENTER);
    this.textOverlay('Press B or P key to add a filter \nPress any key to reset', width / 2, height - 85, 'white');
    pop();
  }

  this.initialize();
}

// visualizer
function audioVisualizer() {
  let waveform = fft.waveform();

  noFill();
  strokeWeight(1);
  stroke(255);

  beginShape();
  for (i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, width - 250, width - 45);
    let y = map(waveform[i] * 0.5, -1, 1, 0, 2 * height - 150);

    vertex(x, y);
  }
  endShape();
}

const exportCamera = {
  showVoiceCommandHint: false,

  createButton: function () {
    const _this = this;
    let button = createButton('<svg style="width:24px;height:24px" viewBox="0 0 24 24"> <path fill="#ffffff" d="M23,12L19,8V11H10V13H19V16M1,18V6C1,4.89 1.9,4 3,4H15A2,2 0 0,1 17,6V9H15V6H3V18H15V15H17V18A2,2 0 0,1 15,20H3A2,2 0 0,1 1,18Z" /> </svg>');

    button.position(width - 80, 40);
    button.addClass("button");

    button.mousePressed(function () {
      _this.savePic();
      _this.showVoiceCommandHint = true;

      // after 7 seconds, hide it
      setTimeout(function () {
        _this.showVoiceCommandHint = false;
      }, 7000)
    });
  },

  drawVoiceCommandHint: function () {
    if (this.showVoiceCommandHint) {
      push();
      textSize(20);
      textAlign(RIGHT);
      fill('white');
      noStroke;
      text('Say "Export" to save image', width - 110, 65);
      pop();
    }
  },

  // using speech to save a picture of the canvas
  processVoiceCommand: function () {
    if (speech.resultValue == true) {
      console.log(speech.resultString);
    }

    if (speech.resultString.toLowerCase() == "export") {
      saveCanvas('myPic.png');
    }
  },

  savePic: function () {
    saveCanvas('myPic.png');
  }
}

// using keys to change filter
function keyTyped() {
  if (key === 'b') {
    filter('BLUR', 1);
  } if (key === 'p') {
    filter('POSTERIZE', 10);
  }
  return false;
}
