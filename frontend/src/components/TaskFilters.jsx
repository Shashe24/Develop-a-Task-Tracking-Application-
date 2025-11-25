import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, selectCurrentFilter } from '../redux/slices/tasksSlice';

const TaskFilters = () => {
    const dispatch = useDispatch();
    const currentFilter = useSelector(selectCurrentFilter);

    const filters = [
        { id: 'all', label: 'All Tasks' },
        { id: 'assignedToMe', label: 'Assigned to Me' },
        { id: 'completed', label: 'Completed' },
    ];

    return (
        <div className="flex gap-2 mb-4">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => dispatch(setFilter(filter.id))}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${currentFilter === filter.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default TaskFilters;
