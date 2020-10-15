import { disposeMaterial } from '/library/scripts/core/resources/utils.module.js';
import { CubeTextureLoader } from '/library/scripts/three/build/three.module.js';
  
class Background {
    constructor() {
        this._setupGrid();
    }

    _setupGrid() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');
        context.canvas.width  = 204;
        context.canvas.height = 204;
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, 204, 204);
        context.fillStyle = "000000";
    }

    setToGrid() {

        for (x=0;x<=w;x+=20) {
            for (y=0;y<=h;y+=20) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        }
    }

    setToSkybox(params) {
        let path = params['Path'];
        let extension = params['File Extension'];
        new CubeTextureLoader()
            .setPath(path)
            .load([
                "right" + extension,
                "left" + extension,
                "top" + extension,
                "bottom" + extension,
                "front" + extension,
                "back" + extension,
            ], function(texture) {
                let oldBackground = global.scene.background;
                global.scene.background = texture;
                if(oldBackground) {
                    disposeMaterial(oldBackground);
                }
            });
    }
}

let background = new Background();

export default background;
