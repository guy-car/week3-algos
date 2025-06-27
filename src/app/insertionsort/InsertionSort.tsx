'use client'

import { useEffect, useState } from "react"

interface InsertionSortState {
    array: number[],
    currentIndex: number,
    lookBackIndex: number,
}


export default function InsertionSort(
    { inputArray }: { inputArray: number[] }) {

    const [currentFrame, setCurrentFrame] = useState<InsertionSortState>()

    const updateFrame = (newFrame: InsertionSortState) => {
        setCurrentFrame(newFrame)
    }

    const insertionSort = (input: number[], updateFrame: (state: InsertionSortState) => void
    ): number[] => {

        const array = [...input]

        const takeSnapshot = (currentIndex: number, lookBackIndex: number) => {
            updateFrame({
                array: [...array],
                currentIndex: currentIndex,
                lookBackIndex: lookBackIndex
            })
        }

        /////// Helper function
        function swap(arr: number[], firstIndex: number, secondIndex: number): void {
            const firstValue = arr[firstIndex]
            const secondValue = arr[secondIndex]
            arr[firstIndex] = secondValue // here and only here do we change the value in the array at that index
            arr[secondIndex] = firstValue
        }

        /////// Sorting algorithm
        for (let currentIndex = 0; currentIndex < array.length; currentIndex++) {

            let lookBackIndex = currentIndex - 1

            takeSnapshot(currentIndex, lookBackIndex)

            while (lookBackIndex >= 0 && array[lookBackIndex] > array[lookBackIndex + 1]) {
                //capture state
                swap(array, lookBackIndex, lookBackIndex + 1)
                lookBackIndex--
            }
            takeSnapshot(currentIndex, lookBackIndex)
        }
        //capture state
        return array
    }

    useEffect(() => {
        insertionSort(inputArray, updateFrame)
    }, [inputArray])

    return (
        <div className='text-black flex justify-center align-middle'>
            <p>{JSON.stringify(currentFrame)}</p>
        </div>
    )
}