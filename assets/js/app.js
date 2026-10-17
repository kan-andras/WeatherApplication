let contentbox = document.getElementById('content')

let lightModeBtn = document.querySelector('#lightModeBtn');
let darkModeBtn = document.querySelector('#darkModeBtn');

let theme = 'light';


function getLoggedUser() {
    const raw = localStorage.getItem('SCU');
    return raw ? JSON.parse(raw) : null;
}

async function navigate(page){
    contentbox.innerHTML = await (await fetch(`view/${page}.html`)).text();

    switch (page){
        case 'admin/users':{
            getAllUsers();
            break;
        }
        case 'users/profile':{
            getUserData();
            break;
        }
        case 'admin/dashboard':{
            getStatistics()
            break;
        }
        case 'users/wheather':{
            getallUserWeather();
            break;
        }
        case 'guest/wheather': {
            getallGuestWeather(); 
            break;
        }
        case 'admin/weather':{
            getallAdminWeather();
            break;
        }
        default:
            break;
    }
}

lightModeBtn.addEventListener('click', () =>{
    theme = 'light';
    setTheme(theme);
})
darkModeBtn.addEventListener('click', () =>{
    theme = 'dark';
    setTheme(theme);
})
function setTheme(theme){
 document.documentElement.setAttribute('data-bs-theme', theme);
 saveTheme(theme);
 setThemeBtnState();
}
function saveTheme(theme){
 localStorage.setItem('SCT', theme);
}

function loadTheme(){
    theme = 'light';
    if (localStorage.getItem('SCT')){
        theme = localStorage.getItem('SCT');
        if (theme == 'dark'){
            setThemeBtnState();
        }
    }
    setTheme(theme);
}
function setThemeBtnState(){
    lightModeBtn.classList.toggle('hide');
    darkModeBtn.classList.toggle('hide');
}


navigate('guest/home');
loadTheme();
loginCheck();