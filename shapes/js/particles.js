function addParticles(scene) {
  const minSpeed = 0.1;
  const leftMost = -175;
  const width = 100;

  let controller = {
    shapes: [],
    update: function () {
      for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].update();
      }
    },
  };

  function getRotationSpeed() {
    return {
      x: 0.05 * (0.5 - Math.random()),
      y: 0.05 * (0.5 - Math.random())
    }
  }

  function update() {
    var speed = getRandomRange(minSpeed, 0.45);
    var rSpeed = getRotationSpeed();

    return function (mesh) {
      mesh.rotation.x += rSpeed.x;
      mesh.rotation.y += rSpeed.y;

      mesh.position.y += speed;

      if (mesh.position.y > 100) {
        mesh.position.y = -100;
        speed = getRandomRange(minSpeed, 0.45);
        rspeed = getRotationSpeed();
        mesh.position.x = getRandomRange(leftMost, width);

        mesh.material.color = getRandomColor();
      }
    }
  }

  (function createParticles() {
    for (var i = 0; i < 1000; i++) {
      var material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
      material.specular = new THREE.Color(1, 1, 1);

      var geometry = new THREE.CircleGeometry(.5, 16);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = getRandomRange(leftMost, width);
      mesh.position.y = getRandomRange(-100, 200);
      mesh.position.z = -100;

      scene.add(mesh);

      controller.shapes.push({
        mesh, update: update().bind(null, mesh)
      });
    }
  })();

  return controller;
}