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

function drawUsersTable(users){
    const me = loadUser();
    document.querySelector('#usersCount').textContent = users.length;
    document.querySelector('#usersList').innerHTML = users
        .map((user, index) => buildUserRow(user, index, me))
        .join('');
}


function buildUserRow(user, index, me){
    const isActive = user.status != 0;
    const isMe = me && user.ID == me.ID;

    const roleBadge = user.role == 'admin' ? 'text-bg-danger' : 'text-bg-primary';
    const regDate = user.reg ? moment(user.reg).format('YYYY.MM.DD. HH:mm') : '-';
    const lastLogin = user.last ? moment(user.last).format('YYYY.MM.DD. HH:mm') : 'Még nem lépett be';

    return `
    <tr>
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

    getAllUsers();
}


const WEATHER_FIELDS = ['date', 'location', 'weather_type', 'temp_min', 'temp_max', 'precipitation',
    'precipitation_probability', 'wind_speed', 'wind_direction', 'humidity', 'pressure', 'uv_index'];
const WEATHER_NUMERIC_FIELDS = ['temp_min', 'temp_max', 'precipitation', 'precipitation_probability',
    'wind_speed', 'humidity', 'pressure', 'uv_index'];

const CHART_METRICS = {
    precipitation: { label: 'Csapadék', unit: 'mm' },
    precipitation_probability: { label: 'Csapadék valószínűsége', unit: '%' },
    wind_speed: { label: 'Szélsebesség', unit: 'km/h' }
};

let adminWeatherData = [];
let editingWeatherId = null;
let chartResizeBound = false;
let chartResizeTimer = null;

async function adminRequest(path, method, payload = {}) {
    const me = loadUser();
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...payload, luid: me ? me.ID : 0 })
        });
        const body = await response.json();
        return { status: response.status, body };
    } catch (err) {
        console.error(err);
        return { status: 0, body: { error: 'A szerver nem érhető el.' } };
    }
}

function readWeatherForm(prefix) {
    const data = {};
    WEATHER_FIELDS.forEach(field => {
        const value = document.querySelector(`#${prefix}-${field}`).value.trim();
        if (WEATHER_NUMERIC_FIELDS.includes(field)) {
            data[field] = value === '' ? null : Number(value);
        } else {
            data[field] = value;
        }
    });
    return data;
}

function fillWeatherForm(prefix, item) {
    WEATHER_FIELDS.forEach(field => {
        let value = item[field];
        if (field == 'date') {
            value = moment(value).format('YYYY-MM-DD');   // a date input ezt a formátumot várja
        }
        document.querySelector(`#${prefix}-${field}`).value = value ?? '';
    });
}


// Összesítő kártyák a vezérlőpulton betöltésekor)
async function getStatistics() {
    const [weather, users] = await Promise.all([
        adminRequest('/admin/weather', 'POST'),
        adminRequest('/admin/users', 'POST')
    ]);

    if (weather.status != 200) {
        showMessage('danger', 'ERROR', weather.body.error);
        return;
    }
    if (users.status != 200) {
        showMessage('danger', 'ERROR', users.body.error);
        return;
    }

    const forecasts = document.querySelector('#statForecasts');
    if (!forecasts) return;

    forecasts.textContent = weather.body.length;
    document.querySelector('#statLocations').textContent = new Set(weather.body.map(w => w.location)).size;
    document.querySelector('#statUsers').textContent = users.body.length;
}

// Új előrejelzés felvétele
async function createWeather(event) {
    event.preventDefault();
    const form = event.target;

    if (!loadUser()) {
        loginCheck();
        return;
    }

    const data = readWeatherForm('nw');
    if (data.temp_min > data.temp_max) {
        showMessage('warning', 'FIGYELEM', 'A minimum hőmérséklet nem lehet nagyobb a maximumnál!');
        return;
    }

    const res = await adminRequest('/admin/weather/new', 'POST', data);
    if (res.status != 201) {
        showMessage('danger', 'ERROR', res.body.error);
        return;
    }

    showMessage('success', 'OK', res.body.message);
    form.reset();
    await getStatistics();
}

//Admin időjárás oldal 

