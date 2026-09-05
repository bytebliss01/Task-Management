const Task = require("../models/Task");


// Create Task
const createTask = async (req, res) => {

    try {

        const { title, description, priority, dueDate } = req.body;


        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }


        const task = await Task.create({

            title,
            description,
            priority,
            dueDate,

            // user from JWT middleware
            user: req.user

        });


        res.status(201).json({

            message: "Task created successfully",
            task

        });


    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// Get All Tasks
const getTasks = async (req, res) => {

    try {

        const tasks = await Task.find({
            user: req.user
        });


        res.status(200).json(tasks);


    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// Update Task
const updateTask = async (req, res) => {

    try {

        const task = await Task.findOneAndUpdate(

            {
                _id: req.params.id,
                user: req.user
            },

            req.body,

            {
                new: true
            }

        );


        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }


        res.status(200).json({

            message:"Task updated successfully",
            task

        });


    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

};



// Delete Task
const deleteTask = async (req,res)=>{

    try {


        const task = await Task.findOneAndDelete({

            _id:req.params.id,
            user:req.user

        });



        if(!task){

            return res.status(404).json({

                message:"Task not found"

            });

        }


        res.status(200).json({

            message:"Task deleted successfully"

        });



    } catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



module.exports = {

    createTask,
    getTasks,
    updateTask,
    deleteTask

};