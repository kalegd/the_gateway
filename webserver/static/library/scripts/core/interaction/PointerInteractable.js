import global from '/library/scripts/core/resources/global.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';
import States from '/library/scripts/core/enums/PointerInteractableStates.js';

class PointerInteractable {
    constructor(threeObj, actionFunc) {
        this._threeObj = threeObj;
        this._actionFunc = actionFunc;
        this._state = States.IDLE;
        this._hoveredOwners = new Set();
        this._selectedOwners = new Set();
    }

    getThreeObj() {
        return this._threeObj;
    }

    getState() {
        return this._state;
    }

    setState(newState) {
        if(this._state != newState) {
            this._state = newState;
            if(this._threeObj.states && newState in this._threeObj.states) {
                this._threeObj.setState(newState);
            }
        }
    }

    _determineAndSetState() {
        if(this._selectedOwners.size > 0) {
            this.setState(States.SELECTED);
        } else if(this._hoveredOwners.size > 0) {
            this.setState(States.HOVERED);
        } else {
            this.setState(States.IDLE);
        }
    }

    addHoveredBy(owner) {
        if(this._hoveredOwners.has(owner)) {
            return;
        } else if(this._selectedOwners.has(owner) && this._actionFunc != null) {
            this._actionFunc();
        }
        this._hoveredOwners.add(owner);
        if(this._selectedOwners.size == 0) {
            this.setState(States.HOVERED);
        }
    }

    removeHoveredBy(owner) {
        this._hoveredOwners.delete(owner);
        this._determineAndSetState();
    }

    addSelectedBy(owner) {
        this._selectedOwners.add(owner);
        this.setState(States.SELECTED);
        global.sessionHandler.disableOrbit();
    }

    removeSelectedBy(owner) {
        this._selectedOwners.delete(owner);
        this._determineAndSetState();
        global.sessionHandler.enableOrbit();
    }

    reset() {
        this._hoveredOwners.clear();
        this._selectedOwners.clear();
        this.setState(States.IDLE);
    }

    updateAction(newActionFunc) {
        this._actionFunc = newActionFunc;
    }
}

export default PointerInteractable;
