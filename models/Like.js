const mysqlUtil = require('../utils/MySQLUtil');
const User = require('./User');

//assuming id is autoincrement
class Like {

    // function to add a like into the like database
    async like(params) {
        const { fromUser, toUser } = params;
        if (await this.checkLikeExist(params) === true) {
            await mysqlUtil.query(
                'DELETE FROM `like`\
                 WHERE fromUser = ? \
                 AND toUser = ?',
                [fromUser, toUser]
            );
            await User.decrementLikeCount(toUser);
        } else {
            await mysqlUtil.query(
                'INSERT INTO `like` \
                 (fromUser, toUser) \
                 VALUES (?, ?);',
                [fromUser, toUser]
            );
            await User.incrementLikeCount(toUser);
        }
    }

    //check if exist in table like
    async checkLikeExist(params) {
        const { fromUser, toUser } = params;

        const [rows] = await mysqlUtil.query('SELECT 1 FROM `like` WHERE fromUser = ? AND toUser = ?', [fromUser, toUser]);

        return rows.length !== 0;
    }


}

module.exports = new Like();