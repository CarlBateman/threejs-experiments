function getRandom(min, max) {
  return min + Math.random() * (max - min);
}

function getRandomRange(min, range) {
  return min + Math.random() * range;
}

function getRandomColor() {
  var r = Math.random();
  var g = Math.random();
  var b = Math.random();
  return new THREE.Color(r, g, b);
}
