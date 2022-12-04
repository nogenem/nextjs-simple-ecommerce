import { type NextPage } from 'next';
import Head from 'next/head';

import { trpc } from '~/shared/utils/trpc';

const Home: NextPage = () => {
  const hello = trpc.example.hello.useQuery({ text: 'from tRPC' });

  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{hello.data?.greeting}</main>
    </>
  );
};

export default Home;
