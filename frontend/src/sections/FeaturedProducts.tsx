import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
};

const products: Product[] = [
  {
    id: 1,
    name: "Product Example One",
    category: "Pharmacy",
    price: "₦0.00",
    image: "",
    rating: 5,
    reviews: 0,
    available: true,
  },
  {
    id: 2,
    name: "Product Example Two",
    category: "Wellness",
    price: "₦0.00",
    image: "",
    rating: 5,
    reviews: 0,
    available: true,
  },
  {
    id: 3,
    name: "Product Example Three",
    category: "Personal Care",
    price: "₦0.00",
    image: "",
    rating: 5,
    reviews: 0,
    available: true,
  },
  {
    id: 4,
    name: "Product Example Four",
    category: "Healthcare",
    price: "₦0.00",
    image: "",
    rating: 5,
    reviews: 0,
    available: true,
  },
];

function FeaturedProducts() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-700">
              Featured Products
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pharmacy Products for Your Everyday Needs
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Browse our product collection and discover convenient access to
              pharmacy, wellness, personal care, and healthcare products.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-green-700 transition hover:text-green-900"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
            >
              {/* PRODUCT IMAGE */}
              <Link
                to={`/products/${product.id}`}
                className="relative block aspect-square overflow-hidden bg-slate-100"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-slate-100 p-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-700 text-3xl font-bold text-white shadow-lg">
                      P
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Product image
                    </p>
                  </div>
                )}

                {/* AVAILABILITY BADGE */}
                <div className="absolute left-4 top-4">
                  {product.available ? (
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                      Available
                    </span>
                  ) : (
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm">
                      Unavailable
                    </span>
                  )}
                </div>
              </Link>

              {/* PRODUCT DETAILS */}
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  {product.category}
                </p>

                <Link to={`/products/${product.id}`}>
                  <h3 className="mt-2 line-clamp-2 min-h-[52px] text-lg font-bold text-slate-900 transition hover:text-green-700">
                    {product.name}
                  </h3>
                </Link>

                {/* RATING */}
                <div className="mt-3 flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={15}
                        className={
                          index < product.rating
                            ? "fill-current text-yellow-500"
                            : "text-slate-300"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-xs text-slate-500">
                    ({product.reviews})
                  </span>
                </div>

                {/* PRICE */}
                <div className="mt-4">
                  <span className="text-xl font-bold text-slate-900">
                    {product.price}
                  </span>
                </div>

                {/* ACTION */}
                <button
                  disabled={!product.available}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-green-700 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
          >
            Browse Full Product Catalog
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
