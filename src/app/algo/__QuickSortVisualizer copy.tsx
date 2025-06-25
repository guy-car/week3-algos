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
        let currentElements: ElementState[] = array.map((value, index) => ({
            id: generateId(),
            value,
            position: { row: 0, column: index },
            visualState: 'normal' as const,
            partitionId: 'initial'
        }));

        addStep(currentElements); // Step 1: initial state

        // Step 2: Select pivot (make middle element yellow)
        const middleIndex = Math.floor(array.length / 2);
        currentElements = currentElements.map(element =>
            element.position.column === middleIndex
                ? { ...element, visualState: 'pivot' as const }
                : element
        );
        addStep(currentElements);

        // Step 3: Move non-pivot elements down to row 1
        currentElements = currentElements.map(element =>
            element.visualState === 'pivot'
                ? element  // pivot stays on row 0
                : { ...element, position: { ...element.position, row: 1 } }
        );
        addStep(currentElements);

        // Step 4: Color elements based on comparison to pivot
        const pivot = currentElements.find(el => el.visualState === 'pivot');
        if (pivot) {
            currentElements = currentElements.map(element => {
                if (element.visualState === 'pivot') return element; // keep pivot yellow
                if (element.value > pivot.value) return { ...element, visualState: 'higher' as const };
                if (element.value < pivot.value) return { ...element, visualState: 'lower' as const };
                return element;
            });
            addStep(currentElements);
        }

        // Step 5: Rearrange elements horizontally (blues left, reds right, pivot in middle)
        const subPivot = currentElements.find(el => el.visualState === 'pivot');
        const lowerElements = currentElements.filter(el => el.visualState === 'lower');
        const higherElements = currentElements.filter(el => el.visualState === 'higher');

        if (subPivot) {
            let newColumnIndex = 0;

            // Position lower elements first (left side)
            const rearrangedElements = currentElements.map(element => {
                if (element.visualState === 'lower') {
                    return { ...element, position: { ...element.position, column: newColumnIndex++ } };
                }
                return element;
            });

            // Then pivot
            const pivotColumn = newColumnIndex++;

            // Then higher elements
            currentElements = rearrangedElements.map(element => {
                if (element.visualState === 'pivot') {
                    return { ...element, position: { ...element.position, column: pivotColumn } };
                }
                if (element.visualState === 'higher') {
                    return { ...element, position: { ...element.position, column: newColumnIndex++ } };
                }
                return element;
            });

            addStep(currentElements);
        }
        return steps;
    };

    //////////////////////////
    // 
    //////////////////////////

    useEffect(() => {
        const steps = generateQuickSortSteps(array)
        setAllSteps(steps)
        setCurrentSnapshot(steps[0])
        setCurrentStepIndex(0)
    }, [array])


    //////////////////////////
    // Navigation functions
    //////////////////////////
    const nextStep = () => {
        if (currentStepIndex < allSteps.length - 1) {
            const newIndex = currentStepIndex + 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const newIndex = currentStepIndex - 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);
        }
    };

    //////////////////////////
    // Render UI
    //////////////////////////
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
                className={`${getBackgroundColor()} border-3 text-black rounded aspect-square flex items-center justify-center font-bold`}
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

    return (
        <div className="p-20">
            <div className="mb-4">
                <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="mr-2 px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
                >
                    Previous Step
                </button>
                <button
                    onClick={nextStep}
                    disabled={currentStepIndex === allSteps.length - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Next Step
                </button>
                <span className="ml-4">Step {currentStepIndex + 1} of {allSteps.length}</span>
            </div>

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