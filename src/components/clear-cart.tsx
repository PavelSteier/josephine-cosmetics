"use client";

import { useEffect } from "react";
import { useCart } from "./cart";

/** Empties the cart once the order page for a freshly placed order is shown. */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
