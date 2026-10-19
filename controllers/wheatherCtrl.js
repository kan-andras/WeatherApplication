// Icon választás
function weatherIcon(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('nap') || t.includes('sun') || t.includes('derült')) return 'bi-brightness-high-fill';
    if (t.includes('eső') || t.includes('rain') || t.includes('zápor')) return 'bi-cloud-rain-fill';
    if (t.includes('vihar') || t.includes('storm') || t.includes('zivatar')) return 'bi-cloud-lightning-rain-fill';
    if (t.includes('hó') || t.includes('snow')) return 'bi-cloud-snow-fill';
    if (t.includes('köd') || t.includes('fog')) return 'bi-cloud-fog2-fill';
    return 'bi-cloud-fill';
}

let guestWeatherData = [];

// Vendég nézet
async function getallGuestWeather() {
    const body = document.querySelector('#guestWeatherBody');

    try {
        const response = await fetch(`${API_URL}/weather`);
        const res = await response.json();

        if (response.status != 200) {
            showMessage('danger', 'ERROR', res.error);
            body.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Az adatok nem tölthetők be.</td></tr>';
            return;
        }

        guestWeatherData = res;
        renderGuestWeather(guestWeatherData);
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
        body.innerHTML = '<tr><td colspan="5" class="text-center text-danger">A szerver nem érhető el.</td></tr>';
    }
}

function renderGuestWeather(list) {
    const body = document.querySelector('#guestWeatherBody');

    if (list.length == 0) {
        body.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nincs megjeleníthető előrejelzés.</td></tr>';
        return;
    }

    body.innerHTML = list.map(item => `
        <tr>
            <td>${moment(item.date).format('YYYY.MM.DD.')}</td>
            <td>${item.location}</td>
            <td class="text-end">${item.temp_min}</td>
            <td class="text-end">${item.temp_max}</td>
            <td class="text-end"><i class="bi ${weatherIcon(item.weather_type)} me-1"></i>${item.weather_type}</td>
        </tr>
    `).join('');
}

// Kiválasztott városra szűrés.
function filterGuestWeather() {
    const term = document.querySelector('#guestWeatherSearch').value.trim().toLowerCase();
    const filtered = guestWeatherData.filter(item =>
        item.location.toLowerCase().includes(term) ||
        item.weather_type.toLowerCase().includes(term)
    );
    renderGuestWeather(filtered);
}
// Eddig guest weather függvények.

// User
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Bejelentkezett user
async function getallUserWeather() {
    const user = loadUser();
    if (!user) {
        loginCheck();
        return;
    }

    document.querySelector('#welcomeName').textContent = user.name;

    const list = document.querySelector('#userWeatherList');

    try {
        const response = await fetch(`${API_URL}/weather`);
        const res = await response.json();

        if (response.status != 200) {
            showMessage('danger', 'ERROR', res.error);
            list.innerHTML = '<div class="col-12 text-center text-danger">Az adatok nem tölthetők be.</div>';
            return;
        }

        renderUserWeather(res);
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
        list.innerHTML = '<div class="col-12 text-center text-danger">A szerver nem érhető el.</div>';
    }
}

// Időjárás részletes adatainak kiírása.
function renderUserWeather(items) {
    const list = document.querySelector('#userWeatherList');

    if (items.length == 0) {
        list.innerHTML = '<div class="col-12 text-center text-body-secondary">Nincs megjeleníthető előrejelzés.</div>';
        return;
    }

    // Animációs megjelenítés. (Math-es megoldás).
    list.innerHTML = items.map((item, i) => `
        <div class="col-sm-6 col-lg-4 fade-up" style="--delay: ${0.25 + Math.min(i, 10) * 0.07}s">
            <div class="card weather-card h-100 shadow-sm" onclick="showUserWeatherDetail(${Number(item.ID)})">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title mb-0">${escapeHtml(item.location)}</h5>
                            <small class="text-body-secondary">${moment(item.date).format('YYYY.MM.DD.')}</small>
                        </div>
                        <i class="bi ${weatherIcon(item.weather_type)} fs-2"></i>
                    </div>
                    <p class="mt-3 mb-2">${escapeHtml(item.weather_type)}</p>
                    <span class="badge text-bg-info">Min ${escapeHtml(item.temp_min)} °C</span>
                    <span class="badge text-bg-danger">Max ${escapeHtml(item.temp_max)} °C</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Egy nap részletes adatai
async function showUserWeatherDetail(id) {
    const user = loadUser();
    if (!user) {
        loginCheck();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/weather/${id}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ luid: user.ID })
        });
        const d = await response.json();

        if (response.status != 200) {
            showMessage('danger', 'ERROR', d.error);
            return;
        }

        // Iconok és adatok megjelenítése együtt. Felugró panel, animációval.
        // Egyszerűbb megoldás?
        const tiles = [
            ['bi-thermometer-low','Minimum hőmérséklet',`${d.temp_min} °C`],
            ['bi-thermometer-high','Maximum hőmérséklet',`${d.temp_max} °C`],
            ['bi-cloud-drizzle','Csapadék',`${d.precipitation ?? '-'} mm`],
            ['bi-droplet-half','Csapadék valószínűsége',`${d.precipitation_probability ?? '-'} %`],
            ['bi-wind','Szélsebesség',`${d.wind_speed ?? '-'} km/h`],
            ['bi-compass','Szélirány',d.wind_direction || '-'],
            ['bi-moisture','Páratartalom',`${d.humidity ?? '-'} %`],
            ['bi-speedometer2','Légnyomás',`${d.pressure ?? '-'} hPa`],
            ['bi-sun','UV-index',d.uv_index ?? '-']
        ];

        document.querySelector('#detailTitle').innerHTML =
            `<i class="bi ${weatherIcon(d.weather_type)} me-2"></i>${escapeHtml(d.location)}`;
        document.querySelector('#detailSubtitle').textContent =
            `${moment(d.date).format('YYYY.MM.DD.')} – ${d.weather_type}`;
        document.querySelector('#detailBody').innerHTML = tiles.map(([icon, label, value], i) => `
            <div class="col-6 col-md-4 fade-up" style="--delay: ${i * 0.05}s">
                <div class="detail-tile h-100">
                    <div class="text-body-secondary small"><i class="bi ${icon} me-1"></i>${label}</div>
                    <div class="fs-5 fw-semibold">${escapeHtml(value)}</div>
                </div>
            </div>
        `).join('');
        // panel megjelenítése, az animáció újraindítása és odagörgetés
        const panel = document.querySelector('#userWeatherDetail');
        panel.classList.remove('d-none', 'fade-up');
        void panel.offsetWidth;   //az animáció újra lefutásához kell.
        panel.classList.add('fade-up');
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
    }
}

function closeUserWeatherDetail() {
    document.querySelector('#userWeatherDetail').classList.add('d-none');
}

async function getAllAdminWeather(){
    const admin = loadAdmin();
    if (!admin) {
        loginCheck();
        return;
    }

    document.querySelector('#welcomeAdminName').textContent = admin.name;

    const list = document.querySelector('#adminWeatherList');

    try {
        const response = await fetch(`${API_URL}/weather`);
        const res = await response.json();

        if (response.status != 200) {
            showMessage('danger', 'ERROR', res.error);
            list.innerHTML = '<div class="col-12 text-center text-danger">Az adatok nem tölthetők be.</div>';
            return;
        }

        renderAdminWeather(res);
    } catch (err) {
        console.error(err);
        showMessage('danger', 'ERROR', 'A szerver nem érhető el.');
        list.innerHTML = '<div class="col-12 text-center text-danger">A szerver nem érhető el.</div>';
    }
}