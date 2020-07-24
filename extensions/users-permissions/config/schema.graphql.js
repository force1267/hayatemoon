module.exports = {
  definition: `
    extend type UsersPermissionsMe {
      name: String
      family: String
      phone: String
      balance: Int
      address: [ComponentAddressItem]
      advertises(sort: String, limit: Int, start: Int, where: JSON): [Advertise]
      orders(sort: String, limit: Int, start: Int, where: JSON): [Order]
      boosts(sort: String, limit: Int, start: Int, where: JSON): [Boost]
      favoriteDishes(sort: String, limit: Int, start: Int, where: JSON): [Dish]
      payments(sort: String, limit: Int, start: Int, where: JSON): [Payment]
    }`,
};
