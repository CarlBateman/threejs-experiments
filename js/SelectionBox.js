( function () {

	/**
 * This is a class to check whether objects are in a selection area in 3D space
 */

	const _frustum = new THREE.Frustum();
	const _center = new THREE.Vector3();
	const _tmpPoint = new THREE.Vector3();
	const _vecNear = new THREE.Vector3();
	const _vecTopLeft = new THREE.Vector3();
	const _vecTopRight = new THREE.Vector3();
	const _vecDownRight = new THREE.Vector3();
	const _vecDownLeft = new THREE.Vector3();
	const _vecFarTopLeft = new THREE.Vector3();
	const _vecFarTopRight = new THREE.Vector3();
	const _vecFarDownRight = new THREE.Vector3();
	const _vecFarDownLeft = new THREE.Vector3();
	const _vectemp1 = new THREE.Vector3();
	const _vectemp2 = new THREE.Vector3();
	const _vectemp3 = new THREE.Vector3();
	const _matrix = new THREE.Matrix4();
	const _quaternion = new THREE.Quaternion();
	const _scale = new THREE.Vector3();

	class SelectionBox {

		constructor( camera, scene, deep = Number.MAX_VALUE ) {
			this.camera = camera;
			this.scene = scene;
			this.startPoint = new THREE.Vector3();
			this.endPoint = new THREE.Vector3();
			this.collection = [];
			this.instances = {};
			this.deep = deep;
		}

		select( startPoint, endPoint ) {
			this.startPoint = startPoint || this.startPoint;
			this.endPoint = endPoint || this.endPoint;
			this.collection = [];
			this.updateFrustum( this.startPoint, this.endPoint );
			this.searchChildInFrustum( _frustum, this.scene );
			return this.collection;
		}

		updateFrustum( startPoint, endPoint ) {
			startPoint = startPoint || this.startPoint;
			endPoint = endPoint || this.endPoint; // Avoid invalid frustum

			if ( startPoint.x === endPoint.x ) {
				endPoint.x += Number.EPSILON;
			}

			if ( startPoint.y === endPoint.y ) {
				endPoint.y += Number.EPSILON;
			}

			this.camera.updateProjectionMatrix();
			this.camera.updateMatrixWorld();

			if ( this.camera.isPerspectiveCamera ) {
				_tmpPoint.copy( startPoint );

				_tmpPoint.x = Math.min( startPoint.x, endPoint.x );
				_tmpPoint.y = Math.max( startPoint.y, endPoint.y );
				endPoint.x = Math.max( startPoint.x, endPoint.x );
				endPoint.y = Math.min( startPoint.y, endPoint.y );

				_vecNear.setFromMatrixPosition( this.camera.matrixWorld );

				_vecTopLeft.copy( _tmpPoint );

				_vecTopRight.set( endPoint.x, _tmpPoint.y, 0 );

				_vecDownRight.copy( endPoint );

				_vecDownLeft.set( _tmpPoint.x, endPoint.y, 0 );

				_vecTopLeft.unproject( this.camera );

				_vecTopRight.unproject( this.camera );

				_vecDownRight.unproject( this.camera );

				_vecDownLeft.unproject( this.camera );

				_vectemp1.copy( _vecTopLeft ).sub( _vecNear );

				_vectemp2.copy( _vecTopRight ).sub( _vecNear );

				_vectemp3.copy( _vecDownRight ).sub( _vecNear );

				_vectemp1.normalize();

				_vectemp2.normalize();

				_vectemp3.normalize();

				_vectemp1.multiplyScalar( this.deep );

				_vectemp2.multiplyScalar( this.deep );

				_vectemp3.multiplyScalar( this.deep );

				_vectemp1.add( _vecNear );

				_vectemp2.add( _vecNear );

				_vectemp3.add( _vecNear );

				const planes = _frustum.planes;
				planes[ 0 ].setFromCoplanarPoints( _vecNear, _vecTopLeft, _vecTopRight );
				planes[ 1 ].setFromCoplanarPoints( _vecNear, _vecTopRight, _vecDownRight );
				planes[ 2 ].setFromCoplanarPoints( _vecDownRight, _vecDownLeft, _vecNear );
				planes[ 3 ].setFromCoplanarPoints( _vecDownLeft, _vecTopLeft, _vecNear );
				planes[ 4 ].setFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft );
				planes[ 5 ].setFromCoplanarPoints( _vectemp3, _vectemp2, _vectemp1 );
				planes[ 5 ].normal.multiplyScalar( - 1 );

			} else if ( this.camera.isOrthographicCamera ) {
				const left = Math.min( startPoint.x, endPoint.x );
				const top = Math.max( startPoint.y, endPoint.y );
				const right = Math.max( startPoint.x, endPoint.x );
				const down = Math.min( startPoint.y, endPoint.y );

				_vecTopLeft.set( left, top, - 1 );

				_vecTopRight.set( right, top, - 1 );

				_vecDownRight.set( right, down, - 1 );

				_vecDownLeft.set( left, down, - 1 );

				_vecFarTopLeft.set( left, top, 1 );

				_vecFarTopRight.set( right, top, 1 );

				_vecFarDownRight.set( right, down, 1 );

				_vecFarDownLeft.set( left, down, 1 );

				_vecTopLeft.unproject( this.camera );

				_vecTopRight.unproject( this.camera );

				_vecDownRight.unproject( this.camera );

				_vecDownLeft.unproject( this.camera );

				_vecFarTopLeft.unproject( this.camera );

				_vecFarTopRight.unproject( this.camera );

				_vecFarDownRight.unproject( this.camera );

				_vecFarDownLeft.unproject( this.camera );

				const planes = _frustum.planes;
				planes[ 0 ].setFromCoplanarPoints( _vecTopLeft, _vecFarTopLeft, _vecFarTopRight );
				planes[ 1 ].setFromCoplanarPoints( _vecTopRight, _vecFarTopRight, _vecFarDownRight );
				planes[ 2 ].setFromCoplanarPoints( _vecFarDownRight, _vecFarDownLeft, _vecDownLeft );
				planes[ 3 ].setFromCoplanarPoints( _vecFarDownLeft, _vecFarTopLeft, _vecTopLeft );
				planes[ 4 ].setFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft );
				planes[ 5 ].setFromCoplanarPoints( _vecFarDownRight, _vecFarTopRight, _vecFarTopLeft );
				planes[5].normal.multiplyScalar(- 1);

			} else {
				console.error( 'THREE.SelectionBox: Unsupported camera type.' );
			}
		}

		searchChildInFrustum( frustum, object ) {
			if ( object.isMesh || object.isLine || object.isPoints ) {
				if ( object.isInstancedMesh ) {
					this.instances[ object.uuid ] = [];
					for ( let instanceId = 0; instanceId < object.count; instanceId ++ ) {
						object.getMatrixAt( instanceId, _matrix );
						_matrix.decompose( _center, _quaternion, _scale );
						_center.applyMatrix4( object.matrixWorld );
						if ( frustum.containsPoint( _center ) ) {
							this.instances[ object.uuid ].push( instanceId );
						}
					}
				} else {
					if ( object.geometry.boundingSphere === null ) object.geometry.computeBoundingSphere();
					_center.copy( object.geometry.boundingSphere.center );
					_center.applyMatrix4( object.matrixWorld );
					if ( frustum.containsPoint( _center ) ) {
						this.collection.push( object );
					}
				}
			}

			if ( object.children.length > 0 ) {
				for ( let x = 0; x < object.children.length; x ++ ) {
					this.searchChildInFrustum( frustum, object.children[ x ] );
				}
			}
		}
	}



	// wholly enclosed - all points inside
	function findEnclosedObjects(pointerBL, pointerTR) {
		let found = false;
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

	function intersectPointerObject(pointer, object) {
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(pointer, camera);
		return raycaster.intersectObjects([object]).length > 0;
	}

	function findIntersectedObjects(pointerBL, pointerTR, object) {
		// inside frustum? orientation of plane?
		let found = false;

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

			// check whether any lines intersect the selcetion frustum
			const indices = models[i].geometry.index.array;

			if (checkFrustumLineIntersection(vertices, indices, _frustum))
				models[i].material.color.set(0xff0000);
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


	function pickPoint(pointer) {
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children);

		for (let i = 0; i < intersects.length; i++) {
			intersects[i].object.material.color.set(0xff0000);
		}
	}

	THREE.SelectionBox = SelectionBox;

} )();
