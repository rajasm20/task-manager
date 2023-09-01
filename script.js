const taskList = document.getElementById('taskList');
const searchParam = document.getElementById('searchParam');
const searchInput = document.getElementById('searchInput');
const addTaskBtn = document.getElementById('addTask');
const usedTaskIds = new Set();

addTaskBtn.addEventListener('click', addTask);
searchInput.addEventListener('input', searchTasks);

let tasks = [];

searchParam.addEventListener('change', () => {
    const selectedValue = searchParam.value;
    searchInput.style.display = selectedValue !== 'startDate' && selectedValue !== 'endDate' ? 'inline-block' : 'none';
    searchDateInput.style.display = selectedValue === 'startDate' || selectedValue === 'endDate' ? 'inline-block' : 'none';
    searchInput.value = '';
    searchDateInput.value = '';
    searchTasks();
});
function updateTaskStatusDropdown() {
    const taskStatusDropdown = document.getElementById('taskStatus');
    const taskEndDateInput = document.getElementById('taskEndDate');
    const selectedEndDate = new Date(taskEndDateInput.value);
    const today = new Date();

    taskStatusDropdown.innerHTML = '';

    if (selectedEndDate < today) {
        taskStatusDropdown.innerHTML += `
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="due_passed">Due Passed</option>
        `;
    } else {
        taskStatusDropdown.innerHTML += `
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
        `;
    }
}

function addTask() {
    const taskId = document.getElementById('taskId').value;
    const taskName = document.getElementById('taskName').value;
    const taskStartDate = document.getElementById('taskStartDate').value;
    const taskEndDate = document.getElementById('taskEndDate').value;    
    const taskStatus = document.getElementById('taskStatus').value;

    if (!taskId || !taskName || !taskStartDate || !taskEndDate ) {
        alert('All fields are required.');
        return;
    }

    const existingTask = tasks.find(task => task.id === taskId);
    if (existingTask) {
        alert('Task ID already exists.');
        return;
    }

    if (usedTaskIds.has(taskId)) {
        alert('Task ID already existed. Please choose a different ID.');
        return;
    }

    if (new Date(taskEndDate) < new Date(taskStartDate)) {
        alert('End date cannot be before start date.');
        return;
    }     

    const task = {
        id: taskId,
        name: taskName,
        startDate: taskStartDate,
        endDate: taskEndDate,
        status: taskStatus,
        subtasks: []
    };
    

    tasks.push(task);
    usedTaskIds.add(taskId);
    renderTasks();
    clearTaskInputs();
}

function addSubtask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    

    const subtaskTitle = document.getElementById(`subtaskTitle${taskId}`).value;
    const subtaskStartDate = document.getElementById(`subtaskStartDate${taskId}`).value;
    const subtaskEndDate = document.getElementById(`subtaskEndDate${taskId}`).value;
    const subtaskStatus = document.getElementById(`subtaskStatus${taskId}`).value;

    if (!subtaskTitle || !subtaskStartDate || !subtaskEndDate || !subtaskStatus) {
        alert('All subtask fields are required.');
        return;
    }

    if (new Date(subtaskEndDate) < new Date(subtaskStartDate)) {
        alert('Subtask end date cannot be before start date.');
        return;
    }

    if (new Date(subtaskStartDate) < new Date(task.startDate) || new Date(subtaskEndDate) > new Date(task.endDate)) {
        alert('Subtask dates must be within the task duration.');
        return;
    }

    

    const subtaskId = `${taskId}.${task.subtasks.length + 1}`;
    task.subtasks.push({
        id: subtaskId,
        title: subtaskTitle,
        startDate: subtaskStartDate,
        endDate: subtaskEndDate,
        status: subtaskStatus,
    });

    updateMainTaskStatus(task);
    renderTasks();

    document.getElementById(`subtaskTitle${taskId}`).value = '';
    document.getElementById(`subtaskStartDate${taskId}`).value = '';
    document.getElementById(`subtaskEndDate${taskId}`).value = '';    

    task.status = 'in_progress';
}



