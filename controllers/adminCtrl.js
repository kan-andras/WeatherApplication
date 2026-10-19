// Admin felhasználók kezelése
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

// Táblázat a userekből.
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
                    ${isMe ? 'disabled title="A saját fiókodat ne tiltsd le!"' : ''}
                    onchange="changeUserStatus(${Number(user.ID)})">
            </div>
        </td>
    </tr>`;
}

// Tiltás/feloldás
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



// Admin időjárás-előrejelzések
// Iconok és kiválasztható szűrők.
const WEATHER_FIELDS = ['date', 'location', 'weather_type', 'temp_min', 'temp_max', 'precipitation',
    'precipitation_probability', 'wind_speed', 'wind_direction', 'humidity', 'pressure', 'uv_index'];
const WEATHER_NUMERIC_FIELDS = ['temp_min', 'temp_max', 'precipitation', 'precipitation_probability',
    'wind_speed', 'humidity', 'pressure', 'uv_index'];
// A diagramon választható mutatók (Chart view ezt veszi át.)
const CHART_METRICS = {
    precipitation: { label: 'Csapadék', unit: 'mm' },
    precipitation_probability: { label: 'Csapadék valószínűsége', unit: '%' },
    wind_speed: { label: 'Szélsebesség', unit: 'km/h' }
};

let adminWeatherData = [];
let editingWeatherId = null;
let detailWeatherId = null;
let adminChart = null;

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
            value = moment(value).format('YYYY-MM-DD');
        }
        document.querySelector(`#${prefix}-${field}`).value = value ?? '';
    });
}

//Dashboard
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

