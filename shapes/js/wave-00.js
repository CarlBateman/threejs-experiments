function addWave(scene) {
  let widthSegments = 50;
  let heightSegments = 20;

  let startX = [];
  let rateX = [];
  for (var i = 0; i < heightSegments; i++) {
    startX.push(2 * Math.PI * Math.random());
    rateX.push(Math.random() * .025);
  }




  //var material = new THREE.MeshPhongMaterial({ color: getRandomColor(), wireframe: true });
  var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  //material.wireframe = true;
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

  var angle = 0;
  let controller = {
    mesh, heightSegments, widthSegments, angle, startX, rateX, 
    update: function () {
      for (var i = 1; i < this.heightSegments; i++) {
        this.startX[0] += this.rateX[0];
        var angle = this.startX[0];


        this.startX[i] += this.rateX[i];
        this.angle = this.startX[i];

        for (var j = 0; j < this.widthSegments; j++) {
          var k = i * this.widthSegments + j;

          angle += this.rateX[0] * 2;
          this.angle += this.rateX[i] * 2;

          this.mesh.geometry.vertices[k].z = Math.cos(angle) * 20 + Math.cos(this.angle) * 20;// 
        }
      }

      this.mesh.geometry.verticesNeedUpdate = true;
    },
  };

  return controller;
}
