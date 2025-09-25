// StripeButton.jsx
import React from "react";
// Instala Stripe en tu proyecto: npm install @stripe/stripe-js
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"); // Reemplaza por tu clave pública

const StripeButton = ({ membresiaId, email, nombre }) => {
  const handleClick = async () => {
    const stripe = await stripePromise;
    const response = await fetch("http://127.0.0.1:8000/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ membresia_id: membresiaId, email }),
    });
    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <button className="feature-btn" onClick={handleClick}>
      Pagar {nombre} con Stripe
    </button>
  );
};

export default StripeButton;
