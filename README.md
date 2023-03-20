<h1 align="center">
  Simple Ecommerce
</h1>
<h4 align="center">
  Just a simple project to learn a bit about the <a href="https://create.t3.gg/">T3-Stack</a>, <a href="https://nextjs.org/">NextJS</a>, <a href="https://stripe.com/">Stripe</a> and <a href="https://www.paypal.com/">Paypal</a>.
</h4>

# Requirements

- [NodeJS](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
  - Here you could install mysql locally on your machine, use docker or even use an online option, like the one i'm using from [PlanetScale](https://planetscale.com/)
- [Yarn](https://yarnpkg.com/) (optional)

# How to run the project for development

1. Make sure you have fulfilled all requirements
2. Clone the repository:

```shell
git clone https://github.com/nogenem/nextjs-simple-ecommerce.git
```

3. Install all dependencies

```shell
cd nextjs-simple-ecommerce
yarn install
```

4. Make a copy of the file `.env.example` and rename it to `.env`

```shell
cp .env.example .env
```

5. Edit the content of the `.env`

- `DATABASE_URL`: comes from mysql.
  - If you are going to use [PlanetScale](https://planetscale.com/), go to their website, create an account and a database. Now you can get the online url from the website or you can run the database locally using their [CLI](https://planetscale.com/features/cli).
- `NEXTAUTH_SECRET`: generate a random string to put here.
- `GOOGLE_ID` and `GOOGLE_SECRET`: Follow some tutorial to get these values from Google.
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` = `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`: Follow some tutorial to get these values from Paypal.
- `NEXT_PUBLIC_STRIPE_PUBLIC` = `STRIPE_PUBLIC` and `STRIPE_SECRET`: Follow some tutorial to get these values from Stripe.

6. Run the following commands to setup the prisma database

```shell
yarn dev:pscale:connect # Terminal tab 1, if you are using planetscale' CLI to run the database locally
# Terminal tab 2 \/
yarn prisma:push
yarn prisma:seed
```

7. Run the following commands to start the project

```shell
yarn dev:pscale:connect # Terminal tab 1, if you are using planetscale' CLI to run the database locally
yarn prisma:studio # Terminal tab 2, if you want to access the prisma' database UI
yarn dev # Terminal tab 3
```

# Some images of the project

### Dark home page

![image](https://user-images.githubusercontent.com/2437497/226357252-d78b5b4d-6cac-4869-8b1c-893189f3d020.png)

### Light home page

![image](https://user-images.githubusercontent.com/2437497/226357293-c778bb06-dc69-44d4-a239-4dff3bcdd1dc.png)

### Product page

![image](https://user-images.githubusercontent.com/2437497/226357354-9e276127-ee94-4b83-8ac4-ff8cff735129.png)

### Cart page

![image](https://user-images.githubusercontent.com/2437497/226357400-44e94960-ceaa-4f2d-a34e-e762a06f1a46.png)

### Place your order page

![image](https://user-images.githubusercontent.com/2437497/226357478-8ad11bf6-783a-4f57-94c1-ca4d2ee7809f.png)

### Order page

![image](https://user-images.githubusercontent.com/2437497/226357533-0f577c53-804a-4962-8997-eac2ac0074c1.png)

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
