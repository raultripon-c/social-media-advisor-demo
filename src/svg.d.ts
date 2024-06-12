
  declare module "*.png" {
    const value: string;
    export default value;
  }

  declare module '*.svg' {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }

  declare module '*.gif' {
    const value: any;
    export default value;
  }