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

    const renderNumberElement = (element: ElementState) => {
        const getBackgroundColor = () => {
            switch (element.visualState) {
                case 'pivot': return 'bg-yellow-400';
                case 'lower': return 'bg-blue-400';
                case 'higher': return 'bg-red-400';
                case 'sorted': return 'bg-green-400';
                default: return 'bg-gray-200';
            }
        }
        return (
            <div
                key={element.id}
                className={`${getBackgroundColor()} border-3 text-black rounded  aspect-square flex items-center justify-center font-bold`}
            >
                {element.value}

            </div>
        )
    }

    const goToStep2 = () => {
        if (!currentSnapshot) return

        const middleIndex = Math.floor(array.length / 2)
        const pivotElement = currentSnapshot.elements[middleIndex]

        const step2Elements = currentSnapshot.elements.map(element =>
            element.id === pivotElement.id
                ? { ...element, visualState: 'pivot' as const }
                : element
        )

        const step2Snapshot: AlgorithmSnapshot = {
            elements: step2Elements,
            sortedRegions: [],
            gridDimensions: { rows: 1, columns: array.length }
        }
        setCurrentSnapshot(step2Snapshot)
    }

    const arrayElement = currentSnapshot?.elements.map((element) => renderNumberElement(element))

    return (
        <div className="p-20">
            <button onClick={goToStep2} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Go to Step 2
            </button>
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

