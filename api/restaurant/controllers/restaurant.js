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
            entities = await strapi.services.restaurant.search(ctx.query);
        } else {
            entities = await strapi.services.restaurant.find(ctx.query);
        }
        if(favDishes) for(let res of entities) for(let d of res.dishes) {
            d.liked = favDishes.includes(d.id)
        }

        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.restaurant }));
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
        const entity = await strapi.services.restaurant.findOne({ id });
        
        if(entity && favDishes) for(let d of entity.dishes) {
            d.liked = favDishes.includes(d.id)
        }
        return sanitizeEntity(entity, { model: strapi.models.restaurant });
    },
};
