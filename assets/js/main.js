/* ==========================================
   MEAL Bridge LLC
   Main JavaScript
   Version 1.0.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------
       Sticky Navigation
    ------------------------------ */

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

    /* ------------------------------
       Fade Animation
    ------------------------------ */

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: 0.15

    });

    document.querySelectorAll(".fade-up").forEach(el => {

        observer.observe(el);

    });

    /* ------------------------------
        Lucide Icons
    ------------------------------ */

    lucide.createIcons();

});

/* Mobile Menu */

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("navMenu");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
    });

}

/* Scroll Progress */

const progressBar = document.getElementById("progressBar");

if (progressBar) {

    window.addEventListener("scroll", () => {

        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        progressBar.style.width = scrolled + "%";

    });

}

/* Back To Top */

const topButton = document.getElementById("topButton");

if (topButton) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {
            topButton.classList.add("show");
        } else {
            topButton.classList.remove("show");
        }

    });

    topButton.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}

/* ========================================
SERVICE TABS
======================================== */

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(tab => tab.classList.remove("active"));

        button.classList.add("active");

        document
            .getElementById(button.dataset.tab)
            .classList.add("active");

    });

});

