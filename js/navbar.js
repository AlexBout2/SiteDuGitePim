class NavBar extends HTMLElement {
  constructor() { super(); }
  connectedCallback() {
    this.innerHTML = `
<nav class="navbar navbar-dark navbar-expand-lg bg-dark" aria-label="Navigation principale" role="navigation">
  <div class="container-fluid">
    <a class="navbar-brand" href="../../index.html">
      <img
        src="../../public/logo-gite-BLANC.png"
        alt="Accueil"
        width="160"
        height="60"
        class="d-inline-block align-text-top"
        title="Accueil"s
      />
    </a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a
            class="nav-link text-white"
            href="../chambre/chambre-index.html"
            >Nos chambres</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link text-white" href="../repas/repas-index.html"
            >Notre restaurant</a
          >
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white"
            href="../cheval/cheval-index.html"
            >Randonnée équestre</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link text-white" href="../kayak/kayak-index.html"
            >Sortie en kayak</a
          >
        </li>
        <li class="nav-item">
          <a class="nav-link text-white" href="../bagne/bagne-index.html"
            >Visite du bagne</a
          >
        </li>
        <li class="nav-item">
          <a
            class="nav-link text-white"
            href="../garderie/garderie-index.html"
            >La garderie</a
          >
        </li>
      </ul>
    </div>
  </div>
</nav>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
`;

  }
}

customElements.define('menu-top', NavBar);
