(() => {
  const body = document.body;
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");

  if (menuToggle && nav) {
    const closeMenu = () => {
      body.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  const selectTab = (selectedTab) => {
    tabs.forEach((tab) => {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.id === selectedTab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        tabs[nextIndex].focus();
        selectTab(tabs[nextIndex]);
      }
    });
  });

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    const requiredFields = Array.from(
      form.querySelectorAll("input[required], textarea[required]")
    );

    const validateField = (field) => {
      const error = form.querySelector(`[data-error-for="${field.id}"]`);
      const value = field.value.trim();

      if (!value) {
        if (error) error.textContent = "To pole jest wymagane.";
        field.setAttribute("aria-invalid", "true");
        return false;
      }

      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        if (error) error.textContent = "Podaj poprawny adres e-mail.";
        field.setAttribute("aria-invalid", "true");
        return false;
      }

      if (error) error.textContent = "";
      field.removeAttribute("aria-invalid");
      return true;
    };

    requiredFields.forEach((field) => {
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const isValid = requiredFields.map(validateField).every(Boolean);

      if (!isValid) {
        status.textContent = "Uzupełnij zaznaczone pola.";
        status.classList.remove("is-success");
        return;
      }

      status.textContent = "Dziękujemy. Odezwiemy się w 1 dzień roboczy.";
      status.classList.add("is-success");
      form.reset();

      requiredFields.forEach((field) => {
        const error = form.querySelector(`[data-error-for="${field.id}"]`);
        if (error) error.textContent = "";
        field.removeAttribute("aria-invalid");
      });
    });
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      const original = button.textContent;

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Skopiowano";
      } catch {
        window.location.href = `mailto:${text}`;
        return;
      }

      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  });
})();
