// https://jsfiddle.net/prisoner849/8uxw667m/
document.addEventListener('DOMContentLoaded', () => {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 10, 50);
  var renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.AxisHelper(2));

  var planeGeom = new THREE.PlaneGeometry(30, 30);
  planeGeom.rotateX(-Math.PI / 2);
  var plane = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({
    color: "lightgray",
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  }));
  plane.position.y = -3.14;
  plane.rotation.x = Math.PI / 5;
  scene.add(plane);

  var objGeom = new THREE.DodecahedronGeometry(10, 0);
  var obj = new THREE.Mesh(objGeom, new THREE.MeshBasicMaterial({
    color: "green",
    wireframe: true
  }));
  obj.rotation.z = Math.PI / 10;
  obj.position.set(0, 3.14, 0);
  scene.add(obj);

  pressMe.addEventListener("click", drawIntersectionPoints, false);

  var pointsOfIntersectionBufferGeometry = new THREE.BufferGeometry();

  var a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3();
  var planePointA = new THREE.Vector3(),
    planePointB = new THREE.Vector3(),
    planePointC = new THREE.Vector3();
  var lineAB = new THREE.Line3(),
    lineBC = new THREE.Line3(),
    lineCA = new THREE.Line3();

  var pointOfIntersection = new THREE.Vector3();
  let pointsOfIntersection = [];

  function drawIntersectionPoints() {
    var mathPlane = new THREE.Plane();

    let indices = plane.geometry.getIndex();
    let vertices = plane.geometry.getAttribute('position');

    let ia = indices.array[0];
    let ib = indices.array[1] * 3;
    let ic = indices.array[2] * 3;

    let point = new THREE.Vector3(vertices.array[ia], vertices.array[ia + 1], vertices.array[ia + 2]);
    plane.localToWorld(planePointA.copy(point));
    point = new THREE.Vector3(vertices.array[ib], vertices.array[ib + 1], vertices.array[ib + 2]);
    plane.localToWorld(planePointB.copy(point));
    point = new THREE.Vector3(vertices.array[ic], vertices.array[ic + 1], vertices.array[ic + 2]);
    plane.localToWorld(planePointC.copy(point));

    mathPlane.setFromCoplanarPoints(planePointB, planePointA, planePointC);

    vertices = obj.geometry.getAttribute('position');//.clone().applyMatrix4(models[i].matrixWorld);

    for (let j = 0; j < vertices.array.length; j) {
      point = new THREE.Vector3(vertices.array[j++], vertices.array[j++], vertices.array[j++]);
      obj.localToWorld(a.copy(point));
      point = new THREE.Vector3(vertices.array[j++], vertices.array[j++], vertices.array[j++]);
      obj.localToWorld(b.copy(point));
      point = new THREE.Vector3(vertices.array[j++], vertices.array[j++], vertices.array[j++]);
      obj.localToWorld(c.copy(point));

      lineAB = new THREE.Line3(a, b);
      lineBC = new THREE.Line3(b, c);
      lineCA = new THREE.Line3(c, a);
      
      setPointOfIntersection(lineAB, mathPlane);
      setPointOfIntersection(lineBC, mathPlane);
      setPointOfIntersection(lineCA, mathPlane);
    }

    let ptsFloat32Array = Float32Array.from(pointsOfIntersection);
    let bufferAttribute = new THREE.BufferAttribute(ptsFloat32Array, 3);
    pointsOfIntersectionBufferGeometry.setAttribute('position', bufferAttribute);

    var pointsMaterial = new THREE.PointsMaterial({
      size: 1,
      color: 0xffff00
    });
    var points = new THREE.Points(pointsOfIntersectionBufferGeometry, pointsMaterial);
    scene.add(points);

    var lines = new THREE.LineSegments(pointsOfIntersectionBufferGeometry, new THREE.LineBasicMaterial({
      color: 0xffffff
    }));
    scene.add(lines);
  }

  function setPointOfIntersection(line, plane) {
    pointOfIntersection = plane.intersectsLine(line);
    if (pointOfIntersection) {
      let intersection = new THREE.Vector3();
      plane.intersectLine(line, intersection)
      pointsOfIntersection.push(intersection.x, intersection.y, intersection.z);
    };
  }


  render();

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
});