// Wait for DOM to load fully before executing scripts
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- DOM Elements ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  
  // Interactive pricing elements
  const testCheckboxes = document.querySelectorAll('input[name="vet-tests"]');
  const visitTypeRadios = document.querySelectorAll('input[name="visit-type"]');
  const servicesCountLabel = document.getElementById('services-count');
  const liveSubtotal = document.getElementById('live-subtotal');

  // Form elements
  const orderForm = document.getElementById('order-form');
  const successModal = document.getElementById('success-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // Receipt modal elements
  const receiptId = document.getElementById('receipt-id');
  const receiptDate = document.getElementById('receipt-date');
  const receiptSpecies = document.getElementById('receipt-species');
  const receiptTestsCount = document.getElementById('receipt-tests-count');
  const receiptCollectionCharge = document.getElementById('receipt-collection-charge');
  const receiptTotal = document.getElementById('receipt-total');
  const receiptName = document.getElementById('receipt-name');
  const receiptAddr = document.getElementById('receipt-addr');

  // --- Mobile Navigation ---
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const isExpanded = !mobileMenu.classList.contains('hidden');
    
    // Change menu icon between hamburger and 'X'
    if (isExpanded) {
      menuIcon.setAttribute('data-lucide', 'x');
    } else {
      menuIcon.setAttribute('data-lucide', 'menu');
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Close mobile nav when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon.setAttribute('data-lucide', 'menu');
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });

  // --- Pricing / Estimate Calculations ---
  function updateEstimate() {
    let total = 0;
    let selectedCount = 0;

    // Sum checked test prices
    testCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        total += parseInt(checkbox.getAttribute('data-price') || '0');
        selectedCount++;
      }
    });

    // Add visit type fee
    let visitFee = 0;
    visitTypeRadios.forEach(radio => {
      if (radio.checked) {
        visitFee = parseInt(radio.getAttribute('data-fee') || '0');
      }
    });
    total += visitFee;

    // Update UI elements
    servicesCountLabel.textContent = `${selectedCount} Test${selectedCount !== 1 ? 's' : ''} Selected`;
    liveSubtotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  // Add event listeners for pricing updates
  testCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateEstimate);
  });

  visitTypeRadios.forEach(radio => {
    radio.addEventListener('change', updateEstimate);
  });

  // Set default form date to tomorrow
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    bookingDateInput.value = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Initial estimate calculation
  updateEstimate();

  // --- Form Submission & Success Dialog Simulation ---
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch field values
    const ownerNameVal = document.getElementById('owner-name').value.trim();
    const phoneVal = document.getElementById('user-phone').value.trim();
    const animalTypeVal = document.getElementById('animal-type').value;
    const addressVal = document.getElementById('user-address').value.trim();
    const bookingDateVal = document.getElementById('booking-date').value;

    // Simple Phone Number Validation Check
    if (phoneVal.length !== 10 || isNaN(phoneVal)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Verify at least one test is selected
    let selectedCount = 0;
    let total = 0;
    testCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selectedCount++;
        total += parseInt(checkbox.getAttribute('data-price') || '0');
      }
    });

    if (selectedCount === 0) {
      alert("Please select at least one diagnostic test.");
      return;
    }

    let visitFee = 0;
    visitTypeRadios.forEach(radio => {
      if (radio.checked) {
        visitFee = parseInt(radio.getAttribute('data-fee') || '0');
      }
    });
    total += visitFee;

    // Generate random booking ID
    const bookingNum = Math.floor(10000 + Math.random() * 90000);
    receiptId.textContent = `#CVD-${bookingNum}`;
    
    // Format Booking Date nicely (e.g. June 19, 2026)
    if (bookingDateVal) {
      const parts = bookingDateVal.split('-');
      const formattedDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      receiptDate.textContent = formattedDate.toLocaleDateString('en-US', dateOptions);
    } else {
      const today = new Date();
      receiptDate.textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Populate Receipt Details
    receiptSpecies.textContent = animalTypeVal;
    receiptTestsCount.textContent = `${selectedCount} Test${selectedCount !== 1 ? 's' : ''}`;
    receiptCollectionCharge.textContent = `₹${visitFee}`;
    receiptTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
    receiptName.textContent = ownerNameVal;
    receiptAddr.textContent = addressVal;

    // Open Success Modal
    successModal.classList.remove('hidden');
    setTimeout(() => {
      successModal.classList.add('active');
    }, 10);
  });

  // --- Close Modal Functions ---
  function closeModal() {
    successModal.classList.remove('active');
    setTimeout(() => {
      successModal.classList.add('hidden');
      
      // Reset form controls
      orderForm.reset();
      
      // Reset checkboxes & radio defaults
      testCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = (index === 0); // Check only pathology by default
      });
      visitTypeRadios.forEach((radio, index) => {
        radio.checked = (index === 1); // Check doorstep visit by default
      });

      // Reset default date to tomorrow
      if (bookingDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        bookingDateInput.value = `${yyyy}-${mm}-${dd}`;
      }

      updateEstimate();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }

  closeModalBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // --- X-Ray Case Studies Gallery Filter Logic ---
  const xrayTabs = document.querySelectorAll('.xray-tab-btn');
  const xrayCards = document.querySelectorAll('.xray-card');

  if (xrayTabs.length && xrayCards.length) {
    xrayTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        // Update active tab button style
        xrayTabs.forEach(t => {
          t.classList.remove('bg-teal-600', 'text-white', 'shadow-sm');
          t.classList.add('bg-white', 'border', 'border-navy-100', 'text-navy-700', 'hover:border-teal-200');
        });
        tab.classList.add('bg-teal-600', 'text-white', 'shadow-sm');
        tab.classList.remove('bg-white', 'border', 'border-navy-100', 'text-navy-700', 'hover:border-teal-200');

        // Filter cards
        xrayCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden-case');
          } else {
            card.classList.add('hidden-case');
          }
        });
      });
    });
  }

  // --- Service Poster Slideshow Logic ---
  const posterSlides = document.querySelectorAll('.poster-slide');
  const posterDots = document.querySelectorAll('.poster-dot');
  const prevPosterBtn = document.getElementById('prev-poster-btn');
  const nextPosterBtn = document.getElementById('next-poster-btn');

  if (posterSlides.length) {
    let currentSlide = 0;

    function showPosterSlide(index) {
      // Handle bounds
      if (index >= posterSlides.length) index = 0;
      if (index < 0) index = posterSlides.length - 1;

      // Update slides
      posterSlides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
          slide.classList.remove('opacity-0', 'pointer-events-none');
        } else {
          slide.classList.remove('active');
          slide.classList.add('opacity-0', 'pointer-events-none');
        }
      });

      // Update dots
      posterDots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('bg-teal-600');
          dot.classList.remove('bg-navy-200');
        } else {
          dot.classList.remove('bg-teal-600');
          dot.classList.add('bg-navy-200');
        }
      });

      currentSlide = index;
    }

    // Initialize first slide as active
    showPosterSlide(0);

    // Click events
    if (prevPosterBtn && nextPosterBtn) {
      prevPosterBtn.addEventListener('click', () => {
        showPosterSlide(currentSlide - 1);
      });

      nextPosterBtn.addEventListener('click', () => {
        showPosterSlide(currentSlide + 1);
      });
    }

    // Dot navigation click events
    posterDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide') || '0');
        showPosterSlide(slideIndex);
      });
    });
  }
});
