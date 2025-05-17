// Espera a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
  // Referencias al formulario
  const form = document.getElementById('task-form');
  const nameInput = document.getElementById('task-name');
  const descInput = document.getElementById('task-desc');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const formTitle = document.getElementById('form-title');
  const idInput = document.getElementById('task-id');

  // Referencias a lista, búsqueda y filtro
  const tableBody = document.getElementById('task-table-body');
  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('filter-select');
  const downloadBtn = document.getElementById('download-btn');

  // Carga inicial de tareas desde localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  renderTasks();

  // Crear o actualizar tarea
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    if (!name || !desc) return;

    if (idInput.value) {
      // UPDATE existente
      tasks = tasks.map(t =>
        t.id === idInput.value ? { id: t.id, name, desc } : t
      );
    } else {
      // CREATE nueva
      tasks.push({
        id: Date.now().toString(), // ID único basado en timestamp
        name,
        desc,
      });
    }
    saveAndReset();
  });

  // Cancelar edición
  cancelBtn.addEventListener('click', saveAndReset);

  // Re-render cada vez que cambie búsqueda o filtro
  searchInput.addEventListener('input', renderTasks);
  filterSelect.addEventListener('change', renderTasks);

  // Descargar lista en PDF
  downloadBtn.addEventListener('click', () => {
    const element = document.getElementById('list-section');
    html2pdf()
      .set({ margin: 10, filename: 'tareas.pdf', html2canvas: { scale: 2 } })
      .from(element)
      .save();
  });

  // Guardar en localStorage y resetear formulario
  function saveAndReset() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    form.reset();
    idInput.value = '';
    formTitle.textContent = 'Crear Nueva Tarea';
    submitBtn.textContent = 'Guardar';
    cancelBtn.classList.add('hidden');
    renderTasks();
  }

  // Genera la tabla según búsqueda, filtro y orden
  function renderTasks() {
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;

    // Filtrar por búsqueda
    let filtered = tasks.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.desc.toLowerCase().includes(query)
    );

    // Ordenar según filtro
    if (filter === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filter === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filter === 'recent') {
      filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    // Mostrar mensaje si no hay resultados
    if (filtered.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="3">No hay tareas que mostrar</td></tr>';
      return;
    }

    // Construir filas
    tableBody.innerHTML = '';
    filtered.forEach(task => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${task.name}</td>
        <td>${task.desc}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${task.id}">Editar</button>
          <button class="action-btn delete-btn" data-id="${task.id}">Eliminar</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Eventos para botones dinámicos
    document
      .querySelectorAll('.edit-btn')
      .forEach(btn =>
        btn.addEventListener('click', () => startEdit(btn.dataset.id))
      );
    document
      .querySelectorAll('.delete-btn')
      .forEach(btn =>
        btn.addEventListener('click', () => deleteTask(btn.dataset.id))
      );
  }

  // Llena el formulario para editar
  function startEdit(id) {
    const task = tasks.find(t => t.id === id);
    idInput.value = task.id;
    nameInput.value = task.name;
    descInput.value = task.desc;
    formTitle.textContent = 'Editar Tarea';
    submitBtn.textContent = 'Actualizar';
    cancelBtn.classList.remove('hidden');
  }

  // Eliminar tarea
  function deleteTask(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveAndReset();
  }
});
