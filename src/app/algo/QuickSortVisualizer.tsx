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
    depth: number;
}

interface AlgorithmSnapshot {
    elements: ElementState[];
    sortedRegions: { startCol: number; endCol: number; depth: number }[];
    description: string;
    maxDepthReached: number;
}

export default function QuickSortVisualizer({ array = [] }: QuickSortVisualizerProps) {
    const [currentSnapshot, setCurrentSnapshot] = useState<AlgorithmSnapshot | null>(null);
    const [allSteps, setAllSteps] = useState<AlgorithmSnapshot[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const generateQuickSortSteps = (initialArray: number[]): AlgorithmSnapshot[] => {
        const steps: AlgorithmSnapshot[] = [];
        let maxDepthReached = 0;

        // Initialize global element map
        const elements = new Map<string, ElementState>();

        // Create initial elements
        initialArray.forEach((value, index) => {
            const id = generateId();
            elements.set(id, {
                id,
                value,
                position: { row: 0, column: index },
                visualState: 'normal',
                depth: 0
            });
        });

        // Helper to create snapshot
        const createSnapshot = (description: string, sortedRegions: { startCol: number; endCol: number; depth: number }[] = []): void => {
            // Update maxDepthReached based on current elements' depth property
            const currentMaxDepth = Math.max(...Array.from(elements.values()).map(el => el.depth), 0);
            maxDepthReached = Math.max(maxDepthReached, currentMaxDepth);

            steps.push({
                elements: Array.from(elements.values()).map(el => ({ ...el })),
                sortedRegions: [...sortedRegions],
                description,
                maxDepthReached
            });
        };

        // Initial state
        createSnapshot("Initial array");
        console.log('Initial snapshot elements:', Array.from(elements.values()).map(el => ({
            value: el.value,
            column: el.position.column,
            row: el.position.row
        })));

        // Track sorted regions
        const sortedRegions: { startCol: number; endCol: number; depth: number }[] = [];

        // Main recursive function
        const quickSortRecursive = (startCol: number, endCol: number, currentDepth: number): void => {
            console.log(`QuickSort called: cols ${startCol}-${endCol}, depth ${currentDepth}`);

            if (startCol >= endCol) {
                // Mark single element or empty region as sorted
                if (startCol === endCol) {
                    const element = Array.from(elements.values()).find(el => el.position.column === startCol);
                    if (element) {
                        element.visualState = 'sorted';
                        sortedRegions.push({ startCol, endCol: startCol, depth: element.depth });
                        createSnapshot(`Element ${element.value} is sorted`, sortedRegions);
                    }
                }
                return;
            }

            // Find elements in current range
            const rangeElements = Array.from(elements.values())
                .filter(el => el.position.column >= startCol && el.position.column <= endCol)
                .sort((a, b) => a.position.column - b.position.column);

            // Skip if all elements are already sorted
            if (rangeElements.every(el => el.visualState === 'sorted')) {
                return;
            }

            const pivotIndex = Math.floor(rangeElements.length / 2);
            const pivotElement = rangeElements[pivotIndex];
            const pivotValue = pivotElement.value;

            // Step 1: Color pivot
            pivotElement.visualState = 'pivot';
            createSnapshot(`Select pivot: ${pivotValue} (depth ${currentDepth})`);

            console.log('Before move:', rangeElements.map(el => ({ value: el.value, row: el.position.row, depth: el.depth })));

            // Step 2: Move non-pivots down ONLY if they're not already deeper
            rangeElements.forEach(el => {
                if (el.id !== pivotElement.id && el.depth <= currentDepth) {
                    // Update the element in the Map
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.depth = currentDepth + 1;
                        mapElement.position.row = currentDepth + 1;
                    }
                }
            });
            console.log('After move:', rangeElements.map(el => ({ value: el.value, row: el.position.row, depth: el.depth })));

            createSnapshot(`Move non-pivot elements to depth ${currentDepth + 1}`);

            // Step 3: Color elements based on comparison
            rangeElements.forEach(el => {
                if (el.id !== pivotElement.id && el.visualState !== 'sorted') {
                    el.visualState = el.value < pivotValue ? 'lower' : 'higher';
                }
            });
            createSnapshot(`Color elements: blue < ${pivotValue}, red > ${pivotValue}`);

            // Step 4: Rearrange elements
            const lowerElements = rangeElements.filter(el => el.visualState === 'lower');
            const higherElements = rangeElements.filter(el => el.visualState === 'higher');

            let newCol = startCol;

            // Place lower elements
            lowerElements.forEach(el => {
                el.position.column = newCol++;
            });

            // Place pivot
            const pivotFinalColumn = newCol++;
            pivotElement.position.column = pivotFinalColumn;

            // Place higher elements
            higherElements.forEach(el => {
                el.position.column = newCol++;
            });

            createSnapshot(`Rearrange: blues left, pivot at index ${pivotFinalColumn}, reds right`);

            // Mark pivot as sorted and add sorted region
            pivotElement.visualState = 'sorted';
            sortedRegions.push({ startCol: pivotFinalColumn, endCol: pivotFinalColumn, depth: currentDepth });

            // Check if entire sections are sorted
            if (lowerElements.length === 0 && higherElements.length === 0) {
                sortedRegions.push({ startCol, endCol, depth: currentDepth + 1 });
                createSnapshot(`Section fully sorted`, sortedRegions);
            }

            // Process left and right sections in parallel (same recursion call)
            const leftEnd = pivotFinalColumn - 1;
            const rightStart = pivotFinalColumn + 1;

            // We need to handle both partitions "at the same time" visually
            // First, identify pivots for both sides if they exist
            if (lowerElements.length > 1 && higherElements.length > 1) {
                // Both sides need sorting - process in parallel
                quickSortRecursive(startCol, leftEnd, currentDepth + 1);
                quickSortRecursive(rightStart, endCol, currentDepth + 1);
            } else if (lowerElements.length > 1) {
                // Only left side needs sorting
                quickSortRecursive(startCol, leftEnd, currentDepth + 1);
            } else if (higherElements.length > 1) {
                // Only right side needs sorting
                quickSortRecursive(rightStart, endCol, currentDepth + 1);
            } else {
                // Both sides are single elements or empty - mark as sorted
                if (lowerElements.length === 1) {
                    lowerElements[0].visualState = 'sorted';
                    sortedRegions.push({ startCol: lowerElements[0].position.column, endCol: lowerElements[0].position.column, depth: currentDepth + 1 });
                }
                if (higherElements.length === 1) {
                    higherElements[0].visualState = 'sorted';
                    sortedRegions.push({ startCol: higherElements[0].position.column, endCol: higherElements[0].position.column, depth: currentDepth + 1 });
                }
                if (lowerElements.length <= 1 && higherElements.length <= 1) {
                    createSnapshot(`Partition complete`, sortedRegions);
                }
            }
        };

        // Run the algorithm
        quickSortRecursive(0, initialArray.length - 1, 0);

        // Final step: Move all elements back to row 0
        elements.forEach(el => {
            el.depth = 0;
            el.position.row = 0;
            el.visualState = 'sorted';
        });
        sortedRegions.length = 0; // Clear and add final sorted region
        sortedRegions.push({ startCol: 0, endCol: initialArray.length - 1, depth: 0 });
        createSnapshot("Sorting complete!", sortedRegions);

        return steps;
    };

    useEffect(() => {
        if (!array || array.length === 0) return;

        const steps = generateQuickSortSteps(array);
        console.log('First snapshot:', steps[0]);
        console.log('Last snapshot:', steps[steps.length - 1]);
        setAllSteps(steps);
        setCurrentSnapshot(steps[0]);
        setCurrentStepIndex(0);
    }, [array]);

    const nextStep = () => {
        if (currentStepIndex < allSteps.length - 1) {
            const newIndex = currentStepIndex + 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);

            console.log('Step', newIndex, 'elements:', allSteps[newIndex].elements.map(e => ({
                value: e.value,
                row: e.position.row
            })));
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const newIndex = currentStepIndex - 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);
        }
    };

    const renderNumberElement = (element: ElementState) => {

        if (element.value === 45) { // Track just one element
            console.log('Rendering 45:', {
                row: element.position.row,
                styleRow: element.position.row + 1,
                visualState: element.visualState
            });
        }
        const getBackgroundColor = () => {

            const opacity = element.position.row * 0.2;
            return `rgba(0, 0, 255, ${opacity})`;

            switch (element.visualState) {
                case 'pivot': return 'bg-yellow-400';
                case 'lower': return 'bg-blue-400';
                case 'higher': return 'bg-red-400';
                case 'sorted': return 'bg-green-400';
                default: return 'bg-gray-200';
            }
        };

        return (
            <div
                key={element.id}
                className={`${getBackgroundColor()} border-2 border-gray-600 text-black rounded-lg aspect-square flex items-center justify-center font-bold text-lg`}
                style={{
                    gridRowStart: element.position.row + 1,
                    gridRowEnd: element.position.row + 2,
                    gridColumnStart: element.position.column + 1,
                    gridColumnEnd: element.position.column + 2,
                }}
            >
                {element.value}
            </div>
        );
    };

    const renderSortedBars = () => {
        if (!currentSnapshot) return null;

        return currentSnapshot.sortedRegions.map((region, index) => (
            <div
                key={`sorted-${index}`}
                className="bg-green-500 h-2 rounded transition-all duration-500"
                style={{
                    gridColumn: `${region.startCol + 1} / ${region.endCol + 2}`,
                    gridRow: region.depth + 2,
                    marginTop: '-0.5rem'
                }}
            />
        ));
    };

    // eslint-disable-next-line prefer-const
    let maxDepth = currentSnapshot?.maxDepthReached || 0;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    Previous Step
                </button>
                <button
                    onClick={nextStep}
                    disabled={currentStepIndex === allSteps.length - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    Next Step
                </button>
                <span className="text-gray-700 font-medium">
                    Step {currentStepIndex + 1} of {allSteps.length}
                </span>
            </div>

            {currentSnapshot && (
                <div className="mb-4 text-gray-600">
                    {currentSnapshot.description}
                </div>
            )}

            <div
                className="grid gap-8 relative border-2 border-red-500"
                style={{
                    gridTemplateColumns: `repeat(${array?.length || 1}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${maxDepth + 2}, minmax(0, 1fr))` // +2 for the sorted bars
                }}
            >
                {currentSnapshot?.elements.map(element => renderNumberElement(element))}
                {renderSortedBars()}
            </div>
        </div>
    );
}