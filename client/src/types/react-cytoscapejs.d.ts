declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import { Core, ElementDefinition, LayoutOptions, Stylesheet } from 'cytoscape';

  interface CytoscapeComponentProps {
    id?: string;
    cy?: (cy: Core) => void;
    style?: React.CSSProperties;
    elements: ElementDefinition[];
    layout?: LayoutOptions;
    stylesheet?: Stylesheet[];
    className?: string;
    zoom?: number;
    pan?: { x: number; y: number };
    minZoom?: number;
    maxZoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
    autolock?: boolean;
    headless?: boolean;
    styleEnabled?: boolean;
    hideEdgesOnViewport?: boolean;
    textureOnViewport?: boolean;
    motionBlur?: boolean;
    motionBlurOpacity?: number;
    wheelSensitivity?: number;
    pixelRatio?: number | 'auto';
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {
    static normalizeElements(elements: any): ElementDefinition[];
  }
}
