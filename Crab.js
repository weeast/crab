function Crab(scene){
	var _compIndex = 0, 
		_axisLength = 0.001, 
		_size = 1.0, 
		_texture, 
		_speed = 0.05, 
		_direct = 0, 
		_targetDirect = 0,
		_turnIndex = 0, // when the number is 100, then turn the Crab
		_legIndex = parseInt(60*Math.random()),// the start frame of the Crab leg animation
		_components = {
		'Joints':{},
		'Diamond':{},
		'Legs':{},
		'Arms':{},
		'Body': {}
	};//Components of carb

	// returns joint axes object
	function _createJoint(name) {
		var axisHelper = new THREE.AxisHelper(_axisLength);
		_components.Joints[name] = axisHelper;
		scene.add(axisHelper);
		return axisHelper;
	};

	// returns diamond segment
	function _createDiamond(sizeX, sizeY, sizeZ, colour) {
		var verticesOfCube,indicesOfFaces,geometry,diamond;
		verticesOfCube = [
			0, sizeY*_size, 0,   
			-sizeX*_size, 0, 0,
			0, 0, -sizeZ*_size,
			sizeX*_size, 0, 0,
			0, 0, sizeZ*_size,
			0, -sizeY*_size, 0,
		];

		indicesOfFaces = [
			0, 1, 4,   0, 2, 1,   0, 3, 2,   0, 4, 3,
			5, 4, 1,   5, 1, 2,   5, 2, 3,   5, 3, 4
		];
		geometry = new THREE.Geometry();

		for(var i=0;i<verticesOfCube.length;i+=3)
			geometry.vertices.push(new THREE.Vector3(verticesOfCube[i],verticesOfCube[i+1],verticesOfCube[i+2]));
		for(var i=0;i<indicesOfFaces.length;i+=3)
			geometry.faces.push(new THREE.Face3(indicesOfFaces[i],indicesOfFaces[i+1],indicesOfFaces[i+2]));

		geometry.computeFaceNormals();
	    geometry.computeVertexNormals();
	    geometry.computeBoundingSphere();
			diamond = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: colour}));
		
		diamond.castShadow = diamond.receiveShadow = true;

		_components.Diamond[_compIndex] = diamond;
		_compIndex++;
		scene.add(diamond);
		return diamond;
	};

	// returns a whole leg
	function _createLeg(x, y, z, color, name) {
		var component,_hip,_knee,_ankle,_uleg,_lleg,_foot;
		name = name || '';
		x = x || 0;
		y = y || 0;
		z = z || 0;
		x = x*_size;
		y = y*_size;
		z = z*_size;
		var base = _createJoint(name + 'base');
		_hip = _createJoint(name + '_hip');
		_knee = _createJoint(name + '_knee');
		_ankle = _createJoint(name + '_ankle');
		_uleg = _createDiamond(0.15,0.15,0.25,color);
		_lleg = _createDiamond(0.15,0.15,0.25,color);
		_foot = _createDiamond(0.15,0.15,0.25,0x000000);
		component = [_hip,_uleg,_knee,_lleg,_ankle,_foot];

		_hip.parent = base;
		_uleg.parent = _hip;
		_knee.parent = _uleg;
		_lleg.parent = _knee;
		_ankle.parent = _lleg;
		_foot.parent = _ankle;
		base.position.set(x,y,z);
		_hip.position.set(0,0,0);
		_knee.position.set(0,0,0.25*_size);
		_ankle.position.set(0,0,0.25*_size);
		_uleg.position.set(0,0,0.25*_size);
		_lleg.position.set(0,0,0.25*_size);
		_foot.position.set(0,0,0.25*_size);

		_components.Legs[name] = base;
		return base;
	};

	function _createArms(x, y, z, color, name){
		var component,_shoulder,_elbow,_wrist,_pincerjoint,_uarm,_larm,_hand,_pincer;
		name = name || '';
		x = x || 0;
		y = y || 0;
		z = z || 0;
		x = x*_size;
		y = y*_size;
		z = z*_size;
		_shoulder = _createJoint(name + '_shoulder');
		_elbow = _createJoint(name + '_elbow');
		_wrist = _createJoint(name + '_wrist');
		_pincerjoint = _createJoint(name + '_pincerjoint');
		_uarm = _createDiamond(0.15,0.15,0.25,color);
		_larm = _createDiamond(0.15,0.15,0.25,color);
		_hand = _createDiamond(0.15,0.15,0.25,color);
		_pincer = _createDiamond(0.075,0.075,0.125,color);
		component = [_shoulder,_uarm,_elbow,_larm,_wrist,_hand,_pincerjoint,_pincer];
		
		_uarm.parent = _shoulder;
		_elbow.parent = _uarm;
		_larm.parent = _elbow;
		_wrist.parent = _larm;
		_hand.parent = _wrist;
		_pincerjoint.parent = _hand;
		_pincer.parent = _pincerjoint;

		_shoulder.position.set(x,y,z);
		_elbow.position.set(0,0,0.25*_size);
		_wrist.position.set(0,0,0.25*_size);
		_uarm.position.set(0,0,0.25*_size);
		_larm.position.set(0,0,0.25*_size);
		_hand.position.set(0,0,0.25*_size);
		_pincerjoint.rotation.y = Math.PI/2;

		_pincerjoint.position.set(0.15*_size,0,0);
		_pincer.position.set(0,0,0.125*_size);

		_components.Arms[name] = _shoulder;
		return _shoulder;
	};

	// returns the body object
	function _createBody(color) {
		var verticesOfCube,indicesOfFaces,bodyGeometry,eyeGeometry,body,leye,reye;
		verticesOfCube = [
			0, 0.8*_size, 0,   
			-2*_size, 0, 0,
			-1.732*_size,0,-1*_size,
			-1*_size,0,-1.732*_size,
			0, 0, -2*_size,
			1*_size,0,-1.732*_size,
			1.732*_size,0,-1*_size,
			2*_size, 0, 0,
			1.732*_size,0,1*_size,
			1*_size,0,1.732*_size,
			0, 0, 2*_size,
			-1*_size,0,1.732*_size,
			-1.732*_size,0,1*_size,
			0, -0.4*_size, 0,
		];

		indicesOfFaces = [
			0, 2, 1,   0, 3, 2,   0, 4, 3,   0, 5, 4,   0, 6, 5,   0, 7, 6,   0, 8, 7,   0, 9, 8,   0, 10, 9,   0, 11, 10,   0, 12, 11,   0, 1, 12,
			13, 1, 2,   13, 2, 3,   13, 3, 4,   13, 4, 5,   13, 5, 6,   13, 6, 7,   13, 7, 8,   13, 8, 9,   13, 9, 10,   13, 10, 11,   13, 11, 12,   13, 12, 1,];

		bodyGeometry = new THREE.Geometry();

		for(var i=0;i<verticesOfCube.length;i+=3)
			bodyGeometry.vertices.push(new THREE.Vector3(verticesOfCube[i],verticesOfCube[i+1],verticesOfCube[i+2]));
		for(var i=0;i<indicesOfFaces.length;i+=3)
			bodyGeometry.faces.push(new THREE.Face3(indicesOfFaces[i],indicesOfFaces[i+1],indicesOfFaces[i+2]));
		for(var i=0;i<indicesOfFaces.length;i+=3)
			bodyGeometry.faceVertexUvs.push(new THREE.Face3(indicesOfFaces[i],indicesOfFaces[i+1],indicesOfFaces[i+2]));

		bodyGeometry.computeFaceNormals();
	    bodyGeometry.computeVertexNormals();
	    bodyGeometry.computeBoundingSphere();
	    bodyGeometry.computeBoundingBox();
		var max = bodyGeometry.boundingBox.max,
		    min = bodyGeometry.boundingBox.min;
		var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
		var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
		bodyGeometry.faceVertexUvs[0] = [];
		for (i = 0; i < bodyGeometry.faces.length ; i++) {

		    var v1 = bodyGeometry.vertices[bodyGeometry.faces[i].a], v2 = bodyGeometry.vertices[bodyGeometry.faces[i].b], v3 = bodyGeometry.vertices[bodyGeometry.faces[i].c];
		    bodyGeometry.faceVertexUvs[0].push(
		        [
		            new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
		            new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
		            new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
		        ]);

		}
		bodyGeometry.uvsNeedUpdate = true;
	    
	    if(!_texture)
			body = new THREE.Mesh(bodyGeometry, new THREE.MeshLambertMaterial({color: color}));
		else{
			var texture = _texture;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 4, 4 );
			body = new THREE.Mesh(bodyGeometry, new THREE.MeshLambertMaterial({color: color,map: texture}));
		}

		body.castShadow = body.receiveShadow = true;
		body.position.set(0,0,0);

		eyeGeometry = new THREE.SphereGeometry( 0.07*_size, 32*_size, 32*_size );
		leye = new THREE.Mesh( eyeGeometry, new THREE.MeshLambertMaterial( {color: 0x000000} ) );
		reye = leye.clone();
		leye.position.set(-0.5*_size,0,1.866*_size);
		reye.position.set(0.5*_size,0,1.866*_size);

		scene.add(leye);
		scene.add(reye);
		scene.add(body);

		leye.parent = body;
		reye.parent = body;
		_components.Body['left_eye'] = leye;
		_components.Body['right_eye'] = reye;
		_components.Body['body'] = body;
		return body;
	};
	//Initialize the Crab's comonents
	function _initCrab(){
		_initArms();
		_initLegs();
		_components.Legs['left_leg1'].parent = _components.Body.body;
		_components.Legs['right_leg1'].parent = _components.Body.body;
		_components.Legs['left_leg2'].parent = _components.Body.body;
		_components.Legs['right_leg2'].parent = _components.Body.body;
		_components.Legs['left_leg3'].parent = _components.Body.body;
		_components.Legs['right_leg3'].parent = _components.Body.body;
		_components.Legs['left_leg4'].parent = _components.Body.body;
		_components.Legs['right_leg4'].parent = _components.Body.body;
		_components.Arms['left_arm'].parent = _components.Body.body;
		_components.Arms['right_arm'].parent = _components.Body.body;
		_components.Body.body.rotation.y = Math.PI/2;
	};
	//Initialize the arms' rotation
	function _initArms(){
		_components.Joints['right_arm_shoulder'].rotation.y = -Math.PI/6;
		_components.Joints['right_arm_elbow'].rotation.y = Math.PI/6;
		_components.Joints['right_arm_wrist'].rotation.y = Math.PI/6;
		_components.Joints['right_arm_pincerjoint'].rotation.y = Math.PI/6;
		
		_components.Joints['left_arm_shoulder'].rotation.z = Math.PI;
		_components.Joints['left_arm_shoulder'].rotation.y = Math.PI/6;
		_components.Joints['left_arm_elbow'].rotation.y = Math.PI/6;
		_components.Joints['left_arm_wrist'].rotation.y = Math.PI/6;
		_components.Joints['left_arm_pincerjoint'].rotation.y = Math.PI/6;
	};
	//Initialize the legs' rotation
	function _initLegs(){
		_components.Legs['right_leg1'].rotation.y = -Math.PI/3;
		_components.Legs['left_leg1'].rotation.y = Math.PI/3;
		_components.Legs['left_leg2'].rotation.y = Math.PI/2;
		_components.Legs['right_leg2'].rotation.y = -Math.PI/2;
		_components.Legs['right_leg3'].rotation.y = -2*Math.PI/3;
		_components.Legs['left_leg3'].rotation.y = 2*Math.PI/3;
		_components.Legs['right_leg4'].rotation.y = -5*Math.PI/6;
		_components.Legs['left_leg4'].rotation.y = 5*Math.PI/6;
	};
	//to add the crab into the scence
	function _loadCrab(){
		scene.add(_components.Body.left_eye);
		scene.add(_components.Body.right_eye);
		scene.add(_components.Body.body);
		for(var joints in _components.Joints){
			if(_components.Joints.hasOwnProperty(joints))
				scene.add(_components.Joints[joints]);
		};
		for(var diamond in _components.Diamond){
			if(_components.Diamond.hasOwnProperty(diamond))
				scene.add(_components.Diamond[diamond]);
		};
		
	};
	//function to create arms and legs
	function _createCrab(color){
		var body,arm1,arm2,leg1,leg2,leg3,leg4,leg5,leg6,leg7,leg8;
		body = _createBody(color);
		arm1 = _createArms(-1,0,1.732,color,'right_arm');
		arm2 = _createArms(1,0,1.732,color,'left_arm');
		leg1 = _createLeg(-1.732,0,1,color,'right_leg1');
		leg2 = _createLeg(1.732,0,1,color,'left_leg1');
		leg3 = _createLeg(2,0,0,color,'left_leg2');
		leg4 = _createLeg(-2,0,0,color,'right_leg2');
		leg5 = _createLeg(-1.732,0,-1,color,'right_leg3');
		leg6 = _createLeg(1.732,0,-1,color,'left_leg3');
		leg7 = _createLeg(-1,0,-1.732,color,'right_leg4');
		leg8 = _createLeg(1,0,-1.732,color,'left_leg4');
		_initCrab();
	};
	//the frame animation of the crab
	function _legFrame(frame){
		var curJ =_components.Joints, strF = '_leg', strB1 = '_hip', strB2 = '_knee', strB3='_ankle', i=1,
			ang = [ -2*Math.PI/9, 4*Math.PI/9, 5*Math.PI/18, 
					-Math.PI/9,   Math.PI/9,   Math.PI/9,
					0,            0,           0,
					0,			  Math.PI/9,   Math.PI/9],
			fFrame = frame,bFrame = frame-2;
		bFrame = bFrame == -1 ? 3 : bFrame;
		bFrame = bFrame == -2 ? 2 : bFrame;
		for(i;i<3;++i){
			curJ['right_leg'+(i*2)+'_hip'].rotation.x = ang[fFrame*3];
			curJ['left_leg'+(i*2)+'_hip'].rotation.x = ang[bFrame*3];
			curJ['right_leg'+(i*2)+'_knee'].rotation.x = ang[fFrame*3+1];
			curJ['left_leg'+(i*2)+'_knee'].rotation.x = ang[bFrame*3+1];
			curJ['right_leg'+(i*2)+'_ankle'].rotation.x = ang[fFrame*3+2];
			curJ['left_leg'+(i*2)+'_ankle'].rotation.x = ang[bFrame*3+2];
			curJ['right_leg'+(i*2-1)+'_hip'].rotation.x = ang[bFrame*3];
			curJ['left_leg'+(i*2-1)+'_hip'].rotation.x = ang[fFrame*3];
			curJ['right_leg'+(i*2-1)+'_knee'].rotation.x = ang[bFrame*3+1];
			curJ['left_leg'+(i*2-1)+'_knee'].rotation.x = ang[fFrame*3+1];
			curJ['right_leg'+(i*2-1)+'_ankle'].rotation.x = ang[bFrame*3+2];
			curJ['left_leg'+(i*2-1)+'_ankle'].rotation.x = ang[fFrame*3+2];
		}

	};
	//the controler of the leg frame animation
	function _frameAnimation(){
		var i = _legIndex%15, j = _legIndex/15;
		if(i==0){
			if(j==0)
				_legFrame(0);
			else if(j==1)
				_legFrame(1);
			else if(j==2)
				_legFrame(2);
			else if(j==3)
				_legFrame(3);
			else if(j==4){
				_legFrame(0);
				_legIndex = -1;
			} 
		}
		_legIndex++;
	}
	var crabObj = {
		readyState : false,//whether the Crab is load
		instanceId : null,//the only id to mark the Crab
		mapIndex : -1,//the collision map index where the Crab is
		//get the components of the Crab
		getComponents : function(){
			return _components;
		},
		//get the position of the Crab
		getPosition : function(){
			return _components.Body.body.position;
		},
		//get the speed of the Crab
		getSpeed : function(){
			return _speed;
		},
		//create a Crab
		createCrab : function(size, color, texture){
			var that = this;
			_size = size||1.0;
			if(texture){
				var loader = new THREE.TextureLoader();
				loader.load(texture,function(loadedTexture){
					loadedTexture.wrapS = THREE.RepeatWrapping;
					loadedTexture.wrapT = THREE.RepeatWrapping;
					loadedTexture.repeat.set( 4, 4 );
					_texture = loadedTexture;
					_createCrab(color);
					that.readyState = true;
				})
				return;
			}
			_createCrab(color);
			
		},
		//clone one Crab
		clone : function(){
			var crab = new Crab(scene), curComp = crab.getComponents(),i,j;
			for(var i in _components){
				if(_components.hasOwnProperty(i)){
					if(!curComp[i])
						curComp[i] = {};
					for(var j in _components[i]){
						if(_components[i].hasOwnProperty(j)){
							curComp[i][j] = _components[i][j].clone();
						}
					}
				}
			}
			return crab;
		},
		//turn the Crab 
		turnAround : function(){
			_targetDirect = _direct + Math.PI/3 * (2*Math.random()-1);
			_speed = 0.0;
		},
		//turn back the Crab
		turnBack : function(){
			_targetDirect = _direct + Math.PI;
			_direct = _direct + Math.PI;
		},
		setRotation : function(r){
			_targetDirect = r;
			_speed = 0.0;
		},
		setPosition : function(x,y){
			_components.Body.body.position.set(x,0,y);
		},
		//function to update the crab every frame
		_update : function(){
			var curCrab = _components.Body.body,
			curPos = curCrab.position,
			curRot = curCrab.rotation,
			dy;
			_turnIndex++;
			if(_turnIndex == 100){
				if(Math.random()>0.5)
					this.turnAround();
				_turnIndex = 0;
			}
			if(_direct - _targetDirect > Math.PI/180 || _direct - _targetDirect < -Math.PI/180){
				dy = (_direct - _targetDirect) >0 ? -1 : 1;
				curRot.y += dy * Math.PI/180;
				_direct += dy * Math.PI/180;
			}
			else
				_speed = 0.05;
			curPos.x += Math.sin(_direct) * _speed;
			curPos.z += Math.cos(_direct) * _speed;
			_frameAnimation();
		}
	};
	return crabObj;
};
