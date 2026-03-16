import { useEffect } from 'react';
import posthog from '../../utils/posthog'; // Add this import
import rudderanalytics from '../../utils/rudderstack';

import Loader from 'components/Loader';
import { GithubCorner, GithubStarButton } from 'components/Github';
import Filter from 'components/Filter';
import Products from 'components/Products';
import Cart from 'components/Cart';

import { useProducts } from 'contexts/products-context';

import * as S from './style';

function App() {
  const { isFetching, products, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Track page view on app mount
  useEffect(() => {
    rudderanalytics.page('Home');
  }, []);

  // Track page views and user sessions
  useEffect(() => {
    // Identify user session (you can add user ID if you have authentication)
    posthog.capture('app_loaded', {
      products_count: products?.length || 0,
    });
  }, [products]);

  return (
    <S.Container>
      {isFetching && <Loader />}
      <GithubCorner />
      <S.TwoColumnGrid>
        <S.Side>
          <Filter />
          <GithubStarButton />
        </S.Side>
        <S.Main>
          <S.MainHeader>
            <p>{products?.length} Product(s) found</p>
          </S.MainHeader>
          <Products products={products} />
        </S.Main>
      </S.TwoColumnGrid>
      <Cart />
    </S.Container>
  );
}

export default App;
