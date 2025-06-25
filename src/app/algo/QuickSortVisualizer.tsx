'use client'

import { useState, useEffect } from "react";

import {
    QuickSortVisualizerProps,
    ElementState,
    SortedRegion,
    AlgorithmSnapshot
} from '@/types'

export default function QuickSortVisualizer({ inputArray = [] }: QuickSortVisualizerProps) {

    const [currentSnapshot, setCurrentSnapshot] = useState<AlgorithmSnapshot | null>(null);
    const [allSteps, setAllSteps] = useState<AlgorithmSnapshot[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    /**
     * Generates a unique ID for each element
     */
    const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

    /**
     * Main function that generates all visualization steps for QuickSort algorithm
     */
    const generateQuickSortSteps = (initialArray: number[]): AlgorithmSnapshot[] => {
        const steps: AlgorithmSnapshot[] = [];
        let maxDepthReached = 0;

        // Create a Map to store all elements with their current state
        const elements = new Map<string, ElementState>();

        // Initialize all elements in their starting positions (row 0)
        inputArray.forEach((value, index) => {
            const id = generateUniqueId();
            elements.set(id, {
                id,
                value,
                positionY: 0,
                positionX: index,
                visualState: 'normal',
                isInFinalPosition: false
            });
        });

        // Create the initial snapshot showing unsorted array
        steps.push({
            elements: Array.from(elements.values()).map(el => ({
                ...el,
            })),
            sortedRegions: [],
            description: "Initial array",
            maxDepthReached: 0
        });

        /**
         * Creates a snapshot of the current algorithm state
         */
        const createAlgorithmSnapshot = (description: string, sortedRegions: SortedRegion[] = []): void => {

            const snapshot = {
                elements: Array.from(elements.values()).map(el => ({
                    ...el,
                })),
                sortedRegions: [...sortedRegions],
                description,
                maxDepthReached
            };

            steps.push(snapshot);
        };

        /**
         * Gets all elements within a specific column range, sorted by column
         */
        const getElementsInRange = (startCol: number, endCol: number) => {
            return Array.from(elements.values())
                .filter(el => el.positionX >= startCol && el.positionX <= endCol)
                .sort((a, b) => a.positionX - b.positionX);
        };

        const sortedRegions: SortedRegion[] = [];

        /**
         * Recursive QuickSort implementation with visualization steps
         */
        const performQuickSortWithVisualization = (startCol: number, endCol: number, currentDepth: number): void => {
            // Base case: single element or empty range
            if (startCol >= endCol) {
                if (startCol === endCol) {
                    const element = Array.from(elements.values()).find(el => el.positionX === startCol);
                    if (element) {
                        element.isInFinalPosition = true
                        createAlgorithmSnapshot(`Element ${element.value} is sorted`, sortedRegions);
                    }
                }
                return;
            }

            // Get elements in current range
            let rangeElements = getElementsInRange(startCol, endCol);

            // Skip if all elements are already sorted
            if (rangeElements.every(el => el.visualState === 'sorted')) {
                return;
            }

            // Step 1: Select pivot (middle element)
            const pivotIndex = Math.floor(rangeElements.length / 2);
            const pivotElement = rangeElements[pivotIndex];
            const pivotValue = pivotElement.value;

            const pivotMapElement = elements.get(pivotElement.id);
            if (pivotMapElement) {
                pivotMapElement.visualState = 'pivot';
            }
            createAlgorithmSnapshot(`Select pivot: ${pivotValue} (depth ${currentDepth})`);

            // Step 2: Move non-pivot elements down one level
            rangeElements.forEach(el => {
                if (el.id !== pivotElement.id && el.positionY <= currentDepth) {
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.positionY = currentDepth + 1;
                        maxDepthReached = Math.max(maxDepthReached, mapElement.positionY);
                    }
                }
            });

            createAlgorithmSnapshot(`Move non-pivot elements to depth ${currentDepth + 1}`);

            // Step 3: Color elements based on comparison with pivot
            rangeElements = getElementsInRange(startCol, endCol);
            rangeElements.forEach(el => {
                if (el.id !== pivotElement.id && el.visualState !== 'sorted') {
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.visualState = mapElement.value < pivotValue ? 'lower' : 'higher';
                    }
                }
            });
            createAlgorithmSnapshot(`Color elements: blue < ${pivotValue}, red > ${pivotValue}`);

            // Step 4: Rearrange elements (partition)
            rangeElements = getElementsInRange(startCol, endCol);
            const lowerElements = rangeElements.filter(el => {
                const mapElement = elements.get(el.id);
                return mapElement && mapElement.visualState === 'lower';
            });
            const higherElements = rangeElements.filter(el => {
                const mapElement = elements.get(el.id);
                return mapElement && mapElement.visualState === 'higher';
            });

            let newCol = startCol;

            // Place lower elements (blues) on the left
            lowerElements.forEach(el => {
                const mapElement = elements.get(el.id);
                if (mapElement) {
                    mapElement.positionX = newCol++;
                }
            });

            // Place pivot in the middle
            const pivotFinalColumn = newCol++;
            if (pivotMapElement) {
                pivotMapElement.positionX = pivotFinalColumn;
                pivotMapElement.visualState = 'pivot';
            }

            // Place higher elements (reds) on the right
            higherElements.forEach(el => {
                const mapElement = elements.get(el.id);
                if (mapElement) {
                    mapElement.positionX = newCol++;
                }
            });

            createAlgorithmSnapshot(`Rearrange: blues left, pivot at index ${pivotFinalColumn}, reds right`);

            sortedRegions.push({ startCol: pivotFinalColumn, endCol: pivotFinalColumn, depth: currentDepth });

            if (lowerElements.length === 0 && higherElements.length === 0) {
                sortedRegions.push({ startCol, endCol, depth: currentDepth + 1 });
                createAlgorithmSnapshot(`Section fully sorted`, sortedRegions);
            }

            // Recursively sort left and right partitions
            const leftEnd = pivotFinalColumn - 1;
            const rightStart = pivotFinalColumn + 1;

            if (lowerElements.length > 1 && higherElements.length > 1) {
                // Both sides need sorting
                performQuickSortWithVisualization(startCol, leftEnd, currentDepth + 1);
                performQuickSortWithVisualization(rightStart, endCol, currentDepth + 1);
            } else if (lowerElements.length > 1) {
                // Only left side needs sorting
                performQuickSortWithVisualization(startCol, leftEnd, currentDepth + 1);
            } else if (higherElements.length > 1) {
                // Only right side needs sorting
                performQuickSortWithVisualization(rightStart, endCol, currentDepth + 1);
            } else {
                // Both sides are single elements - mark as sorted
                if (lowerElements.length === 1) {
                    const mapElement = elements.get(lowerElements[0].id);
                    if (mapElement) {
                        mapElement.isInFinalPosition = true;
                    }
                }
                if (higherElements.length === 1) {
                    const mapElement = elements.get(higherElements[0].id);
                    if (mapElement) {
                        mapElement.isInFinalPosition = true;
                    }
                }
                if (lowerElements.length <= 1 && higherElements.length <= 1) {
                    createAlgorithmSnapshot(`Partition complete`, sortedRegions);
                }
            }
        };

        // Start the QuickSort algorithm
        performQuickSortWithVisualization(0, initialArray.length - 1, 0);

        return steps;
    };

    /**
     * Generate steps when array changes
     */
    useEffect(() => {
        if (!inputArray || inputArray.length === 0) return;

        const steps = generateQuickSortSteps(inputArray);
        setAllSteps(steps);
        setCurrentSnapshot(steps[0]);
        setCurrentStepIndex(0);
    }, [inputArray]);

    /**
     * Navigate to next step
     */
    const goToNextStep = () => {
        if (currentStepIndex < allSteps.length - 1) {
            const newIndex = currentStepIndex + 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);
        }
    };

    /**
     * Navigate to previous step
     */
    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            const newIndex = currentStepIndex - 1;
            setCurrentStepIndex(newIndex);
            setCurrentSnapshot(allSteps[newIndex]);
        }
    };

    /**
     * Renders a single number element with appropriate styling
     */
    const renderNumberElement = (element: ElementState) => {

        const getBackgroundColor = () => {
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
                className={`${getBackgroundColor()} border-2 border-gray-600 text-black rounded-lg aspect-square flex items-center justify-center font-bold text-lg transition-all duration-300`}
                style={{
                    gridRowStart: element.positionY + 1,
                    gridRowEnd: element.positionY + 2,
                    gridColumnStart: element.positionX + 1,
                    gridColumnEnd: element.positionX + 2,
                }}
            >
                {element.value}
            </div>
        );
    };

    /**
     * Renders green bars showing sorted regions
     */
    const renderSortedRegionBars = () => {
        return null
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
            {/* Navigation Controls */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    Previous Step
                </button>
                <button
                    onClick={goToNextStep}
                    disabled={currentStepIndex === allSteps.length - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    Next Step
                </button>
                <span className="text-gray-700 font-medium">
                    Step {currentStepIndex + 1} of {allSteps.length}
                </span>
            </div>

            {/* Current Step Description */}
            {currentSnapshot && (
                <div className="mb-4 text-gray-600">
                    {currentSnapshot.description}
                </div>
            )}

            {/* Visualization Grid */}
            <div
                className="grid gap-8 relative"
                style={{
                    gridTemplateColumns: `repeat(${inputArray?.length || 1}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${maxDepth + 2}, minmax(0, 1fr))`
                }}
            >
                {currentSnapshot?.elements.map(element => renderNumberElement(element))}
                {/* {renderSortedRegionBars()} */}
            </div>
        </div>
    );
}