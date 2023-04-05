const canvas = document.querySelector("canvas"),
  toolButtons = document.querySelectorAll(".tool"),
  colorButtons = document.querySelectorAll(".color"),
  colorPicker = document.querySelector("#colorPicker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  canvasBackgroundColor = document.querySelector("#canvasBackgroundColor"),
  fillColor = document.querySelector("#fillColor"),
  sizeSlider = document.querySelector("#size_slider"),
  context = canvas.getContext("2d"),
  pencil = document.querySelector("#pencil"),
  selectionTool = document.querySelector("#selection"),
  saveImg = document.querySelector("#saveImg");
var drawPoints = [];

//start auto complete
function getTanToDegrees(derivative) {
	return Math.atan(derivative)*180/Math.PI;
}

function detectCircle(points) {
  // center point (average of first and last points)
  var centerX = (points[0].x + points[(points.length - 1) / 2].x) / 2;
  var centerY = (points[0].y + points[(points.length - 1) / 2].y) / 2;
  var center = { x: centerX, y: centerY };

  // radius (average distance to center)
  var sumDistances = 0;
  for (var i = 0; i < points.length; i++) {
    var distance = Math.sqrt(
      Math.pow(points[i].x - center.x, 2) + Math.pow(points[i].y - center.y, 2)
    );
    sumDistances += distance;
  }
  console.log(sumDistances);
  var radius = sumDistances / points.length;

  // Check if the points form a circle by looking at the signs of the derivatives
  var derivatives = [];
  var quad = (points.length - 1) / 4;
  var difAngle = 90 / quad;
  if (difAngle < 5) {
    difAngle = 5;
  }
  for (var i = 1; i < points.length; i++) {
    var dx = points[i].x - points[i - 1].x;
    var dy = points[i].y - points[i - 1].y;
    // var dr = Math.sqrt(dx * dx + dy * dy);
    var derivative = dy / dx;
    //   var dtheta = Math.atan2(dy, dx);
    //   var theta = (dtheta + 2 * Math.PI) % (2 * Math.PI);
    //   var sign = Math.sign(dr - radius);
    // if (i != 0) {
    //   if (derivative >= (derivatives[i - 1] + getTanFromDegrees(difAngle)) || derivative <= (derivatives[i - 1] - getTanFromDegrees(difAngle))) {
    //     return null;
    //   }
    // }
    derivatives.push(derivative);
  }

  var smudgedDerivatives = [];

  for (var i = 0; i < points.length; i++) {
    if (i >= 2) {
      smudgedDerivatives[i] =
        (derivatives[i - 2] +
          derivatives[i - 1] +
          derivatives[i] +
          derivatives[i + 1] +
          derivatives[i + 2]) /
        5;
    }

    if (i > 2) {
      if (
        smudgedDerivatives[i] >=
          smudgedDerivatives[i - 1] + getTanFromDegrees(difAngle) ||
        smudgedDerivatives[i] <=
          smudgedDerivatives[i - 1] - getTanFromDegrees(difAngle)
      ) {
        return null;
      }
    }
  }

  return { type: "circle", center: center, radius: radius };
}

function detectPolygon(points) {
  let count = 0;
  smooth = [];
  var prevDer =0;
  var avgX =0
  var avgY =0
  smooth.push(points[0])
  smooth.push(points[1])
  smooth.push(points[2])
  smooth.push(points[3])
  for( var i = 4; i< points.length - 4; i++){
    avgX = points[i].x + points[i-1].x + points[i-2].x + points[i-3].x + points[i+1].x + points[i+2].x + points[i+3].x;
    avgY = points[i].x + points[i-1].x + points[i-2].x + points[i-3].x + points[i+1].x + points[i+2].x + points[i+3].x;
    smooth.push({x: avgX, y: avgY});
  }
  smooth.push(points[points.length - 3])
  smooth.push(points[points.length - 2])
  smooth.push(points[points.length - 1])
  var derivatives = [];
  var edgesIndex = [];
  for (var i = 5; i < smooth.length; i++) {
    var dx = points[i].x - points[i - 5].x;
    var dy = points[i].y - points[i - 5].y;
    // var dr = Math.sqrt(dx * dx + dy * dy);
    var derivative = dy / dx;
    if (i > 2) {
      if (
        Math.abs(derivative - prevDer) > 80
      ) {
        count++;
        edgesIndex.push(i);
      }
    }
    derivatives.push(derivative);
    prevDer = derivative;
  }
  edgesIndex.push(0);

  if (count <= 3) {
    if (points.length % 2 == 0) {
      var centerX = (points[0].x + points[points.length / 2].x) / 2;
      var centerY = (points[0].y + points[points.length / 2].y) / 2;
      var center = { x: centerX, y: centerY };
    } else {
      var centerX = (points[0].x + points[(points.length - 1) / 2].x) / 2;
      var centerY = (points[0].y + points[(points.length - 1) / 2].y) / 2;
      var center = { x: centerX, y: centerY };
    }

    // radius (average distance to center)
    var sumDistances = 0;
    for (var i = 0; i < points.length; i++) {
      var distance = Math.sqrt(
        Math.pow(points[i].x - center.x, 2) +
          Math.pow(points[i].y - center.y, 2)
      );
      sumDistances += distance;
    }
    var radius = sumDistances / points.length;

    return { type: "circle", center: center, radius: radius, count: count };
  }
  if (count >= 4) {
    var centerX = 0;
    var centerY = 0;
    for (var i = 0; i < points.length; i++) {
      centerX += points[i].x;
      centerY += points[i].y;
    }
    centerX /= points.length;
    centerY /= points.length;
    var squareC = { x: centerX, y: centerY };
    var sumDistances = 0;
    for (var i = 0; i < edgesIndex.length - 1; i++) {
      var distance = Math.sqrt(
        Math.pow(points[edgesIndex[i]].x - points[edgesIndex[i + 1]].x, 2) +
          Math.pow(points[edgesIndex[i]].y - points[edgesIndex[i + 1]].y, 2)
      );
      sumDistances += distance;
    }
    var squareLength = sumDistances / edgesIndex.length;
    return {
      type: "square",
      center: squareC,
      length: 4 * squareLength,
      count: count,
    };
  }
  // } else if (count >= 3) {
  //   var centerX = 0;
  //   var centerY = 0;
  //   for (var i = 0; i < points.length; i++) {
  //     centerX += points[i].x;
  //     centerY += points[i].y;
  //   }
  //   centerX /= points.length;
  //   centerY /= points.length;
  //   var squareC = { x: centerX, y: centerY };
  //   var sumDistances = 0;
  //   for (var i = 0; i < edgesIndex.length - 1; i++) {
  //     var distance = Math.sqrt(
  //       Math.pow(points[edgesIndex[i]].x - points[edgesIndex[i + 1]].x, 2) +
  //         Math.pow(points[edgesIndex[i]].y - points[edgesIndex[i + 1]].y, 2)
  //     );
  //     sumDistances += distance;
  //   }
  //   var squareLength = sumDistances / edgesIndex.length;
  //   return {
  //     type: "triangle",
  //     center: squareC,
  //     length: squareLength,
  //     count: count,
  //   };
  
}

function detectShape(points) {
  var result = null;
  if (detectPolygon(points) != null) {
    result = detectPolygon(points);
  } else if (detectCircle(points) != null) {
    result = detectCircle(points);
  }

  return result;
}

//end auto complete

let x1,
  y1,
  prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "pencil",
  pencilWidth = 5,
  selectedColor = { color: "rgb(0, 0, 0)", r: 0, g: 0, b: 0, a: 1 },
  bgcolor = { color: "rgb(255, 255, 255)", r: 255, g: 255, b: 255, a: 1 },
  backgroundColor = "#fff",
  isDragging = false,
  isSelecting = false,
  startingX,
  startingY;
selection;
const setCanvasBackground = () => {
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (localStorage.getItem("canvas")) {
    var dataURL = localStorage.getItem("canvas");
    var img = new Image();
    img.src = dataURL;
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };
  }
  context.fillStyle = selectedColor.color;
};

