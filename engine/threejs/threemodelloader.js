
import { Importer } from '../import/importer.js';
import { RevokeObjectUrl } from '../io/bufferutils.js';
import { ConvertModelToThreeObject, ModelToThreeConversionOutput, ModelToThreeConversionParams } from './threeconverter.js';
import { ConvertColorToThreeColor } from './threeutils.js';

import * as THREE from 'three';

export class ThreeModelLoader {
    constructor() {
        this.importer = new Importer();
        this.inProgress = false;
        this.defaultMaterial = null;
        this.objectUrls = null;
    }

    InProgress () {
        return this.inProgress;
    }

    LoadModel (inputFiles, settings, callbacks) {
        if (this.inProgress) {
            return;
        }

        this.inProgress = true;
        this.RevokeObjectUrls();
        this.importer.ImportFiles(inputFiles, settings, {
            onLoadStart: () => {
                callbacks.onLoadStart();
            },
            onFileListProgress: (current, total) => {
                callbacks.onFileListProgress(current, total);
            },
            onFileLoadProgress: (current, total) => {
                callbacks.onFileLoadProgress(current, total);
            },
            onImportStart: () => {
                callbacks.onImportStart();
            },
            onSelectMainFile: (fileNames, selectFile) => {
                if (!callbacks.onSelectMainFile) {
                    selectFile(0);
                } else {
                    callbacks.onSelectMainFile(fileNames, selectFile);
                }
            },
            onImportSuccess: (importResult) => {
                callbacks.onVisualizationStart();
                let params = new ModelToThreeConversionParams();
                let output = new ModelToThreeConversionOutput();
                ConvertModelToThreeObject(importResult.model, params, output, {
                    onTextureLoaded: () => {
                        callbacks.onTextureLoaded();
                    },
                    onModelLoaded: (threeObject) => {
                        callbacks.onModelFinished(importResult, threeObject);
                        this.inProgress = false;
                    }
                });
            },
            onImportError: (importError) => {
                callbacks.onLoadError(importError);
                this.inProgress = false;
            }
        });
    }

    GetImporter () {
        return this.importer;
    }

    GetDefaultMaterial () {
        return this.defaultMaterial;
    }

    ReplaceDefaultMaterialColor (defaultColor) {
        if (this.defaultMaterial !== null && !this.defaultMaterial.vertexColors) {
            this.defaultMaterial.color = ConvertColorToThreeColor(defaultColor);
        }
    }

    RevokeObjectUrls () {
        if (this.objectUrls === null) {
            return;
        }
        for (let objectUrl of this.objectUrls) {
            RevokeObjectUrl(objectUrl);
        }
        this.objectUrls = null;
    }
}
