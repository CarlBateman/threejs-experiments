function addGeometry(scene) {
  let geometries = ["Tetrahedron", "Octahedron", "Box", "Icosahedron", "Dodecahedron", "Cone", "Cylinder", "Sphere", "Torus"];

  let geometryDefaults = [];
  geometryDefaults["Box"] = [10, 10, 10];
  geometryDefaults["Cone"] = [5, 15, 16];
  geometryDefaults["Cylinder"] = [5, 5, 10, 32];


  geometryDefaults["Dodecahedron"] = [10, 0];
  geometryDefaults["Icosahedron"] = [10, 0];
  geometryDefaults["Octahedron"] = [10, 0];

  geometryDefaults["Sphere"] = [10, 18, 32];

  geometryDefaults["Tetrahedron"] = [10, 0];

  geometryDefaults["Torus"] = [10, 2.5, 8, 64];

  let controller = {
    shapes: [],
    update: function () {
      for (let i = 0; i < this.shapes.length; i++) {
        this.shapes[i].update();
      }
    },
  };

  function setSpeed() {
    const minSpeed = 0.1;
    return minSpeed + (Math.random() * 0.9) / 2;
  }

  function setPositionX(mesh) {
    const leftMost = -140;
    const scale = 50;
    mesh.position.x = leftMost + scale * Math.random();
  }

  function setRotationSpeed() {
    return {
      x: 0.01 * (0.5 - Math.random()),
      y: 0.01 * (0.5 - Math.random())
    }
  }

  function update() {
    let speed = setSpeed();
    let rSpeed = setRotationSpeed();

    return function (mesh) {
      mesh.rotation.x += rSpeed.x;
      mesh.rotation.y += rSpeed.y;

      mesh.position.y += speed;

      if (mesh.position.y > 100) {
        mesh.position.y = -100;
        speed = setSpeed();
        rspeed = setRotationSpeed();
        setPositionX(mesh);

        switch (mesh.name) {
          case "companion_cube": break;
          case "companion-tetrahedron": break;
          case "duck": break;
          case "hearts": break;
          case "clubs": break;
          case "utah-teapot":
          case "diamonds":
            let color = getRandomColor();
            mesh.traverse(function (child) {
              if (child instanceof THREE.Mesh) {
                child.material.color = color;
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            break;
          default:
            mesh.material.color = getRandomColor();
        }
      }
    }
  }

  for (let i = 0; i < geometries.length; i++) {
    let material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
    let g = geometries[i];
    let d = geometryDefaults[g];

    let geometry = new THREE[g + "Geometry"](...d);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -50 + 100 * Math.random();
    setPositionX(mesh);

    scene.add(mesh);

    controller.shapes.push({
      mesh, update: update().bind(null, mesh)
    });
  }

  let manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
  };

  let textureCompCube = new THREE.Texture();

  let imageLoader = new THREE.ImageLoader(manager);
  imageLoader.load('/common/models/companion_cube/companion_cube.jpg', function (image) {
    textureCompCube.image = image;
    textureCompCube.needsUpdate = true;
  });

  let OBJloader = new THREE.OBJLoader(manager);
  OBJloader.load('/common/models/companion_cube/companion_cube.obj', function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.map = textureCompCube;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    let holder = new THREE.Object3D();

    holder.name = "companion_cube";
    object.scale.set(0.1, 0.1, 0.1);
    object.position.set(-2.25, -5.5, -20);
    setPositionX(holder);

    holder.add(object);
    scene.add(holder);

    controller.shapes.push({
      holder, update: update().bind(null, holder)
    });
  });


  let textureUtahTeapot = new THREE.Texture();

  imageLoader = new THREE.ImageLoader(manager);
  imageLoader.load('/common/models/utah-teapot/utah-teapot.png', function (image) {
    textureUtahTeapot.image = image;
    textureUtahTeapot.needsUpdate = true;
  });

  OBJloader = new THREE.OBJLoader(manager);
  OBJloader.load('/common/models/utah-teapot/utah-teapot.obj', function (object) {
    object.name = "utah-teapot";
    let color = getRandomColor();
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.color = color;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.position.set(0, 0, -20);
    object.scale.set(0.15, 0.15, 0.15);
    setPositionX(object);

    scene.add(object);

    controller.shapes.push({
      object, update: update().bind(null, object)
    });

  });



  OBJloader = new THREE.OBJLoader(manager);
  OBJloader.load('/common/models/clubs/clubs.obj', function (object) {
    object.name = "clubs";
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.color = new THREE.Color(0, 1, 0);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.position.set(0, 0, -20);
    object.scale.set(6, 6, 4);
    setPositionX(object);

    scene.add(object);

    controller.shapes.push({
      object, update: update().bind(null, object)
    });
  });


  OBJloader = new THREE.OBJLoader(manager);
  OBJloader.load('/common/models/hearts/hearts.obj', function (object) {
    object.name = "hearts";
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.color = new THREE.Color(1, 0, 0);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.position.set(0, 0, -20);
    object.scale.set(.035, .05, .05);
    setPositionX(object);

    scene.add(object);

    controller.shapes.push({
      object, update: update().bind(null, object)
    });
  });

  OBJloader = new THREE.OBJLoader(manager);
  OBJloader.load('/common/models/diamonds/diamonds.obj', function (object) {
    let color = getRandomColor();
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material.color = color;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    let holder = new THREE.Object3D();
    holder.name = "diamonds";

    holder.position.set(0, 0, -20);
    object.scale.set(7, 7, 10);
    object.position.set(13, 0, 0);

    setPositionX(holder);

    holder.add(object);
    scene.add(holder);

    controller.shapes.push({
      holder, update: update().bind(null, holder)
    });
  });




  // Instantiate a loader
  let loader = new THREE.GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    '/common/models/companion-tetrahedron.gltf',
    // called when the resource is loaded
    function (gltf) {
      scene.add(gltf.scene);
      let object = gltf.scene.children[0];
      object.name = "companion-tetrahedron";
      controller.shapes.push({
        object, update: update().bind(null, object)
      });
      object.position.set(0, 0, -20);
      object.scale.set(12, 12, 12);
      setPositionX(object);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.scenes; // Array<THREE.Scene>
      gltf.cameras; // Array<THREE.Camera>

    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );


  loader = new THREE.GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    '/common/models/duck/duck.gltf',
    // called when the resource is loaded
    function (gltf) {
      scene.add(gltf.scene);
      let object = gltf.scene.children[0];


      let holder = new THREE.Object3D();
      holder.name = "duck";
      holder.position.set(0, 0, -20);
      object.position.set(-1, -6, 0);
      object.scale.set(.075, .075, .075);
      setPositionX(holder);

      holder.add(object);
      scene.add(holder);

      controller.shapes.push({
        holder, update: update().bind(null, holder)
      });
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );

  //let materialX = new THREE.MeshPhongMaterial({ color: getRandomColor() });
  //let geometryX = new THREE["SphereGeometry"]();
  //let meshX = new THREE.Mesh(geometryX, materialX);
  //meshX.position.z = 5;
  //scene.add(meshX);

  return controller;
}