// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using a pre-trained customized model and p5.js
This example uses p5 preload function to create the classifier
=== */

// Classifier Variable
let classifier;
// Model URL
//let imageModelURL = 'https://teachablemachine.withgoogle.com/models/' + 'R30ttzrJ' + '/model.json';
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/Qbz2Rcnf/';
//let imageModelURL = './models/';



// Video
let cameraInput;
let flippedVideo;
// To store the classification
let label = "";


let vid1;
let vid2;
let myVid;
var readCameraInteractions = false


let labelNames = ['up', 'down', 'no'];

let lastLabel = 'no';
let labelChanged = false;
let showContent = false;

const RESET = 0;
const INTRO = 1;
const STEP1 = 2;
const STEP2 = 3;
const FINAL = 4;

let state = RESET;



// count each class in window of last numofframesback
let map1 = new Map();
let numofframesback = 30;

// holds readings of last numofframesback, each index holds the label read in that frame
//  fame1   frame2  frane3   frame4     frame{numofframesback}  
// [class1][class1][class2][class1]....  [class1]
let myarray = [];



// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL+'model.json');
}


function setup() {

    let cnv =  createCanvas(1280, 720);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    cnv.position(x, y);  
  
    vid1 = createVideo(['assets/cats.mp4']);
    vid1.size(width, height);
    vid1.hide();

    vid2 = createVideo(['assets/dogs.mp4']);
    vid2.size(width, height);
    vid2.hide();

    //myVid = vid1;

    cameraInput = createCapture(VIDEO);
    cameraInput.size(width, height);
    cameraInput.hide();

    flippedVideo = ml5.flipImage(cameraInput)
    
    
    // Start classifying
    classifyVideo();


  }

function draw() {

    if (readCameraInteractions && labelChanged){
      labelChanged = false;
    }
    
    if (showContent){
      showVideo(myVid,lastLabel+" "+state);
    }
    else{  
      if (!readCameraInteractions){
        showDefaultScreen("No Interaction");
      }
      else{
        showDefaultScreen("");
      }
      
    }

    stateManage();
}

function stateManage(){
  switch (state){
    case RESET:{
      if (readCameraInteractions){
        changeState(INTRO);
      }
      break;
    }
    case INTRO:{
      if (readCameraInteractions && lastLabel == labelNames[0]){
        changeState(STEP1);
      }
      break;
    }
    case STEP1:{
      if (endOfMovie() || lastLabel == labelNames[1] || !readCameraInteractions){
        changeState(RESET);
      }
      break;
    }
    default:{

    }
  }
}

function changeState(newState){
  exitState();
  state = newState;
  enterState();
}

function endOfMovie(){
  return myVid.time() == myVid.duration();
}

function enterState(){
  switch (state){
    case RESET:{
      showContent = false;
      readCameraInteractions = false;
      break;
    }
    case INTRO:{
      myVid = vid1;
      myVid.time(0);
      myVid.loop();
      break;
    }
    case STEP1:{
      myVid = vid2;
      myVid.time(0)
      myVid.play();
      break;
    }
    default:{

    }
  }
}


function exitState(){
  switch (state){
    case RESET:{
      showContent = true;
      break;
    }
    case INTRO:{
      myVid.pause();
      myVid.hide();
      break;
    }
    case STEP1:{
      myVid.pause();
      myVid.hide();
      showContent = false;
      break;
    }
    default:{

    }
  }
}

function showVideo(vid,textToShow) {
    background(0, 0, 0);
    fill(255, 255, 255);
    textSize(32);
    image(vid,0,0);
    text(textToShow, 50, 50);
}

function showDefaultScreen(textToShow) {
  background(0, 0, 0);
  fill(255, 255, 255);
  textSize(32);
  text(textToShow, width/2, height/1);
}

function mousePressed() {
  readCameraInteractions = !readCameraInteractions
}


// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(cameraInput)
  classifier.classify(flippedVideo, gotResult);
}


// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  conf = results[0].confidence;
  label = results[0].label;
 // print(results[0]);
  
  let maxval = 0;
  let maxlabel = ""
 
  if(conf > 0.8)
  {
    myarray.push(label);
    if(myarray.length > numofframesback)
    {
        myarray.shift(); //removes first element
        map1.clear();
        for(let i = 0 ; i < numofframesback ; i++)
        {
           let c = map1.get(myarray[i]);
          if(c == undefined) c = 0;
          // print(c)
           map1.set(myarray[i] , c + 1);
        }
        // print(map1);
        for (let entry of map1) { // the same as of recipeMap.entries()
           if(entry[1] > maxval)
           {
             maxval = entry[1];
             maxlabel = entry[0];
           }
        }
     }
  }
  print(maxlabel)
  print(maxval)

  if ( (maxval > 25) && (maxlabel != lastLabel) ){
    //prevState = lastLabel;
    lastLabel = maxlabel;
    labelChanged = true;
  }

  // Classifiy again!
  classifyVideo();
}


