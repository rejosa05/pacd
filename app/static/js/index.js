(function () {
        const themeToggle = document.getElementById('theme-toggle');
        const knob = document.getElementById('toggle-knob');
        const knobSun = document.getElementById('knob-sun');
        const knobMoon = document.getElementById('knob-moon');
        const html = document.documentElement;

        function applyTheme(isDark) {
            if (isDark) {
                html.classList.add('dark');
                knob.style.transform = 'translateX(28px)';
                knobSun.classList.add('hidden');
                knobMoon.classList.remove('hidden');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                knob.style.transform = 'translateX(0px)';
                knobSun.classList.remove('hidden');
                knobMoon.classList.add('hidden');
                localStorage.setItem('theme', 'light');
            }
        }

        // Respect saved preference, fall back to system preference
        const saved = localStorage.getItem('theme');
        let isDark = saved
            ? saved === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;

        applyTheme(isDark);

        themeToggle.addEventListener('click', function () {
            isDark = !isDark;
            applyTheme(isDark);
        });
    })();