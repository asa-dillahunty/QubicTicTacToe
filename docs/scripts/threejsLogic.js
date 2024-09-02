/** THE CANVAS ** ALL HAIL THE CANVAS **/

var scene = null;
var camera;
var mouse;
var raycaster;
var renderer;
var controls;
var gameCanvas;

const CUBE_SIZE = 200;
const CUBE_COLOR = 0x888888;

var intersects = [];

// make the cubes
var cubeBoard = [];
var sphereBoard = [];
const cubeGroup = new THREE.Group();
const sphereGroup = new THREE.Group();

// var loader = new THREE.CubeTextureLoader();
// loader.setPath( 'https://asa-dillahunty.github.io/images/' );
// var textureCube = loader.load( [
// 	'Ghost.png', 'Ghost.png',
// 	'Ghost.png', 'Ghost.png',
// 	'Ghost.png', 'Ghost.png'
// ] );
// var xMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

const xCubeMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide})
];

const oCubeMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/o.png'), side: THREE.DoubleSide})
];

function threejsInit() {
	var gameMenu;
	if (game_type == 'online') gameMenu = document.getElementById('onlineOptions');
	else gameMenu = document.getElementById('game-menu');

	let ughTemp = Math.floor(.9*((window.innerHeight < gameMenu.clientWidth) ? window.innerHeight : gameMenu.clientWidth));
	console.log(window.innerHeight, gameMenu.clientWidth, ughTemp);

	ughTemp = 300;
	let setWidth = ughTemp;
	let setHeight = ughTemp;


	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, setWidth/setHeight, 300, 10000);
	renderer = new THREE.WebGLRenderer();
	// scene.background = new THREE.Color( 0xffffff );
	// var renderer = new THREE.WebGLRenderer({ alpha: true });
	// renderer.setClearColor( 0xffffff, 0);
	renderer.setSize(setWidth, setHeight);
	gameMenu.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera,renderer.domElement);
	controls.enablePan = false;

	threejsBoardInit();
	camera.position.z = 1000;
	render();
	clearThreejsBoard();

	gameCanvas = document.querySelector('canvas');
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("click", onClick);
	window.addEventListener('resize', resizeCanvas); 
}

function resizeCanvas() {
	let gameMenu = document.getElementById('game-menu');
	let ughTemp = .9*((window.innerHeight < gameMenu.clientWidth) ? window.innerHeight : gameMenu.clientWidth);

	let setWidth = ughTemp;
	let setHeight = ughTemp;

	renderer.setSize(setWidth, setHeight);
	camera.aspect = setWidth / setHeight;

	camera.updateProjectionMatrix();
};

//this should be added on game init, not page load
var isHighlighted;
const size = new THREE.Vector2( );
function onMouseMove(event) {
	if (!gameCanvas) return;
	const rect = gameCanvas.getBoundingClientRect();
	// if !within canvas
	if (event.x < rect.left || event.x > rect.right) return;
	if (event.y < rect.top || event.y > rect.bottom) return;
	renderer.getSize(size); 
	// mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	// mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	mouse.x = ((event.clientX - rect.left) / size.x) * 2-1;
	mouse.y = -((event.clientY - rect.top) / size.y) * 2 + 1;
	// mouse.x=event.clientX;
	// mouse.y=event.clientY;

	raycaster.setFromCamera(mouse, camera);
	
	intersects = raycaster.intersectObject(sphereGroup,true);
		
	// if (intersects.length > 1) {
	// 	console.log(intersects);
	// }
	// for ( let i = 0; i < intersects.length; i ++ ) {
	// 	console.log(intersects[ i ].object.name);
	// }

	// only highlight one at a time
	if (intersects.length < 1) {
		if (isHighlighted) {
			isHighlighted.object.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
			isHighlighted = undefined;
		}
		return;
	} 
	if (!isHighlighted) {
		isHighlighted = intersects[0];
		isHighlighted.object.material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.8 } );
	}
	else if (isHighlighted === intersects[0]) return;
	else {
		isHighlighted.object.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
		isHighlighted = intersects[0];
		isHighlighted.object.material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.8 } );
	}
}

function onClick(event) {
	if (!gameCanvas) return;
	const rect = gameCanvas.getBoundingClientRect();

	// if !within canvas
	if (event.x < rect.left || event.x > rect.right) return;
	if (event.y < rect.top || event.y > rect.bottom) return;
	renderer.getSize(size); 
	
	mouse.x = ((event.clientX - rect.left) / size.x) * 2-1;
	mouse.y = -((event.clientY - rect.top) / size.y) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	
	intersects = raycaster.intersectObject(sphereGroup,true);
	if (intersects.length < 1) return;

	// Split the string by spaces
	const parts = intersects[0].object.name.split(' ');
	const x = parseInt(parts[1], 10);
	const y = parseInt(parts[2], 10);
	const z = parseInt(parts[3], 10);

	console.log(intersects[0].object.name);
	
	clickedSquare(3-x, 3-y, z)
}

