// HealthTrack Plus - Sistema de Gestão Médica
// Bug 24: Variáveis globais sem organização

// Estado da aplicação
let appState = {
    user: null,
    appointments: [],
    patients: [],
    doctors: [],
    alerts: [],
    isLoading: false,
    sessionTimeout: null,
    currentView: 'dashboard'
};

// Bug 25: Dados mockados sem validação
const mockData = {
    appointments: [
        { id: 1, patientId: 101, doctorId: 201, date: '2024-01-15T09:00:00', 
          status: 'confirmed', type: 'consulta', notes: '' },
        { id: 2, patientId: 102, doctorId: 202, date: '2024-01-15T10:30:00',
          status: 'pending', type: 'retorno', notes: 'Paciente em observação' },
        { id: 3, patientId: 103, doctorId: 203, date: '2024-01-15T14:00:00',
          status: 'cancelled', type: 'consulta', notes: 'Cancelado pelo paciente' }
    ],
    patients: [
        { id: 101, name: 'Maria Santos', cpf: '123.456.789-00', 
          phone: '(11) 99999-9999', email: 'maria@email.com' },
        { id: 102, name: 'João Silva', cpf: '987.654.321-00',
          phone: '(11) 98888-8888', email: 'joao@email.com' }
    ],
    doctors: [
        { id: 201, name: 'Dr. Carlos Mendes', specialty: 'Cardiologia' },
        { id: 202, name: 'Dra. Ana Paula', specialty: 'Pediatria' }
    ]
};

// Bug 26: Função de inicialização sem tratamento de erro
function initializeApp() {
    try {
        loadUserData();
        setupEventListeners();
        loadDashboardData();
        startSessionTimer();
        
        // Bug 27: Timeout muito curto para carregamento
        setTimeout(() => {
            showSystemAlerts();
        }, 500);
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        // Bug 28: Erro não mostrado ao usuário
    }
}

function loadUserData() {
    // Simulação de usuário logado
    appState.user = {
        id: 1,
        name: 'Dr. Carlos Silva',
        email: 'carlos@clinica.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
    };
    
    // Bug 29: Não verifica se usuário tem permissões
    updateUIForUser();
}

function updateUIForUser() {
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (userName && userRole && appState.user) {
        userName.textContent = appState.user.name;
        userRole.textContent = appState.user.role.toUpperCase();
    }
}

function setupEventListeners() {
    // Menu sidebar
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('href').substring(1);
            navigateToView(view);
        });
    });
    
    // Busca global
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('globalSearch');
    
    // Bug 30: Event listener duplicado potencial
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Novo agendamento
    const newAppointmentBtn = document.getElementById('newAppointment');
    newAppointmentBtn.addEventListener('click', openAppointmentModal);
    
    // Formulário rápido de paciente
    const patientForm = document.getElementById('quickPatientForm');
    patientForm.addEventListener('submit', handleQuickPatientRegistration);
    
    // Session timeout
    const extendSessionBtn = document.getElementById('extendSession');
    if (extendSessionBtn) {
        extendSessionBtn.addEventListener('click', extendSession);
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', filterByDate);
    
    // Notificações
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn.addEventListener('click', showNotifications);
    
    // Bug 31: Listeners não são removidos quando não necessários
}

function loadDashboardData() {
    showLoading(true);
    
    // Simulação de API call
    setTimeout(() => {
        appState.appointments = mockData.appointments;
        appState.patients = mockData.patients;
        appState.doctors = mockData.doctors;
        
        updateStatsCards();
        renderUpcomingAppointments();
        
        // Bug 32: Não atualiza calendário
        if (window.calendar) {
            window.calendar.refetchEvents();
        }
        
        showLoading(false);
    }, 1000);
}

function updateStatsCards() {
    // Agendamentos hoje
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appState.appointments.filter(app => 
        app.date.startsWith(today)
    ).length;
    
    document.getElementById('todayAppointments').textContent = todayApps;
    
    // Pacientes ativos
    document.getElementById('activePatients').textContent = appState.patients.length;
    
    // Bug 33: Cálculo de receita com lógica errada
    const monthlyRevenue = appState.appointments
        .filter(app => app.status === 'confirmed')
        .reduce((total, app) => {
            // Supondo valor fixo por consulta
            return total + 250;
        }, 0);
    
    document.getElementById('monthlyRevenue').textContent = 
        `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    // Taxa de ocupação (calculada errada)
    const totalSlots = 20; // Slots por dia
    const occupiedSlots = todayApps;
    const occupancyRate = (occupiedSlots / totalSlots) * 100;
    
    document.getElementById('occupancyRate').textContent = 
        `${Math.round(occupancyRate)}%`;
    
    // Bug 34: Progress bar não atualiza
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
        progressBar.style.width = `${occupancyRate}%`;
    }
}

function renderUpcomingAppointments() {
    const container = document.getElementById('upcomingAppointments');
    if (!container) return;
    
    // Ordenar por data
    const upcoming = [...appState.appointments]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum agendamento futuro</p>';
        return;
    }
    
    upcoming.forEach(appointment => {
        const patient = appState.patients.find(p => p.id === appointment.patientId);
        const doctor = appState.doctors.find(d => d.id === appointment.doctorId);
        
        if (!patient || !doctor) return;
        
        const date = new Date(appointment.date);
        const timeStr = date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const statusClass = `status-${appointment.status}`;
        
        const appointmentEl = document.createElement('div');
        appointmentEl.className = 'appointment-item';
        appointmentEl.innerHTML = `
            <div class="appointment-time">${timeStr}</div>
            <div class="appointment-patient">
                <strong>${patient.name}</strong>
                <div class="text-sm">${doctor.name}</div>
            </div>
            <div class="appointment-status ${statusClass}">
                ${appointment.status === 'confirmed' ? 'Confirmado' : 
                  appointment.status === 'pending' ? 'Pendente' : 'Cancelado'}
            </div>
        `;
        
        container.appendChild(appointmentEl);
    });
}

// Bug 35: Função de busca sem debounce
function performSearch() {
    const query = document.getElementById('globalSearch').value.trim();
    
    if (!query) {
        alert('Digite algo para buscar');
        return;
    }
    
    showLoading(true);
    
    // Simulação de busca
    setTimeout(() => {
        const results = {
            patients: appState.patients.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.cpf.includes(query)
            ),
            appointments: appState.appointments.filter(app => {
                const patient = appState.patients.find(p => p.id === app.patientId);
                return patient && patient.name.toLowerCase().includes(query.toLowerCase());
            })
        };
        
        displaySearchResults(results);
        showLoading(false);
    }, 500);
}

function displaySearchResults(results) {
    // Bug 36: Modal de resultados não implementado
    console.log('Resultados da busca:', results);
    alert(`Encontrados: ${results.patients.length} pacientes, ${results.appointments.length} agendamentos`);
}

function openAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>Novo Agendamento</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="appointmentForm">
                    <div class="form