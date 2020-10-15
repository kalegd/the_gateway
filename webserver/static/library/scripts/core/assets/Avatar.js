import * as THREE from '/library/scripts/three/build/three.module.js';
import { GLTFLoader } from '/library/scripts/three/examples/jsm/loaders/GLTFLoader.js';
  
export default class Avatar {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._userObj = params['User Object'];
        this._focusCamera = (params['Focus Camera'])
            ? params['Focus Camera']
            : false;
        this._cameraFocalPoint = (params['Camera Focal Point'])
            ? params['Camera Focal Point']
            : [0,0.5,0];
        this._xrViewPoint = (params['XR View Point'])
            ? params['XR View Point']
            : [0,1,0];
        this._defaultURL = '/library/models/core/default_avatar.glb';
        this._worldEuler = new THREE.Euler();
        this._vector3 = new THREE.Vector3();
        this._pivotPoint = new THREE.Object3D();
        this._createBoundingBox(params);
        //this._pivotPoint.position.setY(1.3);

        this._createMesh((params['URL']) ? params['URL'] : this._defaultURL);
        if(this._focusCamera) {
            global.cameraFocus.position.fromArray(this._cameraFocalPoint);
        }
    }

    _createBoundingBox(params) {
        let boundingBoxSize = (params['Bounding Box Size'])
            ? params['Bounding Box Min']
            : [0.2, 0.8, 0.2];
        let boundingBoxCenter = (params['Bounding Box Center'])
            ? params['Bounding Box Max']
            : [0, 0.4, 0];
        let boundingBoxQuaternion = (params['Bounding Box Quaternion'])
            ? params['Bounding Box Quaternion']
            : [0, 0, 0, 0];
        let geometry = new THREE.BoxGeometry(
            boundingBoxSize[0],
            boundingBoxSize[1],
            boundingBoxSize[2],
        );
        let material = new THREE.MeshBasicMaterial({ wireframe: true });
        this._boundingBox = new THREE.Mesh(geometry, material);
        this._boundingBox.position.fromArray(boundingBoxCenter);
        this._boundingBox.quaternion.fromArray(boundingBoxQuaternion);
        //this._pivotPoint.add(this._boundingBox);
    }

    _createMesh(filename) {
        if(/\.glb$/.test(filename)) {
            let gltfLoader = new GLTFLoader();
            gltfLoader.load(filename, (gltf) => {
                gltf.scene.rotateY(Math.PI);
                let hands = new Set();
                gltf.scene.traverse((child) => {
                    if(child.name.toLowerCase().includes("hand")) {
                        hands.add(child);
                    }
                });
                hands.forEach((hand) => { hand.parent.remove(hand); });
                this._pivotPoint.add(gltf.scene);
                this._dimensions = 3;
            }, () => {}, (error) => {
                console.log(error);
                if(filename != this._defaultURL) {
                    this._createMesh(this._defaultURL);
                } else {
                    console.error("Can't display default avatar :(");
                }
            });
        } else if(/\.png$|\.jpg$|\.jpeg$/.test(filename)) {
            new THREE.TextureLoader().load(filename, (texture) => {
                let width = texture.image.width;
                let height = texture.image.height;
                if(width > height) {
                    let factor = 0.3 / width;
                    width = 0.3;
                    height *= factor;
                } else {
                    let factor = 0.3 / height;
                    height = 0.3;
                    width *= factor;
                }
                let material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: true,
                });
                let geometry = new THREE.PlaneBufferGeometry(width, height);
                geometry.rotateY(Math.PI);
                let mesh = new THREE.Mesh(geometry, material);
                this._pivotPoint.add(mesh);
                //let sprite = new THREE.Sprite(material);
                //this._pivotPoint.add(sprite);
                this._dimensions = 2;
            }, () => {}, () => {
                if(filename != this._defaultURL) {
                    this._createMesh(this._defaultURL);
                } else {
                    console.error("Can't display default avatar :(");
                }
            });
        } else {
            if(filename != this._defaultURL) {
                this._createMesh(this._defaultURL);
            } else {
                console.error("Default avatar URL is invalid :(");
            }
        }
    }

    lookAtLocal(point) {
        if(this._userObj) {
            this._vector3.copy(point);
            this._userObj.localToWorld(this._vector3);
            this._pivotPoint.lookAt(this._vector3);
        }
    }

    addToScene(scene) {
        scene.add(this._pivotPoint);
    }

    removeFromScene() {
        this._pivotPoint.parent.remove(this._pivotPoint);
        fullDispose(this._pivotPoint);
    }

    canUpdate() {
        return false;
    }

    static getScriptType() {
        return ScriptType.ASSET;
    }

    static getFields() {
        return [
            {
                "name": "URL",
                "type": "text",
                "default": '/library/models/core/default_avatar.glb'
            },
        ];
    }

}