function threejsBoardInit() {
	cubeBoard = [];
	for (var i=0;i<4;i++) {
		var cubeSlice = [];
		var sphereSlice=[];
		for (var j=0;j<4;j++) {
			var cubeRow = [];
			var sphereRow=[];
			for (var k=0;k<4;k++) {
				// make a cube
				var cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 1, 1, 1);
				var cubeMaterial = new THREE.MeshBasicMaterial({color: CUBE_COLOR, wireframe: true});
				var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
				cube.name = "Cube "+i+" "+j+" "+k;

				// make selection sphere 
				// radius, widthSegments, heightSegments
				var sphereGeom =  new THREE.SphereGeometry( CUBE_SIZE/4, 32, 16 );
				var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.4 } );
				var sphere = new THREE.Mesh( sphereGeom, sphereMaterial );
				sphere.name = "Sphere "+i+" "+j+" "+k;


				// center cube
				cube.position.x -= CUBE_SIZE*1.5;
				cube.position.y -= CUBE_SIZE*1.5;
				cube.position.z -= CUBE_SIZE*1.5;

				cube.position.x += CUBE_SIZE*k;
				cube.position.y += CUBE_SIZE*j;
				cube.position.z += CUBE_SIZE*i;

				// fix sphere location
				sphere.position.x -= CUBE_SIZE*1.5;
				sphere.position.y -= CUBE_SIZE*1.5;
				sphere.position.z -= CUBE_SIZE*1.5;

				sphere.position.x += CUBE_SIZE*k;
				sphere.position.y += CUBE_SIZE*j;
				sphere.position.z += CUBE_SIZE*i;

				cubeGroup.add(cube);
				sphereGroup.add(sphere);

				// add to row
				cubeRow.push(cube);
				sphereRow.push(sphere);
			}
			// add row to slice
			cubeSlice.push(cubeRow);
			sphereSlice.push(sphereRow);
		}
		cubeBoard.push(cubeSlice);
		sphereBoard.push(sphereSlice);
	}
	scene.add(cubeGroup);
	scene.add(sphereGroup);
}

function render() {
	requestAnimationFrame(render);
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
	// scene.rotation.x += 0.005;
	// scene.rotation.y += 0.005;
	renderer.render(scene, camera);
};

function clearThreejsBoard() {
	// Clears Three.js Board
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++)
				cubeBoard[i][j][k].material = new THREE.MeshBasicMaterial({color: slice_colors[3-i], wireframe: true});
}

function markThreejsBoard(i,j,k) {
	// mark Three.js Board
	// this throws warnings of deprecation. Cannot be avoided. 
	// Attach X and O shapes to faces of the cube
	if (players[turn] == 'X')
		cubeBoard[3-i][3-j][k].material = THREE.MeshFaceMaterial(xCubeMaterials);
	else if (players[turn] == 'O')
		cubeBoard[3-i][3-j][k].material = THREE.MeshFaceMaterial(oCubeMaterials);
}

const textSize = 200;
const textDepth = 80;
function create3DText(text, color) {
	const loader = new THREE.FontLoader();

	return new Promise((resolve, reject) => {
		loader.load('fonts/font.json', function (font) {
			const textGeometry = new THREE.TextGeometry(text, {
				font: font,
				size: textSize,  // height of text
				height: textDepth, // Depth of the text
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 2,
				bevelSize: 1.5,
				bevelSegments: 5
			});

			const textMaterial = new THREE.MeshBasicMaterial({ color: color });
			const textMesh = new THREE.Mesh(textGeometry, textMaterial);
			resolve(textMesh);
		}, undefined, function (error) {
			console.error('An error happened loading the font:', error);
			reject(error);
		});
	});
}

async function markThreejsBoard(i, j, k) {
	// Remove the existing mesh if any
	if (cubeBoard[3-i][3-j][k].children.length > 0) {
		cubeBoard[3-i][3-j][k].remove(cubeBoard[3-i][3-j][k].children[0]);
		sphereBoard[3-i][3-j][k].remove(sphereBoard[3-i][3-j][k].children[0]);
	}

	let textMesh;
	if (players[turn] == 'X') {
		textMesh = await create3DText('X', 0xff0000); // Red color for X
	} else if (players[turn] == 'O') {
		textMesh = await create3DText('O', 0x0000ff); // Blue color for O
	}

	textMesh.position.set(-textSize/4, -textSize/4, -textDepth/4);
	textMesh.scale.set(0.5, 0.5, 0.5);

	// Add the textMesh to the cube
	cubeBoard[3-i][3-j][k].add(textMesh);
	cubeBoard[3-i][3-j][k].material = new THREE.MeshBasicMaterial({ visible: false }); // Hide the cube itself if desired
}
