const { User } = require('../../models');

exports.exUser = async (user_id) => {
    const user = await User.findOne({ where: { id: user_id } });

    if (user) {
        return true
    } else {
        return false;
    }
}
