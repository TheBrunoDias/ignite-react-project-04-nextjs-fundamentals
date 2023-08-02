import { stripe } from '@/lib/stripe'
import { ImageContainer, ProductContainer, ProductDetails } from '@/styles/pages/product'
import axios from 'axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import Stripe from 'stripe'

interface ProductPageProps {
  product: {
    id: string,
    name: string,
    imageUrl: string,
    price: string,
    description: string,
    defaultPriceId: string
  }
}

export default function Product({ product }: ProductPageProps) {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  async function handlePurchaseProduct() {
    try {
      setIsCheckoutLoading(true);
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId
      });

      const { checkourUrl } = response.data;

      window.location.href = checkourUrl;
    } catch (error) {
      setIsCheckoutLoading(false);
      alert('Falha ao redirecionar ao checkout!');
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product?.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>
        <ProductDetails>
          <h1>{product?.name}</h1>
          <span>{product?.price}</span>

          <p>
            {product?.description}
          </p>

          <button disabled={isCheckoutLoading} onClick={handlePurchaseProduct}>Comprar Agora</button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => {

  return {
    paths: [],
    fallback: false
  }
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params?.id;

  if (!productId) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      }
    }
  }

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((price.unit_amount ?? 0) / 100),
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1 //1 hour
  }
}