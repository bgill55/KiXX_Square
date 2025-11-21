// Netlify Function for Creating Stripe Checkout Session
// This file handles creating secure payment sessions with Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { items, successUrl, cancelUrl } = JSON.parse(event.body);

    // Validate the items
    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No items provided' })
      };
    }

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image ? `${process.env.URL}/${item.image}` : undefined].filter(Boolean),
          description: 'The all-in-one layout tool engineered for professional carpenters',
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.URL}/cart.html`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Add more countries as needed
      },
      metadata: {
        order_type: 'kixx_square',
        // Add any other metadata you want to track
      },
    });

    // Return the session ID to the frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust in production
      },
      body: JSON.stringify({ id: session.id }),
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        message: error.message 
      }),
    };
  }
};
