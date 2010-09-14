/*
Silver Bullet / Bulletproof: an SVG-based slideshow / presentation framework

usage:
  <script id="slideshowLibrary" xlink:href="silverbullet.js" type="text/ecmascript"/>
  <style type="text/css">@import url(silverbullet.css);</style>
instructions:
 * right/left arrow keys move to next/previous slide
 * down arrow key steps forward through bullets
 * up arrow key steps backward through bullets
 * shift+t shows ToC
*/

var slidelist = [
"title.svg",
"enemy.html",
"cs.html",
"svgopen.html",
"svg.svg",
"svg-motivation.html",
"support.svg",
"svg-vs-canvas.svg",
"canvas-jigsaw.html",
"canvas-wolf3d.html",
"svg-wow.html",
"interfaces.html",
"svg-and-canvas.svg",
"svg-js.html",
"pottisjs.html",
"adobe.svg",
"small-screens.svg",
"thanks.html"
];

// if 'importScript' is not supported, add shim support
if( typeof importScript != "function" ) { 
  function importScript() {
    var scriptEl = document.getElementsByTagName('script')[0];      
    for (var i = 0, iLen = arguments.length; iLen > i; i++) {
      var filename = arguments[i];
      var docNS = document.documentElement.namespaceURI;
      var importEl = document.createElementNS(docNS, "script");
      if ("http://www.w3.org/1999/xhtml" === docNS) {
        importEl.src = filename;
        importEl.type = "text/javascript";
        importEl.defer = true;
      } else if ("http://www.w3.org/2000/svg" === docNS) {
        importEl.setAttributeNS( "http://www.w3.org/1999/xlink", "xlink:href", filename );
        importEl.setAttribute( "type", "text/ecmascript" );
      }
      scriptEl.parentNode.insertBefore( importEl, scriptEl );
    }
  }
}

// import list of slides and list of colors
importScript("slidelist.js", "colorlist.js", "resources/smil.user.js");


// var bulletIcon = "./resources/bullet.svg#root";

var svgns = "http://www.w3.org/2000/svg";
var xlinkns = "http://www.w3.org/1999/xlink";

var ai = -1;
var bulletArray = [];
var t0x, t0y = null;

window.onload = initSilverBullet;

function initSilverBullet(evt) {
  document.addEventListener('touchstart', startGesture, false);
  document.addEventListener('touchmove', moveGesture, false);
  document.addEventListener('touchend', endGesture, false);

  var content = document.getElementById("content");
  if (content) {
    var allElements = content.getElementsByTagName("*");
    for (var i = 0, iLen = allElements.length; iLen > i; i++) {
      var eachEl = allElements[i];
      var bulletClass = eachEl.getAttribute("class");
      if ( bulletClass && -1 != bulletClass.indexOf("bullet") ) {
        bulletArray.push(eachEl);
        if ("http://www.w3.org/1999/xhtml" === eachEl.namespaceURI) {
          eachEl.setAttribute("style", "visibility:hidden");
        } else {
          eachEl.setAttribute("visibility", "hidden");
        }
      }
    }
  
    if ( "http://www.w3.org/2000/svg" === content.namespaceURI ) {
      for (var t = 0, tLen = bulletArray.length; tLen > t; t++) {
        var eachBullet = bulletArray[t];
        var bulletClass = eachBullet.getAttribute("class");
        if ( bulletClass && "g" == eachBullet.localName && -1 != bulletClass.indexOf("colorbox") ) {
          createBox( eachBullet );
        }
        
        if ( bulletClass && "g" == eachBullet.localName && -1 != bulletClass.indexOf("icon") ) {
          insertIcon( eachBullet );
        }
      }
    }
  }  
}


document.onkeydown = function(evt) {

  var keyCode = null;
  if (!evt)
  evt = window.event;

  if (window.event) {
    keyCode = window.event.keyCode;
  }
  else if (evt.which) {
    keyCode = evt.which;
  }
  else {
    return true;
  }

  if (37 == keyCode || 39 == keyCode) {
    changeSlide( keyCode );
  }
  else if (40 == keyCode) {
    stepForward();
  }
  else if (38 == keyCode) {
    stepBackward();
  }
  else if (84 == keyCode) {
    // 't' key
    if (evt && evt.shiftKey) {
      window.location = "toc.html";
    }
  }
}

function startGesture(evt)
{
  var t0 = evt.touches[0];
  t0x = t0.pageX;
  t0y = t0.pageY;
}

function moveGesture(evt)
{
  evt.preventDefault();
  var t1 = evt.touches[0];
  var deltaX = Math.abs(t1.pageX - t0x);
  var deltaY = Math.abs(t1.pageY - t0y);
  if (deltaX > deltaY) {
    // gesture is horizontal
    if (t0x > t1.pageX) {
      // swipe left
      changeSlide( 39 );
    } else if (t0x <= t1.pageX) {
      // swipe right
      changeSlide( 37 );
    }
  } else {
    // gesture is vertical
    if (t0y > t1.pageY) {
      // swipe up
      stepBackward();
    } else if (t0y <= t1.pageY) {
      // swipe down
      stepForward();
    }
  }
}

