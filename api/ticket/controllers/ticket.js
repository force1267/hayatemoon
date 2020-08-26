'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils')
const { userOf } = require('../../is')

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async send(ctx) {
        /* body = {
            ticket: undefined | ticket.id
            message: string
        }
        if ticket was present, send a message to that ticket.
        else create a new ticket and send message to that ticket. */
        let user = ctx.state.user
        let { ticket, message } = ctx.request.body
        if(!ticket) {
            ticket = await strapi.services.ticket.create({ user: user.id, closed: false })
        }
        let isFromSupport = user.roles && user.roles[0].code === 'strapi-super-admin'
        let entity = await strapi.services['ticket-message'].create({ ticket, message, isFromSupport });
        return sanitizeEntity(entity, { model: strapi.models.restaurant });
    },
};
