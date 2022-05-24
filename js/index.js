document.addEventListener('DOMContentLoaded', () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "webgl";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  camera.lookAt(0, 0, 0);

  const helper = new SelectionHelper(renderer, 'selectBox');

  let ambientLightColour = new THREE.Color(0.5, 0.5, 0.5);
  const ambientLight = new THREE.AmbientLight(ambientLightColour);
  scene.add(ambientLight);

  let directionalLightColour = new THREE.Color(0.9, 0.9, 0.9);
  const light = new THREE.PointLight(directionalLightColour, 1.0);
  //light.shadowCameraVisible = true;
  light.castShadow = true;
  scene.add(light);

  const holdall = new THREE.Object3D();
  scene.add(holdall);

  const boxGeometry = new THREE.BoxGeometry();
  let boxGeometry2 = new THREE.BoxGeometry();
  boxGeometry2.deleteAttribute('normal');
  boxGeometry2.deleteAttribute('uv');
  boxGeometry2 = THREE.BufferGeometryUtils.mergeVertices(boxGeometry2);

  const vertices = boxGeometry.getAttribute('position');
  const vertices2 = boxGeometry2.getAttribute('position');

  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  let models = [];
  if (false) {
    for (let i = 0; i < 10; i++) {
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true });
      const cube = new THREE.Mesh(boxGeometry, material);

      cube.position.set(-15 + Math.random() * 30, Math.random() * 10, -15 + Math.random() * 30);
      cube.rotation.set(-5 + Math.random() * 10, -5 + Math.random() * 10, -5 + Math.random() * 10);
      cube.scale.set(0.1 + Math.random() * 5, 0.1 + Math.random() * 5, 0.1 + Math.random() * 5);

      scene.add(cube);
      models.push(cube);
    }
  } else {
    let radius = 1;
    let spacing = radius * 1.5;
    let count = 5;
    let offset = count / 2;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff/*, wireframe: true*/ });
        const cube = new THREE.Mesh(boxGeometry, material);
        cube.position.set(offset - i * spacing, offset - j * spacing, 0);
        holdall.add(cube);
        models.push(cube);
      }
    }

    radius *= 2;
    spacing = radius * 1.5;
    offset *= 2;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff/*, wireframe: true*/ });
        const cube = new THREE.Mesh(boxGeometry, material);
        cube.position.set(offset - i * spacing, offset - j * spacing, -spacing);
        cube.scale.set(2, 2, 2);
        holdall.add(cube);
        models.push(cube);
      }
    }
  }

  function onKeyUp(e) {
    if (e.keyCode == 37) {
      holdall.rotation.y -= .01;
    }
    if (e.keyCode == 39) {
      holdall.rotation.y += .01;
    }
    if (e.keyCode == 38) {
      holdall.rotation.x -= .01;
    }
    if (e.keyCode == 40) {
      holdall.rotation.x += .01;
    }
  }

  //const sphereGeometry = new THREE.SphereGeometry();
  //for (let i = 0; i < 10; i++) {
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
  //for (let i = 0; i < 10; i++) {
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
    let rect = renderer.domElement.getBoundingClientRect();
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

    for (let i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color.set(0xff0000);
    }
  }


  function selectArea(pointer0, pointer1) {
    let planeLft = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    let planeRgt = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    let planeBot = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    let planeTop = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
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

    // if left to right enclosed
    // if right to left any partially selected
    if (pointer0.x < pointer1.x) {
      findIntersectedObjects(pointerBL, pointerTR);
    } else {
      findEnclosedObjects(pointerBL, pointerTR);
    }
  }

  // wholly enclosed - all points inside
  function findEnclosedObjects(pointerBL, pointerTR) {
    let found = false;
    for (let i = 0; i < models.length; i++) {
      // reject outside
      if (_frustum.intersectsObject(models[i]) === false) continue;

      // if any of the selection frustum corners intersects then can't be wholly inside3
      if (intersectPointerObject(pointerBL, models[i])) {
        continue;
      }

      if (intersectPointerObject(pointerTR, models[i])) {
        continue;
      }

      if (intersectPointerObject(new THREE.Vector2(pointerTR.x, pointerBL.y), models[i])) {
        continue;
      }

      if (intersectPointerObject(new THREE.Vector2(pointerBL.x, pointerTR.y), models[i])) {
        continue;
      }

      // all points inside frustum
      const vertices = models[i].geometry.getAttribute('position').clone().applyMatrix4(models[i].matrixWorld);

      let cnt = 0;
      for (let j = 0; j < vertices.array.length; j += 3) {
        let point = new THREE.Vector3(vertices.array[j], vertices.array[j + 1], vertices.array[j + 2]);
        if (_frustum.containsPoint(point)) {
          cnt++;
        }
      }
      if (cnt === vertices.array.length / 3) {
        models[i].material.color.set(0xff0000);
      }
    }

  }

  function intersectPointerObject(pointer, object) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([object]).length > 0;
  }

  function findIntersectedObjects(pointerBL, pointerTR) {
    // inside frustum? orientation of plane?
    let found = false;
    for (let i = 0; i < models.length; i++) {
      // quick selected
      // centre is inside frustum
      if (_frustum.containsPoint(models[i].position)) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      // the selection can be wholly inside the object
      // does a corner of the selection frustum intersect this object
      // test all corners if true may save an intersection test, etc.
      if (intersectPointerObject(pointerBL, models[i])) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      if (intersectPointerObject(pointerTR, models[i])) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      if (intersectPointerObject(new THREE.Vector2(pointerTR.x, pointerBL.y), models[i])) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      if (intersectPointerObject(new THREE.Vector2(pointerBL.x, pointerTR.y), models[i])) {
        models[i].material.color.set(0xff0000);
        continue;
      }

      // quick rejections
      // bounding sphere is wholly outside selection frustum 
      if (_frustum.intersectsObject(models[i]) === false) continue;

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

      // faces for indexed geometry
      //const index = geometry.getIndex();
      //for (let i = 0; i < index.count; i += 3) {
      //  const a = index.getX(i);
      //  const b = index.getX(i + 1);
      //  const c = index.getX(i + 2);
      //}
      //
      // faces for un-indexed geometry
      //const position = geometry.getAttribute('position');
      //for (let i = 0; i < position.count; i += 3) {
      //  const a = i;
      //  const b = i + 1;
      //  const c = i + 2;
      //}

      // check whether any lines intersect the selcetion frustum
      const indices = models[i].geometry.index.array;

      if (checkFrustumLineIntersection(vertices, indices, _frustum))
        models[i].material.color.set(0xff0000);
    }
  }

  function checkFrustumLineIntersection(vertices, indices, frustum) {
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3;
      const b = indices[i + 1] * 3;
      const c = indices[i + 2] * 3;

      let pointA = new THREE.Vector3(vertices.array[a], vertices.array[a + 1], vertices.array[a + 2]);
      let pointB = new THREE.Vector3(vertices.array[b], vertices.array[b + 1], vertices.array[b + 2]);
      let pointC = new THREE.Vector3(vertices.array[c], vertices.array[c + 1], vertices.array[c + 2]);

      let lines = []
      lines.push(new THREE.Line3(pointA, pointB));
      lines.push(new THREE.Line3(pointB, pointC));
      lines.push(new THREE.Line3(pointC, pointA));
      for (let j = 0; j < 6; j++) {
        for (let k = 0; k < lines.length; k++) {
          let intersects = _frustum.planes[j].intersectsLine(lines[k]);
          if (intersects) {
            let intersection = new THREE.Vector3();
            frustum.planes[j].intersectLine(lines[k], intersection);

            if (frustum.containsPoint(intersection)) {
              return true;
            }
          }
        }
      }
    }
    return false;
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
  document.addEventListener('keyup', onKeyUp);

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }
});