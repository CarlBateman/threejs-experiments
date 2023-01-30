"use strict";

window.addEventListener ?
  window.addEventListener("load", main, false) :
  window.attachEvent && window.attachEvent("onload", main);


function main() {
  function setCameraAndRenderer() {
    canvas.style.width = '';
    canvas.style.height = '';
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;

    renderer.setSize(w, h);
    renderer.setViewport(0, 0, w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', setCameraAndRenderer);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);

  let canvas = renderer.domElement;
  canvas.classList.add("centered");

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 100, 10000);
  camera.zoom = 10;
  camera.position.z = 1000;
  setCameraAndRenderer();

  var spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
  spotLight.position.x = 20;
  spotLight.position.y = 20;
  scene.add(spotLight);

  //var light = new THREE.AmbientLight(0x404040);
  //scene.add(light);

  var spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
  spotLight.position.z = -20;
  //spotLight.position.y = 20;
  scene.add(spotLight);

  var light = new THREE.AmbientLight(0x404040);
  scene.add(light);


  var shapes = addGeometry(scene);
  var particles = addParticles(scene);
  var wave = addWave(scene);



  let orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  var animate = function () {
    requestAnimationFrame(animate);

    shapes.update();
    particles.update();
    wave.update();

    orbitControls.update();

    renderer.render(scene, camera);
  };

  animate();
}