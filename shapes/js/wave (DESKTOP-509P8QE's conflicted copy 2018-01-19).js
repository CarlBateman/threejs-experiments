function addWave(scene) {
  let widthSegments = 50;
  let heightSegments = 20;

  let baseAngle = 2 * Math.PI * Math.random();
  let baseStep = Math.random() * .25;

  let angles = [];
  let steps = [];
  for (var i = 0; i < heightSegments; i++) {
    angles.push(2 * Math.PI * Math.random());
    steps.push(Math.random() * .025);
  }




  //var material = new THREE.MeshPhongMaterial({ color: getRandomColor(), wireframe: true });
  var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  material.wireframe = true;
  //var vertexShader = document.getElementById('vertexShader').text;
  //var fragmentShader = document.getElementById('fragmentShader').text;
  //var material = new THREE.ShaderMaterial({
  //  vertexShader: vertexShader,
  //  fragmentShader: fragmentShader,
  //  vertexColors: THREE.VertexColors
  //});
  material.transparent = true;
  material.opacity = 0.1;
  material.side = THREE.DoubleSide;
  material.specular = new THREE.Color(1, 1, 1);

  material.depthTest = false;

  material.blending = THREE["CustomBlending"];
  material.blendSrc = THREE["SrcAlphaFactor"];
  material.blendDst = THREE["OneFactor"];
  material.blendEquation = THREE.AddEquation;

  var geometry = new THREE.PlaneGeometry(500, 10, widthSegments-1, heightSegments-1);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;

  scene.add(mesh);

  let controller = {
    mesh, heightSegments, widthSegments, angles, steps, baseAngle, baseStep, 
    update: function () {
      this.baseAngle += this.baseStep;
      let baseAngle = this.baseAngle;

      for (var i = 0; i < this.heightSegments; i++) {
        var angle = this.angles[i];
        //angle += baseStep;

        for (var j = 0; j < this.widthSegments; j++) {
          var k = i * this.widthSegments + j;

          angle += this.steps[i] * 2;

          this.mesh.geometry.vertices[k].z = Math.cos(baseAngle + this.baseStep * j) * 20 + Math.cos(angle) * 20;// 
        }
      }

      this.mesh.geometry.verticesNeedUpdate = true;
    },
  };

  return controller;
}
