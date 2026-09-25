let scene, camera, renderer, clock;
let playerGroup, currentSkin = 'grace';
let trackSegments = [], obstacles = [];
let isPlaying = false, score = 0, speed = 25;
let tiltX = 0;

const skins = {
    grace: { bodyColor: 0x1d3557, suitColor: 0x457b9d, hairColor: 0x111111, isAfro: true },
    shadow: { bodyColor: 0xf1faee, suitColor: 0xffffff, hairColor: 0xffffff },
    best: { bodyColor: 0xf1faee, suitColor: 0xffffff, hairColor: 0xffffff },
    michelle: { bodyColor: 0x2b2d42, suitColor: 0x8d99ae, hairColor: 0xedf2f4 }
};

document.addEventListener('deviceready', () => {
    window.addEventListener('deviceorientation', handleGyro, true);
    init3D();
}, false);

if (!window.cordova) window.onload = init3D;

function handleGyro(e) {
    if (e.gamma !== null) tiltX = e.gamma / 20;
}

function init3D() {
    const container = document.getElementById('game-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.Fog(0x0a0a12, 20, 90);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3.5, 7);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    buildPlayer();
    buildTrack();
    animate();
}

function buildPlayer() {
    if (playerGroup) scene.remove(playerGroup);
    playerGroup = new THREE.Group();
    const cfg = skins[currentSkin];

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), new THREE.MeshStandardMaterial({ color: cfg.suitColor }));
    torso.position.y = 1.1;
    playerGroup.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xd4a373 }));
    head.position.y = 1.8;
    playerGroup.add(head);

    const hairGeo = cfg.isAfro ? new THREE.SphereGeometry(0.35, 8, 8) : new THREE.BoxGeometry(0.42, 0.2, 0.42);
    const hair = new THREE.Mesh(hairGeo, new THREE.MeshStandardMaterial({ color: cfg.hairColor }));
    hair.position.set(0, cfg.isAfro ? 1.95 : 2.0, 0);
    playerGroup.add(hair);

    const legMat = new THREE.MeshStandardMaterial({ color: cfg.bodyColor });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), legMat);
    leftLeg.position.set(-0.18, 0.35, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), legMat);
    rightLeg.position.set(0.18, 0.35, 0);
    playerGroup.add(rightLeg);

    scene.add(playerGroup);
}

function buildTrack() {
    for (let i = 0; i < 10; i++) createTrackSegment(-i * 20);
}

function createTrackSegment(zPos) {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 20), new THREE.MeshStandardMaterial({ color: (zPos / 20) % 2 === 0 ? 0x1f1f30 : 0x181825 }));
    seg.position.set(0, -0.1, zPos);
    scene.add(seg);
    trackSegments.push(seg);

    if (zPos < -20 && Math.random() > 0.3) {
        const obs = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1), new THREE.MeshStandardMaterial({ color: 0xff0055 }));
        obs.position.set((Math.floor(Math.random() * 3) - 1) * 2, 0.6, zPos);
        scene.add(obs);
        obstacles.push(obs);
    }
}

function selectChar(name, el) {
    currentSkin = name;
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    buildPlayer();
}

function startGame() {
    document.getElementById('char-menu').style.display = 'none';
    score = 0;
    isPlaying = true;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (isPlaying) {
        score += Math.floor(delta * speed);
        document.getElementById('score-display').innerText = score + 'm';

        playerGroup.position.x += tiltX * delta * 8;
        playerGroup.position.x = Math.max(-2.5, Math.min(2.5, playerGroup.position.x));
        camera.position.x = playerGroup.position.x * 0.3;

        trackSegments.forEach(seg => {
            seg.position.z += speed * delta;
            if (seg.position.z > 10) seg.position.z -= 200;
        });

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.position.z += speed * delta;

            if (Math.abs(obs.position.z - playerGroup.position.z) < 0.8 && Math.abs(obs.position.x - playerGroup.position.x) < 1.0) {
                isPlaying = false;
                alert('CRASH! Final Distance: ' + score + 'm');
                document.getElementById('char-menu').style.display = 'flex';
                obstacles.forEach(o => scene.remove(o));
                obstacles = [];
                buildTrack();
                break;
            }

            if (obs.position.z > 10) {
                scene.remove(obs);
                obstacles.splice(i, 1);
            }
        }
    }
    renderer.render(scene, camera);
}
