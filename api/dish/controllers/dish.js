'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');


/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    /**
     * Retrieve records.
     *
     * @return {Array}
     */

    async find(ctx) {
        let userId = ctx.state.user && ctx.state.user.id 
        let favDishes = null
        if(userId) {
            let user = await strapi.query('user', 'users-permissions').findOne({id: userId})
            favDishes = user.favoriteDishes.map(dish => dish.id)
        }

        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.dish.search(ctx.query);
        } else {
            entities = await strapi.services.dish.find(ctx.query);
        }
        if(favDishes) for(let e of entities) {
            e.liked = favDishes.includes(e.id)
        }

        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.dish }));
    },

    /**
     * Retrieve a record.
     *
     * @return {Object}
     */

    async findOne(ctx) {
        let userId = ctx.state.user && ctx.state.user.id 
        let favDishes = null
        if(userId) {
            let user = await strapi.query('user', 'users-permissions').findOne({id: userId})
            favDishes = user.favoriteDishes.map(dish => dish.id)
        }

        const { id } = ctx.params;
        const entity = await strapi.services.dish.findOne({ id });

        if(entity && favDishes) entity.liked = favDishes.includes(entity.id)
        return sanitizeEntity(entity, { model: strapi.models.dish });
    },
};
