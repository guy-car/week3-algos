export interface QuickSortVisualizerProps {
    inputArray: number[]
}

export interface ElementState {
    id: string;
    value: number;
    positionX: number;
    positionY: number;
    visualState: 'normal' | 'pivot' | 'lower' | 'higher' | 'sorted' | 'finalGradient';
}

export interface SortedRegion {
    startCol: number;
    endCol: number;
    depth: number
}

export interface AlgorithmSnapshot {
    elements: ElementState[];
    sortedRegions: SortedRegion[]
    description: string;
    maxDepthReached: number;
}

export interface ArrayControlsProps {
    arraySize: number;
    onArraySizeChange: (size: number) => void;
    onGenerateRandom: () => void
}