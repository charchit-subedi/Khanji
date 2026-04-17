const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let ink = []; 
let currX = [], currY = [], currT = [];

export function initCanvas() {
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", move);
    canvas.addEventListener("touchend", stop);
}

function start(e) {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    currX = [pos.x]; currY = [pos.y]; currT = [Date.now()];
}

function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    currX.push(pos.x); currY.push(pos.y); currT.push(Date.now());
}

function stop() {
    if (!drawing) return;
    drawing = false;
    ink.push([currX, currY, currT]);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

export const getInk = () => ink;
export const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ink = [];
};
