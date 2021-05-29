
let centerX, centerY, radius, minRadius, redraw;

function moveResizeSquares(target, targets) {
    return e => { 
        let deltaX = e.clientX - target.clientX;
        let deltaY = e.clientY - target.clientY;        
        let delta = Math.min(Math.abs(deltaX), Math.abs(deltaY));
        let expanding = target.expanding(deltaX, deltaY);
        if (radius + expanding * delta < minRadius) {
            return;
        }            

        target.left += expanding * target.expandX * delta;        
        target.top += expanding * target.expandY * delta; 
        radius += expanding * delta; 
        target.style.left = `${target.left}px`;        
        target.style.top = `${target.top}px`;
        target.clientX = e.clientX;
        target.clientY = e.clientY;
        redraw();
        for (let t of targets) {
            if (t !== target) {
                t.left += expanding * t.expandX * delta;        
                t.top += expanding * t.expandY * delta;       
                t.style.left = `${t.left}px`;        
                t.style.top = `${t.top}px`;
            }
        }
    }
}

function moveCenterSquare(target, targets) {
    return e => { 
        let deltaX = e.clientX - target.clientX;
        let deltaY = e.clientY - target.clientY;           
        target.clientX = e.clientX;
        target.clientY = e.clientY;
        centerX += deltaX;
        centerY += deltaY;
        redraw();
        for (let t of [target, ...targets]) {
            t.left += deltaX;
            t.top += deltaY;
            t.style.left = `${t.left}px`;        
            t.style.top = `${t.top}px`;
        }
    }
}

function createResizeSquares(params) {
    let container = document.getElementById('canvas_image_container');
    const size = 8;
    const { x, y, d, w, h } = params;
    const targets = [];
    
    for (let i = 0; i < 4; ++i) {
        let square = document.createElement('div');
        container.appendChild(square);
        square.style.height = square.style.width = `${size}px`;
        square.left = x + (i % 2) * d - size / 2;
        square.style.left = `${square.left}px`;
        square.top = y + Math.floor(i / 2) * d - size / 2;
        square.style.top = `${square.top}px`;
        square.style.draggable = false;
        square.clientX = square.getBoundingClientRect().left;
        square.clientY = square.getBoundingClientRect().top;
        square.expandX = (i % 2) * 2 - 1;
        square.expandY = Math.floor(i / 2) * 2 - 1;
        square.expanding = (dx, dy) => ((dx * square.expandX >= 0) && (dy * square.expandY >= 0)) * 2 - 1;
        targets.push(square);
        
        square.addEventListener('mousedown', e => {
            e.preventDefault(); 
            e.target.clientX = e.clientX;
            e.target.clientY = e.clientY;   
            let move = moveResizeSquares(e.target, targets);     
            window.addEventListener('mousemove', move, true);
            let up = () => { 
                window.removeEventListener('mousemove', move, true);
                window.removeEventListener('mouseup', up, true);
            }
            window.addEventListener('mouseup', up, true);
        });
    }

    let center = document.createElement('div');  
    container.appendChild(center);
    center.style.height = center.style.width = `${size}px`;
    center.left = x + d / 2 - size / 2
    center.style.left = `${center.left}px`;
    center.top = y + d / 2 - size / 2
    center.style.top = `${center.top}px`;
    let shift = moveCenterSquare(center, targets);

    center.addEventListener('mousedown', e => {
        e.preventDefault(); 
        e.target.clientX = e.clientX;
        e.target.clientY = e.clientY;   
        window.addEventListener('mousemove', shift, true);
        let up = () => { 
            window.removeEventListener('mousemove', shift, true);
            window.removeEventListener('mouseup', up, true);
        }
        window.addEventListener('mouseup', up, true);
    });
}

function drawSelectionCircle(ctx, params) { 
    const { w, h, x, y, r } = params   
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation='source-over';
}

function createCanvasImage(src) {
    let img = new Image();
    img.onload = function () {
        let container = document.getElementById('canvas_image_container');
        let h = img.height;
        let w = img.width;

        // base canvas
        let base = document.createElement('canvas');
        let base_context = base.getContext('2d');
        container.appendChild(base);
        base.height = h;
        base.width = w;
        base_context.drawImage(img, 0, 0);    

        // circle canvas
        let circle = document.createElement('canvas');
        let circle_context = base.getContext('2d');
        container.appendChild(circle);
        circle.height = h;
        circle.width = w;
        
        // init position values. and define min radius
        radius = Math.min(w, h) / 4;
        centerX = w / 2;
        centerY = h / 2;
        minRadius = radius / 2;

        createResizeSquares({ x: centerX - radius, y: centerY - radius, d: radius * 2, w, h });
        redraw = () => {
            circle_context.clearRect(0, 0, w, h);
            base_context.drawImage(img, 0, 0); 
            drawSelectionCircle(circle_context, { w, h, x: centerX, y: centerY, r: radius }); 
        }
        redraw();  
    }
    img.src = src;
}
