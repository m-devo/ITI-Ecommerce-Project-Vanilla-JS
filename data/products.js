import { db } from "../config/firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

export async function fetchAllProducts({
  category = "",
  sort = "",
  search = "",
  lastVisible = null,
  limitPerPage = 8,
}) {
  try {
    const productsCollection = collection(db, "products");
    const queryConstraints = [];

    if (category) {
      queryConstraints.push(where("category", "==", category));
    }

    const usingSearch = Boolean(search && search.trim().length > 0);

    if (usingSearch) {
      const searchTerm = search.toLowerCase();
      queryConstraints.push(where("name_lowercase", ">=", searchTerm));
      queryConstraints.push(where("name_lowercase", "<=", searchTerm + "\uf8ff"));
      queryConstraints.push(orderBy("name_lowercase"));
    } else {
      if (sort === "price-low") {
        queryConstraints.push(orderBy("price", "asc"));
      } else if (sort === "price-high") {
        queryConstraints.push(orderBy("price", "desc"));
      } else if (sort === "rating") {
        queryConstraints.push(orderBy("rating", "desc"));
      }
    }

    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }

    queryConstraints.push(limit(limitPerPage));

    const q = query(productsCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    let products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched products before sort:", products);

    if (usingSearch && sort) {
      products.sort((a, b) => {
        if (sort === "price-high") return (b.price || 0) - (a.price || 0);
        if (sort === "price-low") return (a.price || 0) - (b.price || 0);
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
      console.log("Products after manual sort:", products);
    }

    const newLastVisible =
      querySnapshot.docs.length > 0
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null;

    return { products, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error fetching products: ", error);
    return { products: [], lastVisible: null };
  }
}

export async function fetchFeaturedProducts() {
  console.log("Fetching all products...");

  const productsCollectionRef = collection(db, "products");

  try {
    const featuredQuery = query(
      productsCollectionRef,
      where("isFeatured", "==", true),
      limit(9)
    );

    // featuredQuery.push(limit(9));

    const querySnapshot = await getDocs(featuredQuery);

    const productsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("f p ", productsList);

    return productsList;
  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}

export async function fetchProductById(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);

    console.log(productDoc);

    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product: ", error);
    return null;
  }
}
