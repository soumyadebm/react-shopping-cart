import { useState } from 'react';
import formatPrice from 'utils/formatPrice';
import CartProducts from './CartProducts';
import Login from 'components/Login';
import posthog from '../../utils/posthog'; // Add PostHog import
import rudderanalytics from '../../utils/rudderstack';
import { useCart } from 'contexts/cart-context';
import { useAuth } from 'contexts/auth-context';

import * as S from './style';

const Cart = () => {
  const { products, total, isOpen, openCart, closeCart } = useCart();
  const { isAuthenticated, username, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleCheckout = () => {
    if (total.productQuantity) {
      const orderId = `order_${Date.now()}`;

      // Track checkout started with RudderStack
      rudderanalytics.track('Checkout Started', {
        order_id: orderId,
        revenue: total.totalPrice,
        currency: total.currencyId,
        currency_format: total.currencyFormat,
        products: products.map(product => ({
          product_id: product.sku,
          name: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
        total_quantity: total.productQuantity,
        ...(total.installments && { installments: total.installments })
      });

      // Track with PostHog
      posthog.capture('checkout_completed', {
        order_id: orderId,
        revenue: total.totalPrice,
        currency: total.currencyId,
        currency_format: total.currencyFormat,
        products: products.map(product => ({
          product_id: product.sku,
          name: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
        total_quantity: total.productQuantity,
        installments: total.installments || null
      });

      // Track order completed with RudderStack
      rudderanalytics.track('Order Completed', {
        order_id: orderId,
        revenue: total.totalPrice,
        value: total.totalPrice,
        currency: total.currencyId,
        currency_format: total.currencyFormat,
        products: products.map(product => ({
          product_id: product.sku,
          name: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
        total_quantity: total.productQuantity,
        ...(total.installments && { installments: total.installments })
      });

      // Also track individual product purchases
      products.forEach(product => {
        posthog.capture('product_purchased', {
          product_id: product.sku,
          product_name: product.title,
          price: product.price,
          quantity: product.quantity,
          currency: total.currencyId,
          order_id: orderId
        });
      });

      alert(
        `Checkout - Subtotal: ${total.currencyFormat} ${formatPrice(
          total.totalPrice,
          total.currencyId
        )}`
      );
    } else {
      alert('Add some product in the cart!');
    }
  };

  const handleToggleCart = (isOpen: boolean) => () => {
    if (isOpen) {
      rudderanalytics.track('Cart Closed', {
        products: products.map(product => ({
          product_id: product.sku,
          name: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
        total_quantity: total.productQuantity,
        revenue: total.totalPrice,
        currency: total.currencyId,
        currency_format: total.currencyFormat,
      });
      posthog.capture('cart_closed');
      closeCart();
    } else {
      // Track cart viewed with RudderStack
      rudderanalytics.track('Cart Viewed', {
        products: products.map(product => ({
          product_id: product.sku,
          name: product.title,
          price: product.price,
          quantity: product.quantity,
        })),
        total_quantity: total.productQuantity,
        revenue: total.totalPrice,
        currency: total.currencyId,
        currency_format: total.currencyFormat
      });
      
      posthog.capture('cart_opened', {
        products_in_cart: total.productQuantity
      });
      openCart();
    }
  };

  return (
    <>
      <S.Container isOpen={isOpen}>
        <S.CartButton onClick={handleToggleCart(isOpen)}>
          {isOpen ? (
            <span>X</span>
          ) : (
            <S.CartIcon>
              <S.CartQuantity title="Products in cart quantity">
                {total.productQuantity}
              </S.CartQuantity>
            </S.CartIcon>
          )}
        </S.CartButton>
        
        {!isOpen && (
          <S.AuthButtonContainer>
            {isAuthenticated ? (
              <S.LogoutButton onClick={logout} title={`Logged in as ${username}`}>
                <S.UserIcon>👤</S.UserIcon>
                <S.AuthButtonText>{username}</S.AuthButtonText>
                <S.LogoutIcon>↪</S.LogoutIcon>
              </S.LogoutButton>
            ) : (
              <S.LoginButton onClick={() => setIsLoginOpen(true)} title="Login (optional)">
                <S.LoginIcon>🔐</S.LoginIcon>
                <S.AuthButtonText>Login</S.AuthButtonText>
              </S.LoginButton>
            )}
          </S.AuthButtonContainer>
        )}

      {isOpen && (
        <S.CartContent>
          <S.CartContentHeader>
            <S.CartIcon large>
              <S.CartQuantity>{total.productQuantity}</S.CartQuantity>
            </S.CartIcon>
            <S.HeaderTitle>Cart</S.HeaderTitle>
          </S.CartContentHeader>

          <CartProducts products={products} />

          <S.CartFooter>
            <S.Sub>SUBTOTAL</S.Sub>
            <S.SubPrice>
              <S.SubPriceValue>{`${total.currencyFormat} ${formatPrice(
                total.totalPrice,
                total.currencyId
              )}`}</S.SubPriceValue>
              <S.SubPriceInstallment>
                {total.installments ? (
                  <span>
                    {`OR UP TO ${total.installments} x ${
                      total.currencyFormat
                    } ${formatPrice(
                      total.totalPrice / total.installments,
                      total.currencyId
                    )}`}
                  </span>
                ) : null}
              </S.SubPriceInstallment>
            </S.SubPrice>
            <S.CheckoutButton onClick={handleCheckout} autoFocus>
              Checkout
            </S.CheckoutButton>
          </S.CartFooter>
        </S.CartContent>
      )}
    </S.Container>
    <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Cart;