import { KeyboardEvent } from 'react';
import formatPrice from 'utils/formatPrice';
import { IProduct } from 'models';
import { useCart } from 'contexts/cart-context';
import * as S from './style';
import rudderanalytics from '../../../utils/rudderstack';

interface IProps {
  product: IProduct;
}

const Product = ({ product }: IProps) => {
  const { openCart, addProduct } = useCart();
  const {
    sku,
    title,
    price,
    installments,
    currencyId,
    currencyFormat,
    isFreeShipping,
  } = product;

  const formattedPrice = formatPrice(price, currencyId);
  let productInstallment;

  if (installments) {
    const installmentPrice = price / installments;

    productInstallment = (
      <S.Installment>
        <span>or {installments} x</span>
        <b>
          {currencyFormat}
          {formatPrice(installmentPrice, currencyId)}
        </b>
      </S.Installment>
    );
  }

  const handleProductClick = () => {
    // Track product viewed when clicked
    rudderanalytics.track('Product Viewed', {
      product_id: sku,
      name: title,
      price: price,
      currency: currencyId,
      currency_format: currencyFormat,
      has_free_shipping: isFreeShipping
    });

    // Track product click
    rudderanalytics.track('Product Clicked', {
      product_id: sku,
      name: title,
      price: price,
      currency: currencyId,
      currency_format: currencyFormat,
      has_free_shipping: isFreeShipping
    });
  };

  const handleAddProduct = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent product click event from firing

    rudderanalytics.track('Product Added', {
      product_id: sku,
      name: title,
      price: price,
      currency: currencyId,
      currency_format: currencyFormat,
      quantity: 1,
      has_free_shipping: isFreeShipping,
      input_method: 'mouse'
    });

    addProduct({ ...product, quantity: 1 });
    openCart();
  };

  const handleAddProductWhenEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.code === 'Space') {
      rudderanalytics.track('Product Added', {
        product_id: sku,
        name: title,
        price: price,
        currency: currencyId,
        currency_format: currencyFormat,
        quantity: 1,
        has_free_shipping: isFreeShipping,
        input_method: 'keyboard'
      });

      addProduct({ ...product, quantity: 1 });
      openCart();
    }
  };

  return (
    <S.Container onKeyUp={handleAddProductWhenEnter} onClick={handleProductClick} sku={sku} tabIndex={1}>
      {isFreeShipping && <S.Stopper>Free shipping</S.Stopper>}
      <S.Image alt={title} />
      <S.Title>{title}</S.Title>
      <S.Price>
        <S.Val>
          <small>{currencyFormat}</small>
          <b>{formattedPrice.substring(0, formattedPrice.length - 3)}</b>
          <span>{formattedPrice.substring(formattedPrice.length - 3)}</span>
        </S.Val>
        {productInstallment}
      </S.Price>
      <S.BuyButton onClick={handleAddProduct} tabIndex={-1}>
        Add to cart
      </S.BuyButton>
    </S.Container>
  );
};

export default Product;