function updateMainTaskStatus(task) {
    if (task.subtasks.length === 0) {
        task.status = 'in_progress';
        return;
    }
    if (task.subtasks.every(subtask => subtask.status === 'completed')) 
        task.status = 'completed';

    else if (task.subtasks.some(subtask => subtask.status === 'in_progress')) 
        task.status = 'in_progress';

    else if (task.subtasks.every(subtask => subtask.status === 'cancelled')) 
        task.status = 'cancelled';

    else 
        task.status = 'in_progress';
    
}

const taskL = document.getElementById('taskList');
const editForm = document.getElementById('editForm');

let editTaskId = null;



function editTask(taskId) {
    editTaskId = taskId;
    const task = tasks.find(task => task.id === taskId);

    editForm.innerHTML = `
        <h2>Edit Task</h2>
        <input type="text" id="editTaskId" value="${task.id}">
        <input type="text" id="editTaskName" value="${task.name}">
        <input type="date" id="editTaskStartDate" value="${task.startDate}">
        <input type="date" id="editTaskEndDate" value="${task.endDate}">
        
        <button type="button" class="save-button" onclick="saveEditedTask()">Save</button>
        <button type="button" class="cancel-button" onclick="cancelEdit()">Cancel</button>
    `;

    editForm.style.display = 'block';
}

function saveEditedTask() {
    const editedTask = tasks.find(task => task.id === editTaskId);
    if (editedTask) {
        const newTaskId = document.getElementById('editTaskId').value;
        if (!isTaskIdUnique(newTaskId)) {
            alert('Task ID already exists.');
            return;
        }
        editedTask.id = newTaskId;
        editedTask.name = document.getElementById('editTaskName').value;
        editedTask.startDate = document.getElementById('editTaskStartDate').value;
        editedTask.endDate = document.getElementById('editTaskEndDate').value;
        
        renderTasks();
        editForm.style.display = 'none';
        editTaskId = null;
    }
}

function isTaskIdUnique(newTaskId) {
    return !tasks.some(task => task.id === newTaskId);
}

function editSubtask(taskId, subtaskTitle) {
    editTaskId = taskId;
    editSubtaskTitle = subtaskTitle;
    const task = tasks.find(task => task.id === taskId);
    const subtask = task.subtasks.find(subtask => subtask.title === subtaskTitle);

    editSubtaskForm.innerHTML = `
        <h2>Edit Subtask</h2>
        <input type="text" id="editSubtaskTitle" value="${subtask.title}">
        <input type="date" id="editSubtaskStartDate" value="${subtask.startDate}">
        <input type="date" id="editSubtaskEndDate" value="${subtask.endDate}">
                <select id="editSubtaskStatus">                    
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="due_passed">Due Passed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
        <button type="button" class="save-button" onclick="saveEditedSubtask()">Save Subtask</button>
        <button type="button" class="cancel-button" onclick="cancelEdit()">Cancel</button>





        
    `;

    
    document.getElementById('editSubtaskStatus').value = subtask.status;

    editSubtaskForm.style.display = 'block';
}

function saveEditedSubtask() {
    const task = tasks.find(task => task.id === editTaskId);
    if (task) {
        const subtask = task.subtasks.find(subtask => subtask.title === editSubtaskTitle);
        if (subtask) {
            subtask.title = document.getElementById('editSubtaskTitle').value;
            subtask.startDate = document.getElementById('editSubtaskStartDate').value;
            subtask.endDate = document.getElementById('editSubtaskEndDate').value;
            subtask.status = document.getElementById('editSubtaskStatus').value;
            updateMainTaskStatus(task);
            renderTasks();
            cancelEdit();
        }
    }
}



function cancelEdit() {
    editForm.style.display = 'none';
    editSubtaskForm.style.display = 'none';
    editTaskId = null;
    editSubtaskTitle = null;
}    




function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);    
    renderTasks();
}

function deleteSubtask(taskId, subtaskTitle) {
    const task = tasks.find(task => task.id === taskId);
    task.subtasks = task.subtasks.filter(subtask => subtask.title !== subtaskTitle);
    updateMainTaskStatus(task);
    adjustSubtaskIds(task);
    renderTasks();
}

function adjustSubtaskIds(task) {
    task.subtasks.forEach((subtask, index) => {
        subtask.id = `${task.id}.${index + 1}`;
    });
}

