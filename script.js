const taskList = document.getElementById('taskList');
const searchParam = document.getElementById('searchParam');
const searchInput = document.getElementById('searchInput');
const startDateSearch = document.getElementById('startDateSearch');
const endDateSearch = document.getElementById('endDateSearch');
const statusSearch = document.getElementById('statusSearch');
const addTaskBtn = document.getElementById('addTask');
const clearButton = document.getElementById('clearButton');
const usedTaskIds = new Set();

addTaskBtn.addEventListener('click', addTask);
searchParam.addEventListener('change', searchTasks);
searchInput.addEventListener('input', searchTasks);
startDateSearch.addEventListener('input', searchTasks);
endDateSearch.addEventListener('input', searchTasks);
statusSearch.addEventListener('change', searchTasks);
clearButton.addEventListener('click', clearSearch);

searchParam.addEventListener('change', () => {
    const selectedParam = searchParam.value;
    
    
    searchInput.style.display = 'none';
    startDateSearch.style.display = 'none';
    endDateSearch.style.display = 'none';
    statusSearch.style.display = 'none';
    
    if (selectedParam === 'id' || selectedParam === 'name') {
        searchInput.style.display = 'inline-block';
    } else if (selectedParam === 'startDate') {
        startDateSearch.style.display = 'inline-block';
    } else if (selectedParam === 'endDate') {
        endDateSearch.style.display = 'inline-block';
    } else if (selectedParam === 'status') {
        statusSearch.style.display = 'inline-block';
    }
});

let tasks = [];



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

function clearSearch() {
    searchInput.value = '';
    startDateSearch.value = '';
    endDateSearch.value = '';
    statusSearch.value = '';       
    searchTasks();
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
        if (!isTaskIdUnique(newTaskId, editedTask.id)) {
            alert('Task ID already exists.');
            return;
        }

        const newStartDate = document.getElementById('editTaskStartDate').value;
        const newEndDate = document.getElementById('editTaskEndDate').value;

        if (!validateTaskDates(newStartDate, newEndDate)) {
            alert('End date cannot be before start date.');
            return;
        }

        usedTaskIds.delete(editTaskId);
        usedTaskIds.add(newTaskId);

        editedTask.id = newTaskId;
        editedTask.name = document.getElementById('editTaskName').value;
        editedTask.startDate = newStartDate;
        editedTask.endDate = newEndDate;
        
        renderTasks();
        editForm.style.display = 'none';
        editTaskId = null;
    }
}

function isTaskIdUnique(newTaskId,currentTaskId) {
    return !tasks.some(task => task.id === newTaskId && task.id !== currentTaskId);
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
        const subtaskTitle = editSubtaskTitle;
        const subtask = task.subtasks.find(subtask => subtask.title === subtaskTitle);
        if (subtask) {
            const newSubtaskTitle = document.getElementById('editSubtaskTitle').value;
            const newSubtaskStartDate = document.getElementById('editSubtaskStartDate').value;
            const newSubtaskEndDate = document.getElementById('editSubtaskEndDate').value;
            const newSubtaskStatus = document.getElementById('editSubtaskStatus').value;

            
            if (
                new Date(newSubtaskEndDate) < new Date(newSubtaskStartDate) ||
                new Date(newSubtaskStartDate) < new Date(task.startDate) ||
                new Date(newSubtaskEndDate) > new Date(task.endDate)
            ) {
                alert('Subtask dates must be within the task duration, and end date cannot be before start date.');
                return;
            }

            subtask.title = newSubtaskTitle;
            subtask.startDate = newSubtaskStartDate;
            subtask.endDate = newSubtaskEndDate;
            subtask.status = newSubtaskStatus;

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
    
    const searchText = searchInput.value.toLowerCase();
    const searchStartDate = startDateSearch.value;
    const searchEndDate = endDateSearch.value;
    const searchStatus = statusSearch.value;
    const param = searchParam.value;

    
    

    const filteredTasks = tasks.filter(task => {
        if (param === 'id') {
            return task.id.includes(searchText) || task.subtasks.some(subtask => subtask.id.includes(searchText));
        } else if (param === 'name') {
            return task.name.toLowerCase().includes(searchText) || task.subtasks.some(subtask => subtask.title.toLowerCase().includes(searchText));
        } else if (param === 'status') {
            return task.status.toLowerCase().includes(searchStatus) || task.subtasks.some(subtask => subtask.status.toLowerCase().includes(searchStatus));
        } else if (param === 'startDate') {
            return task.startDate === searchStartDate || task.subtasks.some(subtask => subtask.startDate === searchStartDate); 
        } else if (param === 'endDate') {
            return task.endDate === searchEndDate || task.subtasks.some(subtask => subtask.endDate === searchEndDate);
        }
    });

    if (filteredTasks.length === 0) {
        
        taskList.innerHTML = '<span id="norecord">No records found.</span>';
        return;
    }

    renderTasks(filteredTasks);
}

function clearTaskInputs() {
    document.getElementById('taskId').value = '';
    document.getElementById('taskName').value = '';
    document.getElementById('taskStartDate').value = '';
    document.getElementById('taskEndDate').value = '';
    document.getElementById('taskStatus').value = '';
}

function validateTaskName(inputField) {
    const inputValue = inputField.value;
    const alphanumericRegex = /^[a-zA-Z0-9\s]*$/; 

    if (!alphanumericRegex.test(inputValue)) {
        inputField.value = inputValue.replace(/[^a-zA-Z0-9\s]/g, '');
    }
}


function validateTaskDates(startDate, endDate) {
    return new Date(endDate) >= new Date(startDate);
}

function validateSubtaskDates(startDate, endDate, task) {
    return new Date(startDate) >= new Date(task.startDate) && new Date(endDate) <= new Date(task.endDate);
}

function calculateTaskDuration(task){
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const durationInDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    return durationInDays+1;
}

function calculateSubTaskDuration(subtask){
    const startDate = new Date(subtask.startDate);
    const endDate = new Date(subtask.endDate);
    const durationInDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    return durationInDays+1;
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
            <span class="t"><strong>DURATION : </strong> ${calculateTaskDuration(task)} days</span>
            
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
            <span><strong>ID : </strong>${subtask.id}</span>  <span><strong>NAME : </strong>${subtask.title}</span> <span><strong>STATUS : </strong>${subtask.status} </span> <span><strong>START DATE: </strong>${subtask.startDate} </span> <span><strong>END DATE : </strong>${subtask.endDate}</span> <span><strong>DURATION : </strong>${calculateSubTaskDuration(subtask)} days</span> 
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
