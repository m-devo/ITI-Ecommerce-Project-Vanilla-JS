import { db } from '../config/firebase-config.js';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc
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

    // Category and Search filters remain the same
    if (category) {
      queryConstraints.push(where("category", "==", category));
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      queryConstraints.push(where("name_lowercase", ">=", searchTerm));
      queryConstraints.push(where("name_lowercase", "<=", searchTerm + "\uf8ff"));
      queryConstraints.push(orderBy("name_lowercase"));
    } 
    
    if (sort && !search) { 
      if (sort === "price-high") {
        queryConstraints.push(orderBy("price", "desc"));
      }
      if (sort === "price-low") {
        queryConstraints.push(orderBy("price", "asc"));
      }
      if (sort === "rating") {
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

    // If there was a search and a sort, we sort the results here
    if (search && sort) {
      products.sort((a, b) => {
        if (sort === 'price-high') return b.price - a.price;
        if (sort === 'price-low') return a.price - b.price;
        if (sort === 'rating') return b.rating - a.rating;
        return 0;
      });
    }

    const newLastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    return { products, lastVisible: newLastVisible };

  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}



export async function fetchFeaturedProducts() {
  console.log("Fetching all products...");
  
  const productsCollectionRef = collection(db, "products");
  
  try {

    const featuredQuery = query(
      productsCollectionRef,
      where("isFeatured", "==", true) ,
      limit(9),
    );

    // featuredQuery.push(limit(9));

    const querySnapshot = await getDocs(featuredQuery);

    
    const productsList = querySnapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
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
