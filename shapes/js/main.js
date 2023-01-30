"use strict";

window.addEventListener ?
  window.addEventListener("load", main, false) :
  window.attachEvent && window.attachEvent("onload", main);


function main() {
  function setCameraAndRenderer() {
    canvas.style.width = '';
    canvas.style.height = '';
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;

    renderer.setSize(w, h);
    renderer.setViewport(0, 0, w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', setCameraAndRenderer);

  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  //renderer.setClearColor(0xffffff, 0);
  document.body.appendChild(renderer.domElement);

  let canvas = renderer.domElement;
  canvas.classList.add("centered");

  let scene = new THREE.Scene();

  let camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 100, 10000);
  camera.zoom = 10;
  camera.position.z = 1000;
  setCameraAndRenderer();

  let spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
  spotLight.position.x = 20;
  spotLight.position.y = 20;
  scene.add(spotLight);

  //let light = new THREE.AmbientLight(0x404040);
  //scene.add(light);

  spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
  spotLight.position.z = -20;
  //spotLight.position.y = 20;
  scene.add(spotLight);

  let light = new THREE.AmbientLight(0x404040);
  scene.add(light);


  let shapes = addGeometry(scene);
  let particles = addParticles(scene);
  //let wave = addWave(scene);



  let animate = function () {
    requestAnimationFrame(animate);

    shapes.update();
    particles.update();
    //wave.update();

    renderer.render(scene, camera);
  };

  animate();
}