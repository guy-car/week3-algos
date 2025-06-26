
export default function InsertionSort({ inputArray }: { inputArray: number[] }) {

    // We want to take an unsorted array and return a sorted one
    // we have an empty array in which we will place sorted elements one at a time
    // We need to first pick one element arbitrarily -- let's take the first one
    // Add it to the sortedArray
    // Then take the second element of the unsorted array and compare it with what's in the sorted array


    const insertionSort = (input: number[]): number[] => {
        const array = [...input]
        function swap(arr: number[], firstIndex: number, secondIndex: number): void {
            const firstValue = arr[firstIndex] // 6
            const secondValue = arr[secondIndex] // 11
            arr[firstIndex] = secondValue // here and only here do we change the value in the array at that index
            arr[secondIndex] = firstValue
        }

        for (let currentIndex = 0; currentIndex < array.length; currentIndex++) {
            let lookBackIndex = currentIndex - 1
            while (lookBackIndex >= 0 && array[lookBackIndex] > array[lookBackIndex + 1]) {
                swap(array, lookBackIndex, lookBackIndex + 1)
                lookBackIndex--
                // lookBackIndex should not be less than 0
                // it should compare its current value and the value to the right 
                // arr[lookBackIndex] compared to arr[lookBackIndex + 1]
                // if arr[lookBackIndex] > arr[lookBackIndex + 1] then swap
            }
        }
        return array
    }
    const sortedArray = insertionSort(inputArray)

    return (
        <div className='text-black flex justify-center align-middle'>
            <p>{JSON.stringify(sortedArray)}</p>
        </div>


    )
}