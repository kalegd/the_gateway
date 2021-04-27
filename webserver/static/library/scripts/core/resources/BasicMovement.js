import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

export default class BasicMovement {
    constructor(params) {
        if(params == null) {
            params = {};
        }
        this._avatar = params['Avatar'];
        this._userObj = params['User Object'];
        this._vector = new THREE.Vector3();//For any vector calculations
        this._vector2 = new THREE.Vector3();
        this._velocity = new THREE.Vector3();
        this._movementHand = "LEFT";
        this._movementSpeed = (params['Movement Speed (m/s)'])
            ? params['Movement Speed (m/s)']
            : 4;
        global.basicMovement = this;
    }

    setMovementHand(hand) {
        this._movementHand = hand;
    }
    _moveForward(distance) {
        // move forward parallel to the xz-plane
        // assumes camera.up is y-up
        this._vector.setFromMatrixColumn(global.camera.matrixWorld, 0);
        this._vector.crossVectors(this._userObj.up, this._vector);
        // not using addScaledVector because we use this._vector later
        this._vector.multiplyScalar(distance);
        this._userObj.position.add(this._vector);
    };

    _moveRight(distance) {
        this._vector.setFromMatrixColumn(global.camera.matrixWorld, 0);
        this._vector.y = 0;
        this._vector.multiplyScalar(distance);
        this._userObj.position.add(this._vector);
    };

    update(timeDelta) {
        if(global.deviceType == "XR") {
            this._updatePositionVR(timeDelta);
        } else if(global.deviceType == "POINTER") {
            this._updatePosition(timeDelta);
        }
    }

    _updatePosition(timeDelta) {
        // Decrease the velocity.
        this._velocity.x -= this._velocity.x * 10.0 * timeDelta;
        this._velocity.z -= this._velocity.z * 10.0 * timeDelta;

        if(global.sessionActive && !global.keyboardLock) {
            let movingDistance = 10.0 * this._movementSpeed * timeDelta;
            if (global.inputHandler.isKeyPressed("ArrowUp") || global.inputHandler.isKeyPressed("KeyW")) {
                this._velocity.z += movingDistance;
            }
            if (global.inputHandler.isKeyPressed("ArrowDown") || global.inputHandler.isKeyPressed("KeyS")) {
                this._velocity.z -= movingDistance;
            }
            if (global.inputHandler.isKeyPressed("ArrowLeft") || global.inputHandler.isKeyPressed("KeyA")) {
                this._velocity.x -= movingDistance;
            }
            if (global.inputHandler.isKeyPressed("ArrowRight") || global.inputHandler.isKeyPressed("KeyD")) {
                this._velocity.x += movingDistance;
            }
        }

        if(this._velocity.length() > this._movementSpeed) {
            this._velocity.normalize().multiplyScalar(this._movementSpeed);
        }
        if(this._avatar) {
            this._moveRight(this._velocity.x * timeDelta);
            this._vector2.copy(this._vector);
            this._moveForward(this._velocity.z * timeDelta);
            this._vector2.add(this._vector);
            if(this._vector2.length() > 0.01) {
                this._vector2.multiplyScalar(-2);
                this._avatar.lookAtLocal(this._vector2);
            }
        } else {
            this._moveRight(this._velocity.x * timeDelta);
            this._moveForward(this._velocity.z * timeDelta);
        }
    }

    _updatePositionVR(timeDelta) {
        //These two lines below add decceleration to the mix
        //this._velocity.x -= this._velocity.x * 10.0 * timeDelta;
        //this._velocity.z -= this._velocity.z * 10.0 * timeDelta;
        this._velocity.x = 0;
        this._velocity.z = 0;
        let gamepad = global.inputHandler.getXRGamepad(this._movementHand);
        if(gamepad != null) {
            let axes = gamepad.axes;
            let movingDistance = 10.0 * this._movementSpeed * timeDelta;
            this._velocity.z = -1 * movingDistance * axes[3];//Forward/Backward
            this._velocity.x = movingDistance * axes[2];//Left/Right
            this._velocity.normalize().multiplyScalar(this._movementSpeed);
        }
        this._moveRight(this._velocity.x * timeDelta);
        this._moveForward(this._velocity.z * timeDelta);
    }

    canUpdate() {
        return true;
    }

    static isDeviceTypeSupported(deviceType) {
        return (deviceType == "XR" || deviceType == "POINTER");
    }

    static getScriptType() {
        return 'PRE_SCRIPT';
    }

    static getFields() {
        return [
            {
                "name": "Movement Speed (m/s)",
                "type": "float",
                "default": 4
            },
        ];
    }
}
