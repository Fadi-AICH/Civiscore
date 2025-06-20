declare module "three" {
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
    clone(): Vector2;
  }
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
  }
  export class Texture { needsUpdate?: boolean }
  export class CanvasTexture extends Texture {
    constructor(canvas?: any);
  }
  export class DataTexture extends Texture {
    constructor(data?: any, width?: number, height?: number, format?: any);
  }
  export class CanvasTexture extends Texture {}
  export class Color {
    constructor(hex?: number | string);
  }
  export class SphereGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }
  export class TextureLoader {
    load(url: string): any;
  }
  export class MeshBasicMaterial {
    constructor(params?: any);
  }
  // Base 3D object to expose common properties like userData used by react-three-fiber JSX elements
  export class Object3D {
    rotation?: any;
    userData?: any;
  }

  export class Mesh extends Object3D {
    constructor(geometry?: any, material?: any);
    rotation?: any;
  }

  export class Group extends Object3D {
    constructor();
  }
  export class Raycaster {
    constructor();
    setFromCamera(vec: any, camera: any): void;
    intersectObjects(objs: any, recursive?: boolean): any[];
    intersectObject(obj: any): any[];
  }
  export const RedFormat: any;
  export const BackSide: any;
}