function endGesture(evt)
{
  evt.preventDefault();
  // tap
  stepForward();
}


function stepForward() {
  // hide "remove" bullets for replacement content
  var lastBullet = bulletArray[ai];
  if ( lastBullet ) {
    var c = lastBullet.getAttribute("class");
    var ri = c.indexOf("remove");
    if ( -1 != ri ) {
      var removalIndex = parseInt(c.substr(ri).split(" ")[0].split("-")[1]);
      // alert(removalIndex + " " + ai)
      if ( isNaN(removalIndex) ||  ai >= removalIndex ) {
        // alert("foo")
        lastBullet.setAttribute("style", "visibility:hidden");
      }
    }
  }

  for (var b = 0, bLen = bulletArray.length; bLen > b; b++) {
    var eachBullet = bulletArray[b];
    var bulletClass = eachBullet.getAttribute("class");
    var ri = bulletClass.indexOf("remove");
    var removalIndex = parseInt(bulletClass.substr(ri).split(" ")[0].split("-")[1]);
    if ( false == isNaN(removalIndex) && ai >= removalIndex ) {
      eachBullet.setAttribute("style", "visibility:hidden");
    }
  }

  ai++;
  if (bulletArray.length - 1 <= ai) {
    ai = bulletArray.length -1;
  }
  
  var bullet = bulletArray[ai];
  if (!bullet) { return true; }
  // TODO IE
  bullet.setAttribute("style", "visibility:visible");
  
  var bulletClass = bullet.getAttribute("class");
  var ani = bulletClass.indexOf("animate");
  if ( -1 != ani ) {
    var bulletEls = bullet.getElementsByTagName("*");
    for (var b = 0, bLen = bulletEls.length; bLen > b; b++) {
      var eachEl = bulletEls[b];
      if ( eachEl.beginElement ) {
        eachEl.beginElement();
      }
      // var isAnimation = eachEl.getAttribute("class").indexOf("animate");
      // if ( -1 != ani ) {
      //   eachEl.beginElement();
      // }
    }
  }
  
  // play media
  if ( bulletClass && -1 != bulletClass.indexOf("media") ) {
    playMedia( bullet );
  }
  
}


function stepBackward() {
  var bullet = bulletArray[ai];
  if (!bullet) { return true; }
  // @@TODO IE
  bullet.setAttribute("style", "visibility:hidden");
  
  ai--;
  if (-1 > ai) {
    ai = -1;
  }

  // show "remove" bullets for replacement content
  var prevBullet = bulletArray[ai];
  if ( prevBullet && -1 != prevBullet.getAttribute("class").indexOf("remove") ) {
    prevBullet.setAttribute("style", "visibility:visible");
  }
}


function changeSlide( keyCode ) {

  var loc = window.location.href;
  var file = loc.split("/").pop();

  var newfile = slidelist[0];


  
  if (file === "") {
    file = "Overview.html";
  }


  
  for (var fi = 0, fiLen = slidelist.length; fiLen > fi; fi++) {
    var eachSlide = slidelist[fi];
    if (file == eachSlide) {
      var ni = fi;
      switch (keyCode) {
        case 37:
          // left
          ni--;
          if (0 > ni) {
            ni = slidelist.length - 1;
          }
          break;
          
        case 39:
          // right
          ni++;
          if (slidelist.length <= ni) {
            ni = 0;
          }
          break;
      }
      newfile = slidelist[ni];
    }
  }
  window.location = newfile;
}

function fade() {
}

function toc() {
  var toc = document.getElementById("toc");

  for (var fi = 0, fiLen = slidelist.length; fiLen > fi; fi++) {
    var eachSlide = slidelist[fi];
    var li = document.createElement("LI");
    var a = document.createElement("A");

    var file_name = eachSlide.split(".")[0];

    a.appendChild(document.createTextNode(file_name));
    a.setAttribute("href", eachSlide);
    li.appendChild(a);
    toc.appendChild(li);
  }
}

//generates a quasi-random number in the ranges between the two parameters
randomNum.today = new Date();
randomNum.seed = randomNum.today.getTime();
function randomNum(min, max) {
  var range = Number(max) - Number(min);
  var offset = 0;
  if (0 == min) {
    range = max + 1;
    offset = 1;
  }
  else if (0 > min) {
    range += 1;
    offset = 1;
  }
  randomNum.seed = (randomNum.seed * 9301 + 49297) % 233280;
  var result = Math.ceil(randomNum.seed / (233280.0) * range);
  return Number(result) + Number(min) - Number(offset);
};


