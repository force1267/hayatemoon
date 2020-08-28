
async function userOf(ctx) {
    if(!ctx.state.user) return null;
    return await strapi.query('user', 'users-permissions').findOne({id: ctx.state.user.id})
}



module.exports = {
    userOf
}