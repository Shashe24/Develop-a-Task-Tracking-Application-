import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../redux/slices/tasksSlice';
import { fetchUsers, selectAllUsers, selectUsersLoading } from '../redux/slices/usersSlice';
import { toast } from 'react-toastify';
import Loader from './utils/Loader';

const AddTaskForm = ({ onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const users = useSelector(selectAllUsers);
    const usersLoading = useSelector(selectUsersLoading);
    const authToken = useSelector(state => state.auth.token);
    const currentUser = useSelector(state => state.auth.user);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeId: '',
        status: 'todo',
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authToken && users.length === 0) {
            dispatch(fetchUsers(authToken));
        }
    }, [authToken, users.length, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }

        setLoading(true);
        try {
            const taskData = {
                ...formData,
                assigneeId: formData.assigneeId || currentUser._id,
            };

            await dispatch(createTask({ token: authToken, taskData })).unwrap();
            toast.success('Task created successfully!');
            setFormData({
                title: '',
                description: '',
                assigneeId: '',
                status: 'todo',
                dueDate: '',
            });
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            toast.error(error || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task title"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task description"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
                        Assign To
                    </label>
                    {usersLoading ? (
                        <Loader />
                    ) : (
                        <select
                            id="assigneeId"
                            name="assigneeId"
                            value={formData.assigneeId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select assignee (defaults to you)</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-medium"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 font-medium"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddTaskForm;
