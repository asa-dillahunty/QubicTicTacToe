// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
	apiKey: "AIzaSyBtgu5IqpwfA7SjVEcOWta84STCTQZT5-4",
	authDomain: "qubic-tic-tac-toe.firebaseapp.com",
	databaseURL: "https://qubic-tic-tac-toe-default-rtdb.firebaseio.com",
	projectId: "qubic-tic-tac-toe",
	storageBucket: "qubic-tic-tac-toe.appspot.com",
	messagingSenderId: "528911439204",
	appId: "1:528911439204:web:c71cc4e244039771a5d671",
	measurementId: "G-HVYTJDSKQQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


// I'm trusting this information won't be abused, so I don't have to add authentication