async function getAllUsers(){
    //
    let luid = loadUser() ? loadUser().ID : 0;
    //
    const response = await fetch('http://localhost:3000/admin/users', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        //
        body: JSON.stringify({ luid })
        //
    });
    if (response.status != 200){
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error)
    }
    else{
        const users = await response.json();
        // console.log(users);
        drawtable(users);
    }
   
}
 
function drawtable(users){
    let usersCount = document.querySelector('#usersCount');
    usersCount.innerHTML = users.length;
    users.forEach((user, index) => {
        addTableRow(user, index);
    });
}
function addTableRow(user, index){
    let usersList = document.querySelector('#usersList');
    let tr = document.createElement('tr');
 
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let td5 = document.createElement('td');
        let td6 = document.createElement('td');
        let td7 = document.createElement('td');
 
        td1.innerHTML = (index + 1) + '.';
        td2.innerHTML = user.name;
        td3.innerHTML = user.email;
        td4.innerHTML = moment(user.created_at).format('YYYY-MM-DD HH:mm:ss');
        td5.innerHTML = user.last_login ? moment(user.last_login, 'YYYYMMDD').fromNow() : 'never';
        td6.innerHTML = user.login_count;
        let isActive = user.is_active ? 'checked' : '';
        let isDisabled = user.ID == loadUser().ID ? 'disabled' : '';

        td7.innerHTML = '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="is_active" '+ isActive + ' ' + isDisabled +' onclick="changeUserStatus('+ user.id +')"></div>';
 
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
 
        td7.classList.add('text-end');
 
        usersList.appendChild(tr);
}

async function getStatistics() {
    let luid = loadUser() ? loadUser().ID : 0;
    //
    const response = await fetch('http://localhost:3000/admin/statistics', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        //
        body: JSON.stringify({ luid })
        //
    });
    if (response.status != 200){
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error)
    }
    else{
        const data = await response.json();
        // console.log(users);
        drawDashboard(data);
    }
}

function drawDashboard(results){
    let totalstep = document.querySelector('#totalSteps');
    let totalKm = document.querySelector('#totalKm');
    let avgStep = document.querySelector('#avgSteps');
    let avgkm = document.querySelector('#avgKm');
    console.log(results[0][0].total)
    totalstep.innerHTML = results[0][0].total + ' steps';
    totalKm.innerHTML = '~' + Math.round((results[0][0].total * 0.7) / 1000) + ' km';
    avgStep.innerHTML = results[0][0].avg + ' steps'
    avgkm.innerHTML = '~' + Math.round((results[0][0].avg * 0.7) / 1000) + ' km';

    let topUsers = document.querySelector('#topUsers');

    results[1].forEach((user, index) =>{
        let km = Math.round((user.steps * 0.7) / 1000) + ' km';
        topUsers.innerHTML += `
        <tr>
        <td>${index+1}.</td>
        <td class="text-start">
        ${user.name} <br> <small>${user.email}</small>
        </td>
        <td class="text-end>${user.steps} <br> <small>${km}</small></td>
        </tr>`
    })

}

async function changeUserStatus(uid) {
    let luid = loadUser() ? loadUser().id : 0;

    let data ={
        uid,
        luid
    }
    //
    const response = await fetch('http://localhost:3000/admin/statistics', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        //
        body: JSON.stringify({ data })
        //
    });
    const res = await response.json();
    if (response.status != 200){
        showMessage('danger', 'ERROR', res.error)
    }
    else{
        drawDashboard(data);
    }
    
}

async function denyUser(tdToggle) {
    let luid = loadUser ? loadUser().ID : 0;
    let uid = tdToggle.dataset.uid;   // selected row's user ID
 
    console.log("uid:", uid);
 
    const response = await fetch('http://localhost:3000/admin/status', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uid, luid })
    });
    let res =await response.json()
    if(response.status !=200){
        showMessage('danger', 'ERROR', res.error );
    } else{
        showMessage('success', 'OK', res.message)
    }
}