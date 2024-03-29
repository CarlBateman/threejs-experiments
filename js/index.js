﻿document.addEventListener('DOMContentLoaded', () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "webgl";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  const helper = new SelectionHelper(renderer, 'selectBox');
  helper.enabled = false;

  let ambientLightColour = new THREE.Color(0.5, 0.5, 0.5);
  const ambientLight = new THREE.AmbientLight(ambientLightColour);
  scene.add(ambientLight);

  let directionalLightColour = new THREE.Color(0.9, 0.9, 0.9);
  const light = new THREE.PointLight(directionalLightColour, 1.0);
  //light.shadowCameraVisible = true;
  light.castShadow = true;
  scene.add(light);

  const holdall = new THREE.Object3D();
  //holdall.position.x = 10;
  //holdall.rotation.x = 1;
  scene.add(holdall);

  const frustumHolder = new THREE.Object3D();
  scene.add(frustumHolder);

  const frustumHelperGeometry = new THREE.BoxGeometry();
  const material1 = new THREE.MeshBasicMaterial({ color: 0xffdddd/*, side: THREE.DoubleSide*//*, wireframe: true*/, transparent: true/*, vertexColors: true*/ });
  material1.opacity = 0.5;

  const frustumHelper = new THREE.Mesh(frustumHelperGeometry, material1);

  frustumHolder.add(frustumHelper);

  const edges = new THREE.EdgesGeometry(frustumHelperGeometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
  frustumHolder.add(line);
  frustumHolder.visible = false;

  let planeLft = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  let planeRgt = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  let planeBot = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  let planeTop = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  let planeFar = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
  let planeNear = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);

  let models = [];
  const boxGeometry = new THREE.BoxGeometry();

  // regular space cubes
  // regular space shapes
  // randomised cubes
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
    let count = 20;
    let offset = count * 1.5 / 2;
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        for (var k = 0; k < count; k++) {
          const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
          const cube = new THREE.Mesh(boxGeometry, material);
          cube.position.set(-offset + i * spacing, offset - j * spacing, -k * spacing);
          holdall.add(cube);
          models.push(cube);
        }
      }
    }
  }

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
    let pointerBL = pointer0.clone();
    let pointerTR = pointer1.clone();

    let pointerTL = pointer0.clone();
    let pointerBR = pointer1.clone();
    if (pointer0.x > pointer1.x) {
      pointerBL.x = pointer1.x;
      pointerTR.x = pointer0.x;
    }
    if (pointer0.y > pointer1.y) {
      pointerBL.y = pointer1.y;
      pointerTR.y = pointer0.y;
    }

    pointerTL.x = pointerBL.x;
    pointerTL.y = pointerTR.y;

    pointerBR.x = pointerTR.x;
    pointerBR.y = pointerBL.y;


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



    let planeFar1 = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);
    let planeNear1 = new THREE.Plane(new THREE.Vector3(1, 0, 0), -11);

    vToPlane = fwd.multiplyScalar(camera.far - 10.);

    v1 = camera.position.clone().add(vToPlane);
    v2 = v1.clone().add(cameraRightVector);
    v3 = v1.clone().add(camera.up);

    planeFar1.setFromCoplanarPoints(v1, v2, v3);

    // near plane
    camera.getWorldDirection(fwd);
    vToPlane = fwd.multiplyScalar(camera.near + 10.);

    v1 = camera.position.clone().add(vToPlane);
    v2 = v1.clone().add(cameraRightVector);
    v3 = v1.clone().add(camera.up);

    //let up = camera.position.clone().add(camera.up);
    planeNear1.setFromCoplanarPoints(v1, v3, v2);


    const intersectsBL1 = getPointOnPlane(pointerBL, planeFar1);
    const intersectsTR1 = getPointOnPlane(pointerTR, planeFar1);

    const intersectsBR1 = getPointOnPlane(pointerBR, planeFar1);
    const intersectsTL1 = getPointOnPlane(pointerTL, planeFar1);

    const intersectsBL2 = getPointOnPlane(pointerBL, planeNear1);
    const intersectsTR2 = getPointOnPlane(pointerTR, planeNear1);

    const intersectsBR2 = getPointOnPlane(pointerBR, planeNear1);
    const intersectsTL2 = getPointOnPlane(pointerTL, planeNear1);

    const frustumVertices = [];
    frustumVertices.push(...intersectsTR2);
    frustumVertices.push(...intersectsTR1);
    frustumVertices.push(...intersectsBR2);

    frustumVertices.push(...intersectsBR1);
    frustumVertices.push(...intersectsTL1);
    frustumVertices.push(...intersectsTL2);

    frustumVertices.push(...intersectsBL1);
    frustumVertices.push(...intersectsBL2);
    frustumVertices.push(...intersectsTL1);

    frustumVertices.push(...intersectsTR1);
    frustumVertices.push(...intersectsTL2);
    frustumVertices.push(...intersectsTR2);


    frustumVertices.push(...intersectsBL2);
    frustumVertices.push(...intersectsBR2);
    frustumVertices.push(...intersectsBL1);

    frustumVertices.push(...intersectsBR1);
    frustumVertices.push(...intersectsTL2);
    frustumVertices.push(...intersectsTR2);

    frustumVertices.push(...intersectsBL2);
    frustumVertices.push(...intersectsBR2);
    frustumVertices.push(...intersectsTR1);

    frustumVertices.push(...intersectsTL1);
    frustumVertices.push(...intersectsBR1);
    frustumVertices.push(...intersectsBL1);

    frustumHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(frustumVertices, 3));

    frustumHelper.geometry.computeVertexNormals();

    const edgeVertices = [];
    edgeVertices.push(...intersectsTL1);
    edgeVertices.push(...intersectsTR1);

    edgeVertices.push(...intersectsTR1);
    edgeVertices.push(...intersectsBR1);

    edgeVertices.push(...intersectsBR1);
    edgeVertices.push(...intersectsBL1);

    edgeVertices.push(...intersectsBL1);
    edgeVertices.push(...intersectsTL1);


    edgeVertices.push(...intersectsTL2);
    edgeVertices.push(...intersectsTR2);

    edgeVertices.push(...intersectsTR2);
    edgeVertices.push(...intersectsBR2);

    edgeVertices.push(...intersectsBR2);
    edgeVertices.push(...intersectsBL2);

    edgeVertices.push(...intersectsBL2);
    edgeVertices.push(...intersectsTL2);


    edgeVertices.push(...intersectsTL1);
    edgeVertices.push(...intersectsTL2);

    edgeVertices.push(...intersectsTR1);
    edgeVertices.push(...intersectsTR2);

    edgeVertices.push(...intersectsBR1);
    edgeVertices.push(...intersectsBR2);

    edgeVertices.push(...intersectsBL1);
    edgeVertices.push(...intersectsBL2);

    line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(edgeVertices, 3));



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

      // if any of the selection frustum corners intersects then can't be wholly inside
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
      // quick rejections
      // bounding sphere is wholly outside selection frustum 
      if (_frustum.intersectsObject(models[i]) === false) continue;

      // bounding box is wholly outside selection frustum ???

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

      const vertices = models[i].geometry.getAttribute('position').clone().applyMatrix4(models[i].matrixWorld);

      // any point is inside frustum
      for (let j = 0; j < vertices.array.length; j += 3) {
        let point = new THREE.Vector3(vertices.array[j], vertices.array[j + 1], vertices.array[j + 2]);
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


  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();

  function onKeyUp(e) {
    if (e.keyCode == 17) {
      controls.enabled = true;

      helper.enabled = false;
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    }
  }
  function onKeyDown(e) {
    if (e.keyCode == 17) {
      controls.enabled = false;

      helper.enabled = true;
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
    }
  }

  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('keydown', onKeyDown);


  let chkSelected = document.getElementById('selection');
  let chkUnselected = document.getElementById('unselection');

  chkSelected.addEventListener('change', setSelectedVisible);
  chkUnselected.addEventListener('change', setUnelectedVisible);


  function setSelectedVisible() {
    for (let i = 0; i < models.length; i++) {
      if (models[i].material.color.getHex() === 0xff0000)
        models[i].visible = chkSelected.checked;
    }
  }

  function setUnelectedVisible() {
    for (let i = 0; i < models.length; i++) {
      if (models[i].material.color.getHex() === 0xffffff)
        models[i].visible = chkUnselected.checked;
    }
  }


  let chkFrustum = document.getElementById('frustum');
  chkFrustum.addEventListener('change', setFrustumHolderVisible);
  function setFrustumHolderVisible() {
    frustumHolder.visible = chkFrustum.checked;
  }

  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function getPointOnPlane(pointer, plane) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    const intersects = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersects);

    return intersects;
  }
});