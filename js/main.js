function draw() {
    var canvas = document.getElementById('canvas_image_base');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
    }

    var canvas_image_circle = document.getElementById('canvas_image_circle');
    canvas_image_circle.onmousedown = e => {
        console.log("hi");
    }
}

function main() {
    /*
    var canvas_image_circle = document.getElementById('canvas_image_circle');
    canvas_image_circle.onmousedown = e => {
        console.log("asd");
    }

    document.onmousemove = e => {
        //console.log(`x: ${e.clientX} y: ${e.clientY}`)
    };*/
    createCanvasImage('images/bird.jpg');
}