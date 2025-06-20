declare module "@react-three/fiber" {
  import type { Object3D } from "three";
  // Extend built-in props to accept userData so that JSX elements like <mesh userData={...}> compile
  export interface MeshProps {
    userData?: any;
    // allow any additional props to avoid type mismatch issues
    [key: string]: any;
  }
  export const Canvas: any;
  export function useFrame(cb: (...args: any[]) => void): void;

  export interface GroupProps {
    userData?: any;
    [key: string]: any;
  }
}
