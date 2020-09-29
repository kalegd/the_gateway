import * as THREE from '/library/scripts/three/build/three.module.js';
  
export default class PointLight {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._light;
        this._pivotPoint = new THREE.Object3D();

        this._color = (params['Color']) ? params['Color'] : 0xffffff;
        this._intensity = (params['Intensity']) ? params['Intensity'] : 1;
        this._distance = (params['Distance']) ? params['Distance'] : 0;
        this._decay = (params['Decay']) ? params['Decay'] : 1;
        this._position = (params['Position']) ? params['Position'] : [0,0,0];

        this._pivotPoint.position.fromArray(this._position);

        this._createMeshes();
    }

    _createMeshes() {
        this._light = new THREE.PointLight(
            this._color,
            this._instensity,
            this._distance,
            this._decay,
        );
        this._pivotPoint.add(this._light);

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
                "name": "Position",
                "type": "list3",
                "default": [0,0,0]
            },
            {
                "name": "Initial Y Position",
                "type": "float",
                "default": 0
            },
            {
                "name": "Initial Z Position",
                "type": "float",
                "default": 0
            },
            {
                "name": "Color",
                "type": "color",
                "default": 0xffffff
            },
            {
                "name": "Intensity",
                "type": "float",
                "default": 1
            },
            {
                "name": "Distance",
                "type": "float",
                "default": 0
            },
            {
                "name": "Decay",
                "type": "float",
                "default": 1
            },
        ];
    }

}