const setCanvasBackgroundColor = () => {
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const select = (e) => {
  if (isSelecting) {
    // drawRect(e);
    console.log(prevMouseX, prevMouseY, e.offsetX, e.offsetY);
    selection = context.getImageData(
      prevMouseX,
      prevMouseY,
      e.offsetX - prevMouseX,
      e.offsetY - prevMouseY
    );
    //////////////creating selection box/////////////
    context.strokeStyle = "#505050";
    context.lineWidth = 1;
    context.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
    (x1 = prevMouseX), (y1 = prevMouseY);
  }
};
// start of autocomplete2
var shapeResult = null;
const handleMagicPen = (e) => {
  console.log(e.offsetX);
  // for (var i = 1; i < drawPoints.length; i++) {
  //   if (e.offsetX === drawPoints[i].x && e.offsetY === drawPoints[i].y) {
  //     shapeResult = detectShape(drawPoints);
  //     drawPoints = [];
  //     console.log(shapeResult);
  //     break;
  //   }
  // }
  // if (drawPoints.length > 1) {
  //   if ((e.offsetX != drawPoints[drawPoints.length - 1].x && e.offsetY != drawPoints[drawPoints.length - 1].y))
  //     drawPoints.push({ x: e.offsetX, y: e.offsetY });
  // }
  // else {
  //   drawPoints.push({ x: e.offsetX, y: e.offsetY });
  // }
  drawPoints.push({ x: e.offsetX, y: e.offsetY });

  // if (shapeResult != null) {
  //   if (shapeResult.type === 'circle') {
  //     // context.strokeStyle = bgcolor.color;
  //     // for (var i = 0; i < drawPoints.length; i++) {
  //     //   context.lineTo(drawPoints[i].x, drawPoints[i].y);
  //     //   context.stroke;
  //     // }
  //     context.strokeStyle = selectedColor;
  //     console.log(shapeResult.center.x, shapeResult.radius);
  //     context.arc(shapeResult.center.x, shapeResult.center.y, shapeResult.radius, 0, 2 * Math.PI);
  //     fillColor.checked ? context.fill() : context.stroke();
  //   }
  //   else if (shapeResult.type === 'square') {
  //     // context.strokeStyle = bgcolor.color;
  //     // console.log(selectedColor)
  //     // for (var i = 0; i < drawPoints.length; i++) {
  //     //   context.lineTo(drawPoints[i].x, drawPoints[i].y);
  //     //   context.stroke;
  //     // }
  //     context.strokeStyle = selectedColor;
  //     console.log(shapeResult.center.x, shapeResult.length);
  //     if (!fillColor.checked) {
  //       return context.strokeRect(
  //         shapeResult.center.x,
  //         shapeResult.center.y,
  //         shapeResult.length,
  //         shapeResult.length
  //       );
  //     }
  //     context.fillRect(
  //       shapeResult.center.x,
  //       shapeResult.center.y,
  //       shapeResult.length,
  //       shapeResult.length
  //     );
  //   }
  // }
};
// end of autocomplete2

const drawRect = (e) => {
  if (!fillColor.checked) {
    return context.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  context.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  context.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  context.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? context.fill() : context.stroke();
};

const drawLine = (e) => {
  context.beginPath();
  context.moveTo(prevMouseX, prevMouseY);
  context.lineTo(e.offsetX, e.offsetY);
  context.stroke();
};

function actionFill(startX, startY, currentColor) {
  let colorLayer = context.getImageData(0, 0, canvas.width, canvas.height);

  let startPos = (startY * canvas.width + startX) * 4;

  let startR = colorLayer.data[startPos];
  let startG = colorLayer.data[startPos + 1];
  let startB = colorLayer.data[startPos + 2];

  if (
    currentColor.r === startR &&
    currentColor.g === startG &&
    currentColor.b === startB
  ) {
    return;
  }

  let pixelStack = [[startX, startY]];
  let newPos, x, y, pixelPos, reachLeft, reachRight;
  floodFill();
  function floodFill() {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];

    pixelPos = (y * canvas.width + x) * 4;

    while (y >= 0 && matchStartColor(pixelPos)) {
      y--;
      pixelPos -= canvas.width * 4;
    }

    pixelPos += canvas.width * 4;
    y++;
    reachLeft = false;
    reachRight = false;

    while (y < canvas.height && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvas.width - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }
      y++;
      pixelPos += canvas.width * 4;
    }

    if (pixelStack.length) {
      floodFill();
    }
  }

  context.putImageData(colorLayer, 0, 0);

  function matchStartColor(pixelPos) {
    let r = colorLayer.data[pixelPos];
    let g = colorLayer.data[pixelPos + 1];
    let b = colorLayer.data[pixelPos + 2];
    return r === startR && g === startG && b === startB;
  }

  function colorPixel(pixelPos) {
    colorLayer.data[pixelPos] = currentColor.r;
    colorLayer.data[pixelPos + 1] = currentColor.g;
    colorLayer.data[pixelPos + 2] = currentColor.b;
    colorLayer.data[pixelPos + 3] = 255;
  }
}

