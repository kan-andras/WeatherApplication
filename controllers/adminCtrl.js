async function getAllUsers(){
    const luid = loadUser() ? loadUser().ID : 0;
    const usersList = document.querySelector('#usersList');

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ luid })
        });
        const res = await response.json();

        if (response.status != 200){
            showMessage('danger', 'ERROR', res.error);
            usersList.innerHTML = '<tr><td colspan="8" class="text-center text-danger">A felhasználók nem tölthetők be.</td></tr>';
            return;
        }

        drawUsersTable(res);
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
        usersList.innerHTML = '<tr><td colspan="8" class="text-center text-danger">A szerver nem érhető el.</td></tr>';
    }
}

// A teljes tbody-t újraírása, így frissítéskor nem duplázódnak a sorok. Megváltoztattam.
function drawUsersTable(users){
    const me = loadUser();
    document.querySelector('#usersCount').textContent = users.length;
    document.querySelector('#usersList').innerHTML = users
        .map((user, index) => buildUserRow(user, index, me))
        .join('');
}

function buildUserRow(user, index, me){
    // a login csak status == 0 esetén tiltja a belépést
    const isActive = user.status != 0;
    const isMe = me && user.ID == me.ID;

    // Piros vagy kék szín a usernek és adminnak.
    const roleBadge = user.role == 'admin' ? 'text-bg-danger' : 'text-bg-primary';
    const regDate = user.reg ? moment(user.reg).format('YYYY.MM.DD. HH:mm') : '-';
    const lastLogin = user.last ? moment(user.last).format('YYYY.MM.DD. HH:mm') : 'Még nem lépett be';
    // Táblázat kirajzolása.
    return `
    <tr class="fade-up">
        <td class="d-none d-md-table-cell">${index + 1}.</td>
        <td>
            <div class="fw-semibold">${escapeHtml(user.name)}</div>
            <div class="small text-body-secondary d-md-none">${escapeHtml(user.email)}</div>
        </td>
        <td class="d-none d-md-table-cell">${escapeHtml(user.email)}</td>
        <td><span class="badge ${roleBadge}">${escapeHtml(user.role)}</span></td>
        <td class="d-none d-lg-table-cell">${regDate}</td>
        <td class="d-none d-md-table-cell">${lastLogin}</td>
        <td class="d-none d-lg-table-cell">${user.loginCount ?? 0}</td>
        <td class="text-end text-nowrap">
            <span class="badge ${isActive ? 'text-bg-success' : 'text-bg-warning'} me-2">${isActive ? 'Aktív' : 'Tiltott'}</span>
            <div class="form-check form-switch d-inline-block align-middle mb-0">
                <input class="form-check-input" type="checkbox" role="switch"
                    ${isActive ? 'checked' : ''}
                    ${isMe ? 'disabled title="A saját fiókodat nem tilthatod le"' : ''}
                    onchange="changeUserStatus(${Number(user.ID)})">
            </div>
        </td>
    </tr>`;
}

// Tiltás / feloldás
async function changeUserStatus(uid) {
    const me = loadUser();
    const luid = me ? me.ID : 0;

    try {
        const response = await fetch(`${API_URL}/admin/status`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uid, luid })
        });
        const res = await response.json();

        if (response.status != 200){
            showMessage('danger', 'ERROR', res.error);
        } else {
            showMessage('success', 'OK', res.message);
        }
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
    }

    // mindkét esetben újra kell tölteni a listát.
    getAllUsers();
}
