// ==========================================
// HOME PAGE - JAVASCRIPT
// ==========================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// Mobile menu toggle
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');

navbarToggle.addEventListener('click', () => {
  navbarMenu.classList.toggle('active');
  
  // Animar hamburguer
  const spans = navbarToggle.querySelectorAll('span');
  spans[0].style.transform = navbarMenu.classList.contains('active') 
    ? 'rotate(45deg) translate(5px, 5px)' 
    : 'none';
  spans[1].style.opacity = navbarMenu.classList.contains('active') ? '0' : '1';
  spans[2].style.transform = navbarMenu.classList.contains('active') 
    ? 'rotate(-45deg) translate(7px, -6px)' 
    : 'none';
});

// Fechar menu ao clicar em link
const navbarLinks = document.querySelectorAll('.navbar-link');
navbarLinks.forEach(link => {
  link.addEventListener('click', () => {
    navbarMenu.classList.remove('active');
    
    // Reset hamburguer
    const spans = navbarToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    // Fechar todos os itens
    faqItems.forEach(faqItem => {
      faqItem.classList.remove('active');
    });
    
    // Abrir o item clicado se não estava ativo
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// Smooth scroll para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navbarHeight = navbar.offsetHeight;
      const targetPosition = target.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Animação de entrada dos elementos (opcional - scroll reveal)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Elementos para animar
const animatedElements = document.querySelectorAll('.card, .highlight-card, .process-step, .social-card, .faq-item');
animatedElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});

// Log quando a página carregar
console.log('Home page carregada com sucesso!');