const drawTriangle = (e) => {
  context.beginPath();
  context.moveTo(prevMouseX, prevMouseY);
  context.lineTo(e.offsetX, e.offsetY);
  context.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  context.closePath();
  fillColor.checked ? context.fill() : context.stroke();
};

const img = new Image();
img.src = "assets/images/crayon.png";
const pattern = context.createPattern(img, "repeat");

const img2 = new Image();
img2.src = "assets/images/gradient2.webp";
const gradPattern = context.createPattern(img2, "repeat");

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  context.beginPath();

  if (selectedTool === "texture") {
    console.log("texture selected");
    const pattern = context.createPattern(img, "repeat");
    context.strokeStyle = pattern;
  } else if (selectedTool === "gradient") {
    console.log("gradient selected");
    const gradPattern = context.createPattern(img2, "repeat");
    context.strokeStyle = gradPattern;
  } else {
    context.strokeStyle = selectedColor.color;
    context.fillStyle = selectedColor.color;
  }
  context.lineJoin = "round";
  context.lineWidth = pencilWidth;
  context.globalAlpha = 1;
  if (selectedTool === "selection") {
    if (isSelecting === true && isDragging === false) {
      console.log("Started dragging");
      isSelecting = false;
      isDragging = true;
    }
    //  else if (isSelecting === false && isDragging === true) {
    //   isSelecting = true;
    //   isDragging = false;
    // }
    else if (isSelecting === false && isDragging === false) {
      console.log("Started selection");

      isSelecting = true;
    }
  }
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  context.putImageData(snapshot, 0, 0);

  if (
    selectedTool === "pencil" ||
    selectedTool === "eraser" ||
    selectedTool === "highlighter" ||
    selectedTool === "texture" ||
    selectedTool === "gradient"
  ) {
    context.strokeStyle =
      selectedTool === "eraser"
        ? canvasBackgroundColor.value
        : selectedTool === "texture"
        ? pattern
        : selectedColor;
    context.lineWidth = selectedTool === "highlighter" ? 25 : pencilWidth;
    context.globalAlpha = selectedTool === "highlighter" ? 0.6 : 1;

    if (selectedTool === "pencil") {
      document.getElementById("canvas").style.cursor = "crosshair";
    } else if (selectedTool === "highlighter") {
      document.getElementById("canvas").style.cursor = "crosshair";
    } else if (selectedTool === "eraser") {
      document.getElementById("canvas").style.cursor = "crosshair";
    } else if (selectedTool === "texture") {
      document.getElementById("canvas").style.cursor = "crosshair";
    } else if (selectedTool === "gradient") {
      document.getElementById("canvas").style.cursor = "crosshair";
    }

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
  } else if (selectedTool === "rectangle") {
    document.getElementById("canvas").style.cursor = "crosshair";
    drawRect(e);
  } else if (selectedTool === "circle") {
    document.getElementById("canvas").style.cursor = "crosshair";
    drawCircle(e);
  } else if (selectedTool === "line") {
    document.getElementById("canvas").style.cursor = "crosshair";
    drawLine(e);
  } else if (selectedTool === "paint-bucket") {
    document.getElementById("canvas").style.cursor = "crosshair";
    actionFill(prevMouseX, prevMouseY, selectedColor);
  } else if (selectedTool === "triangle") {
    document.getElementById("canvas").style.cursor = "crosshair";
    drawTriangle(e);
  } else if (selectedTool === "magicPen") {
    document.getElementById("canvas").style.cursor = "crosshair";
    context.strokeStyle =
      selectedTool === "eraser" ? canvasBackgroundColor.value : selectedColor;
    context.lineWidth = selectedTool === "highlighter" ? 25 : pencilWidth;
    context.globalAlpha = selectedTool === "highlighter" ? 0.6 : 1;

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    handleMagicPen(e);
  } else if (selectedTool === "selection") {
    document.getElementById("canvas").style.cursor = "crosshair";
    if (isSelecting) {
      startingX = e.offsetX;
      startingY = e.offsetY;
      select(e);
    } else if (isDragging) {
      // console.log("isdragging" ,x1, y1, startingX, startingY, Math.abs(startingX-selection.width), Math.abs(startingY-selection.height))
      console.log("isdragging", startingX, startingY, x1, y1);
      // if(startingX> Math.abs(startingX-selection.width) && startingY> Math.abs(startingY-selection.height))
      if (startingX > x1 && startingY > y1) {
        ////for top left
        context.clearRect(
          startingX - selection.width,
          startingY - selection.height,
          selection.width,
          selection.height
        );
        context.fillStyle = backgroundColor;
        context.fillRect(
          startingX - selection.width - 1,
          startingY - selection.height - 1,
          selection.width + 2,
          selection.height + 2
        );
      } else if (startingX > x1 && startingY < y1) {
        // //////for bottom left
        context.clearRect(
          startingX - selection.width,
          startingY,
          selection.width,
          selection.height
        );
        context.fillStyle = backgroundColor;
        context.fillRect(
          startingX - selection.width - 1,
          startingY - 1,
          selection.width + 2,
          selection.height + 2
        );
      } else if (startingX < x1 && startingY > y1) {
        //   // //////for top right
        context.clearRect(
          startingX,
          startingY - selection.height,
          selection.width,
          selection.height
        );
        context.fillStyle = backgroundColor;
        context.fillRect(
          startingX - 1,
          startingY - selection.height - 1,
          selection.width + 2,
          selection.height + 2
        );
      } else if (startingX < x1 && startingY < y1) {
        //   // //////for bottom right
        context.clearRect(
          startingX,
          startingY,
          selection.width,
          selection.height
        );
        context.fillStyle = backgroundColor;
        context.fillRect(
          startingX - 1,
          startingY - 1,
          selection.width + 2,
          selection.height + 2
        );
      }
      moveSelection(e);
    }
  }
};
let preX = prevMouseX,
  preY = prevMouseY;
