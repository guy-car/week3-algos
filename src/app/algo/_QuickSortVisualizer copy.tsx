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
    const [allSteps, setAllSteps] = useState<AlgorithmSnapshot[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const generateId = () => Math.random().toString(36).substring(2, 9)

    // const quickSortHistory = (array: number[]): AlgorithmSnapshot[] => {
    //     const steps: AlgorithmSnapshot[] = []

    //     // Convert initial array to ElementState[]
    //     const initialElements = array.map((value, index) => ({
    //         id: generateId(),
    //         value,
    //         position: { row: 0, column: index },
    //         visualState: 'normal' as const,
    //         partitionId: 'initial'
    //     }))

    //     const selectPivot = (subarray: ElementState[]): ElementState => {
    //         const middleIndex = Math.floor(subarray.length / 2)
    //         return { ...subarray[middleIndex], visualState: 'pivot' as const }
    //     }

    //     const partionArray = (subarray: ElementState[], pivotValue: number) => {
    //         const left: ElementState[] = []
    //         const right: ElementState[] = []
    //         let pivot: ElementState | null = null

    //         subarray.forEach(element => {
    //             if (element.value > pivotValue) right.push(element)
    //             if (element.value < pivotValue) left.push(element)
    //             else pivot = element
    //         })
    //         return { left, pivot, right }
    //     }

    //     function quickSort(subarray: ElementState[], row: number) {
    //         if (subarray.length <= 1) return

    //         const pivotElement = selectPivot(subarray)

    //         const { left, pivot, right } = partionArray(subarray, pivotElement.value)

    //         const snapshot: AlgorithmSnapshot = {
    //             elements: 
    //         }

    //         quickSort(left, row + 1);
    //         quickSort(right, row + 1);
    //     }

    //     quickSort(initialElements, 0)
    //     return steps
    // }

    //////////////////////////////
    // REFACTOR
    //////////////////////////////

    const generateQuickSortSteps = (array: number[]): AlgorithmSnapshot[] => {
        const steps: AlgorithmSnapshot[] = [];

        // Helper to add a step
        const addStep = (elements: ElementState[], description?: string) => {
            steps.push({
                elements: [...elements],
                sortedRegions: [],
                gridDimensions: { rows: Math.max(...elements.map(e => e.position.row)) + 1, columns: array.length }
            });
        };

        // Start with initial state
        const currentElements = array.map((value, index) => ({
            id: generateId(),
            value,
            position: { row: 0, column: index },
            visualState: 'normal' as const,
            partitionId: 'initial'
        }));

        addStep(currentElements); // Step 1: initial state

        // TODO: Apply transformations here

        return steps;
    };

    useEffect(() => {
        const steps = generateQuickSortSteps(array)
        setAllSteps(steps)
        setCurrentSnapshot(steps[0])
        setCurrentStepIndex(0)
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
                style={{
                    gridRow: element.position.row + 1,
                    gridColumn: element.position.column + 1
                }}
            >
                {element.value}

            </div>
        )
    }

    const arrayElement = currentSnapshot?.elements.map((element) => renderNumberElement(element))

    // Step by step

    // const goToStep2 = () => {
    //     if (!currentSnapshot) return

    //     const middleIndex = Math.floor(array.length / 2)
    //     const pivotElement = currentSnapshot.elements[middleIndex]

    //     const step2Elements = currentSnapshot.elements.map(element =>
    //         element.id === pivotElement.id
    //             ? { ...element, visualState: 'pivot' as const }
    //             : element
    //     )

    //     const step2Snapshot: AlgorithmSnapshot = {
    //         elements: step2Elements,
    //         sortedRegions: [],
    //         gridDimensions: { rows: 1, columns: array.length }
    //     }
    //     setCurrentSnapshot(step2Snapshot)
    // }

    // const goToStep3 = () => {
    //     if (!currentSnapshot) return

    //     const step3Elements = currentSnapshot.elements.map(element =>
    //         element.visualState === 'pivot'
    //             ? element
    //             : { ...element, position: { ...element.position, row: 1 } }
    //     )

    //     const step3Snapshot: AlgorithmSnapshot = {
    //         elements: step3Elements,
    //         sortedRegions: [],
    //         gridDimensions: { rows: 2, columns: array.length }
    //     }
    //     setCurrentSnapshot(step3Snapshot)
    // }

    // const goToStep4 = () => {
    //     if (!currentSnapshot) return

    //     const pivot = currentSnapshot.elements.find(element => element.visualState === 'pivot')
    //     if (!pivot) return

    //     const step4Elements = colorElementsByPivot(currentSnapshot.elements, pivot.id)

    //     const step4Snapshot: AlgorithmSnapshot = {
    //         elements: step4Elements,
    //         sortedRegions: [],
    //         gridDimensions: { rows: 2, columns: array.length }
    //     }
    //     setCurrentSnapshot(step4Snapshot)
    // }

    // refactoring to reusable functions

    const selectPivot = (subarray: ElementState[]): ElementState => {
        const middleIndex = Math.floor(subarray.length / 2)
        return { ...subarray[middleIndex], visualState: 'pivot' as const }
    }

    const partionArray = (subarray: ElementState[], pivotValue: number) => {
        const left: ElementState[] = []
        const right: ElementState[] = []
        let pivot: ElementState | null = null

        subarray.forEach(element => {
            if (element.value > pivotValue) right.push(element)
            if (element.value < pivotValue) left.push(element)
            else pivot = element
        })
        return { left, pivot, right }
    }

    const colorElementsByPivot = (elements: ElementState[], pivotId: string): ElementState[] => {
        const pivot = elements.find(el => el.id === pivotId)
        if (!pivot) return elements

        return elements.map(element => {
            if (element.value > pivot.value)
                return { ...element, visualState: 'higher' as const }
            if (element.value < pivot.value)
                return { ...element, visualState: 'lower' as const }
            else return element
        })
    }




    return (
        <div className="p-20">
            <button onClick={goToStep2} className="mr-2 mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Go to Step 2
            </button>
            <button onClick={goToStep3} className="mr-2 mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Go to Step 3
            </button>
            <button onClick={goToStep4} className="mr-2 mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Go to Step 4
            </button>
            <div
                className="grid gap-8"
                style={{
                    gridTemplateColumns: `repeat(${array.length}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${currentSnapshot?.gridDimensions.rows || 1}, minmax(0, 1fr))`

                }}
            >
                {arrayElement}
            </div>

        </div>

    )
}

