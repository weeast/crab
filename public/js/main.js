//Global Object
var renderer,
	cameraControls,
	clock = new THREE.Clock(),
	camera,
	scene,
	light,
	ground,
	gWidth,
	gHeight,
	sky,
	overFlag = false,
	initFlag = false,
	readyFlag = false,
	instanceId = 0,
	crabs = {},//the object contains all crabs which are marked by the instanceId
	mapWidth = 2,//every square's border width
	colliMap = {};//the map contains square,when the crab is moved by the ground, 
				  //it will change in the colliMap

//initialization canvas and set the render
function initThree() {
		width = document.getElementById('canvas3d').clientWidth;
		height = document.getElementById('canvas3d').clientHeight;
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setClearColor(0x4040ff); //set background color
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
		document.getElementById('canvas3d').appendChild(renderer.domElement);
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.shadowMapEnabled = true;
}
//initialization camera
function initCamera() {
		camera = new THREE.PerspectiveCamera(80, width / height, 1, 3000);

		camera.position.x = 0;
        camera.position.y = 60;
        camera.position.z = 40;
        camera.up.x = 0;
        camera.up.y = 1;
        camera.up.z = 0;
}
//initialization Scene
function initScene() {
		scene = new THREE.Scene();
		//scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
}
//initialization Light
function initLight() {
		scene.add(new THREE.AmbientLight(0x222222));
		light = new THREE.DirectionalLight(0xffffff, 2.25);
		light.position.set(200, 450, 500);
		light.castShadow = true;
		light.shadowMapWidth = 128;
		light.shadowMapHeight = 128;
		light.shadowMapDarkness = 0.95;
		light.shadowCameraNear = 100;
		light.shadowCameraFar = 1200;
		light.shadowCameraTop = 400;
		light.shadowCameraBottom = -250;
		light.shadowCameraRight = 900;
		light.shadowCameraLeft = -1000;

		scene.add(light);
}
//initialization ground			
function initGround() {
	var loader = new THREE.TextureLoader(),sandCircle1,sandCircle2,sandCircle3,sandCircle4,blackCircle1,blackCircle2,blackCircle3,blackCircle4, arr = [50,37,24,10], objArr = [sandCircle1,sandCircle2,sandCircle3,sandCircle4,blackCircle1,blackCircle2,blackCircle3,blackCircle4];
	loader.load('./texture/sand.png',function(texture){
		var ggeometry,gmaterial;
		ggeometry = new THREE.PlaneBufferGeometry(105, 105);
		gmaterial = new THREE.MeshPhongMaterial({
			map: texture
		});
		ground = new THREE.Mesh(ggeometry, gmaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -1;
		ground.receiveShadow = true;
		for(var i =0;i<8;++i){
			var index = parseInt(i/2),cgeometry,cmaterial;
			cgeometry = new THREE.CircleGeometry(arr[index], 32);
			cmaterial = new THREE.MeshPhongMaterial({
				color: 0x000000
			});
			objArr[i+4] = new THREE.Mesh(cgeometry, cmaterial);
			objArr[i+4].rotation.x = -Math.PI / 2;			
			objArr[i+4].receiveShadow = true;
			objArr[i+4].parent = ground;
			objArr[i+4].position.y = -0.8+index*0.1 - 0.05;
			scene.add(objArr[i+4]);
			cgeometry = new THREE.CircleGeometry(arr[index]-1, 32);
			cmaterial = new THREE.MeshPhongMaterial({
				map: texture
			});
			objArr[i] = new THREE.Mesh(cgeometry, cmaterial);
			objArr[i].rotation.x = -Math.PI / 2;
			objArr[i].receiveShadow = true;
			objArr[i].parent = ground;
			objArr[i].position.y = -0.8+index*0.1;
			scene.add(objArr[i]);
		}
		scene.add(ground);

	})
	
	gWidth = 100/4;
	gHeight = 100/4;
}
function initSky() {
	var ggeometry,gmaterial,
	ggeometry = new THREE.PlaneBufferGeometry(3000, 3000);
	gmaterial = new THREE.MeshBasicMaterial({
		color: 0x4040ff,
	});
	sky = new THREE.Mesh(ggeometry, gmaterial);
	sky.rotation.x = Math.PI / 2;
	sky.position.y = 100;
	

	scene.add(sky);
	
}

//set object
function initObject() {
	var i = 0,
		color = [
			0x5a0000,
			0x50a000,
			0x005a00,
			0x0500a0,
			0xa00050,
			0x0aa050,
			0xbbbbbb,
			0x500050
		],
		texture = [
			'texture/crabShellCircle.png',
			'texture/crabShell.png',
			'texture/crabShellStripe.png',
			'texture/crabShellCircle.png',
			'texture/crabShell.png',
			'texture/crabShellStripe.png',
			'texture/crabShellCircle.png',
			'texture/crabShellStripe.png'
		];
	for(i;i < 8; ++i){
		var crab = Crab(scene);
		crab.createCrab(1.0,color[i],texture[i]);
		crabs[instanceId] = crab;
		crab.instanceId = instanceId;
		instanceId++;
	}
}
	
//initialization camera controler
function initControl() {
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControls.target.set(0, 0, 0);
}

//add the crab to the collision map
function appendToMap(crabIndex){
	var x = crabs[crabIndex].getPosition().x+50,
		y = crabs[crabIndex].getPosition().z+50,
		xLoc = parseInt(x/4),
		yLoc = parseInt(y/4),
		curIndex = crabs[crabIndex].mapIndex;
		newIndex = xLoc + yLoc*gWidth;
	if(newIndex > gWidth*gWidth){
		console.log('crab position wrong in adding to the collision map!');
		return
	}
	if(curIndex == newIndex)
		return
	crabs[crabIndex].mapIndex = newIndex;
	if(!colliMap[newIndex])
		colliMap[newIndex] = {};
	colliMap[newIndex][crabIndex] = crabs[crabIndex];
	delete colliMap[curIndex][crabIndex];
	console.log('delete crab in collision map: crab index '+crabIndex+', map index '+curIndex+'.');
	var count = 0, i;
	for(i in colliMap[curIndex]){
		if(colliMap[curIndex].hasOwnProperty(i))
			return
	}
	delete colliMap[curIndex];
	console.log('delete collision map: index '+curIndex+'.');
}

//collision detection
function colliDetection(){
	for(var i in colliMap){
		colliInMap(i);
		colliOutMap(i);
	}
}
//the crabs in one square will be collided
function colliInMap(index){
	var colliCrab = [], i, j = 0, len, curMap =colliMap[index], curCrab;
	for(i in curMap)
		colliCrab.push(i);
	len = colliCrab.length;
	if(len<2)
		return
	for(j;j<len;++j){
		curCrab = crabs[colliCrab[j]];
		if(curCrab.getSpeed()!=0)
			crabs[colliCrab[j]].turnBack();
	}
}
//only check the crabs in the near five squares 
function colliOutMap(index){
	var curMap =colliMap[index], tagMap, arr = [parseInt(index) + 1, parseInt(index) + gWidth - 1, parseInt(index) + gWidth, parseInt(index) + gWidth + 1], i = 0;
	for(i;i<4;++i){
		tagMap = colliMap[arr[i]];
		if(tagMap)
			colliBetweenMap(curMap,tagMap);
	}
}
//when crabs are about two radius apart from each other, they are collided;
function colliBetweenMap(curMap, tagMap){
	var i, j;
	for(i in curMap){
		if(curMap[i].getSpeed()==0)
			continue;
		for(j in tagMap){
			if(tagMap[j].getSpeed()==0)
				continue;
			if(circleInCircle(curMap[i].getPosition().x,curMap[i].getPosition().z,tagMap[j].getPosition().x,tagMap[j].getPosition().z,4)){
				curMap[i].turnBack();
				tagMap[j].turnBack();
			}
		}
	}
}
//check whether two circles are collided 
function circleInCircle(rx, ry, orx, ory, r){
	return (rx - orx)*(rx - orx) + (ry - ory)*(ry - ory) < r*r;
}
//Initialize the crabs
function initCrabs(){
	var i, index = 0;
	for(i in crabs){
		crabs[i].setPosition(Math.sin(index*2*Math.PI/8)*10,Math.cos(index*2*Math.PI/8)*10);
		index++;
		crabs[i].setRotation(index*2*Math.PI/8);
		if(!colliMap[-1])
			colliMap[-1] = {};
		colliMap[-1][crabs[i].instanceId] = crabs[i];

	}
}
//check crabs reaching the end
function reachDetection(carbIndex){
	var x = crabs[carbIndex].getPosition().x,y = crabs[carbIndex].getPosition().z;
	if(x*x + y*y > 2500){
		alert("Crab "+carbIndex+" reached!");
		overFlag = true;
		/*var text = TextGeometry("crab"+carbIndex+"reached",{size: 32}),
		material = new THREE.MeshPhongMaterial({
				color: 0x000000
			}),
		textArea = new THREE.Mesh(text, material);
		scene.add(textArea);*/
	}

}
//animations
function animate() {
		requestAnimationFrame(animate);
		if(!overFlag){
			if(!readyFlag){
				for(var j in crabs){
					readyFlag = true;
					if(!crabs[j].readyState)
						readyFlag = readyFlag & crabs[j].readyState;
				}
				if(readyFlag)
					initFlag = true;
			}
			if(initFlag){
				initCrabs();
				initFlag = false;
			}
			if(readyFlag){
				for(var i in crabs){
					appendToMap(i)
					crabs[i]._update();
					reachDetection(i);
				}
				colliDetection();
			}
		}
		render();
}
//render
function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.clear();
	renderer.render(scene, camera);
}
//initialization and execution
function threeStart() {
	initThree();
	initCamera();
	initScene();
	initLight();
	initSky();
	initGround();
	initObject();
	initControl();
	animate();
}

window.onload = threeStart;