//Összes előrejelzés lekérése
async function getallAdminWeather() {
    const me = loadUser();
    if (!me) {
        loginCheck();
        return;
    }

    document.querySelector('#adminWelcomeName').textContent = me.name;

    const res = await adminRequest('/admin/weather', 'POST');
    if (res.status != 200) {
        showMessage('danger', 'ERROR', res.body.error);
        document.querySelector('#adminWeatherBody').innerHTML =
            '<tr><td colspan="10" class="text-center text-danger">Az adatok nem tölthetők be.</td></tr>';
        return;
    }

    adminWeatherData = res.body;
    renderAdminWeather();
    setupAdminChart();
}

function renderAdminWeather() {
    document.querySelector('#adminWeatherCount').textContent = adminWeatherData.length;

    const body = document.querySelector('#adminWeatherBody');
    if (adminWeatherData.length == 0) {
        body.innerHTML = '<tr><td colspan="10" class="text-center text-body-secondary">Még nincs előrejelzés. Vegyél fel egyet az "Új előrejelzés" gombbal.</td></tr>';
        return;
    }
    body.innerHTML = adminWeatherData.map(buildAdminWeatherRow).join('');
}

// Egy sor az admin táblázatban
function buildAdminWeatherRow(item, i) {
    const withUnit = (value, unit) => (value === null || value === undefined) ? '-' : `${value} ${unit}`;

    return `
    <tr class="fade-up" style="--delay: ${Math.min(i, 12) * 0.04}s">
        <td class="text-nowrap">${moment(item.date).format('YYYY.MM.DD.')}</td>
        <td class="fw-semibold">${escapeHtml(item.location)}</td>
        <td class="text-nowrap"><i class="bi ${weatherIcon(item.weather_type)} me-1"></i>${escapeHtml(item.weather_type)}</td>
        <td class="d-none d-md-table-cell text-nowrap">
            <span class="badge text-bg-info">${escapeHtml(item.temp_min)} °</span>
            <span class="badge text-bg-danger">${escapeHtml(item.temp_max)} °</span>
        </td>
        <td class="d-none d-lg-table-cell text-nowrap">
            ${withUnit(item.precipitation, 'mm')}
            <span class="text-body-secondary">(${withUnit(item.precipitation_probability, '%')})</span>
        </td>
        <td class="d-none d-lg-table-cell text-nowrap">${withUnit(item.wind_speed, 'km/h')} ${escapeHtml(item.wind_direction || '')}</td>
        <td class="d-none d-xl-table-cell">${withUnit(item.humidity, '%')}</td>
        <td class="d-none d-xl-table-cell text-nowrap">${withUnit(item.pressure, 'hPa')}</td>
        <td class="d-none d-xl-table-cell">${item.uv_index ?? '-'}</td>
        <td class="text-end text-nowrap">
            <button type="button" class="btn btn-sm btn-outline-primary" title="Szerkesztés" aria-label="Szerkesztés"
                onclick="editAdminWeather(${Number(item.ID)})"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" title="Törlés" aria-label="Törlés"
                onclick="deleteAdminWeather(${Number(item.ID)})"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`;
}

