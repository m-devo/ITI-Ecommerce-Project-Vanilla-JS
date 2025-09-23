import { brandName, paths } from "../config/main.js";


class MainFooter extends HTMLElement {
    connectedCallback() {
        const activeLink = this.getAttribute("active-link") ? this.getAttribute("active-link").toLowerCase() : '';

        const navItemsHTML = paths.map(path => `
            <li class="list-inline-item me-3">
                <a class="nav-link ${activeLink === path.label.toLowerCase() ? "active" : ""}" href="${path.path}">${path.label}</a>
            </li>
        `).join("");

        this.innerHTML = `
            <footer class="bg-dark text-light text-center py-3">
                <div class="container">
                    <div class="row justify-content-between pt-5 align-items-center">
                        <div class="col-12 col-md-4">
                            <h4 class="active">
                            ${brandName}
                            </h4>
                        </div>
                        <div class="col-12 col-md-4">
                            <ul class="list-inline">
                                ${navItemsHTML}
                            </ul>
                        </div>
                        <div class="col-12 col-md-4">
                            <ul class="list-inline">
                                <li class="list-inline-item me-3">
                                    <a class="nav-link" href="#" aria-label="Facebook">
                                        <i class="fa-brands fa-facebook"></i>
                                    </a>
                                </li>
                                <li class="list-inline-item me-3">
                                    <a class="nav-link" href="#" aria-label="Instagram">
                                        <i class="fa-brands fa-instagram"></i>
                                    </a>
                                </li>
                                <li class="list-inline-item me-3">
                                    <a class="nav-link" href="#" aria-label="YouTube">
                                        <i class="fa-brands fa-youtube"></i>
                                    </a>
                                </li>
                                <li class="list-inline-item me-3">
                                    <a class="nav-link" href="#" aria-label="Twitter">
                                        <i class="fa-brands fa-x-twitter"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr>
                    <div>
                        <p>&copy; 2025 <span class="active">${brandName}</span>. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define("main-footer", MainFooter);
