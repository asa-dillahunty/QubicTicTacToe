/** THE CANVAS ** ALL HAIL THE CANVAS **/

var scene = null;
var camera;
var renderer;
var controls;

const CUBE_SIZE = 200;
const CUBE_COLOR = 0x888888;

// make the cubes
var cubeBoard = [];

// var loader = new THREE.CubeTextureLoader();
// loader.setPath( 'https://asa-dillahunty.github.io/images/' );
// var textureCube = loader.load( [
// 	'Ghost.png', 'Ghost.png',
// 	'Ghost.png', 'Ghost.png',
// 	'Ghost.png', 'Ghost.png'
// ] );
// var xmaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

var xcubeMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('images/x.png'), side: THREE.DoubleSide})
];

var ocubeMaterials = [
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

	threejsBoardInit();
	camera.position.z = 1000;
	render();
	clearThreejsBoard();
}

window.addEventListener('resize', function() {
	let gameMenu = document.getElementById('game-menu');
	let ughTemp = .9*((window.innerHeight < gameMenu.clientWidth) ? window.innerHeight : gameMenu.clientWidth);

	let setWidth = ughTemp;
	let setHeight = ughTemp;

	renderer.setSize(setWidth, setHeight);
	camera.aspect = setWidth / setHeight;

	camera.updateProjectionMatrix();
});


function threejsBoardInit() {
	cubeBoard = [];
	for (var i=0;i<4;i++) {
		var cubeSlice = [];
		for (var j=0;j<4;j++) {
			var cubeRow = [];
			for (var k=0;k<4;k++) {
				// make a cube
				var geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 1, 1, 1);
				var material = new THREE.MeshBasicMaterial({color: CUBE_COLOR, wireframe: true});

				var cube = new THREE.Mesh(geometry, material);

				// center cube
				cube.position.x -= CUBE_SIZE*1.5;
				cube.position.y -= CUBE_SIZE*1.5;
				cube.position.z -= CUBE_SIZE*1.5;

				cube.position.x += CUBE_SIZE*k;
				cube.position.y += CUBE_SIZE*j;
				cube.position.z += CUBE_SIZE*i;

				scene.add(cube);

				// add to row
				cubeRow.push(cube);
			}
			// add row to slice
			cubeSlice.push(cubeRow);
		}
		cubeBoard.push(cubeSlice);
	}
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
	if (players[turn] == 'X')
		cubeBoard[3-i][3-j][k].material = THREE.MeshFaceMaterial(xcubeMaterials);
	else if (players[turn] == 'O')
		cubeBoard[3-i][3-j][k].material = THREE.MeshFaceMaterial(ocubeMaterials);
}
