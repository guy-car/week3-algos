import {
    ArrayControlsProps
} from '@/types'

export default function ArrayControls({
    arraySize,
    onArraySizeChange,
    onGenerateRandom
}: ArrayControlsProps) {
    return (
        <div className="mb-6 flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
            <label className="flex items-center gap-2">
                <span className="text-sm font-medium text-black">Array Size:</span>
                <input
                    type="number"
                    min="7"
                    max="20"
                    value={arraySize}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        // Allow any input while typing, but clamp on blur
                        onArraySizeChange(value);
                    }}
                    onBlur={(e) => {
                        const value = Number(e.target.value);
                        // Clamp to valid range when user finishes typing
                        if (value < 7) onArraySizeChange(7);
                        else if (value > 20) onArraySizeChange(20);
                        else if (isNaN(value)) onArraySizeChange(7);
                    }}
                    className="text-black w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-black">(7-20)</span>
            </label>
            <button
                onClick={onGenerateRandom}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
                Generate Random Array
            </button>
        </div>
    );
}