'use client'

import { useState } from "react";
import { motion } from 'motion/react'

interface QuickSortState {
    array: number[];
    pivot?: number;
    leftIndices: number[];
    rightIndices: number[];
    comparing?: number[];
    depth: number;
    status: string
}

export default function Algorithms() {
    const [states, setStates] = useState<QuickSortState[]>([])
    const [currentFrame, setCurrentFrame] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const arrayOne = [45, 3, 5, 0, 32, 23, 27];

    const quickSortWithState = (arr, depth = 0, onStateChange) => {

        const state = []

        // Capture initial state
        if (onStateChange) {
            onStateChange({
                array: [...arr],
                depth,
                leftIndices: [],
                rightIndices: [],
                status: "Starting sort"
            })
        }

        // Base case: arrays with 0 or 1 element are already sorted
        if (arr.length <= 1) return arr;

        // Step 1: Pick the pivot (middle element)
        const middleIndex = Math.floor(arr.length / 2);
        const pivot = arr[middleIndex]

        // Capture pivot selection
        if (onStateChange) {
            onStateChange({
                array: [...arr],
                pivot: middleIndex,
                depth,
                leftIndices: [],
                rightIndices: [],
                status: `Selecting pivot: ${pivot}`
            });
        }

        // Step 2: Create arrays for left and right
        const left = [];
        const right = [];
        const leftIdx = [];
        const rightIdx = []

        for (let i = 0; i < arr.length; i++) {
            const current = arr[i]
            if (arr[i] < pivot) {
                left.push(current)
                leftIdx.push(i);
            } else if (arr[i] > pivot) {
                right.push(current);
                rightIdx.push(i);
            }
        }
        if (onStateChange) {
            onStateChange({
                array: [...arr],
                pivot: middleIndex,
                depth,
                leftIndices: leftIdx,
                rightIndices: rightIdx,
                status: "Partitioned around pivot"
            })
        }

        return [
            ...quickSortWithState(left, depth + 1, onStateChange),
            pivot,
            ...quickSortWithState(right, depth + 1, onStateChange)
        ]
    }

    const runSort = () => {
        const collectedStates: QuickSortState[] = []

        // Run sort with callback to collect state
        quickSortWithState(arrayOne, 0, (state) => {
            collectedStates.push(state)
        })

        setStates(collectedStates)
        setCurrentFrame(0)
    }

    const QuickSortVisualizer = ({ state }: { state: QuickSortState }) => {
        if (!state) return null

        return (
            <div>
                <h3 className="text-xl font-bold mb-4">{state.status}</h3>
                <div className='flex gap-1 justify-center items-end h-52'>
                    {state.array.map((value, index) => (
                        <motion.div
                            key={`${index}-${value}`}
                            className='w-10 flex items-end justify-center text-xs font-bold text-white rounded'
                            animate={{
                                height: `${value * 3}px`,
                                backgroundColor:
                                    index === state.pivot ? '#FFD700' : // Gold
                                        state.leftIndices?.includes(index) ? '#4169E1' : // Blue
                                            state.rightIndices?.includes(index) ? '#DC1243c' : // Red
                                                '#808080', // Gray
                                y: index === state.pivot ? -30 : 0
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            {value}
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='p-5'>
            <h1 className="text-3xl font-bold mb-6">QuickSort Visualization</h1>

            <button
                onClick={runSort}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
                Start Animation
            </button>

            {states.length > 0 && (
                <>
                    <QuickSortVisualizer state={states[currentFrame]} />

                    <div className="mt-5 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                            disabled={currentFrame === 0}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <span className="mx-5">
                            Frame {currentFrame + 1} of {states.length}
                        </span>

                        <button
                            onClick={() => setCurrentFrame(Math.min(states.length - 1, currentFrame + 1))}
                            disabled={currentFrame === states.length - 1}
                            className="bg-gray-500 hover:bg-gray-700 text-white front-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}