window.addEventListener('load', init);

let canvas;
let ctx;
let width = 800;
let height = 600;
let depth = 2;
let particles = [];
let mouseX = 0;
let mouseY = 0;
let rotationX = 0;
let rotationY = 0;
let isMouseDown = false;
let lastMouseX;
let lastMouseY;
let currentColor = '#4eff8c';
let pulseActive = false;
let trailActive = false;
let autoRotate = true;
let autoRotateSpeed = 0.005;

function init() {
    canvas = document.getElementById('canvasOne');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    createParticles();
    setupEventListeners();
    setupControls();
    animate();
}

function resizeCanvas() {
    canvas.width = width;
    canvas.height = height;
}

function createParticles() {
    particles = [];
    for (let i = 0; i < 1500; i++) {
        let theta = Math.random() * 2 * Math.PI;
        let phi = Math.acos((Math.random() * 2) - 1);
        particles.push({
            x: Math.sin(phi) * Math.cos(theta) * 200,
            y: Math.sin(phi) * Math.sin(theta) * 200,
            z: Math.cos(phi) * 200,
            size: 2,
            color: currentColor
        });
    }
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        lastMouseX = e.clientX - canvas.offsetLeft;
        lastMouseY = e.clientY - canvas.offsetTop;
        autoRotate = false;
    });

    canvas.addEventListener('mousemove', function(e) {
        if (isMouseDown) {
            let deltaX = (e.clientX - canvas.offsetLeft) - lastMouseX;
            let deltaY = (e.clientY - canvas.offsetTop) - lastMouseY;
            
            rotationY += deltaX * 0.005;
            rotationX += deltaY * 0.005;
            
            lastMouseX = e.clientX - canvas.offsetLeft;
            lastMouseY = e.clientY - canvas.offsetTop;
        }
    });

    canvas.addEventListener('mouseup', function() {
        isMouseDown = false;
    });

    window.addEventListener('resize', function() {
        resizeCanvas();
    });
}

function setupControls() {
    $("#slider-range").slider({
        range: "min",
        value: 200,
        min: 100,
        max: 300,
        slide: function(event, ui) {
            updateSphereSize(ui.value);
        }
    });

    $("#slider-test").slider({
        range: "min",
        value: depth,
        min: 1,
        max: 5,
        slide: function(event, ui) {
            depth = ui.value;
        }
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            let color = this.dataset.color;
            switch(color) {
                case 'default': currentColor = '#4eff8c'; break;
                case 'blue': currentColor = '#0096ff'; break;
                case 'purple': currentColor = '#9300ff'; break;
                case 'red': currentColor = '#ff3232'; break;
                case 'rainbow': currentColor = 'rainbow'; break;
            }
        });
    });

    document.querySelector('.effect-btn.pulse').addEventListener('click', function() {
        pulseActive = !pulseActive;
        this.classList.toggle('active');
    });

    document.querySelector('.effect-btn.trail').addEventListener('click', function() {
        trailActive = !trailActive;
        this.classList.toggle('active');
    });

    document.querySelector('.effect-btn.explode').addEventListener('click', function() {
        explodeEffect();
    });

    let autoRotateBtn = document.createElement('button');
    autoRotateBtn.textContent = 'Auto Rotação';
    autoRotateBtn.className = 'effect-btn auto-rotate';
    autoRotateBtn.addEventListener('click', function() {
        autoRotate = !autoRotate;
        this.classList.toggle('active');
    });
    document.querySelector('.effects-grid').appendChild(autoRotateBtn);
}

function updateSphereSize(newSize) {
    particles.forEach(particle => {
        let distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
        let scale = newSize / distance;
        particle.x *= scale;
        particle.y *= scale;
        particle.z *= scale;
    });
}

function explodeEffect() {
    particles.forEach(particle => {
        let distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
        let scale = 1.5;
        particle.x *= scale;
        particle.y *= scale;
        particle.z *= scale;
        
        setTimeout(() => {
            scale = 1/1.5;
            particle.x *= scale;
            particle.y *= scale;
            particle.z *= scale;
        }, 500);
    });
}

function animate() {
    if (!trailActive) {
        ctx.clearRect(0, 0, width, height);
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
    }

    if (autoRotate) {
        rotationY += autoRotateSpeed;
    }

    let cosY = Math.cos(rotationY);
    let sinY = Math.sin(rotationY);
    let cosX = Math.cos(rotationX);
    let sinX = Math.sin(rotationX);

    particles.sort((a, b) => (b.z - a.z));

    particles.forEach(particle => {
        let x = particle.x * cosY - particle.z * sinY;
        let z = particle.z * cosY + particle.x * sinY;
        
        let y = particle.y * cosX - z * sinX;
        z = z * cosX + particle.y * sinX;

        let scale = (depth * 400) / (depth * 400 - z);
        let x2d = (x * scale) + width/2;
        let y2d = (y * scale) + height/2;

        if (pulseActive) {
            let pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
            scale *= pulseScale;
        }

        let color = currentColor;
        if (currentColor === 'rainbow') {
            let hue = (Date.now() * 0.1 + Math.atan2(y, x) * 180 / Math.PI) % 360;
            color = `hsl(${hue}, 100%, 50%)`;
        }

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.min(1, scale / 2);
        ctx.arc(x2d, y2d, scale * 1.5, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}