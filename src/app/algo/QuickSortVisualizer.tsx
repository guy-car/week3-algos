'use client'

import { randomUUID } from "crypto";
import { useState } from "react";


export default function QuickSortVisualizer({ array }) {

    const randomId = () => crypto.randomUUID()

    const createNumberElement = (value, index) => (
        <div
            key={index}
            className="bg-gray-200 rounded p-4 flex items-center justify-center font-bold"
        >
            {value}

        </div>
    )
    return (
        <div className="p-8">
            <div
                className="grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${array.length}, minmax(0, 1fr))`
                }}
            >
                {array.map((num, idx) => createNumberElement(num, idx))}
            </div>

        </div>

    )
}