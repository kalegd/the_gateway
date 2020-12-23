import global from '/library/scripts/core/resources/global.js';
import * as THREE from '/library/scripts/three/build/three.module.js';
import { DRACOLoader } from '/library/scripts/three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from '/library/scripts/three/examples/jsm/loaders/GLTFLoader.js';
import { JSZip } from '/library/scripts/three/examples/jsm/libs/jszip.module.min.js';

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

export const zipToGLTF = (arrayBuffer, successCallback, errorCallback) => {
    let zip = JSZip(arrayBuffer);
    console.log(zip);
    zip.filter(( path, file ) => {
        let manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => {
            let file = zip.files[url];
            if(file) {
                console.log('Loading', url);
                var blob = new Blob([file.asArrayBuffer()], { type: 'application/octet-stream' });
                return URL.createObjectURL(blob);
            }
            return url;
        });
        let extension = file.name.split('.').pop().toLowerCase();
        switch ( extension ) {
            case 'gltf':
                var dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');
                var loader = new GLTFLoader(manager);
                loader.setDRACOLoader(dracoLoader);
                loader.parse(file.asText(), '',
                    (result) => { successCallback(result); },
                    () => { errorCallback(); });
                break;
        }
    });
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
