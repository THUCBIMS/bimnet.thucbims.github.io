// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // 设置背景颜色为白色

// 获取 viewer 容器并将 canvas 添加进去
const viewer = document.getElementById('viewer');
viewer.appendChild(renderer.domElement);
// document.body.appendChild(renderer.domElement);

// 设置 renderer 的大小为容器的大小
function resizeRenderer() {
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
resizeRenderer(); // 初始化时设置大小

// Lights
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// // Load point cloud data from a txt file
// fetch('point.txt')
//     .then(response => response.text())
//     .then(data => {
//         const points = parsePointCloudData(data);
//         scene.add(points);
//     })
//     .catch(error => {
//         console.error('An error occurred loading the point cloud file:', error);
//     });

// // Load OBJ file
// const objLoader = new THREE.OBJLoader();
// objLoader.load('usr.obj', function (object) {
//     scene.add(object);
//     object.position.set(0, 0, 0);
//     object.scale.set(1, 1, 1);
// }, undefined, function (error) {
//     console.error('An error occurred loading the OBJ file:', error);
// });

// // Function to parse point cloud data
// function parsePointCloudData(data) {
//     const lines = data.split('\n');
//     const geometry = new THREE.BufferGeometry();
//     const positions = [];
//     const colors = [];

//     lines.forEach(line => {
//         if (line.trim().length > 0) {
//             const [x, y, z, r, g, b] = line.split(' ').map(Number);
//             positions.push(x, y, z);
//             colors.push(r / 255, g / 255, b / 255); // Normalize colors to [0, 1]
//         }
//     });

//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

//     const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
//     return new THREE.Points(geometry, material);
// }

// // // Camera position
// camera.position.z = 5;

// 自动旋转标志
let autoRotate = true;
let timeoutId;

// 监听 OrbitControls 的交互事件
controls.addEventListener('start', () => {
    autoRotate = false; // 停止自动旋转
    if (timeoutId) {
        clearTimeout(timeoutId); // 清除之前的计时器
    }
});

controls.addEventListener('end', () => {
    timeoutId = setTimeout(() => {
        autoRotate = true; // 重新开始自动旋转
    }, 2000); // 3秒后重新开始自动旋转
});


// 加载点云和OBJ文件的函数
const loaders = {
    point: new THREE.PCDLoader(),
    obj: new THREE.OBJLoader()
};

const models = {
    pair1: { point: 'point.pcd', obj: 'usr.obj' },
    pair2: { point: 'point2.pcd', obj: 'model2.obj' }
    // Add more pairs as needed
};

let currentPointCloud = null;
let currentOBJ = null;

function loadModelPair(pair) {
    if (currentPointCloud) {
        scene.remove(currentPointCloud);
    }
    if (currentOBJ) {
        scene.remove(currentOBJ);
    }

    const { point, obj } = models[pair];

    loaders.point.load(point, (points) => {
        currentPointCloud = points;
        updateVisibility();
        scene.add(points);
    });

    loaders.obj.load(obj, (object) => {
        currentOBJ = object;
        updateVisibility();
        scene.add(object);
    });
}

function updateVisibility() {
    if (currentPointCloud) {
        currentPointCloud.visible = document.getElementById('showPointCloud').checked;
    }
    if (currentOBJ) {
        currentOBJ.visible = document.getElementById('showOBJ').checked;
    }
}

// 监听选择列表和复选框的变化
document.getElementById('modelSelect').addEventListener('change', (event) => {
    loadModelPair(event.target.value);
});

document.getElementById('showPointCloud').addEventListener('change', updateVisibility);
document.getElementById('showOBJ').addEventListener('change', updateVisibility);

// 初始加载第一个模型对
loadModelPair('pair1');

// Camera position
camera.position.z = 5;


// Render loop
function animate() {
    requestAnimationFrame(animate);

    if (autoRotate) {
        // 自动旋转场景中的所有物体
        scene.children.forEach(child => {
            child.rotation.y += 0.003; // 以每帧0.01弧度的速度旋转
        });
    }

    controls.update(); // Only if using controls
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    resizeRenderer();
});
