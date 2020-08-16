'use strict';

const { sanitizeEntity } = require('strapi-utils');
const { userOf } = require('../../is')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async order(ctx) {
        let userId = ctx.state.user && ctx.state.user.id
        if(!userId) return ctx.unauthorized("you can't order")

        let { dish: dishId, number } = ctx.request.body
        dishId = parseInt(dishId)
        number = parseInt(number)
        if(!dishId) return ctx.badRequest("send { dish: dishId }")
        let dish = await strapi.services.dish.findOne({ id: dishId }, ["restaurant"])
        if(!dish || !dish.restaurant) return ctx.badRequest("dish does not exist")
        
        let cart = await strapi.services.order.findOne({ user: userId, state: "incart" })
        if(!cart) {
            cart = await strapi.services.order.create({ user: userId, state: "incart", restaurant: dish.restaurant.id })
        } else if(cart.restaurant.id !== dish.restaurant.id) {
            cart.restaurant = dish.restaurant
            if(number > 0) {
                cart.dish = [{ dish, number }]
            } else {
                cart.dish = []
            }
        } else {
            cart.dish = cart.dish.filter(d => d.dish && d.dish.id !== dishId)
            if(number > 0) {
                cart.dish.push({ dish, number })
            }
        }

        let price = 0
        for(let dish of cart.dish) {
            price += (dish.number * dish.dish.price)
        }
        cart.price = price
        cart = await strapi.services.order.update({ id: cart.id }, cart)
        
        return cart
    },
    async finish(ctx) {
        let userId = ctx.state.user && ctx.state.user.id
        if(!userId) return ctx.unauthorized("you can't order")

        let cart = await strapi.services.order.findOne({ user: userId, state: "incart" })
        if(!cart) return ctx.badRequest("your cart is empty")

        if(cart.price > ctx.state.user.balance) return ctx.badRequest("your balance is low")

        let balance = ctx.state.user.balance
        let price = cart.price

        try {
            await strapi.query('user', 'users-permissions').update({ id: userId }, { balance: balance - price })
        } catch (e) {
            await strapi.query('user', 'users-permissions').update({ id: userId }, { balance })
            return ctx.internalError("server error")
        }

        try {
            await strapi.services.order.update({ id: cart.id }, { state: "pending" })
        } catch (e) {
            await strapi.services.order.update({ id: cart.id }, { state: "incart" })
            await strapi.query('user', 'users-permissions').update({ id: userId }, { balance })
            return ctx.internalError("server error")
        }
    },

    async find(ctx) {
        let user = await userOf(ctx)
        if(user.role.name === "panel") {
            if(!ctx.query.restaurant) {
                return ctx.badRequest('add field `restaurant`')
            }
            let resq = {
                _where: {
                    id: ctx.query.restaurant.id || ctx.query.restaurant,
                    _or: [
                        { owner: user.id },
                        { admins_contains: user.id }
                    ]
                }
            }
            let restaurant = await strapi.services.restaurant.findOne(resq)
            if(!restaurant) return ctx.unauthorized('not your restaurant')
        } else {
            ctx.query.user = user.id
        }

        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.order.search(ctx.query);
        } else {
            entities = await strapi.services.order.find(ctx.query);
        }
    
        return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.order }));
    },

    async findOne(ctx) {
        const { id } = ctx.params
        const order = await strapi.services.order.findOne({ id },[
            "restaurant",
            "restaurant.owner",
            "restaurant.admins",
            "user",
        ])
        if(!order) return order

        let user = await userOf(ctx)
        if(user.role.name === "panel") {
            if(!order.restaurant) {
                return ctx.badRequest('order does not have `restaurant`')
            }
            
            if((order.restaurant.owner && order.restaurant.owner.id != user.id) &&
            !order.restaurant.admins.filter(a => a.id).includes(user.id)) {
                return ctx.unauthorized('not your restaurant')
            }
        } else {
            delete order.restaurant.owner
            delete order.restaurant.admins
        }

        return sanitizeEntity(order, { model: strapi.models.order });
    },

    async update(ctx) {
        const { id } = ctx.params;
        const order = await strapi.services.order.findOne({ id },[
            "restaurant",
            "restaurant.owner",
            "restaurant.admins",
            "user",
        ])
        if(!order) return order

        let user = await userOf(ctx)
        let data;
        if(user.role.name === "panel") {
            if(!order.restaurant) {
                return ctx.badRequest('order does not have `restaurant`')
            }
            
            if((order.restaurant.owner && order.restaurant.owner.id != user.id) &&
            !order.restaurant.admins.filter(a => a.id).includes(user.id)) {
                return ctx.unauthorized('not your restaurant')
            }
            
            let { reply, state } = ctx.request.body
            if(state && state != "incart") {
                data = { state }
            } else if(reply && order.comment) {
                data = { reply }
            } else {
                return ctx.unauthorized("admins can't change order's details")
            }
        } else {
            let {
                dish,
                address,
                comment,
                rate, restaurantRate, foodRate, experience
            } = ctx.request.body
            if(order.state == "incart") {
                data = {}
                if(dish) data.dish = dish
                if(address) data.address = address
            } else if(order.state == "delivered" &&
            new Date(order.updated_at) + (24 * 60 * 60 * 1000) > new Date().getTime()) {
                data = {
                    comment,
                    rate,
                    restaurantRate,
                    foodRate,
                    experience
                }
            } else {
                return ctx.unauthorized("you can't change a placed order")
            }
        }
        
        let entity;
        entity = await strapi.services.restaurant.update({ id }, data)
        
        return sanitizeEntity(entity, { model: strapi.models.restaurant })
    },
}
