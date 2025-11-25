import React from 'react';
import MainLayout from '../layouts/MainLayout';
import AddTaskForm from '../components/AddTaskForm';
import TaskDetail from '../components/TaskDetail';
import { useParams, useNavigate } from 'react-router-dom';

const Task = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const mode = taskId === undefined ? "add" : "update";

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <MainLayout>
      {mode === "add" ? (
        <div className="my-8">
          <AddTaskForm onSuccess={handleSuccess} />
        </div>
      ) : (
        <div className="my-8">
          <TaskDetail />
        </div>
      )}
    </MainLayout>
  );
};

export default Task;