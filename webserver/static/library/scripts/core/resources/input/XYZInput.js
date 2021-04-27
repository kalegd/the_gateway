import NumberField from '/library/scripts/core/resources/input/NumberField.js';
import ThreeMeshUI from '/library/scripts/three-mesh-ui/three-mesh-ui.js';
import ThreeMeshUIHelper from '/library/scripts/core/resources/ThreeMeshUIHelper.js';

class XYZInput {
    constructor(params) {
        this._onEnter = params['onEnter'] || null;
        this._onUpdate = params['onUpdate'] || null;
        let initialValues = params['initialValues'] || [0,0,0];
        let title = params['title'] || 'Missing Field Name...';
        this.interactables = [];
        this._createInputs(initialValues, title);
    }

    _createInputs(initialValues, title) {
        this.block = new ThreeMeshUI.Block({
            'height': 0.2,
            'width': 1.5,
            'contentDirection': 'row',
            'justifyContent': 'start',
            'backgroundOpacity': 0,
        });
        let titleBlock = ThreeMeshUIHelper.createTextBlock({
            'text': title,
            'fontSize': 0.08,
            'height': 0.2,
            'width': 0.3,
        });
        this._xField = new NumberField({
            'initialText': String(initialValues[0]),
            'fontSize': 0.08,
            'height': 0.15,
            'width': 0.15,
            'onEnter': (this._onEnter) ? () => { this._onEnter(0) } : null,
            'onUpdate': (this._onUpdate) ? () => { this._onUpdate(0) } : null,
        });
        this._yField = new NumberField({
            'initialText': String(initialValues[1]),
            'fontSize': 0.08,
            'height': 0.15,
            'width': 0.15,
            'onEnter': (this._onEnter) ? () => { this._onEnter(1) } : null,
            'onUpdate': (this._onUpdate) ? () => { this._onUpdate(1) } : null,
        });
        this._zField = new NumberField({
            'initialText': String(initialValues[2]),
            'fontSize': 0.08,
            'height': 0.15,
            'width': 0.15,
            'onEnter': (this._onEnter) ? () => { this._onEnter(2) } : null,
            'onUpdate': (this._onUpdate) ? () => { this._onUpdate(2) } : null,
        });
        this.block.add(titleBlock);
        this.block.add(this._xField.block);
        this.block.add(this._yField.block);
        this.block.add(this._zField.block);
        this.interactables.push(this._xField.interactable);
        this.interactables.push(this._yField.interactable);
        this.interactables.push(this._zField.interactable);
    }

    getX() {
        return Number.parseFloat(this._xField.content);
    }

    getY() {
        return Number.parseFloat(this._yField.content);
    }

    getZ() {
        return Number.parseFloat(this._zField.content);
    }

    reset() {
        this._xField.reset();
        this._yField.reset();
        this._zField.reset();
    }
}

export default XYZInput;
