# Simple Ecommerce

Just a simple project to learn a bit about the `t3-stack`, `NextJs`, `Stripe` and `Paypal`.

[Some images of the project.](https://imgur.com/a/rVZNH2O)

## Start dev commands

```shell
yarn dev:pscale:connect
yarn prisma:studio #optional
yarn dev
```

# TODO/MAYBE LIST:

- [x] Merge the guest and logged in user' cart on login !?

- [x] Add a text to the product page informing the user if they already have 1 or more of that product in the cart

- [x] Show to the user when a variant is out of stock/is not available anymore !? Or just filter all those cases out !?

- [x] Add debound to the min/max price inputs in /?

- [x] Add some sorting options to the home page

- [x] Add a search input to the home page and/or the navbar

- [ ] Add the variants' colors to the ProductCard !?

- [ ] Try to lower the amount of data on first load of the home page !?

- [ ] Use pagination/infinite loading on the home page and on the orders page !?

- [ ] Add tests to the project

- [ ] Handle the shipping addresses better !?

  - Allow used to save and edit them;
  - That can be a problem cause the user shouldn't be allowed to do that on addresses that are on orders already paid;

- [ ] Handle the product stock better !?

  - [There should be a table with the stock and we should lock the products when a user put them on their carts](https://stackoverflow.com/a/17483270);
  - The problem here is that we should release that "lock" after X minutes/hours/days if the user doesn't finish the purchage;
  - This could make getting the amount of items left in stock more... annoying;

- [ ] Add other forms of login, like with other OAuth options and a local option !?

- [ ] Add an Admin section for the site to allow the management of products, orders and so on and to show stats/graphs of sells
