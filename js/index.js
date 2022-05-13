document.addEventListener('DOMContentLoaded', () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "webgl";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.position.x = 5;
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const helper = new SelectionHelper(renderer, 'selectBox');

  var ambientLightColour = new THREE.Color(0.5, 0.5, 0.5);
  const ambientLight = new THREE.AmbientLight(ambientLightColour);
  scene.add(ambientLight);

  var directionalLightColour = new THREE.Color(0.9, 0.9, 0.9);
  const light = new THREE.PointLight(directionalLightColour, 1.0);
  //light.shadowCameraVisible = true;
  light.castShadow = true;
  scene.add(light);


  //const geometry2 = new THREE.SphereGeometry(1);
  //const material2 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  //const sphere = new THREE.Mesh(geometry2, material2);
  //sphere.position.set(2, 0, -5);
  //scene.add(sphere);
  //camera.add(sphere);
  ////camera.remove(sphere);
  //sphere.position.set(2, 0, -5);
  ////sphere.position.set(0, 0, -10);



  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  let cubes = [];
  for (var i = 0; i < 10; i++) {
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = i;

    cube.position.set(-5 + Math.random() * 10, -5 + Math.random() * 10, -5 + Math.random() * 10);
    scene.add(cube);
    cubes.push(cube);
  }

  // "back splash"
  const geometry1 = new THREE.PlaneGeometry(1000, 1000);
  const material1 = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
  const backSplash = new THREE.Mesh(geometry1, material1);
  backSplash.name = "back";
  backSplash.position.set(0, 0, -100);
  //backSplash.rotation.set(Math.PI / 10, Math.PI / 10, Math.PI / 10);
  camera.add(backSplash);
  //scene.add(backSplash);


  const planeLft = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  //const helper0 = new THREE.PlaneHelper(plane0, 10, 0xffff00);
  //helper0.layers.set(1);
  //scene.add(helper0);

  const planeRgt = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  //const helper1 = new THREE.PlaneHelper(plane1, 10, 0xffff00);
  //helper1.layers.set(1);
  //scene.add(helper1);

  const planeBot = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  //const helper2 = new THREE.PlaneHelper(plane2, 10, 0xffff00);
  //helper2.layers.set(1);
  //scene.add(helper2);

  const planeTop = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  //const helper3 = new THREE.PlaneHelper(plane3, 10, 0xffff00);
  //helper3.layers.set(1);
  //scene.add(helper3);

  const planeFar = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  const planeNear = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);

  const _frustum = new THREE.Frustum();

  let startPt = new THREE.Vector2(0, 0);
  let endPt = new THREE.Vector2(0, 0);

  function onPointerDown(event) {
    //camera.layers.disable(1);

    startPt.set(event.clientX, event.clientY);
  }

  function onPointerUp(event) {
    for (let i = 0; i < cubes.length; i++) {
      cubes[i].material.color.set(0xffffff);
    }

    endPt.set(event.clientX, event.clientY);

    const pointer = new THREE.Vector2();
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    var rect = renderer.domElement.getBoundingClientRect();
    //pointer.x = event.clientX - rect.left;
    //pointer.y = event.clientY - rect.top;

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;


    if (startPt.distanceToSquared(endPt) < 25) {
      pickPoint(pointer);
    } else {
      const pointer2 = new THREE.Vector2();
      pointer2.x = ((startPt.x - rect.left) / rect.width) * 2 - 1;
      pointer2.y = - ((startPt.y - rect.top) / rect.height) * 2 + 1;
      selectArea(pointer, pointer2);
    }
  }

  function pickPoint(pointer) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    //if (intersects1) {
    //  sphere.position.set(intersects1[0].point.x, intersects1[0].point.y, intersects1[0].point.z);
    //}

    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === "back") continue;
      intersects[i].object.material.color.set(0xff0000);
    }
  }


  function selectArea(pointer0, pointer1) {
    //camera.layers.enable(1);

    let pointerBL = pointer0.clone();
    let pointerTR = pointer1.clone();
    if (pointer0.x > pointer1.x) {
      pointerBL.x = pointer1.x;
      pointerTR.x = pointer0.x;
    }
    if (pointer0.y > pointer1.y) {
      pointerBL.y = pointer1.y;
      pointerTR.y = pointer0.y;
    }

    const raycasterBL = new THREE.Raycaster();
    raycasterBL.setFromCamera(pointerBL, camera);
    const intersectsBL = raycasterBL.intersectObjects(scene.children);

    const raycasterTR = new THREE.Raycaster();
    raycasterTR.setFromCamera(pointerTR, camera);
    const intersectsTR = raycasterTR.intersectObjects(scene.children);

    // left plane
    // formed from camera position, bottom left intersection point and camera up vector
    let offset = camera.position.clone().add(camera.up);
    planeLft.setFromCoplanarPoints(camera.position, intersectsBL[0].point, offset);

    // right plane
    // formed from camera position, camera up vector and top right intersection point
    planeRgt.setFromCoplanarPoints(camera.position, offset, intersectsTR[0].point);


    // bottom plane
    // formed from camera position, camera right vector and bottom left intersection point
    // we need to calculate the camera right vector
    let cameraRightVector = new THREE.Vector3();
    camera.getWorldDirection(cameraRightVector);
    cameraRightVector.cross(camera.up);
    offset = camera.position.clone().add(cameraRightVector);
    planeBot.setFromCoplanarPoints(camera.position, offset, intersectsBL[0].point);

    // top plane
    // formed from camera position, top right intersection point and camera right vector
    planeTop.setFromCoplanarPoints(camera.position, intersectsTR[0].point, offset);

    // far plane - aasumes backSpalsh is at limit of detection
    planeFar.setFromCoplanarPoints(backSplash.position, intersectsBL[0].point, intersectsTR[0].point);

    // near plane
    let up = camera.position.clone().add(camera.up);
    planeNear.setFromCoplanarPoints(camera.position, cameraRightVector, up);

    const planes = _frustum.planes;

    planes[0] = planeTop;
    planes[1] = planeRgt;
    planes[2] = planeBot;
    planes[3] = planeLft;
    planes[4] = planeNear;
    planes[5] = planeFar;

    findIntersectedObjects();
  }

  function findEnclosedObjects() {

  }

  function findIntersectedObjects() {
    // find all objects between all planes
    // 1. check position - definitely inside

    for (let i = 0; i < cubes.length; i++) {
      let distLft = planeLft.distanceToPoint(cubes[i].position);
      let distRgt = planeRgt.distanceToPoint(cubes[i].position);
      let distBot = planeBot.distanceToPoint(cubes[i].position);
      let distTop = planeTop.distanceToPoint(cubes[i].position);
      //if (dist0 * dist2 < 0 && dist1 * dist3 < 0)

      //if (distBot > 0 && distTop < 0 && distLft < 0 && distRgt > 0)
      if (distTop > 0 && distBot > 0 && distLft > 0 && distRgt > 0)
        cubes[i].material.color.set(0xff0000);
    }


    // any vertex is inside
    // quick exclude? if bounded box, sphere is outside
    // sphere, then box
    // then points inside
    // then intersections

    // For plane
    // .distanceToSphere
    // .intersectsBox
    // .intersectsLine
    // .intersectsSphere

    // For frustum
    // .containsPoint
    // .intersectsBox
    // .intersectsObjec
    // .intersectsSphere


    // 2. check other vertices - either of geometry or bounding sphere/box
    //    bound is approximate (unless for sphere or box) but if all points on one side then no intersection
    // 3. check lines (not faces) .intersectsLine

    // EXCLUDE items behind viewer!!!

  }


  let angle = 0;
  function animate() {
    //camera.position.x += .01;
    //angle += .01;
    //sphere.position.z = Math.cos(angle) * 10;
    //sphere.position.x = Math.sin(angle) * 10;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();


  window.addEventListener('resize', onWindowResize, false);
  //renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }
});