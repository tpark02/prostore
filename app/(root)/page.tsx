import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

// import sampleData from "@/db/sample-data";

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HomePage = async () => {
  const latestProducts = await getLatestProducts();

  // await delay(2000);
  console.log(latestProducts);
  return (
    <>
      <ProductList
        data={latestProducts}
        title="Newest Arrtivals"
        limit={4}
      ></ProductList>
    </>
  );
};

export default HomePage;