function searchTasks() {
    let searchText = '';
    const param = searchParam.value;

    if (param !== 'startDate' && param !== 'endDate') {
        searchText = searchInput.value.toLowerCase();
    } else {
        searchText = searchDateInput.value;
    }

    const filteredTasks = tasks.filter(task => {
        if (param === 'id') {
            return task.id.includes(searchText) || task.subtasks.some(subtask => subtask.id.includes(searchText));
        } else if (param === 'name') {
            return task.name.toLowerCase().includes(searchText) || task.subtasks.some(subtask => subtask.title.toLowerCase().includes(searchText));
        } else if (param === 'status') {
            return task.status.toLowerCase().includes(searchText) || task.subtasks.some(subtask => subtask.status.toLowerCase().includes(searchText));
        } else if (param === 'startDate') {
            return task.startDate.includes(searchText);
        } else if (param === 'endDate') {
            return task.endDate.includes(searchText);
        }
    });

    renderTasks(filteredTasks);
}

function clearTaskInputs() {
    document.getElementById('taskId').value = '';
    document.getElementById('taskName').value = '';
    document.getElementById('taskStartDate').value = '';
    document.getElementById('taskEndDate').value = '';
    document.getElementById('taskStatus').value = 'not_started';
}

function validateTaskDates(startDate, endDate) {
    return new Date(endDate) >= new Date(startDate);
}

function validateSubtaskDates(startDate, endDate, task) {
    return new Date(startDate) >= new Date(task.startDate) && new Date(endDate) <= new Date(task.endDate);
}

function renderTasks(filteredTasks) {
    taskList.innerHTML = '';
    const tasksToRender = filteredTasks || tasks;

    tasksToRender.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item ' + (task.status === 'completed' ? 'completed' : '');
        taskItem.innerHTML = `
            <span class="t"><strong>ID : </strong>${task.id}</span>
            <span class="t"><strong>NAME : </strong>${task.name}</span>
            <span class="t"><strong>STATUS : </strong>${task.status}</span>
            <span class="t"><strong>START DATE : </strong>${task.startDate}</span>
            <span class="t"><strong>END DATE : </strong>${task.endDate}</span>
            
            <button class="add-button" onclick="toggleSubtaskForm('${task.id}')">Add Subtask</button>
            <button class="edit-button" onclick="editTask('${task.id}')">Edit</button>
            <button class="delete-button" onclick="deleteTask('${task.id}')">Delete</button>
            
            <div id="subtaskForm${task.id}" class="subtask-form">                
                <input type="text" placeholder="Subtask Title" id="subtaskTitle${task.id}">
                <input type="date" placeholder="Subtask Start Date" id="subtaskStartDate${task.id}">
                <input type="date" placeholder="Subtask End Date" id="subtaskEndDate${task.id}">
                <select id="subtaskStatus${task.id}"> 
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>                  
                    <option value="due_passed">Due Passed</option>
                    <option value="cancelled">Cancelled</option>
                                        
                </select>
                <button class="edit-button" onclick="addSubtask('${task.id}')">Add Subtask</button>
            </div>
            <ul id="subtaskList${task.id}"></ul>
        `;

        const subtaskList = taskItem.querySelector(`#subtaskList${task.id}`);
        task.subtasks.forEach(subtask => {
            const subtaskItem = document.createElement('li');
            subtaskItem.className = 'subtask-item ' + (subtask.status === 'completed' ? 'completed' : '');
            subtaskItem.innerHTML = `
            <span><strong>ID : </strong>${subtask.id}</span>  <span><strong>NAME : </strong>${subtask.title}</span> <span><strong>STATUS : </strong>${subtask.status} </span> <span><strong>START DATE: </strong>${subtask.startDate} </span> <span><strong>END DATE : </strong>${subtask.endDate}</span>
                <div><button class="edit-button" onclick="editSubtask('${task.id}', '${subtask.title}')">Edit</button>
                <button class="delete-button" onclick="deleteSubtask('${task.id}', '${subtask.title}')">Delete</button></div>
            `;
            subtaskList.appendChild(subtaskItem);
        });

        taskList.appendChild(taskItem);
    });
}

function toggleSubtaskForm(taskId) {
    const subtaskForm = document.getElementById(`subtaskForm${taskId}`);
    subtaskForm.classList.toggle('active');
}

renderTasks();
