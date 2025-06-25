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

        const elements = new Map<string, ElementState>();

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

        const createSnapshot = (description: string, sortedRegions: { startCol: number; endCol: number; depth: number }[] = []): void => {
            const currentMaxDepth = Math.max(...Array.from(elements.values()).map(el => el.depth), 0);
            maxDepthReached = Math.max(maxDepthReached, currentMaxDepth);

            steps.push({
                elements: Array.from(elements.values()).map(el => ({ ...el })),
                sortedRegions: [...sortedRegions],
                description,
                maxDepthReached
            });
        };

        const getCurrentRangeElements = (startCol, endCol) => {
            return Array.from(elements.values())
                .filter(el => el.position.column >= startCol && el.position.column <= endCol)
                .sort((a, b) => a.position.column - b.position.column);
        };

        createSnapshot("Initial array");

        const sortedRegions: { startCol: number; endCol: number; depth: number }[] = [];

        const quickSortRecursive = (startCol: number, endCol: number, currentDepth: number): void => {
            if (startCol >= endCol) {
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


            let rangeElements = Array.from(elements.values())
                .filter(el => el.position.column >= startCol && el.position.column <= endCol)
                .sort((a, b) => a.position.column - b.position.column);
            console.log('Current range values:', rangeElements.map(el => el.value));

            if (rangeElements.every(el => el.visualState === 'sorted')) {
                console.log('Current range values:', rangeElements.map(el => el.value));
                return;
            }

            const pivotIndex = Math.floor(rangeElements.length / 2);
            const pivotElement = rangeElements[pivotIndex];
            const pivotValue = pivotElement.value;

            pivotElement.visualState = 'pivot';

            rangeElements.forEach(el => {
                console.log('Current range values:', rangeElements.map(el => el.value));
                if (el.id !== pivotElement.id && el.depth <= currentDepth) {
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.depth = currentDepth + 1;
                        mapElement.position.row = currentDepth + 1;
                    }
                }
            });
            createSnapshot(`Move non-pivot elements to depth ${currentDepth + 1}`);

            rangeElements = Array.from(elements.values())
                .filter(el => el.position.column >= startCol && el.position.column <= endCol)
                .sort((a, b) => a.position.column - b.position.column);
            console.log('Current range values:', rangeElements.map(el => el.value));

            createSnapshot(`Move non-pivot elements to depth ${currentDepth + 1}`);

            rangeElements.forEach(el => {
                if (el.id !== pivotElement.id && el.visualState !== 'sorted') {
                    const mapElement = elements.get(el.id);
                    if (mapElement) {  // ✅ Add this check
                        mapElement.visualState = mapElement.value < pivotValue ? 'lower' : 'higher';
                    }
                }
            });
            rangeElements = getCurrentRangeElements(startCol, endCol);
            createSnapshot(`Color elements: blue < ${pivotValue}, red > ${pivotValue}`);

            // Step 4: Rearrange elements
            const lowerElements = rangeElements.filter(el => {
                const mapElement = elements.get(el.id);
                return mapElement && mapElement.visualState === 'lower';
            });
            const higherElements = rangeElements.filter(el => {
                const mapElement = elements.get(el.id);
                return mapElement && mapElement.visualState === 'higher';
            });

            let newCol = startCol; // ✅ Add this declaration

            // Place lower elements
            lowerElements.forEach(el => {
                const mapElement = elements.get(el.id);
                if (mapElement) {
                    mapElement.position.column = newCol++;
                }
            });

            // Place pivot
            const pivotFinalColumn = newCol++;
            const pivotMapElement = elements.get(pivotElement.id); // ✅ Get pivot from Map
            if (pivotMapElement) {
                pivotMapElement.position.column = pivotFinalColumn;
            }
            createSnapshot(`Select pivot: ${pivotValue} (depth ${currentDepth})`);

            // Place higher elements
            higherElements.forEach(el => {
                const mapElement = elements.get(el.id);
                if (mapElement) {
                    mapElement.position.column = newCol++;
                }
            });
            createSnapshot(`Rearrange: blues left, pivot at index ${pivotFinalColumn}, reds right`);

            if (pivotMapElement) {
                pivotMapElement.visualState = 'sorted';  // ✅ Use the Map element
            }
            sortedRegions.push({ startCol: pivotFinalColumn, endCol: pivotFinalColumn, depth: currentDepth });

            if (lowerElements.length === 0 && higherElements.length === 0) {
                sortedRegions.push({ startCol, endCol, depth: currentDepth + 1 });
                createSnapshot(`Section fully sorted`, sortedRegions);
            }

            const leftEnd = pivotFinalColumn - 1;
            const rightStart = pivotFinalColumn + 1;

            if (lowerElements.length > 1 && higherElements.length > 1) {
                quickSortRecursive(startCol, leftEnd, currentDepth + 1);
                quickSortRecursive(rightStart, endCol, currentDepth + 1);
            } else if (lowerElements.length > 1) {
                quickSortRecursive(startCol, leftEnd, currentDepth + 1);
            } else if (higherElements.length > 1) {
                quickSortRecursive(rightStart, endCol, currentDepth + 1);
            } else {
                if (lowerElements.length === 1) {
                    const mapElement = elements.get(lowerElements[0].id);
                    if (mapElement) {
                        mapElement.visualState = 'sorted';
                        sortedRegions.push({ startCol: mapElement.position.column, endCol: mapElement.position.column, depth: currentDepth + 1 });
                    }
                }
                if (higherElements.length === 1) {
                    const mapElement = elements.get(higherElements[0].id);
                    if (mapElement) {
                        mapElement.visualState = 'sorted';
                        sortedRegions.push({ startCol: mapElement.position.column, endCol: mapElement.position.column, depth: currentDepth + 1 });
                    }
                }
                if (lowerElements.length <= 1 && higherElements.length <= 1) {
                    createSnapshot(`Partition complete`, sortedRegions);
                }
            }
        };

        quickSortRecursive(0, initialArray.length - 1, 0);

        elements.forEach(el => {
            el.depth = 0;
            el.position.row = 0;
            el.visualState = 'sorted';
        });
        sortedRegions.length = 0;
        sortedRegions.push({ startCol: 0, endCol: initialArray.length - 1, depth: 0 });
        createSnapshot("Sorting complete!", sortedRegions);

        return steps;
    };

    useEffect(() => {
        if (!array || array.length === 0) return;

        const steps = generateQuickSortSteps(array);
        setAllSteps(steps);
        setCurrentSnapshot(steps[0]);
        setCurrentStepIndex(0);
    }, [array]);

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

    const renderNumberElement = (element: ElementState) => {
        const getBackgroundColor = () => {
            const opacity = element.position.row * 0.2;
            return `rgba(0, 0, 255, ${opacity})`;
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

    const maxDepth = currentSnapshot?.maxDepthReached || 0;

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
                    gridTemplateRows: `repeat(${maxDepth + 2}, minmax(0, 1fr))`
                }}
            >
                {currentSnapshot?.elements.map(element => renderNumberElement(element))}
                {renderSortedBars()}
            </div>
        </div>
    );
}
