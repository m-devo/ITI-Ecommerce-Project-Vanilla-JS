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

    // console.log(productsCollection);
    
    const queryConstraints = [];

    if (category) {
      queryConstraints.push(where("category", "==", category));
    }

    // Handle search and sorting logic in a unified way
    if (search) {
      const searchTerm = search.toLowerCase();
      queryConstraints.push(where("name_lowercase", ">=", searchTerm));
      queryConstraints.push(where("name_lowercase", "<=", searchTerm + "\uf8ff"));
      queryConstraints.push(orderBy("name_lowercase")); 

      console.log(`Searching for: ${searchTerm} and ending at: ${searchTerm + "\uf8ff"}` );
    } else if (sort) {

      if (sort === "price-high" ) {
          queryConstraints.push(orderBy("price", "desc"));
      } else if (sort === "price-low") {
          queryConstraints.push(orderBy("price", "asc"));
      } else if (sort === "rating") {
          queryConstraints.push(orderBy("rating", "desc"));
      }
    }


    
    // pagination
    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }
    
    // Limit 8 products per once
    queryConstraints.push(limit(limitPerPage));

    // Construct the final query
    const q = query(productsCollection, ...queryConstraints);
    
    const querySnapshot = await getDocs(q);

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get the last document for the next page's cursor
    const newLastVisible = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    return { products, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("An error occurred while fetching products. You might need to create a Firestore index. Check the console for details.");
    return { products: [], lastVisible: null };
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
    
    return productsList;

  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}

export async function fetchProductById(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);
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
