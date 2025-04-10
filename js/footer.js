class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <footer class="footer py-5">
                <div class="container">
                    <div class="row">
                        <!-- Colonne 1 : Logo et description -->
                        <div class="col-md-4 col-sm-6 mb-4">
                        <a href="#" id="backToTop" aria-label="Retour en haut de page">
                            <img src="../../public/logo-gite-BLANC.png" alt="Logo Gîte Pim" class="img-fluid mb-3 align-self-start" style="max-width: 50%;">
                        </a>
                             <h6 class="text-uppercase fw-bold text-white mb-3">Contact</h6>
                            <p class="text-white"><i class="bi bi-geo-alt-fill me-2"></i> Îlot Pam, Poum</p>
                            <p class="text-white"><i class="bi bi-telephone-fill me-2"></i> +687 12 34 56</p>
                            <p class="text-white"><i class="bi bi-envelope-fill me-2"></i> contact@gitepim.nc</p>
                            
                        </div>
                        <!-- Colonne 2 : Navigation principale -->
                        <div class="col-md-4 col-sm-6 mb-4">
                            <h6 class="text-uppercase fw-bold text-white mb-3">Navigation</h6>
                            <ul class="list-unstyled">
                                <li><a href="../../index.html" class="text-white text-decoration-none">Accueil</a></li>
                                <li><a href="../chambre/chambre-index.html" class="text-white text-decoration-none">Nos chambres</a></li>
                                <li><a href="../repas/repas-index.html" class="text-white text-decoration-none">Notre restaurant</a></li>
                                
                                <li><a href="./modules/garderie/garderie-index.html" class="text-white text-decoration-none">La garderie</a></li></br></br>
                            </ul>
                       
                      
                            <h6 class="text-uppercase fw-bold text-white mb-3">Activité</h6>
                            <ul class="list-unstyled">
                                <li><a href="../cheval/cheval-index.html" class="text-white text-decoration-none">Randonnée équestre</a></li>
                                <li><a href="../kayak/kayak-index.html" class="text-white text-decoration-none">Sortie en kayak</a></li>
                                <li><a href="../bagne/bagne-index.html" class="text-white text-decoration-none">Visite du bagne</a></li>
                            </ul>
                        </div>
                        <!-- Colonne 3 : Contact et réseaux sociaux -->
                        <div class="col-md-4 col-12 mb-4">
                        <img src="../../public/cartepim.png" alt="lieux Gîte Pim" width="300" class="mb-3">
                           <h6 class="text-uppercase fw-bold text-white mt-4">Suivez-nous</h6>
                            <div>
                                <a href="#" class="text-white me-3"><img src="../../public/facebook.png" alt="Facebook" width="24"></a>
                                <a href="#" class="text-white me-3"><img src="../../public/instagram.png" alt="Instagram" width="24"></a>
                                <a href="#" class="text-white"><img src="../../public/twitter.png" alt="Twitter" width="24"></a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <script>
                document.getElementById('backToTop').addEventListener('click', function(e) {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            </script>
            
        `;
    }
}

customElements.define('pied-de-page', Footer);