const moveSelection = (e) => {
  console.log(e.offsetX, e.offsetY, selection.width, selection.height);
  // context.clearRect(preX, preY, selection.width, selection.height);
  // setCanvasBackground();
  context.putImageData(selection, e.offsetX, e.offsetY);
  preX = e.offsetX;
  preY = e.offsetY;
};

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".activeTool").classList.remove("activeTool");
    button.classList.add("activeTool");
    selectedTool = button.id;
  });
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".activeColor").classList.remove("activeColor");
    button.classList.add("activeColor");
    selectedColor.color = window
      .getComputedStyle(button)
      .getPropertyValue("background-color");
    var rgb = selectedColor.color.match(/\d+/g);
    selectedColor.r = rgb[0];
    selectedColor.g = rgb[1];
    selectedColor.b = rgb[2];
  });
});

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem("canvas");
  setCanvasBackground();
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});

canvasBackgroundColor.addEventListener("input", () => {
  backgroundColor = canvasBackgroundColor.value;
  setCanvasBackgroundColor();
});

sizeSlider.addEventListener("change", () => (pencilWidth = sizeSlider.value));

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
window.addEventListener("mouseup", () => {
  localStorage.setItem("canvas", canvas.toDataURL());
  isDrawing = false;
  if (selectedTool === "selection") {
    if (isDragging) {
      isSelecting = false;
      isDragging = false;
      selectedTool = "pencil";
      selectionTool.classList.remove("activeTool");
      pencil.classList.add("activeTool");
    }
  }
  if (selectedTool === "magicPen") {
    console.log(drawPoints);
    shapeResult = detectShape(drawPoints);
    drawPoints = [];
    console.log(shapeResult, drawPoints);

    if (shapeResult != null) {
      if (shapeResult.type === "circle") {
        // context.strokeStyle = bgcolor.color;
        // for (var i = 0; i < drawPoints.length; i++) {
        //   context.lineTo(drawPoints[i].x, drawPoints[i].y);
        //   context.strokeStyle = backgroundColor;
        //   context.stroke();
        //   // context.fillStyle = backgroundColor;
        //   // context.fillRect(shapeResult.center.x - 2*shapeResult.radius, shapeResult.center.y - 2*shapeResult.radius, 2*shapeResult.radius, 2*shapeResult.radius);
        //   //context.clearRect(shapeResult.center.x - 1.5*shapeResult.radius, shapeResult.center.y - 1.5*shapeResult.radius, 2.5*shapeResult.radius, 2.5*shapeResult.radius);
        //   //setCanvasBackground();
        // }

        // setCanvasBackground();

        context.fillStyle = backgroundColor;
        console.log(context.fillStyle);
        context.fillRect(shapeResult.center.x + shapeResult.radius, shapeResult.center.y + 2*shapeResult.radius, -3*shapeResult.radius, -3*shapeResult.radius);
        console.log(context.strokeStyle);
        context.beginPath();
        // console.log(shapeResult.center.x, shapeResult.radius, context.strokeStyle);
        context.arc(
          shapeResult.center.x,
          shapeResult.center.y,
          shapeResult.radius,
          0,
          2 * Math.PI
        );
        context.fillStyle = selectedColor;
        context.stroke();
        console.log(context.strokeStyle, selectedColor.color, backgroundColor);
        // fillColor.checked ? context.fill() : context.stroke();
      } else if (shapeResult.type === "square") {
        // context.strokeStyle = bgcolor.color;
        // console.log(selectedColor);
        // for (var i = 0; i < drawPoints.length; i++) {
        //   context.lineTo(drawPoints[i].x, drawPoints[i].y);
        //   context.stroke();
        // }
        
        context.fillStyle = backgroundColor;
        console.log(context.fillStyle);
        context.fillRect(shapeResult.center.x + shapeResult.length, shapeResult.center.y + shapeResult.length, -1.5*shapeResult.length, -1.5*shapeResult.length);
        console.log(shapeResult.center.x, shapeResult.length);
        if (!fillColor.checked) {
          return context.strokeRect(
            shapeResult.center.x-0.5*shapeResult.length,
            shapeResult.center.y-0.5*shapeResult.length,
            shapeResult.length,
            shapeResult.length
          );
        }
        // context.fillStyle = fillColor;
        context.fillRect(
          shapeResult.center.x-0.5*shapeResult.length,
          shapeResult.center.y-0.5*shapeResult.length,
          shapeResult.length,
          shapeResult.length
        );
      }
    }
  }
});
