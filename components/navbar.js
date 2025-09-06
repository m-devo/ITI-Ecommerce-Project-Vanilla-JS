class MainNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg bg-transparent fixed-top" role="navigation">
                <div class="container">
                    <a class="navbar-brand" href="#">eCommerce</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <a class="nav-link active" aria-current="page" href="#">Shop</a>
                        </li>
                        <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">About</a>
                        </li>
                        <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Contact</a>
                        </li>
                        <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Cart <i class="fas fa-shopping-cart"></i></a>
                        </li>
                    </ul>
                    </div>
                </div>
            </nav>
        `;
    }
}

customElements.define("main-navbar", MainNavbar);
