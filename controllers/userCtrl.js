// Egy helyen állítható a backend címe (egyezzen a server.js portjával!)
const API_URL = 'http://localhost:5000';

async function registration(){
    let name = document.querySelector('#name').value
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value
    let confirm = document.querySelector('#confirm').value

    let user = {
        name,
        email,
        password,
        confirm
    }
    const response = await fetch(`${API_URL}/users/register`, {
        method:'POST',
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })

    let res = await response.json()
    if(response.status !=201){
        showMessage('danger', 'ERROR', res.error );
    } else{
        showMessage('success', 'OK', res.message)
        navigate('guest/login')   // users/login helyett: a login oldal a guest mappában van
    }
}


async function login(){
    let email = document.querySelector('#email').value
    let password = document.querySelector('#password').value

    let user = {
        email,
        password
    }

    const response = await fetch(`${API_URL}/users/login`, {
        method:'POST',
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    let res = await response.json()
    if(response.status !=200){
        showMessage('danger', 'ERROR', res.error );
    } else{
        showMessage('success', 'OK', res.message);
        storeUser(res.loggedUser);
        loginCheck();
    }
}

function logout(){
    clearUser();
    loginCheck();
}

function storeUser(user) {
    sessionStorage.setItem('SCU', JSON.stringify(user));
}

function loadUser() {
    let user = JSON.parse(sessionStorage.getItem('SCU'));
    return user;
}

function clearUser() {
    sessionStorage.removeItem('SCU');
}

function loginCheck() {
    let user = loadUser();   // let: ne jöjjön létre véletlen globális változó

    if (user){
        if (user.role == 'admin'){
            setMenuItems('admin');
            navigate('admin/dashboard');
        }
        else {
            setMenuItems('user');
            navigate('users/wheather');
        }
    }
    else{
        // nincs belépve -> vendég: csak login, regisztráció, időjárás
        setMenuItems('guest');
        navigate('guest/home');
    }
}

function setMenuItems(param){
    let baseMenu = document.querySelector('#baseMenu');
    let userMenu = document.querySelector('#userMenu');
    let adminMenu = document.querySelector('#adminMenu');

    // először mindent elrejtünk, aztán csak a megfelelőt mutatjuk
    baseMenu.classList.add('hide');
    userMenu.classList.add('hide');
    adminMenu.classList.add('hide');

    switch(param){
        case 'admin' : {
            adminMenu.classList.remove('hide');
            break;
        }
        case 'user' : {
            userMenu.classList.remove('hide');
            break;
        }
        default : {
            baseMenu.classList.remove('hide');
            break;
        }
    }
}

async function updateProfile(){
   let name = document.querySelector('#name');
   let email = document.querySelector('#email');
   let loggedUser = loadUser();

   let data = {
       username: name.value,
       email: email.value,
       luid: loggedUser.ID
   };
   const response = await fetch(`${API_URL}/users/${loggedUser.ID}`, {
       method: 'PATCH',                 // a szerveren app.patch('/users/:uid')
       headers: {
           "Content-Type": "application/json"
       },
       body: JSON.stringify(data)       // nem {data}, a szerver közvetlenül a body-ból olvassa
   });
   let res = await response.json();
   if(response.status != 200){
       showMessage('danger', 'ERROR', res.error);
   } else {
       showMessage('success', 'OK', res.message);
       storeUser({
        ID: loggedUser.ID,
        name: name.value,
        email: email.value,
        role: loggedUser.role
       });
   }
}

async function updatePassword(){
    let oldpass = document.querySelector('#oldpassword');
    let newpass = document.querySelector('#newpassword');
    let confirm = document.querySelector('#confirm');

    let data = {
        oldpassword: oldpass.value,
        newpassword: newpass.value,
        confirm: confirm.value
    }

    let uid = loadUser() ? loadUser().ID : 0;   // .id helyett .ID
    const response = await fetch(`${API_URL}/users/${uid}/password`, {   // passmod helyett password
        method:'POST',
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    let res = await response.json();

    if(response.status !=200){
        showMessage('danger', 'ERROR', res.error );
    } else{
        showMessage('success', 'OK', res.message);
        oldpass.value = '';
        newpass.value = '';
        confirm.value = '';
    }
}

async function getUserData() {
    let user = loadUser();
    document.querySelector('#name').value = user.name;
    document.querySelector('#email').value = user.email;
}