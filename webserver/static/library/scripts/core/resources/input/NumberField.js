import PointerInteractableStates from '/library/scripts/core/enums/PointerInteractableStates.js';
import TextField from '/library/scripts/core/resources/input/TextField.js';

class NumberField extends TextField {
    constructor(params) {
        super(params);
    }

    _setupEventListeners() {
        this._keyListener = (event) => {
            if(isFinite(event.key) || event.key == '-' || event.key == '.') {
                this._appendToContent(event.key);
                if(this._onUpdate) this._onUpdate();
            } else if(event.key == "Backspace") {
                this._removeFromEndOfContent();
                if(this._onUpdate) this._onUpdate();
            } else if(event.key == "Enter") {
                this._deactivate();
                if(this._onEnter) this._onEnter();
            }
        };
        this._clickListener = (event) => {
            if(this.interactable.getState() != PointerInteractableStates.SELECTED) {
                this._deactivate();
            }
        };
    }

    _removeCursor() {
        let textComponent = this.block.children[1];
        let content = textComponent.content;
        if(content.length > 0 && content.endsWith("|")) {
            let newContent = textComponent.content.slice(0,-1);
            if(!Number.isNaN(Number.parseFloat(newContent))) {
                textComponent.set({ content: newContent });
            } else {
                this.reset();
            }
        }
    }
}

export default NumberField;
