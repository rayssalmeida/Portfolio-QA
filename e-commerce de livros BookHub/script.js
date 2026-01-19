// Dados mockados
const books = [
    {
        id: 1,
        title: "O Programador Pragmático",
        author: "Andrew Hunt",
        price: 89.90,
        genre: "tecnologia",
        image: "https://via.placeholder.com/200x250/4a90e2/ffffff?text=Livro+1"
    },
    {
        id: 2,
        title: "Dom Casmurro",
        author: "Machado de Assis",
        price: 39.90,
        genre: "ficcao",
        image: "https://via.placeholder.com/200x250/ff6b6b/ffffff?text=Livro+2"
    },
    {
        id: 3,
        title: "Steve Jobs",
        author: "Walter Isaacson",
        price: 59.90,
        genre: "biografia",
        image: "https://via.placeholder.com/200x250/4CAF50/ffffff?text=Livro+3"
    },
    {
        id: 4,
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 99.90,
        genre: "tecnologia",
        image: "https://via.placeholder.com/200x250/FFC107/333333?text=Livro+4"
    },
    {
        id: 5,
        title: "A Metamorfose",
        author: "Franz Kafka",
        price: 29.90,
        genre: "ficcao",
        image: "https://via.placeholder.com/200x250/9C27B0/ffffff?text=Livro+5"
    }
];

// Bug 24: Carrinho salvo localmente sem validação
let cart = JSON.parse(localStorage.getItem('bookhub-cart')) || [];
let currentPage = 1;
const booksPerPage = 4;

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginLink = document.getElementById('loginLink');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const cartLink = document.getElementById('cartLink');
const cartSidebar = document.getElementById('cartSidebar');
const cartCount = document.getElementById('cartCount');
const catalogBooks = document.getElementById('catalogBooks');
const featuredBooks = document.getElementById('featuredBooks');
const genreFilter = document.getElementById('genreFilter');
const maxPrice = document.getElementById('maxPrice');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Bug 25: Event listeners duplicados potencialmente
function initializeApp() {
    renderFeaturedBooks();
    renderCatalog();
    updateCartCount();
    
    // Event Listeners
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('hidden');
    });
    
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });
    
    // Bug 26: Modal não fecha clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });
    
    loginForm.addEventListener('submit', handleLogin);
    
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        cartSidebar.classList.toggle('hidden');
        renderCart();
    });
    
    genreFilter.addEventListener('change', renderCatalog);
    maxPrice.addEventListener('input', renderCatalog);
    prevPage.addEventListener('click', goToPrevPage);
    nextPage.addEventListener('click', goToNextPage);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Bug 27: Checkout não implementado
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        alert('Funcionalidade de checkout não implementada');
    });
}

function renderFeaturedBooks() {
    featuredBooks.innerHTML = '';
    const featured = books.slice(0, 3);
    
    featured.forEach(book => {
        const bookElement = createBookElement(book);
        featuredBooks.appendChild(bookElement);
    });
}

function renderCatalog() {
    catalogBooks.innerHTML = '';
    
    const selectedGenre = genreFilter.value;
    const priceLimit = parseFloat(maxPrice.value) || 100;
    
    let filteredBooks = books.filter(book => {
        const genreMatch = !selectedGenre || book.genre === selectedGenre;
        const priceMatch = book.price <= priceLimit;
        return genreMatch && priceMatch;
    });
    
    // Bug 28: Paginação quebrada - não considera booksPerPage
    const startIndex = (currentPage - 1) * booksPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);
    
    if (paginatedBooks.length === 0) {
        catalogBooks.innerHTML = '<p class="no-results">Nenhum livro encontrado</p>';
        return;
    }
    
    paginatedBooks.forEach(book => {
        const bookElement = createBookElement(book);
        catalogBooks.appendChild(bookElement);
    });
    
    updatePagination(filteredBooks.length);
}

function createBookElement(book) {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <div class="book-info">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <p class="book-price">R$ ${book.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${book.id}">
                Adicionar ao Carrinho
            </button>
        </div>
    `;
    
    // Bug 29: Event listener adicionado múltiplas vezes
    div.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(book);
    });
    
    return div;
}

// Bug 30: Função addToCart não valida itens duplicados
function addToCart(book) {
    cart.push({...book, quantity: 1});
    localStorage.setItem('bookhub-cart', JSON.stringify(cart));
    updateCartCount();
    
    // Bug 31: Notificação temporária que some muito rápido
    showNotification(`${book.title} adicionado ao carrinho!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p>R$ ${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div>
                <p>R$ ${itemTotal.toFixed(2)}</p>
                <button class="remove-item" data-index="${index}">×</button>
            </div>
        `;
        
        cartItems.appendChild(div);
    });
    
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    
    // Bug 32: Event listeners de remover item não são removidos
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
        });
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('bookhub-cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Bug 33: Validação de email muito básica
    if (!email.includes('@')) {
        showError('Email inválido');
        return;
    }
    
    // Bug 34: Senha aceita qualquer valor
    if (password.length < 1) {
        showError('Senha é obrigatória');
        return;
    }
    
    // Simulação de login bem-sucedido
    errorElement.classList.add('hidden');
    alert('Login realizado com sucesso!');
    loginModal.classList.add('hidden');
    loginForm.reset();
    
    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function handleSearch() {
    const query = searchInput.value.toLowerCase();
    
    if (!query.trim()) {
        renderCatalog();
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
    );
    
    catalogBooks.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        catalogBooks.innerHTML = '<p class="no-results">Nenhum livro encontrado</p>';
        return;
    }
    
    filteredBooks.forEach(book => {
        const bookElement = createBookElement(book);
        catalogBooks.appendChild(bookElement);
    });
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCatalog();
    }
}

function goToNextPage() {
    currentPage++;
    renderCatalog();
}

function updatePagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    
    currentPageSpan.textContent = currentPage;
    prevPage.disabled = currentPage <= 1;
    nextPage.disabled = currentPage >= totalPages;
}

function showNotification(message) {
    // Bug 35: Notificação sem estilização adequada
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000); // Bug 36: Tempo muito curto para leitura
}

// Bug 37: App inicializa antes do DOM carregar completamente
initializeApp();