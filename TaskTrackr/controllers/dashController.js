const db = require(`../config/data/${process.env.DB_METHOD}`);

class DashController {
    static async getDash(req, res) {

        const tasks = await db.getAllTasksForUser(req.user);
        const status = await db.getStatus();
        const statusNames = [];
        const statusCounts = [];
        const statusSetCounts = [];

        const statusSetList = await db.getStatusUpdatesForUser(req.user);

        status.forEach((status) => {
            statusNames.push(status.name);

            const count = tasks.filter(task => task.status_id === status.status_id).length;
            const setCount = statusSetList.filter(set => set.status_id === status.status_id).length;
            statusCounts.push(count);
            statusSetCounts.push(setCount);
        });

        let tasksOwned = 0;
        let tasksAssigned = 0;

        for (const task of tasks) {
            if(task.status_id === 4) continue;
            if(task.user_id === req.user.user_id) tasksOwned++;
            if(task.assigned_user_id === req.user.user_id) tasksAssigned++;
        }

        const projects = await db.getProjectsForUser(req.user);
        const projectNames = [];
        const projectTaskCounts = [];

        tasks.forEach((task) => {
            if(!task.project_id) return;

            const projectName = projects.find(proj => proj.project_id === task.project_id).name;
            let projectNameIndex = projectNames.indexOf(projectName);
            if(projectNameIndex === -1) {
                projectNames.push(projectName);
                projectNameIndex = projectNames.length - 1;
                projectTaskCounts.push(0);
            }

            projectTaskCounts[projectNameIndex] += 1;
        })

        projectNames.push("No Project");
        projectTaskCounts.push(tasks.filter(task => {return !task.project_id}).length);

        const chartByProject = {
            titles: projectNames,
            values: projectTaskCounts,
            title: "Project Size",
            label: "In project",
            format: "doughnut",
        };

        const chartByStatus = {
            titles: statusNames,
            values: statusCounts,
            title: "Current Task Status",
            label: "Tasks Currently",
            format: "doughnut",
        };
        const chartInteractions = {
            titles: statusNames,
            values: statusSetCounts,
            title: "Total Task Interactions",
            label: "Task Set",
            format: "doughnut",
        };
        const chartOwnership = {
            titles: ['Tasks Owned', 'Tasks Assigned'],
            values: [tasksOwned, tasksAssigned],
            title: "Current Task Ownership",
            label: "Task Currently",
            format: "doughnut",
        };

        async function getCountsForLastDays(number) {
            const output = [];

            for(let i = -number; i <= 0; i++){
                const tDate = new Date()
                tDate.setDate(tDate.getDate() + i);
                const count = await db.getTaskLogsForDate(tDate);
                output.push(count.length);
            }

            return output;
        }

        async function getCumulativeCountsForLastDays(number) {
            const output = [];

            let cumulativeCount = 0;
            for(let i = -number; i <= 0; i++){
                const tDate = new Date();
                tDate.setDate(tDate.getDate() + i);
                cumulativeCount += (await db.getTaskLogsForDate(tDate)).length;
                output.push(cumulativeCount);
            }

            return output;
        }


        function getTitlesForLastDays(number){
            const output = [];
            const tDate = new Date();
            tDate.setDate(tDate.getDate() - number);

            for(let i = 0; i <= number; i++){
                output.push(`${tDate.getDate()}/${tDate.getMonth()+1}`);
                tDate.setDate(tDate.getDate() + 1);
            }
            return output;
        }

        const chartHistory = {
            titles: getTitlesForLastDays(10),
            values: await getCountsForLastDays(10),
            title: "Historic Task Interactions",
            label:  'Task Historic Interactions',
            format: "line",
            colour: 'rgb(169, 042, 069)'
        };

        const chartCumulativeHistory = {
            titles: getTitlesForLastDays(30),
            values: await getCumulativeCountsForLastDays(30),
            title: "Cumulative Task Interactions",
            label:  'Task Cumulative Interactions',
            format: "line",
            colour: 'rgb(042, 069, 255)'
        };

        let chartData = [chartByStatus, chartInteractions, chartOwnership, chartHistory, chartByProject, chartCumulativeHistory];

        if(tasks.length === 0) chartData = undefined;

        res.render('dash', {
            title: `${req.user.name}'s Dashboard`,
            data: chartData,
        });
    }
}

module.exports = DashController;