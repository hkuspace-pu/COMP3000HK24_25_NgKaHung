window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

document.addEventListener('DOMContentLoaded', function () {
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');

    dropdownMenus.forEach(function (menu) {
        menu.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.classList.contains('dropdown-item')) {
                const selectedText = event.target.textContent;
                menu.previousElementSibling.textContent = selectedText;
            }
        });
    });
});

document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.closest('.input-group').querySelector('input');
        
        navigator.clipboard.writeText(input.value)
    });
});
document.querySelectorAll('.paste-btn').forEach(button => {
    button.addEventListener('click', async () => {
        try {
            const input = button.closest('.input-group').querySelector('input');
            const text = await navigator.clipboard.readText();
            input.value = text; 
        } catch (error) {
            console.error('Failed to read clipboard contents: ', error);
        }
    });
});
