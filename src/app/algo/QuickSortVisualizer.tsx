'use client'

import { useState, useEffect, useRef } from "react";

import {
    QuickSortVisualizerProps,
    ElementState,
    SortedRegion,
    AlgorithmSnapshot
} from '@/types'

import ArrayControls from "./ArrayControl";

export default function QuickSortVisualizer({ inputArray: propArray = [] }: QuickSortVisualizerProps) {

    const [currentSnapshot, setCurrentSnapshot] = useState<AlgorithmSnapshot | null>(null);
    const [allSteps, setAllSteps] = useState<AlgorithmSnapshot[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null)
    const [cellSize, setCellSize] = useState({ width: 80, height: 80, gap: 32 })
    const [arraySize, setArraySize] = useState(propArray.length || 12);
    const [userArray, setUserArray] = useState<number[]>([]);
    const [hasUserGenerated, setHasUserGenerated] = useState(false); // ← Add this flag

    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1000); // milliseconds between steps
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-play logic
    useEffect(() => {
        if (isPlaying && currentStepIndex < allSteps.length - 1) {
            playIntervalRef.current = setTimeout(() => {
                goToNextStep();
            }, playSpeed);
        } else if (currentStepIndex >= allSteps.length - 1) {
            setIsPlaying(false); // Stop when we reach the end
        }

        return () => {
            if (playIntervalRef.current) {
                clearTimeout(playIntervalRef.current);
            }
        };
    }, [isPlaying, currentStepIndex, playSpeed, allSteps.length]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (playIntervalRef.current) {
                clearTimeout(playIntervalRef.current);
            }
        };
    }, []);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const resetAnimation = () => {
        setIsPlaying(false);
        setCurrentStepIndex(0);
        setCurrentSnapshot(allSteps[0]);
    };

    // Use userArray if it exists, otherwise use prop
    const inputArray = userArray.length > 0 ? userArray : propArray;

    // Function to generate random array
    const generateRandomArray = (size: number) => {
        const newArray = Array.from({ length: size }, () =>
            Math.floor(Math.random() * 20) + 1 // Random numbers 1-20
        );
        setUserArray(newArray);
        setHasUserGenerated(true); // ← Mark that user has generated
    };

    // Generate initial array or when size changes
    useEffect(() => {
        if (!hasUserGenerated && propArray.length > 0) {
            // Use the hardcoded array on first load
            return;
        } else if (!hasUserGenerated) {
            generateRandomArray(arraySize); // Generate if no hardcoded array
        }
    }, [arraySize, hasUserGenerated]);

    useEffect(() => {
        const calculateCellSize = () => {
            if (containerRef.current && inputArray.length > 0) {
                const containerWidth = containerRef.current.offsetWidth;
                const padding = 32;

                // Start with normal gap, but reduce if needed
                let gap = 32;
                let cellWidth = 40; // Start with minimum

                // Calculate what cell width we can achieve with current gap
                const totalGaps = (inputArray.length - 1) * gap;
                const availableWidth = containerWidth - totalGaps - padding;
                cellWidth = Math.max(40, availableWidth / inputArray.length);

                // If cells are still too small, try reducing the gap
                if (cellWidth <= 40 && gap > 8) {
                    gap = 16; // Reduce gap
                    const newTotalGaps = (inputArray.length - 1) * gap;
                    const newAvailableWidth = containerWidth - newTotalGaps - padding;
                    cellWidth = Math.max(40, newAvailableWidth / inputArray.length);
                }

                setCellSize({ width: cellWidth, height: cellWidth, gap }); // ← Store gap too
            }
        };

        //Calculate on mount and array change
        calculateCellSize()
        //Recalculate on window resize
        window.addEventListener('resize', calculateCellSize)
        return () => {
            window.removeEventListener('resize', calculateCellSize)
        }
    }, [inputArray.length])

    /**
     * Generates a unique ID for each element
     */
    const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

    /**
     * Main function that generates all visualization steps for QuickSort algorithm
     */
    const generateQuickSortSteps = (inputArray: number[]): AlgorithmSnapshot[] => {
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
                visualState: 'normal'
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
            const elementsToMove = rangeElements.filter(el =>
                el.id !== pivotElement.id && el.positionY <= currentDepth
            );

            if (elementsToMove.length > 0) {
                elementsToMove.forEach(el => {  // ← Use elementsToMove, not rangeElements
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.positionY = currentDepth + 1;
                        maxDepthReached = Math.max(maxDepthReached, mapElement.positionY);
                    }
                });

                createAlgorithmSnapshot(`Move non-pivot elements to depth ${currentDepth + 1}`);
            }

            // Step 3: Color elements based on comparison with pivot
            rangeElements = getElementsInRange(startCol, endCol);

            const elementsNeedingColorChange = rangeElements.filter(el => {
                if (el.id !== pivotElement.id) {
                    const shouldBe = el.value < pivotValue ? 'lower' : 'higher';
                    return el.visualState !== shouldBe;
                }
                return false;
            });

            if (elementsNeedingColorChange.length > 0) {
                elementsNeedingColorChange.forEach(el => {
                    const mapElement = elements.get(el.id);
                    if (mapElement) {
                        mapElement.visualState = mapElement.value < pivotValue ? 'lower' : 'higher';
                    }
                });

                createAlgorithmSnapshot(`Color elements: blue < ${pivotValue}, red > ${pivotValue}`);
            }

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
            }
        };

        // Start the QuickSort algorithm
        performQuickSortWithVisualization(0, inputArray.length - 1, 0);

        elements.forEach(el => {
            el.positionY = Math.floor(maxDepthReached / 2)
            el.visualState = 'finalGradient'
        });
        createAlgorithmSnapshot("Final gradient animation!", [])

        return steps;
    };

    /**
     * Generate steps when array changes
     */
    useEffect(() => {
        console.log('🔄 Regenerating steps for array:', userArray);
        if (!inputArray || inputArray.length === 0) return;

        const steps = generateQuickSortSteps(inputArray);
        setAllSteps(steps);
        setCurrentSnapshot(steps[0]);
        setCurrentStepIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userArray]);

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

        const translateX = element.positionX * (cellSize.width + cellSize.gap); // cellWidth + gap
        const translateY = element.positionY * (cellSize.width + cellSize.gap); // cellHeight + gap

        const getBackgroundColor = () => {
            switch (element.visualState) {
                case 'pivot': return 'bg-yellow-400';
                case 'lower': return 'bg-blue-400';
                case 'higher': return 'bg-red-400';
                case 'sorted': return 'bg-green-400';
                case 'finalGradient': {
                    //Calculate gradient using positionX
                    const percentage = element.positionX / (inputArray.length - 1)
                    const blue = Math.round(255 * (1 - percentage))
                    const red = Math.round(255 * percentage)
                    return { backgroundColor: `rgb(${blue}, 0, ${red})` }
                }
                default: return 'bg-gray-200';
            }
        };

        const backgroundColor = getBackgroundColor()
        const isInlineStyle = typeof backgroundColor === 'object'

        return (
            <div
                key={element.id}
                className={`${isInlineStyle ? '' : backgroundColor} border-2 border-gray-600 text-black rounded-lg aspect-square flex items-center justify-center font-bold text-lg`}
                style={{
                    ...(isInlineStyle ? backgroundColor : {}),
                    position: 'absolute',
                    width: `${cellSize.width}px`,
                    height: `${cellSize.width}px`,
                    transform: `translate(${translateX}px, ${translateY}px)`,
                    transition: 'transform 0.5s ease-in-out, background-color 0.3s ease-in-out'
                }}
            >
                {element.value}
            </div>
        );
    };

    const maxDepth = currentSnapshot?.maxDepthReached || 0;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Navigation Controls */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={goToPreviousStep}
                    disabled={currentStepIndex === 0 || isPlaying}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                    Previous Step
                </button>

                <button
                    onClick={togglePlay}
                    disabled={currentStepIndex >= allSteps.length - 1}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>

                <button
                    onClick={resetAnimation}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    🔄 Reset
                </button>

                <button
                    onClick={goToNextStep}
                    disabled={currentStepIndex === allSteps.length - 1 || isPlaying}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                    Next Step
                </button>

                <div className="flex items-center gap-2">
                    <label className="text-black text-sm font-medium">Speed:</label>
                    <select
                        value={playSpeed}
                        onChange={(e) => setPlaySpeed(Number(e.target.value))}
                        className="text-black px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                        <option value={2000}>0.5x (Slow)</option>
                        <option value={1000}>1x (Normal)</option>
                        <option value={500}>2x (Fast)</option>
                        <option value={250}>4x (Very Fast)</option>
                    </select>
                </div>

                <span className="text-gray-700 font-medium">
                    Step {currentStepIndex + 1} of {allSteps.length}
                </span>
            </div>

            <ArrayControls
                arraySize={arraySize}
                onArraySizeChange={setArraySize}
                onGenerateRandom={() => generateRandomArray(arraySize)}
            />


            {/* Current Step Description
            {currentSnapshot && (
                <div className="mb-4 text-gray-600">
                    {currentSnapshot.description}
                </div>
            )} */}

            {/* Visualization Grid */}
            <div
                ref={containerRef}
                className="grid gap-8 relative"
                style={{
                    width: '100%',
                    height: `${(maxDepth + 2) * (cellSize.height + 32)}px`, // Dynamic height
                }}
            >
                {currentSnapshot?.elements.map(element => renderNumberElement(element))}
                {/* {renderSortedRegionBars()} */}
            </div>
        </div>
    );
}