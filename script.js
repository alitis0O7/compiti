// Configurazione di Firebase
const firebaseConfig = {
    apiKey: "LA_TUA_API_KEY",
    authDomain: "IL_TUO_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://IL_TUO_PROJECT_ID.firebaseio.com",
    projectId: "IL_TUO_PROJECT_ID",
    storageBucket: "IL_TUO_PROJECT_ID.appspot.com",
    messagingSenderId: "IL_TUO_MESSAGING_SENDER_ID",
    appId: "LA_TUA_APP_ID"
};

// Inizializza Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Gestire il login
function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            showTaskForm();
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
}

// Gestire la registrazione
function signupUser() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User registered:', user);
            showTaskForm();
        })
        .catch(error => {
            console.error('Error signing up:', error);
        });
}

// Mostrare il form di login
function showLogin() {
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("signupContainer").style.display = "none";
}

// Mostrare il form di registrazione
function showSignup() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("signupContainer").style.display = "block";
}

// Mostrare il form per aggiungere compiti
function showTaskForm() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("taskFormContainer").style.display = "block";
    document.getElementById("tasksContainer").style.display = "block";
    loadTasks();
}

// Logout
function logoutUser() {
    auth.signOut()
        .then(() => {
            console.log('User logged out');
            document.getElementById("taskFormContainer").style.display = "none";
            document.getElementById("loginContainer").style.display = "block";
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
}

// Aggiungi un nuovo compito
document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert('Devi essere loggato per aggiungere un compito!');
        return;
    }

    const taskName = document.getElementById('taskName').value;
    const dueDate = document.getElementById('dueDate').value;
    const description = document.getElementById('description').value;

    const taskRef = database.ref('tasks/' + user.uid);
    const newTask = taskRef.push();
    newTask.set({
        taskName: taskName,
        dueDate: dueDate,
        description: description,
        createdAt: new Date().toISOString()
    })
    .then(() => {
        alert('Compito aggiunto con successo!');
        loadTasks();
        document.getElementById('taskForm').reset();
    })
    .catch(error => {
        console.error('Errore nell\'aggiungere il compito:', error);
    });
});

// Carica i compiti dell'utente
function loadTasks() {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = database.ref('tasks/' + user.uid);
    taskRef.on('value', function(snapshot) {
        const tasksContainer = document.getElementById('tasksList');
        tasksContainer.innerHTML = '';

        snapshot.forEach(function(childSnapshot) {
            const task = childSnapshot.val();
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');
            taskElement.innerHTML = `
                <h3>${task.taskName}</h3>
                <p><strong>Scadenza:</strong> ${task.dueDate}</p>
                <p><strong>Descrizione:</strong> ${task.description}</p>
                <p><strong>Creato il:</strong> ${task.createdAt}</p>
            `;
            tasksContainer.appendChild(taskElement);
        });
    });
}

// Gestisci l'autenticazione
auth.onAuthStateChanged(user => {
    if (user) {
        showTaskForm();
    } else {
        document.getElementById("loginContainer").style.display = "block";
    }
});
