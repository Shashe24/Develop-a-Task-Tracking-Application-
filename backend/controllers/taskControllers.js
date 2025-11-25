const Task = require("../models/Task");
const { validateObjectId } = require("../utils/validation");


exports.getTasks = async (req, res) => {
  try {
    const { assignedToMe, status } = req.query;
    let query = { user: req.user.id };

    // Filter by assignee if requested
    if (assignedToMe === 'true') {
      query.assigneeId = req.user.id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email')
      .populate('user', 'name email');
    res.status(200).json({ tasks, status: true, msg: "Tasks found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findOne({ user: req.user.id, _id: req.params.taskId })
      .populate('assigneeId', 'name email')
      .populate('user', 'name email');
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    res.status(200).json({ task, status: true, msg: "Task found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.postTask = async (req, res) => {
  try {
    const { title, description, assigneeId, status, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ status: false, msg: "Title of task is required" });
    }

    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task is required" });
    }

    // Create task object with user as creator
    const taskData = {
      user: req.user.id,
      title,
      description,
      assigneeId: assigneeId || req.user.id, // Default to creator if no assignee
      status: status || 'todo', // Default to 'todo'
    };

    // Add dueDate if provided
    if (dueDate) {
      taskData.dueDate = dueDate;
    }

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate('assigneeId', 'name email')
      .populate('user', 'name email');

    res.status(200).json({ task: populatedTask, status: true, msg: "Task created successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.patchTask = async (req, res) => {
  try {
    const { title, description, assigneeId, status, dueDate } = req.body;

    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't update task of another user" });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    task = await Task.findByIdAndUpdate(req.params.taskId, updateData, { new: true })
      .populate('assigneeId', 'name email')
      .populate('user', 'name email');
    res.status(200).json({ task, status: true, msg: "Task updated successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}


exports.deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't delete task of another user" });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}