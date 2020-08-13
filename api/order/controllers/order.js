'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async order(ctx) {
        let userId = ctx.state.user && ctx.state.user.id
        if(!userId) return ctx.unauthorized("you can't order")

        let { dish: dishId, number } = ctx.request.body
        dish = parseInt(dish)
        number = parseInt(number)
        if(!dishId) return ctx.badRequest("send { dish: dishId }")
        let dish = await strapi.services.dish.findOne({ id: dishId }, ["restaurant"])
        if(!dish) return ctx.badRequest("dish does not exist")
        
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
    }
};
