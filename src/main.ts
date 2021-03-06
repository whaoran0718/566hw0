import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  color: '#ff0000',
  shape: 'cube',
  shader: 'lambert',
  'Load Scene': loadScene, // A function pointer, essentially
  
  get Colorfv() {
    let decCol = parseInt(this.color.slice(1), 16);
    let r = (decCol >> 16) & 255;
    let g = (decCol >> 8) & 255;
    let b = decCol & 255;
    return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, 1);
  }
};

let icosphere: Icosphere;
let square: Square;
let cubeSeparate: Cube;
let cubeCojoint: Cube;
let prevTesselations: number = 5;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cubeSeparate = new Cube(vec3.fromValues(0, 0, 0));
  cubeSeparate.create();
  cubeCojoint = new Cube(vec3.fromValues(0, 0, 0), true);
  cubeCojoint.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.addColor(controls, "color");
  gui.add(controls, 'shape', ['cube', 'square', 'icosphere']);
  gui.add(controls, 'shader', ['lambert', 'wave']);
  gui.add(controls, 'Load Scene');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);
  
  const wave = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/wave-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/wave-frag.glsl')),
  ]);

  let time = 0;
  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    lambert.setGeometryColor(controls.Colorfv);
    wave.setTime(time);

    let shader : ShaderProgram;
    let cube : Cube;
    switch(controls.shader) {
      case 'wave':  shader = wave; cube = cubeCojoint; break;
      case 'lambert':
      default:  shader = lambert; cube = cubeSeparate; break;
    }
    switch(controls.shape) {
      case 'square':  renderer.render(camera, shader, [square]); break;
      case 'icosphere': renderer.render(camera, shader, [icosphere]); break;
      case 'cube':
      default:  renderer.render(camera, shader, [cube]); break;
    }
    stats.end();
    time++;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
