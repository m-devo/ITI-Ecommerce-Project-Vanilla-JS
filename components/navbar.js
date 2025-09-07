import { brandName, paths , homePath } from "../config/main.js";

class MainNavbar extends HTMLElement {
    connectedCallback() {
        const activeLink = this.getAttribute("active-link").toLowerCase();

        const navItemsHTML = paths.map(path => `
            <li class="nav-item">
                <a class="nav-link ${activeLink === path.label.toLowerCase() ? "active" : ""}" href="${path.path}" aria-current="page">
                    ${path.label} ${path.icon || ""}
                </a>
            </li>
        `).join("");


        this.innerHTML = `
            <nav class="navbar navbar-expand-lg bg-transparent fixed-top" role="navigation">
                <div class="container">
                    <a class="navbar-brand active" href="${homePath}">${brandName}</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                            ${navItemsHTML}
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }
}

customElements.define("main-navbar", MainNavbar);
