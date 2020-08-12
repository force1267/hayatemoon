'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');


/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

function sanitizeForPublic(res, user) {
    return {
        id: res.id,
        name: res.name,
        offPrice: res.offPrice,
        rate: res.rate,
        type: res.type,
        orking_hour_from: res.orking_hour_from,
        working_hour_to: res.working_hour_to,
        city: res.city,
        neighborhood: res.neighborhood,
        address: res.address,
        least_buy: res.least_buy,
        delivery_time: res.delivery_time,
        covered_area: res.covered_area,
        categories: res.categories,
        images: res.images,
        dishes: res.dishes,
        orders: res.orders.filter(o => o.comment).map(o => ({
            comment: o.comment,
            reply: o.reply,
            user: {
                name: o.user.name
            }
        })),
        rate_bad: res.rate_bad,
        rate_avg: res.rate_avg,
        rate_good: res.rate_good,
        food_quality: res.food_quality,
        // liked: res.liked
    }
}


async function mustOwn(ctx) {

}

// another one !
async function updateCtx(ctx) {
    if(user) {}
    if(admin) {}
}
async function sanitize(ents, ctx) {

}

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
            if(favDishes.includes(d.id)) {
                res.liked = d.liked = true
            } else {
                d.liked = false
            }
        } else for(let res of entities) for(let d of res.dishes) {
            d.liked = false
        }
        for(let res of entities) if(!res.liked) {
            res.liked = false
        }
        entities = entities.map(entity => sanitizeForPublic(entity))
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
        let entity = await strapi.services.restaurant.findOne({ id });
        
        if(entity) if(favDishes) for(let d of entity.dishes) {
            if(favDishes.includes(d.id)) {
                entity.liked = d.liked = true
            } else {
                d.liked = false
            }
        } else for(let d of entity.dishes) {
            d.liked = false
        }
        if(!entity.liked) {
            entity.liked = false
        }
        entity = sanitizeForPublic(entity)
        return sanitizeEntity(entity, { model: strapi.models.restaurant });
    },
};
