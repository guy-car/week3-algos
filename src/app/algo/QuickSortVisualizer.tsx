'use client'

import { useState, useEffect } from "react";

interface QuickSortVisualizerProps {
    array: number[]
}

interface ElementState {
    id: string;
    value: number;
    position: { row: number; column: number };
    visualState: 'normal' | 'pivot' | 'lower' | 'higher' | 'sorted';
    partitionId: string;
}

interface SortedRegion {
    startColumn: number;
    endColumn: number;
    row: number;
}

interface AlgorithmSnapshot {
    elements: ElementState[];
    sortedRegions: SortedRegion[];
    gridDimensions: { rows: number; columns: number };
}


export default function QuickSortVisualizer({ array }: QuickSortVisualizerProps) {

    const [currentSnapshot, setCurrentSnapshot] = useState<AlgorithmSnapshot | null>(null);

    const generateId = () => Math.random().toString(36).substring(2, 9)

    useEffect(() => {
        const initialElements = array.map((value, index) => ({
            id: generateId(),
            value,
            position: { row: 0, column: index },
            visualState: 'normal' as const,
            partitionId: 'initial'
        }));
        const initialSnapshot: AlgorithmSnapshot = {
            elements: initialElements,
            sortedRegions: [],
            gridDimensions: { rows: 1, columns: array.length }
        }
        setCurrentSnapshot(initialSnapshot);
    }, [array])

    const createNumberElement = (element: ElementState) => (
        <div
            key={element.id}
            className="bg-none border-3 text-black rounded  aspect-square flex items-center justify-center font-bold"
        >
            {element.value}

        </div>
    )

    const arrayElement = currentSnapshot?.elements.map((element) => createNumberElement(element))

    return (
        <div className="p-20">
            <div
                className="grid gap-8"
                style={{
                    gridTemplateColumns: `repeat(${array.length}, minmax(0, 1fr))`
                }}
            >
                {arrayElement}
            </div>

        </div>

    )
}