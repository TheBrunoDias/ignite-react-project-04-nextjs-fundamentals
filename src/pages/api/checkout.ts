import { stripe } from "@/lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { priceId } = req.body;

  if(req.method !== 'POST'){
    return res.status(405).json({error: 'Method not allowed.'});
  }

  if (!priceId) {
    return res.status(400).json({ error: 'Price not found.' });
  }

  const SUCCESS_URL = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`
  const CANCEL_URL = `${process.env.NEXT_URL}/`

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    success_url: SUCCESS_URL,
    cancel_url: CANCEL_URL,
  })

  return res.status(201).json({
    checkourUrl: checkoutSession.url
  })

}

