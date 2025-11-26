import ProductList from '@/components/shared/product/product-list';
import { getFeaturedProducts, getLastestProducts } from '@/lib/actions/product.actions';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';
import ProductCarousel from '@/components/shared/product/product-carousel';
import IconBoxes from '@/components/shared/homepage/icon-boxes';
import ViewAllProductsButton from '@/components/shared/homepage/view-all-products-button';
import DealCountdown from '@/components/shared/homepage/deal-countdown';

const Homepage = async () => {
  const latestProduct = await getLastestProducts();
  const featuredProduct = await getFeaturedProducts();

  return (
    <>
      {featuredProduct.length > 0 && <ProductCarousel data={featuredProduct}/>}
      <ProductList data={latestProduct} title='Newest Arrivals' limit={LATEST_PRODUCTS_LIMIT}></ProductList>
      <ViewAllProductsButton/>
      <IconBoxes/>
      <DealCountdown/>
    </>
  )
}

export default Homepage;