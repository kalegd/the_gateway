import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';

var id = 0;

export const getNextSequentialId = () => {
    return id++;
};

export const getRadians = (degrees) => {
    return ((degrees % 360) / 180) * Math.PI;
};

export const colorHexToHex = (colorHex) => {
    return parseInt(colorHex.replace("#", "0x"), 16);
};

export const getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
};

export const getRandomFloat = (min, max) => {
    return (Math.random() * (max - min) ) + min;
};

export const getRandomColor = (start) => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    if(start != null) {
        color = start;
    }
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => 
      (c^crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};

export const createLoadingLock = () => {
    let uuid = uuidv4();
    while(global.loadingAssets.has(uuid)) {
        uuid = uuidv4();
    }
    global.loadingAssets.add(uuid);
    return uuid;
};

export const loadScripts = (array,callback) => {
    var loader = function(src,handler){
        var script = document.createElement("script");
        script.src = src;
        script.onload = script.onreadystatechange = function(){
            script.onreadystatechange = script.onload = null;
            handler();
        }
        var head = document.getElementsByTagName("head")[0];
        (head || document.body).appendChild( script );
    };
    (function run(){
        if(array.length!=0){
            loader(array.shift(), run);
        }else{
            callback && callback();
        }
    })();
};

export const insertWrappedTextToCanvas = (context, text, x, y, maxWidth, lineHeight) => {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
};

export const fullDispose = (object3d) => {
    object3d.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }

            if (node.material) {

                if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
                    node.material.materials.forEach(function (mtrl, idx) {
                        disposeMaterial(mtrl);
                    });
                }
                else {
                    disposeMaterial(node.material);
                }
            }
        }
    });
};

export const disposeMaterial = (material) => {
    if (material.alphaMap) material.alphaMap.dispose();
    if (material.aoMap) material.aoMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.displacementMap) material.displacementMap.dispose();
    if (material.emissiveMap) material.emissiveMap.dispose();
    if (material.envMap) material.envMap.dispose();
    if (material.gradientMap) material.gradientMap.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.map) material.map.dispose();
    if (material.metalnessMap) material.metalnessMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.roughnessMap) material.roughnessMap.dispose();
    if (material.specularMap) material.specularMap.dispose();

    material.dispose();    // disposes any programs associated with the material
};
