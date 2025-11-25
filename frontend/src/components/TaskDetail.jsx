import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateTask, deleteTask, fetchTasks } from '../redux/slices/tasksSlice';
import { fetchUsers, selectAllUsers } from '../redux/slices/usersSlice';
import { toast } from 'react-toastify';
import Loader from './utils/Loader';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const authToken = useSelector(state => state.auth.token);
    const tasks = useSelector(state => state.tasks.tasks);
    const users = useSelector(selectAllUsers);
    const loading = useSelector(state => state.tasks.loading);

    const task = tasks.find(t => t._id === taskId);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeId: '',
        status: 'todo',
        dueDate: '',
    });

    useEffect(() => {
        if (authToken) {
            dispatch(fetchUsers(authToken));
            if (tasks.length === 0) {
                dispatch(fetchTasks({ token: authToken }));
            }
        }
    }, [authToken, dispatch, tasks.length]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                assigneeId: task.assigneeId?._id || '',
                status: task.status || 'todo',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            });
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateTask({
                token: authToken,
                taskId,
                updates: formData
            })).unwrap();
            toast.success('Task updated successfully!');
            setEditMode(false);
        } catch (error) {
            toast.error(error || 'Failed to update task');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await dispatch(updateTask({
                token: authToken,
                taskId,
                updates: { status: newStatus }
            })).unwrap();
            toast.success('Status updated successfully!');
        } catch (error) {
            toast.error(error || 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await dispatch(deleteTask({ token: authToken, taskId })).unwrap();
                toast.success('Task deleted successfully!');
                navigate('/');
            } catch (error) {
                toast.error(error || 'Failed to delete task');
            }
        }
    };

    if (loading && !task) {
        return <Loader />;
    }

    if (!task) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <p className="text-red-500">Task not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Back to Tasks
                </button>
            </div>
        );
    }

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'todo':
                return 'bg-blue-100 text-blue-800';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'done':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-md shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold">Task Details</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                            {editMode ? 'Cancel Edit' : 'Edit'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {editMode ? (
                    <form onSubmit={handleUpdate}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                            <select
                                name="assigneeId"
                                value={formData.assigneeId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select assignee</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 font-medium"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(task.status)}`}>
                                {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-1">Description:</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-1">Assigned To:</h3>
                            <p className="text-gray-600">
                                {task.assigneeId ? `${task.assigneeId.name} (${task.assigneeId.email})` : 'Not assigned'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-1">Due Date:</h3>
                            <p className="text-gray-600">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-1">Created:</h3>
                            <p className="text-gray-600">{new Date(task.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-2">Update Status:</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusChange('todo')}
                                    className={`px-4 py-2 rounded-md font-medium ${task.status === 'todo' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        }`}
                                >
                                    To Do
                                </button>
                                <button
                                    onClick={() => handleStatusChange('in-progress')}
                                    className={`px-4 py-2 rounded-md font-medium ${task.status === 'in-progress' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        }`}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange('done')}
                                    className={`px-4 py-2 rounded-md font-medium ${task.status === 'done' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
                                        }`}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                    Back to Tasks
                </button>
            </div>
        </div>
    );
};

export default TaskDetail;