// új előrejelzés felvétele
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
//összes előrejelzés lekérése
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
            '<tr><td colspan="10" class="text-center text-danger">Rossz az egész.</td></tr>';
        return;
    }

    adminWeatherData = res.body;
    renderAdminWeather();
    updateAdminChart();
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
            <button type="button" class="btn btn-sm btn-outline-secondary" title="Details" aria-label="Details"
                onclick="showAdminWeatherDetail(${Number(item.ID)})"><i class="bi bi-info-circle"></i><span class="d-none d-xl-inline ms-1">Details</span></button>
            <button type="button" class="btn btn-sm btn-primary" title="Szerkesztés" aria-label="Szerkesztés"
                onclick="editAdminWeather(${Number(item.ID)})"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-sm btn-outline-danger" title="Törlés" aria-label="Törlés"
                onclick="deleteAdminWeather(${Number(item.ID)})"><i class="bi bi-trash"></i></button>
        </td>
    </tr>`;
}

// Egy nap részletes adatai
function showAdminWeatherDetail(id) {
    const d = adminWeatherData.find(w => w.ID == id);
    if (!d) return;

    closeAdminEdit();
    detailWeatherId = d.ID;

    const tiles = [
        ['bi-thermometer-low','Minimum hőmérséklet',`${d.temp_min} °C`],
        ['bi-thermometer-high','Maximum hőmérséklet',`${d.temp_max} °C`],
        ['bi-cloud-drizzle','Csapadék',`${d.precipitation ?? '-'} mm`],
        ['bi-droplet-half','Csapadék valószínűsége',`${d.precipitation_probability ?? '-'} %`],
        ['bi-wind','Szélsebesség',`${d.wind_speed ?? '-'} km/h`],
        ['bi-compass','Szélirány', d.wind_direction || '-'],
        ['bi-moisture','Páratartalom',`${d.humidity ?? '-'} %`],
        ['bi-speedometer2','Légnyomás',`${d.pressure ?? '-'} hPa`],
        ['bi-sun','UV-index',d.uv_index ?? '-']
    ];

    document.querySelector('#adminDetailTitle').innerHTML =
        `<i class="bi ${weatherIcon(d.weather_type)} me-2"></i>${escapeHtml(d.location)}`;
    document.querySelector('#adminDetailSubtitle').textContent =
        `${moment(d.date).format('YYYY.MM.DD.')} – ${d.weather_type}`;

    document.querySelector('#adminDetailBody').innerHTML = tiles.map(([icon, label, value], i) => `
        <div class="col-6 col-md-4 fade-up" style="--delay: ${i * 0.05}s">
            <div class="detail-tile h-100">
                <div class="text-body-secondary small"><i class="bi ${icon} me-1"></i>${label}</div>
                <div class="fs-5 fw-semibold">${escapeHtml(value)}</div>
            </div>
        </div>
    `).join('');

    const panel = document.querySelector('#adminWeatherDetail');
    panel.classList.remove('d-none', 'fade-up');
    void panel.offsetWidth;   // animáció újraindításához szükséges szutyok
    panel.classList.add('fade-up');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAdminDetail() {
    detailWeatherId = null;
    document.querySelector('#adminWeatherDetail').classList.add('d-none');
}

// A részletes nézetből közvetlenül átváltunk szerkesztésre, ha már nem akarja nézegetni az időjárássssstttt
function editFromDetail() {
    if (detailWeatherId !== null) editAdminWeather(detailWeatherId);
}

// Szerkesztő panel megnyitása
function editAdminWeather(id) {
    const item = adminWeatherData.find(w => w.ID == id);
    if (!item) return;

    closeAdminDetail(); 
    editingWeatherId = item.ID;
    fillWeatherForm('ed', item);
    document.querySelector('#adminEditTitle').textContent =
        `Szerkesztés: ${item.location} – ${moment(item.date).format('YYYY.MM.DD.')}`;

    const panel = document.querySelector('#adminWeatherEdit');
    panel.classList.remove('d-none', 'fade-up');
    void panel.offsetWidth;   // animáció újraindításához cucc itt is
    panel.classList.add('fade-up');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAdminEdit() {
    editingWeatherId = null;
    document.querySelector('#adminWeatherEdit').classList.add('d-none');
}

// Módosítás az időjárásnál
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

// Törlés
async function deleteAdminWeather(id) {
    if (!confirm('Biztosan törölni szeretnéd ezt az előrejelzést?')) return;

    const res = await adminRequest(`/admin/weather/${id}`, 'DELETE');
    if (res.status != 200) {
        showMessage('danger', 'ERROR', res.body.error);
        return;
    }

    showMessage('success', 'OK', res.body.message);
    if (editingWeatherId == id){
        closeAdminEdit();
    }
    if (detailWeatherId == id) {
        closeAdminDetail();
    }
    await getallAdminWeather();
}

//Diagram

function updateAdminChart() {
    const canvas = document.querySelector('#adminChartCanvas');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        showMessage('danger', 'ERROR', 'A Chart.js nincs betöltve, nézd meg az index.html script sorát.');
        return;
    }

    const key = document.querySelector('#chartMetric').value;
    const metric = CHART_METRICS[key];

    const dayOf = w => moment(w.date).format('YYYY-MM-DD'); // Napok
    const labels = [...new Set(adminWeatherData.map(dayOf))].sort(); // Nap szűrés
    const locations = [...new Set(adminWeatherData.map(w => w.location))] // Hely szűrés
        .sort((a, b) => a.localeCompare(b, 'hu'));

    const datasets = locations.map(location => ({
        label: location,
        data: labels.map(day => {
            const row = adminWeatherData.find(w => w.location === location && dayOf(w) === day);
            return row ? (Number(row[key]) || 0) : null;
        }),
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 8,
        pointHoverRadius: 12,
        spanGaps: true
    }));

    // a színek az aktuális témából jönnek
    const css = getComputedStyle(document.documentElement);
    Chart.defaults.color = css.getPropertyValue('--bs-body-color').trim() || '#666';
    const gridColor = css.getPropertyValue('--bs-border-color').trim() || 'rgba(0, 0, 0, 0.1)';

    if (adminChart) adminChart.destroy();   // ugyanarra a canvasra nem lehet két diagramot rajzolni, mert összefolyna az egész
    adminChart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
            scales: {
                x: {
                    grid: { color: gridColor }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    title: { display: true, text: metric.unit }
                }
            },
            plugins: {
                title: { display: true, text: metric.label }
            }
        }
    });
}
