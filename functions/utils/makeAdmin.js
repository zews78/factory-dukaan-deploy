const firebase = require('../firebase');
const readline = require('readline');

const makeAdmin = async(mobile) => {
	try {
		const userSnapshot = await firebase.firestore()
			.collection('users')
			.where('mobile', '==', '+91' + mobile)
			.get();
		if (userSnapshot.empty) {
			throw Error('No user with this mobile number!');
		}
		const uid = userSnapshot.docs[0].id;
		await firebase.auth()
			.setCustomUserClaims(uid, {admin: true});
		console.log(mobile + ' is now an admin! 😎😎😎');
		process.exit();
	} catch (err) {
		console.log(err.message);
	}
};

const rl = readline.createInterface(process.stdin, process.stdout);
rl.question('Enter mobile number> ', mobile => {
	makeAdmin(mobile);
	rl.close();
});


