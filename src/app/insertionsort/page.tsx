'use client'

import InsertionSort from '@/app/insertionsort/InsertionSort'

export default function Page() {

    const arrayOne = [45, 3, 5, 17, 32, 23, 27, 6, 24, 13, 33, 22];

    return (
        <div>
            <InsertionSort inputArray={arrayOne} />
        </div>
    )

}