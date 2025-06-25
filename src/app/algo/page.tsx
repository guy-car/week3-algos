'use client'

import QuickSortVisualizer from '@/app/algo/QuickSortVisualizer'

export default function Page() {

    const arrayOne = [45, 3, 5, 17, 32, 23, 27, 6, 24, 13, 33, 22];

    return (
        <div>
            <QuickSortVisualizer inputArray={arrayOne} />
        </div>
    )

}