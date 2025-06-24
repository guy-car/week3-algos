'use client'

import QuickSortVisualizer from '@/app/algo/QuickSortVisualizer'

export default function Page() {

    const arrayOne = [45, 3, 5, 17, 32, 23, 27];

    return (
        <div>
            <QuickSortVisualizer array={arrayOne} />
        </div>
    )

}