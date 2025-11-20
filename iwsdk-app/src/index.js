import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  PlaneGeometry,
  SessionMode,
  World,
  LocomotionEnvironment,
  EnvironmentType,
  PhysicsBody, 
  PhysicsShape, 
  PhysicsShapeType, 
  PhysicsState, 
  PhysicsSystem,
  OneHandGrabbable,
  CylinderGeometry,
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';

import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1

const assets = { };

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { 
    locomotion: true, 
    grabbing: true,
  },

}).then((world) => {

  const { camera } = world;

  world.registerSystem(PhysicsSystem).registerComponent(PhysicsBody).registerComponent(PhysicsShape);
  
  // Create a green sphere
  const sphereGeometry = new SphereGeometry(0.25, 32, 32);
  const greenMaterial = new MeshStandardMaterial({ color: "red" });
  const sphere = new Mesh(sphereGeometry, greenMaterial);
  sphere.position.set(1, 1.5, -3);

  //Grabbing
  const sphereEntity = world.createTransformEntity(sphere);
  sphereEntity.addComponent(Interactable).addComponent(OneHandGrabbable);

  //Physics
  sphereEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto,  density: 0.2,  friction: 0.5,  restitution: 0.9 }); 
  sphereEntity.addComponent(PhysicsBody, { state: PhysicsState.Dynamic });

  // create a floor
  const floorMesh = new Mesh(new PlaneGeometry(20, 20), new MeshStandardMaterial({ color:"tan" }));
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });

  //Physics
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });

  //Bat
  const cylinderGeometry = new CylinderGeometry(.025, .025, 1.5);
  const cylinderMaterial = new MeshStandardMaterial({ color: "red" });
  const cylinder = new Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.rotation.x = -Math.PI / 2;
  cylinder.rotation.z = -Math.PI / 2;
  cylinder.position.set(0, 1.5, -1);
  
  //Grabbing
  const cylinderEntity = world.createTransformEntity(cylinder);
  cylinderEntity.addComponent(Interactable).addComponent(OneHandGrabbable);
  
  //Physics
  cylinderEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto,  density: 0.2,  friction: 0.5,  restitution: 0.9 }); 
  cylinderEntity.addComponent(PhysicsBody, { state: PhysicsState.Kinematic });

  //Back wall
  const wallMesh = new Mesh(new PlaneGeometry(600, 10), new MeshStandardMaterial({color:"black"}));
  wallMesh.position.set(0, 5, -15);
  const wallEntity = world.createTransformEntity(wallMesh);
  
  //Physics
  wallEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
  wallEntity.addComponent(PhysicsShape, {shape: PhysicsShapeType.Auto, restitution: 0.9,});

  console.log('a button pressed!');

  function respawnSphere() {
  sphereEntity.position.set(0, 5, -3);   // reset position
  sphereEntity.physicsBody.setVelocity(0, 0, 0); // stop movement
}

  //GameLoop
  function gameLoop() {
    // code here runs every frame
    if (sphereEntity.position.z < -30) {
        sphereEntity.destroy()
    }

    const leftCtrl = world.input.gamepads.left
    if (leftCtrl?.gamepad.buttons[4].pressed) {
          console.log('x button pressed!');
          // do something like spawn a new object
          sphereEntity.position.set(0, 5, -3);
    }

    const rightCtrl = world.input.gamepads.right
    if (rightCtrl?.gamepad.buttons[4].pressed) {
          console.log('a button pressed!');
          // do something like spawn a new object
          batEntity.position.set(1, 1, -.5);
    }

    requestAnimationFrame(gameLoop);
  }
  gameLoop();

  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }

});