//Szerkesztő panel megnyitása
function editAdminWeather(id) {
    const item = adminWeatherData.find(w => w.ID == id);
    if (!item) return;

    editingWeatherId = item.ID;
    fillWeatherForm('ed', item);
    document.querySelector('#adminEditTitle').textContent =
        `Szerkesztés: ${item.location} – ${moment(item.date).format('YYYY.MM.DD.')}`;

    const panel = document.querySelector('#adminWeatherEdit');
    panel.classList.remove('d-none', 'fade-up');
    void panel.offsetWidth; //Az animációhoz való finomság
    panel.classList.add('fade-up');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAdminEdit() {
    editingWeatherId = null;
    document.querySelector('#adminWeatherEdit').classList.add('d-none');
}

//Módosítás mentése
async function saveAdminWeather(event) {
    event.preventDefault();
    if (editingWeatherId === null) return;

    const data = readWeatherForm('ed');
    if (data.temp_min > data.temp_max) {
        showMessage('warning', 'FIGYELEM', 'A minimum hőmérséklet nem lehet nagyobb a maximumnál!');
        return;
    }

    const res = await adminRequest(`/admin/weather/${editingWeatherId}`, 'PATCH', data);
    if (res.status != 200) {
        showMessage('danger', 'ERROR', res.body.error);
        return;
    }

    showMessage('success', 'OK', res.body.message);
    closeAdminEdit();
    await getallAdminWeather();
}

//Törlés
async function deleteAdminWeather(id) {
    if (!confirm('Biztosan törölni szeretnéd ezt az előrejelzést?')) return;

    const res = await adminRequest(`/admin/weather/${id}`, 'DELETE');
    if (res.status != 200) {
        showMessage('danger', 'ERROR', res.body.error);
        return;
    }

    showMessage('success', 'OK', res.body.message);
    if (editingWeatherId == id) closeAdminEdit();
    await getallAdminWeather();
}

// A helység-választó feltöltése és a diagram kirajzolása
function setupAdminChart() {
    const select = document.querySelector('#chartLocation');
    const previous = select.value;

    const locations = [...new Set(adminWeatherData.map(w => w.location))]
        .sort((a, b) => a.localeCompare(b, 'hu'));
    select.innerHTML = locations
        .map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
        .join('');
    if (locations.includes(previous)) select.value = previous;

    bindChartResize();
    updateAdminChart();
}

function updateAdminChart() {
    const container = document.querySelector('#adminChart');
    if (!container) return;

    const location = document.querySelector('#chartLocation').value;
    const key = document.querySelector('#chartMetric').value;
    const metric = CHART_METRICS[key];

    const rows = adminWeatherData
        .filter(w => w.location === location)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-14);

    const points = rows.map(w => {
        const value = Math.round((Number(w[key]) || 0) * 10) / 10;
        return {
            label: moment(w.date).format('MM.DD.'),
            value,
            tip: `${moment(w.date).format('YYYY.MM.DD.')} – ${w.location}: ${value} ${metric.unit}`
        };
    });

    document.querySelector('#chartCaption').textContent = points.length > 0
        ? `${metric.label} (${metric.unit}) – ${location}, utolsó ${points.length} bejegyzés`
        : '';
    drawBarChart(container, points);
}

function niceMax(value) {
    if (value <= 0) return 1;
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const n = value / power;
    const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return nice * power;
}

function drawBarChart(container, points) {
    if (points.length == 0) {
        container.innerHTML = '<p class="text-center text-body-secondary my-5">Nincs adat a diagramhoz.</p>';
        return;
    }

    const W = Math.max(container.clientWidth, 300);
    const H = 260;
    const margin = { top: 24, right: 12, bottom: 34, left: 46 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const max = niceMax(Math.max(...points.map(p => p.value)));
    const band = innerW / points.length;
    const barW = Math.min(band * 0.6, 44);
    const y = v => margin.top + innerH - (v / max) * innerH;
    const labelEvery = Math.ceil(points.length / Math.max(1, Math.floor(innerW / 46)));

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Oszlopdiagram">`;

    for (let i = 0; i <= 4; i++) {
        const v = (max * i) / 4;
        svg += `<line class="chart-grid" x1="${margin.left}" x2="${W - margin.right}" y1="${y(v)}" y2="${y(v)}"/>`;
        svg += `<text class="chart-text" x="${margin.left - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 100) / 100}</text>`;
    }

    points.forEach((p, i) => {
        const x = margin.left + band * i + (band - barW) / 2;
        const h = (p.value / max) * innerH;

        svg += `<rect class="chart-bar" x="${x}" y="${y(p.value)}" width="${barW}" height="${h}" rx="3" style="--delay: ${i * 0.05}s"><title>${escapeHtml(p.tip)}</title></rect>`;
        if (band >= 34) {
            svg += `<text class="chart-text chart-value" x="${x + barW / 2}" y="${y(p.value) - 6}" text-anchor="middle">${p.value}</text>`;
        }
        if (i % labelEvery == 0) {
            svg += `<text class="chart-text" x="${x + barW / 2}" y="${H - 12}" text-anchor="middle">${escapeHtml(p.label)}</text>`;
        }
    });

    svg += '</svg>';
    container.innerHTML = svg;
}

function bindChartResize() {
    if (chartResizeBound) return;
    chartResizeBound = true;

    window.addEventListener('resize', () => {
        clearTimeout(chartResizeTimer);
        chartResizeTimer = setTimeout(() => {
            if (document.querySelector('#adminChart')) updateAdminChart();
        }, 200);
    });
}