# step2glb

[![license](https://badgen.net/github/license/xslasd/step2glb/)](https://github.com/xslasd/step2glb/blob/master/LICENSE)
[![release](https://badgen.net/github/release/xslasd/step2glb/stable)](https://github.com/xslasd/step2glb/releases)

## step2glb Introduction

Convert 3d model (STL/IGES/STEP/OBJ/FBX) to gltf and other

Theoretical supported file formats

- **Import**: obj, 3ds, stl, ply, gltf, glb, off, 3dm, fbx, dae, wrl, 3mf, ifc, brep, step, iges, fcstd, bim.
- **Export**: obj, stl, ply, gltf, glb, off, 3dm, bim.

# Start STEP file to GLB file service

## Project setup

```
npm install
```

## Configure config.json file

```json
{
  "callback_url": "", // Conversion file result callback interface
  "callback_file": true, // When calling the conversion file result callback interface, synchronously upload the converted file stream.
  "s3_upload_config": {
    "endPoint": "127.0.0.1",
    "port": 9010,
    "useSSL": false,
    "accessKey": "xxxx",
    "secretKey": "xxxxx",
    "bucketName": "xxx-asset"
  }
}
```

## Run Service

```
npm run dev
```

or

```
node ./app.js
```

# STEP file to GLB file service usage steps

## 1、Interface for submitting STEP files

> request /convertwork/v1/importfile

> method：POST

> data type：json

```json
{
  "request_id": "", //Request ID, used for conversion result identification, required.
  "url": "", //Choose between the network file address, URL or file Only one.
  "file": "<file>", //The file stream to convert,URL or file Only one.
  "convert_type": "glb", //Conversion file type glb, etc., required.
  "file_name": "", //file name,The file name must have a suffix.(for example:test.step)
  "save_path": "" //minio s3 Save File Path
}
```

> response

```json
{
  "code": 0,
  "msg": "OK",
  "data": "gid" //Used for transitioning status queries
}
```

ecode

> 4000 Request parameter error. Verify mandatory parameters  
>  4001 Unsupported file type  
>  4002 Unsupported conversion file type

## 2、Conversion file progress query interface

ps: When the conversion file is incorrect or completed, the progress information is automatically eliminated.

> request /convertwork/v1/progress

> method：GET

> data type：json

```json
{
  "gid": "" //Unique identification of the conversion file.
}
```

> response

```json
{
  "code": 0,
  "msg": "OK",
  "data": {
    "stage": "", //transition stage
    //FileListProgress Zip file processing, msg contains current, total
    //FileLoadProgress File stream loading, msg contains current, total
    //ImportStart
    //ExportStart
    "msg": "current, total" //Stage messages
  }
}
```

ecode

> 4003 Conversion file progress information does not exist

## 3、Conversion file result callback interface (3D file conversion completion callback interface)

> request <Config.callback_url>

> method：POST

> data type：json

```json
{
  "request_id": "", //Unique identification of the conversion file.
  "status": 0, //0 successfully converted; 1 Conversion failed
  "msg": "", //Error message when conversion fails
  "file": "<file>", //The converted file stream, when config.callback_ File=true
  "file_path": "" //Converted mini s3 file path
}
```

> If the response fails, it will automatically retry 3 times.

```json
{
  "code": 0,
  "msg": "OK"
}
```

# Third-party Library

The engine code in this library uses the https://3dviewer.net/ library.
