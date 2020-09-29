import * as THREE from '/library/scripts/three/build/three.module.js';

export default class AmbientLight {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._light;
        this._pivotPoint = new THREE.Object3D();

        this._color = (params['Color']) ? params['Color'] : 0xffffff;
        this._intensity = (params['Intensity']) ? params['Intensity'] : 1;

        this._createMeshes();
    }

    _createMeshes() {
        this._light = new THREE.AmbientLight(this._color, this._intensity);
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
                "name": "Color",
                "type": "color",
                "default": 0xffffff
            },
            {
                "name": "Intensity",
                "type": "float",
                "default": 1
            },
        ];
    }
}
