import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getUserOrders } from '../../data/orders.js';

const auth = getAuth();

let allUserOrders = [];

const ordersContainer = document.getElementById('orders-container');
const noOrdersMessage = document.getElementById('no-orders-message');
const filterGroup = document.getElementById('filter-group');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await getAndRenderInitialOrders(user.uid);
    } else {
        window.location.href = "../auth/login.html";
    }
});

async function getAndRenderInitialOrders(userId) {
    if (!userId) {
        console.error("Cannot get orders without a userId.");
        return;
    }
    
    ordersContainer.innerHTML = '<p class="text-center">Loading your orders...</p>';
    noOrdersMessage.classList.add('d-none');

    allUserOrders = await getUserOrders(userId);

    renderOrders('all');
}


const renderOrders = (filter = 'all') => {
    ordersContainer.innerHTML = '';

    const filteredOrders = allUserOrders.filter(order => {
        if (filter === 'all') return true;
        return order.status && order.status.toLowerCase() === filter;
    });

    if (filteredOrders.length === 0) {
        noOrdersMessage.classList.remove('d-none');
    } else {
        noOrdersMessage.classList.add('d-none');
    }

    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center">No orders found.</p>';
        return;
    }

    filteredOrders.forEach(order => {
        const orderCardHtml = `
            <div class="card shadow-sm mb-3">
                <div class="card-body">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                        <div>
                            <h6 class="fw-bold mb-1">Order #${order.id}</h6>
                            <small class="text-muted d-block">Placed on ${new Date(order.date).toLocaleDateString()}</small>
                            <small class="text-muted">Total: $${order.total}</small>
                        </div>
                        <div class="d-flex align-items-center mt-3 mt-md-0">
                            <span class="badge ${getStatusClass(order.status || 'pending')} p-2 me-3">${order.status || 'Pending'}</span>
                            <a href="order-details.html?id=${order.id}" class="btn btn-outline-primary btn-sm stretched-link">View Details</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        ordersContainer.innerHTML += orderCardHtml;
    });
};



const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
        case 'delivered': return 'bg-success';
        case 'shipped': return 'bg-info';
        case 'pending': return 'bg-warning text-dark';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
};


filterGroup.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        filterGroup.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        const filterValue = e.target.id.replace('filter-', '');
        
        renderOrders(filterValue);
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
        const alertPlaceholder = document.getElementById('payment-success-alert');
        if (alertPlaceholder) {
            alertPlaceholder.classList.remove('d-none');
            setTimeout(() => {
                alertPlaceholder.classList.add('d-none');
            }, 5000); 
        }
    }
});