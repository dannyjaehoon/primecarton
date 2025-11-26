import ProductList from '@/components/shared/product/product-list';
import { getFeaturedProducts, getLastestProducts } from '@/lib/actions/product.actions';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';
import ProductCarousel from '@/components/shared/product/product-carousel';

const Homepage = async () => {
  const latestProduct = await getLastestProducts();
  const featuredProduct = await getFeaturedProducts();

  return (
    <>
      {featuredProduct.length > 0 && <ProductCarousel data={featuredProduct}/>}
      <ProductList data={latestProduct} title='Newest Arrivals' limit={LATEST_PRODUCTS_LIMIT}></ProductList>
    </>
  )
}

export default Homepage;