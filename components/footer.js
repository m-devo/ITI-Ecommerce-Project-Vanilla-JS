class MainFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="bg-light text-center py-3">
            <div class="row justify-between pt-5 align-items-center">
                <div class="col col-md-4">
                    <h4>eCommerce</h4>
                </div>
                <div class="col col-md-4">
                    <ul class="list-inline">
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#">Shop</a>
                        </li>
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#">About</a>
                        </li>
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#">Contact</a>
                        </li>
                    </ul>
                </div>
                <div class="col col-md-4">
                    <ul class="list-inline">
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#"><i class="fa-brands fa-facebook"></i></a>
                        </li>
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#"><i class="fa-brands fa-instagram"></i></a>
                        </li>
                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#"><i class="fa-brands fa-youtube"></i></a>

                        <li class="list-inline-item me-3">
                        <a class="nav-link active" aria-current="page" href="#"><i class="fa-brands fa-x-twitter"></i></a>
                        </li>
                    </ul>
                </div>
            </div>
            <hr>
            <div>
                <p>&copy; 2025 eCommerce. All rights reserved.</p>
            </div>
        </footer>
        `;
    }
}

customElements.define("main-footer", MainFooter);
