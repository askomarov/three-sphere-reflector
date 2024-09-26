import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import GUI from "lil-gui";

class Sketch {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Основные параметры
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.controls = this.addOrbitControls();
    this.textureLoader = new THREE.TextureLoader();
    this.clock;
    this.gui = new GUI();
    this.bgMesh;
    this.balls = [];

    this.mousePos = new THREE.Vector2(0, 0);

    this.sphereMatOption = {
      roughness: 0.15,
      transmission: 1,
      thickness: 4,
    };

    // Запускаем инициализацию
    this.init();
  }

  async init() {
    this.clock = new THREE.Clock();
    // Добавляем объекты на сцену
    this.addObjects();

    // Обработчики событий
    this.addEventListeners();

    // Добавляем освещение
    this.addLight();

    this.initGui();

    // Запуск анимации
    this.animate();
  }

  initGui() {
    this.gui
      .add(this.bgMesh.position, "x")
      .name("bgMesh.position.x")
      .onChange((value) => {
        this.bgMesh.position.x = value;
      });

    this.gui
      .add(this.sphereMatOption, "transmission", 0, 1, 0.01)
      .onChange((val) => {
        this.sphereMaterial1.transmission = val;
      });

    this.gui
      .add(this.sphereMatOption, "thickness", 0, 5, 0.1)
      .onChange((val) => {
        this.sphereMaterial1.thickness = val;
      });

    this.gui
      .add(this.sphereMatOption, "roughness", 0, 1, 0.01)
      .onChange((val) => {
        this.sphereMaterial1.roughness = val;
      });
  }

  // Создание сцены
  createScene() {
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x686868);
    return scene;
  }

  // Создание камеры
  createCamera() {
    const fov = 45;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 20);
    return camera;
  }

  // Создание рендера
  createRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(this.width, this.height);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x1f1e1c, 1);
    if (this.container) {
      this.container.appendChild(renderer.domElement);
    } else {
      console.error(`Элемент с id "${this.containerId}" не найден.`);
    }

    return renderer;
  }

  addLight() {
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(dirLight);
  }

  addOrbitControls() {
    return new OrbitControls(this.camera, this.renderer.domElement);
  }

  addObjects() {
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load("./textures/stained-glass.jpg");
    const bgGeometry = new THREE.PlaneGeometry(19.2, 14.4);
    const bgMaterial = new THREE.MeshBasicMaterial({
      map: bgTexture,
      side: THREE.DoubleSide,
    });
    this.bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.bgMesh.position.set(0, 0, -1);
    this.scene.add(this.bgMesh);

    const envMapTexture = new RGBELoader().load(
      "./textures/hdr_map.hdr",
      () => {
        envMapTexture.mapping = THREE.EquirectangularReflectionMapping;
        envMapTexture.needsUpdate = true;
      }
    );
    // spheres
    const golfNormal = textureLoader.load("./textures/golfball_normal.jpeg");
    const bballNormal = textureLoader.load("./textures/basketball_normal.png");
    const roughNormal = textureLoader.load("./textures/Water_2_M_Normal.jpeg");
    const clearcoatNormal = textureLoader.load(
      "./textures/Scratched_gold_01_1K_Normal.png"
    );

    const sphereGeo = new THREE.SphereGeometry(3, 32, 32);
    this.sphereMaterial1 = new THREE.MeshPhysicalMaterial({
      roughness: this.sphereMatOption.roughness,
      transmission: this.sphereMatOption.transmission,
      thickness: this.sphereMatOption.thickness,
      clearcoat: 1,
      clearcoatNormalMap: clearcoatNormal,
      envMap: envMapTexture,
    });
    this.sphere1 = new THREE.Mesh(sphereGeo, this.sphereMaterial1);
    this.sphere1.position.set(5, 3.5, 3);
    this.scene.add(this.sphere1);

    // sphere 2
    this.sphereMaterial2 = new THREE.MeshPhysicalMaterial({
      normalMap: golfNormal,
      roughness: 0.15,
      transmission: 1,
      thickness: 2,
      envMap: envMapTexture,
    });
    this.sphere2 = new THREE.Mesh(sphereGeo, this.sphereMaterial2);
    this.sphere2.position.set(-5, 3.5, 3);
    this.scene.add(this.sphere2);

    // sphere 3
    this.sphereMaterial3 = new THREE.MeshPhysicalMaterial({
      normalMap: roughNormal,
      clearcoat: 1,
      clearcoatNormalMap: clearcoatNormal,
      roughness: 0.15,
      transmission: 1,
      thickness: 2,
    });
    this.sphere3 = new THREE.Mesh(sphereGeo, this.sphereMaterial3);
    this.sphere3.position.set(-5, -3.5, 3);
    this.scene.add(this.sphere3);

    // sphere 4
    this.sphereMaterial4 = new THREE.MeshPhysicalMaterial({
      normalMap: bballNormal,
      roughness: 0.15,
      transmission: 1,
      thickness: 2,
    });
    this.sphere4 = new THREE.Mesh(sphereGeo, this.sphereMaterial4);
    this.sphere4.position.set(5, -3.5, 3);
    this.scene.add(this.sphere4);
    this.balls.push(this.sphere4, this.sphere3, this.sphere2, this.sphere1)
  }

  // Обработчик изменения размеров окна
  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(evt) {
    this.mousePos.x = (evt.clientX / this.width) * 2 - 1;
    this.mousePos.y = -(evt.clientY / this.height) * 2 + 1;
    this.bgMesh.position.x = this.mousePos.x * 2;
    this.bgMesh.position.y = this.mousePos.y* 2;
  }

  // Добавление обработчиков событий
  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));

    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
  }
  // Анимация
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const rotateX = (delta / 15) * Math.PI * 2;
    const rotateY = (delta / 15) * Math.PI * 2;

    this.balls.forEach((ball) => {
      ball.rotateX(rotateX);
      ball.rotateY(rotateY);
    });
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

export default Sketch;
