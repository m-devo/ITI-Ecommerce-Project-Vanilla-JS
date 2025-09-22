import { getOrderById } from "../../data/orders.js"; 

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

if (orderId) {
    const order = await getOrderById(orderId);

    order.products.forEach(product => {
        const productHtml = `
                    <div class="card-header bg-white py-3">
                        <h5 class="mb-0">Items</h5>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2"">
                            <a href="../product-details/product-details.html?id=${product.id}">
                                <img src="${product.image}" alt="..." class="img-fluid">
                            </a>
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-1">Ergonomic Optical Mouse</h6>
                            </div>
                            <div class="col-md-2 text-md-center">
                                <p class="mb-0">Qty: ${product.quantity}</p>
                            </div>
                            <div class="col-md-2 text-md-end">
                                <p class="fw-bold mb-0">$${product.price}</p>
                            </div>
                        </div>
                        <hr class="my-3">
                    </div>
        `;

        const productDiv = document.createElement('div');
        productDiv.innerHTML = productHtml;
        document.querySelector('.card-container').appendChild(productDiv);
    });


    document.querySelector('.address').textContent = order.address;
    document.querySelector('.payment').textContent = order.payment_method;
    document.querySelector('.order-number').textContent = "Order Number: " + order.id;
    document.querySelector('.order-date').textContent = "Order Date: " + new Date(order.date).toLocaleDateString();
    document.querySelector('.order-total').textContent = "$" + order.total;
    document.querySelector('.order-subtotal').textContent = "$" + (order.total - 50).toFixed(2);
    document.querySelector('.order-status').textContent = order.status


    console.log(order);
} else {
    window.location.href = "./orders.html";
}