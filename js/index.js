document.addEventListener('DOMContentLoaded', () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "webgl";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  //camera.position.x = 5;
  camera.lookAt(0, 0, 0);

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



  const boxGeometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  let models = [];
  if (true) {
    for (var i = 0; i < 10; i++) {
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff/*, wireframe: true*/ });
      const cube = new THREE.Mesh(boxGeometry, material);
      //cube.name = i;

      //cube.geometry.computeBoundingBox();
      cube.position.set(-15 + Math.random() * 30, Math.random() * 10, -15 + Math.random() * 30);
      cube.rotation.set(-5 + Math.random() * 10, -5 + Math.random() * 10, -5 + Math.random() * 10);
      cube.scale.set(0.1 + Math.random() * 5, 0.1 + Math.random() * 5, 0.1 + Math.random() * 5);

      scene.add(cube);
      models.push(cube);

      //const box = new THREE.BoxHelper(cube, 0xffff00);
      //scene.add(box);
    }
  } else {
    for (var i = 0; i < 1; i++) {
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff/*, wireframe: true*/ });
      const cube = new THREE.Mesh(boxGeometry, material);

      //cube.position.set(-5 + i * 2, 0, 0);
      //cube.rotation.set(Math.PI / 10, 0, 0);
      //cube.scale.set(1, 5, 1);
      scene.add(cube);
      models.push(cube);
    }
  }

  //const sphereGeometry = new THREE.SphereGeometry();
  //for (var i = 0; i < 10; i++) {
  //  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  //  const cube = new THREE.Mesh(sphereGeometry, material);
  //  //cube.name = i;

  //  cube.position.set(-5 + Math.random() * 15, -5 + Math.random() * 15, -5 + Math.random() * 5);
  //  cube.rotation.set(-5 + Math.random() * 10, -5 + Math.random() * 10, -5 + Math.random() * 10);
  //  scene.add(cube);
  //  models.push(cube);

  //  //const box = new THREE.BoxHelper(cube, 0xffff00);
  //  //scene.add(box);
  //}

  //const cylinderGeometry = new THREE.CylinderGeometry();
  //for (var i = 0; i < 10; i++) {
  //  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  //  const cube = new THREE.Mesh(cylinderGeometry, material);
  //  //cube.name = i;

  //  cube.position.set(-5 + Math.random() * 15, -5 + Math.random() * 15, -5 + Math.random() * 5);
  //  cube.rotation.set(-5 + Math.random() * 10, -5 + Math.random() * 10, -5 + Math.random() * 10);
  //  scene.add(cube);
  //  models.push(cube);

  //  //const box = new THREE.BoxHelper(cube, 0xffff00);
  //  //scene.add(box);
  //}




  const _frustum = new THREE.Frustum();

  let startPt = new THREE.Vector2(0, 0);
  let endPt = new THREE.Vector2(0, 0);

  function onPointerDown(event) {
    //camera.layers.disable(1);

    startPt.set(event.clientX, event.clientY);
  }

  function onPointerUp(event) {
    for (let i = 0; i < models.length; i++) {
      models[i].material.color.set(0xffffff);
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
      //console.log(pointer);
    } else {
      const pointer2 = new THREE.Vector2();
      pointer2.x = ((startPt.x - rect.left) / rect.width) * 2 - 1;
      pointer2.y = - ((startPt.y - rect.top) / rect.height) * 2 + 1;
      selectArea(pointer, pointer2);
    }
  }

  function pickPoint(pointer) {
    //planeNear = new THREE.Plane(new THREE.Vector3(1, 0, 0), -110);
    _frustum.planes[0] = null;


    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    //if (intersects1) {
    //  sphere.position.set(intersects1[0].point.x, intersects1[0].point.y, intersects1[0].point.z);
    //}

    for (let i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color.set(0xff0000);
    }
  }


  function selectArea(pointer0, pointer1) {
    let planeLft = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    //const helper0 = new THREE.PlaneHelper(plane0, 10, 0xffff00);
    //helper0.layers.set(1);
    //scene.add(helper0);

    let planeRgt = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    //const helper1 = new THREE.PlaneHelper(plane1, 10, 0xffff00);
    //helper1.layers.set(1);
    //scene.add(helper1);

    let planeBot = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    //const helper2 = new THREE.PlaneHelper(plane2, 10, 0xffff00);
    //helper2.layers.set(1);
    //scene.add(helper2);

    let planeTop = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    //const helper3 = new THREE.PlaneHelper(plane3, 10, 0xffff00);
    //helper3.layers.set(1);
    //scene.add(helper3);

    let planeFar = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    let planeNear = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);

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


    // we need to calculate the camera right vector
    let cameraRightVector = new THREE.Vector3();
    camera.getWorldDirection(cameraRightVector);
    cameraRightVector.cross(camera.up);

    // construct back plane to project on to (only need to once, then update if camera moves)
    let fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);

    let vToPlane = fwd.multiplyScalar(camera.far);

    let v1 = camera.position.clone().add(vToPlane);
    let v2 = v1.clone().add(cameraRightVector);
    let v3 = v1.clone().add(camera.up);


    planeFar.setFromCoplanarPoints(v1, v2, v3);
    //const helperFar = new THREE.PlaneHelper(planeFar, 1000, 0xffff00);
    //scene.add(helperFar);


    // near plane
    camera.getWorldDirection(fwd);
    vToPlane = fwd.multiplyScalar(camera.near);

    v1 = camera.position.clone().add(vToPlane);
    v2 = v1.clone().add(cameraRightVector);
    v3 = v1.clone().add(camera.up);

    //let up = camera.position.clone().add(camera.up);
    planeNear.setFromCoplanarPoints(v1, v3, v2);





    const raycasterBL = new THREE.Raycaster();
    raycasterBL.setFromCamera(pointerBL, camera);

    const intersectsBL1 = new THREE.Vector3();
    raycasterBL.ray.intersectPlane(planeFar, intersectsBL1);


    const raycasterTR = new THREE.Raycaster();
    raycasterTR.setFromCamera(pointerTR, camera);

    const intersectsTR1 = new THREE.Vector3();
    raycasterTR.ray.intersectPlane(planeFar, intersectsTR1);

    // left plane
    // formed from camera position, bottom left intersection point and camera up vector
    let offset = camera.position.clone().add(camera.up);
    planeLft.setFromCoplanarPoints(camera.position, intersectsBL1, offset);

    // right plane
    // formed from camera position, camera up vector and top right intersection point
    planeRgt.setFromCoplanarPoints(camera.position, offset, intersectsTR1);


    // bottom plane
    // formed from camera position, camera right vector and bottom left intersection point
    offset = camera.position.clone().add(cameraRightVector);
    planeBot.setFromCoplanarPoints(camera.position, offset, intersectsBL1);

    // top plane
    // formed from camera position, top right intersection point and camera right vector
    planeTop.setFromCoplanarPoints(camera.position, intersectsTR1, offset);

    const planes = _frustum.planes;

    planes[0] = planeTop;
    planes[1] = planeRgt;
    planes[2] = planeBot;
    planes[3] = planeLft;
    planes[4] = planeNear;
    planes[5] = planeFar;

    findIntersectedObjects();

    //planeTop = null;
    //planeRgt = null;
    //planeBot = null;
    //planeLft = null;
    //planeNear = null;
    //planeFar = null;
  }

  function findEnclosedObjects() {

  }

  function findIntersectedObjects() {
    // inside frustum? orientation of plane?
    let found = false;
    for (let i = 0; i < models.length; i++) {
      // quick selected
      // centre is inside frustum
      if (_frustum.containsPoint(models[i].position)) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      // quick rejections
      // bounding sphere is wholly outside selection frustum 
      //if (_frustum.intersectsObject(models[i]) === false) continue;

      //if (models[i].geometry.boundingBox === null) {
      //  models[i].geometry.computeBoundingBox();
      //}

      //let box = new THREE.Box3();
      //box.copy(models[i].geometry.boundingBox).applyMatrix4(models[i].matrixWorld);

      //// bounding box is wholly outside selection frustum 
      //if (_frustum.intersectsBox(box) === false) {
      //  //models[i].material.color.set(0xff0000);
      //  continue;
      //}

      //box = models[i].clone();
      //box.applyMatrix4(models[i].matrixWorld);
      const vertices1 = models[i].geometry.getAttribute('position');
      const vertices = models[i].geometry.getAttribute('position').clone().applyMatrix4(models[i].matrixWorld);

      // any point is inside frustum
      for (let j = 0; j < vertices.array.length; j += 3) {
        let point = new THREE.Vector3(vertices.array[j], vertices.array[j+1], vertices.array[j+2]);
        if (_frustum.containsPoint(point)) {
          models[i].material.color.set(0xff0000);
          j = vertices.array.length;
          found = true;
        }
      }
      if (found) continue;

      //for (let i = 0; i < models.length; i++) {
      //  let distLft = planeLft.distanceToPoint(models[i].position);
      //  let distRgt = planeRgt.distanceToPoint(models[i].position);
      //  let distBot = planeBot.distanceToPoint(models[i].position);
      //  let distTop = planeTop.distanceToPoint(models[i].position);
      //  //if (dist0 * dist2 < 0 && dist1 * dist3 < 0)

      //  //if (distBot > 0 && distTop < 0 && distLft < 0 && distRgt > 0)
      //  if (distTop > 0 && distBot > 0 && distLft > 0 && distRgt > 0)
      //    models[i].material.color.set(0xff0000);
      //}

    }



    // For plane
    // .distanceToSphere
    // .intersectsBox
    // .intersectsLine
    // .intersectsSphere

    // For frustum
    // .containsPoint
    // .intersectsBox
    // .intersectsObject
    // .intersectsSphere


    // 2. check other vertices - either of geometry or bounding sphere/box
    //    bound is approximate (unless for sphere or box) but if all points on one side then no intersection
    // 3. check lines (not faces) .intersectsLine

    // EXCLUDE items behind viewer!!!

  }


  let angle = 0;
  function animate() {
    //camera.position.x += .01;
    //models[0].rotation.x += .01;
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