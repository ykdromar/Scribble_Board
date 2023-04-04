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
  selectionTool = document.querySelector("#selection");

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "pencil",
  pencilWidth = 5,
  selectedColor = { color: "rgb(0, 0, 0)", r: 0, g: 0, b: 0, a: 1 },
  backgroundColor = "#fff",
  isDragging = false,
  isSelecting = false,
  startingX,
  startingY;
selection;
const setCanvasBackground = () => {
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
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
  }
};

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

    if(selectedTool === "pencil") {
      document.getElementById("body").style.cursor = "url('assets/cursors/pencil.png'), auto";
    } else if(selectedTool === "highlighter") {
      document.getElementById("body").style.cursor = "url('assets/cursors/highlighter.png'), auto";
    } else if(selectedTool === "eraser") {
      document.getElementById("body").style.cursor = "url('assets/cursors/eraser.png'), auto";
    } else if(selectedTool === "texture") {
      document.getElementById("body").style.cursor = "url('assets/images/crayon.svg'), auto";
    } else if(selectedTool === "gradient") {
      document.getElementById("body").style.cursor = "url('assets/cursors/brush.png'), auto";
    }

    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
  } else if (selectedTool === "rectangle") {
    document.getElementById("body").style.cursor = "crosshair";
    drawRect(e);
  } else if (selectedTool === "circle") {
    document.getElementById("body").style.cursor = "crosshair";
    drawCircle(e);
  } else if (selectedTool === "line") {
    document.getElementById("body").style.cursor = "crosshair";
    drawLine(e);
  } else if (selectedTool === "paint-bucket") {
    document.getElementById("body").style.cursor = "url('assets/cursors/paint-bucket.png'), auto";
    actionFill(prevMouseX, prevMouseY, selectedColor);
  } else if (selectedTool === "triangle") {
    document.getElementById("body").style.cursor = "crosshair";
    drawTriangle(e);
  } else if (selectedTool === "selection") {
    document.getElementById("body").style.cursor = "crosshair";
    if (isSelecting) {
      startingX = e.offsetX;
      startingY = e.offsetY;
      select(e);
    } else if (isDragging) {
      context.clearRect(
        startingX-selection.width,
        startingY-selection.height,
        selection.width,
        selection.height
      );
      context.fillStyle= backgroundColor;
      context.fillRect(
        startingX-selection.width-1,
        startingY-selection.height-1,
        selection.width+2,
        selection.height+2
      );
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
  setCanvasBackground();
});

canvasBackgroundColor.addEventListener("input", () => {
  backgroundColor = canvasBackgroundColor.value;
  setCanvasBackgroundColor();
});

sizeSlider.addEventListener("change", () => (pencilWidth = sizeSlider.value));

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
window.addEventListener("mouseup", () => {
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
});
