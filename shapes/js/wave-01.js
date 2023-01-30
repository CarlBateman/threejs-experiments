function addWave(scene) {
  let noOfSegments = 50;
  let noOfWaves = 10;

  let waves = [];
  let freq = [];
  let step = [];
  for (var i = 0; i < noOfWaves; i++) {
    waves.push(2 * Math.PI * Math.random());
    freq.push(Math.random() * .001);
    step.push(Math.random() * .01);
  }

  let baseWave = 2 * Math.PI * Math.random();
  let baseFreq = Math.random() * .25;
  let baseStep = Math.random() * .025;


  //var material = new THREE.MeshPhongMaterial({ color: getRandomColor(), wireframe: true });
  var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  //material.wireframe = true;
  material.transparent = true;
  material.opacity = 0.1;
  material.side = THREE.DoubleSide;
  material.specular = new THREE.Color(1, 1, 1);

  material.depthTest = false;

  material.blending = THREE["CustomBlending"];
  material.blendSrc = THREE["SrcAlphaFactor"];
  material.blendDst = THREE["OneFactor"];
  material.blendEquation = THREE.AddEquation;

  var geometry = new THREE.PlaneGeometry(500, 32, noOfSegments - 1, noOfWaves - 1);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;

  scene.add(mesh);

  var angle = 0;
  let controller = {
    mesh, noOfWaves, noOfSegments, angle, waves, freq, step, baseWave, baseFreq, baseStep,
    update: function () {
      for (var i = 0; i < this.noOfWaves; i++) {
        this.waves[i] += this.step[i];
        this.angle = this.waves[i];

        for (var j = 0; j < this.noOfSegments; j++) {
          var k = i * this.noOfSegments + j;
          //console.log(k);

          this.angle += this.freq[i] * 2;

          this.mesh.geometry.vertices[k].z = Math.cos(this.angle) * 30;
        }
      }

      this.baseWave += this.baseStep;
      let baseWave = this.baseWave;

      for (var i = 0; i < this.noOfSegments; i++) {
        baseWave += this.baseFreq;

        for (var j = 0; j < this.noOfWaves; j++) {
          var k = j * this.noOfSegments + i;


          this.mesh.geometry.vertices[k].z += Math.cos(baseWave) * 20;
        }
      }
      this.mesh.geometry.computeVertexNormals();

      this.mesh.geometry.verticesNeedUpdate = true;
    },
  };

  return controller;
}
