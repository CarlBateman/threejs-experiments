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

  var pointsOfIntersection = new THREE.Geometry();

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

  function drawIntersectionPoints() {
    var mathPlane = new THREE.Plane();
    plane.localToWorld(planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
    plane.localToWorld(planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
    plane.localToWorld(planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
    mathPlane.setFromCoplanarPoints(planePointB, planePointA, planePointC);

    obj.geometry.faces.forEach(function (face) {
      obj.localToWorld(a.copy(obj.geometry.vertices[face.a]));
      obj.localToWorld(b.copy(obj.geometry.vertices[face.b]));
      obj.localToWorld(c.copy(obj.geometry.vertices[face.c]));
      lineAB = new THREE.Line3(a, b);
      lineBC = new THREE.Line3(b, c);
      lineCA = new THREE.Line3(c, a);
      setPointOfIntersection(lineAB, mathPlane);
      setPointOfIntersection(lineBC, mathPlane);
      setPointOfIntersection(lineCA, mathPlane);
    });

    var pointsMaterial = new THREE.PointsMaterial({
      size: 1,
      color: 0xffff00
    });
    var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
    scene.add(points);

    var lines = new THREE.LineSegments(pointsOfIntersection, new THREE.LineBasicMaterial({
      color: 0xffffff
    }));
    scene.add(lines);
  }

  function setPointOfIntersection(line, plane) {
    pointOfIntersection = plane.intersectLine(line);
    if (pointOfIntersection) {
      pointsOfIntersection.vertices.push(pointOfIntersection.clone());
    };
  }


  render();

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
});