/*
 colorbox bullets extension
*/
function createBox( bulletEl ) {
  var min = 0;
  var max = 20;

  var bbox = bulletEl.getBBox();
  var x = [];
  var y = [];
  x[0] = bbox.x - randomNum( min, max);
  y[0] = bbox.y - randomNum( min, max);
  x[1] = Number(bbox.x + bbox.width) + randomNum( min, max);
  y[1] = bbox.y - randomNum( min, max);
  x[2] = Number(bbox.x + bbox.width) + randomNum( min, max);
  y[2] = Number(bbox.y + bbox.height) + randomNum( min, max);
  x[3] = bbox.x - randomNum( min, max);
  y[3] = Number(bbox.y + bbox.height) + randomNum( min, max);

  var points = x[0] + "," + y[0] + " " + x[1] + "," + y[1] + " " + x[2] + "," + y[2] + " " + x[3] + "," + y[3];

  var colorIndex = randomNum(0, colorlist.length - 1);
  var color = colorlist[ colorIndex ];
  colorlist.splice( colorIndex, 1);
  
  var box = document.createElementNS(svgns, "polygon" );
  box.setAttribute( "points", points );
  box.setAttribute( "fill", color );
  // box.setAttribute( "fill", "rgb(" + randomNum(0, 255) + "," + randomNum(0, 255) + "," + randomNum(0, 255) + ")" );

  bulletEl.insertBefore( box, bulletEl.firstChild );

}


/*
 icon bullets extension
*/
function insertIcon( bulletEl ) {
  var bbox = bulletEl.getBBox();
  
  var fontSize = parseFloat(window.getComputedStyle(bulletEl,null).getPropertyValue("font-size"));
  var bulletClass = bulletEl.getAttribute("class");
  // if ( bulletClass && "g" == eachBullet.localName && -1 != bulletClass.indexOf("icon") ) {
  //   insertIcon( eachBullet );
  // }
  // var removalIndex = parseInt(c.substr(ri).split(" ")[0].split("-")[1]);
  var icon = document.getElementById("icon");
  if ( icon ) {
    var icon = document.createElementNS(svgns, "use" );
    icon.setAttribute( "x", bbox.x - 60 );
    // icon.setAttribute( "y", (Number(bbox.y) + (Number(bbox.height) / 2)) - 9 );
    // icon.setAttribute( "y", bbox.y  );
    icon.setAttribute( "y", bbox.y + (fontSize * 0.36) );
    icon.setAttributeNS( xlinkns, "xlink:href", "#icon" );
  } else {
    var icon = document.createElementNS(svgns, "circle" );
    icon.setAttribute( "cx", bbox.x - 20 );
    icon.setAttribute( "cy", bbox.y + (fontSize * 0.63) );
    icon.setAttribute( "r", (fontSize * 0.25) );
    icon.setAttribute( "fill", "white" );
  }
  
  

  var isAnimated = bulletClass.indexOf("animate");
  if ( -1 != isAnimated ) {
    // icon.setAttribute( "display", "none" );
    icon.setAttribute( "transform", "translate(-200)" );

    var ani = document.createElementNS(svgns, "animateTransform" );
    ani.setAttribute( "attributeName", "transform" );
    ani.setAttribute( "type", "translate" );
    ani.setAttribute( "from", "-200" );
    ani.setAttribute( "to", "0" );
    ani.setAttribute( "dur", "0.20s" );
    ani.setAttribute( "begin", "indefinite" );
    ani.setAttribute( "fill", "freeze" );
    icon.appendChild( ani );

    // icon.setAttribute( "display", "inline" );
  }
  
  bulletEl.insertBefore( icon, bulletEl.firstChild );
  
  // initSMIL();
}


/*
 media extension
*/
function playMedia( bulletEl ) {
  var audios = bulletEl.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "audio");
  for ( var i = 0, iLen = audios.length; iLen > i; i++ ) {
    var a = audios[i];
    a.play();
  }
  
  var videos = bulletEl.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "video");
  for ( var i = 0, iLen = videos.length; iLen > i; i++ ) {
    var v = videos[i];
    v.play();
  }
  
  // // Invoke new Audio object
  // var audio = new Audio('test.ogg');
  // 
  // // Get the play button and append an audio play method to onclick
  // var play = document.getElementById('play');
  // play.addEventListener('click', function(){
  //     audio.play();
  // }, false);
  // 
  // // Get the pause button and append an audio pause method to onclick
  // var pause = document.getElementById('pause');
  // pause.addEventListener('click', function(){
  //     audio.pause();
  // }, false);
  // 
  // // Get the HTML5 range input element and append audio volume adjustment to onchange
  // var volume = document.getElementById('volume');
  // volume.addEventListener('change', function(){
  //     audio.volume = parseFloat(this.value / 10);
  // }, false);
  // 
  // // Get where one are in playback and push the time to an element
  // audio.addEventListener("timeupdate", function() {
  //     var duration = document.getElementById('duration');
  //     var s = parseInt(audio.currentTime % 60);
  //     var m = parseInt((audio.currentTime / 60) % 60);
  //     duration.innerHTML = m + '.' + s + 'sec';
  // }, false);  
}

