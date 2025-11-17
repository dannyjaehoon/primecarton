import ProductList from '@/components/shared/product/product-list';
import { getLastestProducts } from '@/lib/actions/product.actions';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';

const Homepage = async () => {
  const latestProudct = await getLastestProducts();

  return (
    <>
      <ProductList data={latestProudct} title='Newest Arrivals' limit={LATEST_PRODUCTS_LIMIT}></ProductList>
    </>
  )
}

export default Homepage;