import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks, deleteTask, selectFilteredTasks, selectTasksLoading } from '../redux/slices/tasksSlice';
import TaskFilters from './TaskFilters';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {
  const dispatch = useDispatch();
  const authToken = useSelector(state => state.auth.token);
  const filteredTasks = useSelector(selectFilteredTasks);
  const loading = useSelector(selectTasksLoading);

  useEffect(() => {
    if (authToken) {
      dispatch(fetchTasks({ token: authToken }));
    }
  }, [authToken, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask({ token: authToken, taskId: id }));
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="my-2 mx-auto max-w-[900px] py-4 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Tasks ({filteredTasks.length})</h2>
          <Link
            to="/tasks/add"
            className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2"
          >
            + Add New Task
          </Link>
        </div>

        <TaskFilters />

        {loading ? (
          <Loader />
        ) : (
          <div>
            {filteredTasks.length === 0 ? (
              <div className="w-full h-[300px] flex items-center justify-center gap-4">
                <span className="text-gray-500">No tasks found</span>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task._id} className="bg-white my-4 p-4 text-gray-600 rounded-md shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-gray-800">{task.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{task.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fa-solid fa-user mr-1"></i>
                          {task.assigneeId ? task.assigneeId.name : 'Unassigned'}
                        </span>
                        <span>
                          <i className="fa-solid fa-calendar mr-1"></i>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Tooltip text="View/Edit this task" position="top">
                        <Link to={`/tasks/${task._id}`} className="text-green-600 cursor-pointer hover:text-green-700">
                          <i className="fa-solid fa-pen text-lg"></i>
                        </Link>
                      </Tooltip>

                      <Tooltip text="Delete this task" position="top">
                        <span className="text-red-500 cursor-pointer hover:text-red-600" onClick={() => handleDelete(task._id)}>
                          <i className="fa-solid fa-trash text-lg"></i>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;