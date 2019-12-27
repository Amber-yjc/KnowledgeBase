const User = require('../models/User');

class UserController {

    // I am just using it as an example, please feel free to change it in order to make it work
    async signUp(params) {
        const { email } = params;
        // check if the user name is already occupied
        if (await User.hasUser({ email })) {
            return 'occupied'; // failed
        }
        // insert user into database
        const userid = await User.add(params);
        return userid // success
    }

    async login(params){
        const user = await User.get(params);
        if (user != null) {
            return user.id;
        }
    }

}

module.exports = new UserController();