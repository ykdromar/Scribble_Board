const canvas = document.querySelector("canvas"),
  toolButtons = document.querySelectorAll(".tool"),
  colorButtons = document.querySelectorAll(".color"),
  colorPicker = document.querySelector("#colorPicker"),
  fillColor = document.querySelector("#fillColor"),
  context = canvas.getContext("2d");

console.log(toolButtons);
console.log(fillColor);

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "pencil",
  pencilWidth = 5,
  selectedColor = "#000";

const setCanvasBackground = () => {
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

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
}

const drawTriangle = (e) => {
  context.beginPath();
  context.moveTo(prevMouseX, prevMouseY);
  context.lineTo(e.offsetX, e.offsetY);
  context.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  context.closePath();
  fillColor.checked ? context.fill() : context.stroke();
}

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  context.beginPath();
  context.lineWidth = pencilWidth;
  context.strokeStyle = selectedColor;
  context.fillStyle = selectedColor;
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  context.putImageData(snapshot, 0, 0);
  if (selectedTool === "pencil" || selectedTool === "eraser") {
    context.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);

  } else if (selectedTool === "line") {
    drawLine(e);

  } else if (selectedTool === "triangle") {
    drawTriangle(e);

  }
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
    selectedColor = window
      .getComputedStyle(button)
      .getPropertyValue("background-color");
  });
});
colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
window.addEventListener("mouseup", () => (isDrawing = false));
