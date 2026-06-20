// VEX HUB - app.js
// Correção: venda aparece imediatamente no Histórico + Firestore por usuário

const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const loginModeButton = document.getElementById("loginModeButton");
const registerModeButton = document.getElementById("registerModeButton");
const displayNameField = document.getElementById("displayNameField");
const registerDisplayName = document.getElementById("registerDisplayName");
const authSubmitButton = document.getElementById("authSubmitButton");
const authHelperText = document.getElementById("authHelperText");
const userEmailLabel = document.getElementById("userEmailLabel");
const usersNavButton = document.getElementById("usersNavButton");
const usersList = document.getElementById("usersList");
const usersMessage = document.getElementById("usersMessage");
const profileRole = document.getElementById("profileRole");

const logoutButton = document.getElementById("logoutButton");

const navButtons = document.querySelectorAll(".nav-item");
const contentSections = document.querySelectorAll(".content-section");

const saleForm = document.getElementById("saleForm");
const saleMessage = document.getElementById("saleMessage");

const historyList = document.getElementById("historyList");
const historyCounter = document.getElementById("historyCounter");

const historySearch = document.getElementById("historySearch");
const historyStatusFilter = document.getElementById("historyStatusFilter");
const historyTransferFilter = document.getElementById("historyTransferFilter");
const clearHistoryFiltersButton = document.getElementById("clearHistoryFiltersButton");

const totalSalesCard = document.getElementById("totalSalesCard");
const totalCommissionCard = document.getElementById("totalCommissionCard");
const pendingAfterSalesCard = document.getElementById("pendingAfterSalesCard");
const transferSalesCard = document.getElementById("transferSalesCard");

const reportTotalSales = document.getElementById("reportTotalSales");
const reportTotalCommission = document.getElementById("reportTotalCommission");
const reportFrankCommission = document.getElementById("reportFrankCommission");
const reportLucasCommission = document.getElementById("reportLucasCommission");
const reportStoreTransfer = document.getElementById("reportStoreTransfer");
const reportClientTransfer = document.getElementById("reportClientTransfer");
const reportPendingAfterSales = document.getElementById("reportPendingAfterSales");
const reportFinishedAfterSales = document.getElementById("reportFinishedAfterSales");

let sales = [];
let auth = null;
let db = null;
let currentUser = null;
let salesCollection = null;
let unsubscribeSales = null;
let authMode = "login";
let currentUserProfile = null;
let unsubscribeUsers = null;
let users = [];

const ADMIN_EMAILS = [
  "frank.since96@gmail.com",
  "consultorjunior.auto@gmail.com"
];

initializeApplication();

function initializeApplication() {
  initializeFirebase();
  initializeNavigation();
  initializeAuthModeSwitch();
  initializeLoginForm();
  initializeProfileForm();
  initializeSaleForm();
  initializeHistoryFilters();
  initializeVexPhase02Vehicles();
  initializeVexPhase03Build02();
  initializeVexPremiumExperience();
  initializeVexDashboardExecutive();
  listenAuthenticationState();
}

function initializeFirebase() {
  if (typeof firebase === "undefined") {
    showLoginMessage("Firebase não carregou. Verifique a internet.");
    return;
  }

  auth = firebase.auth();
  db = firebase.firestore();
}

function initializeNavigation() {
  if (logoutButton) {
    logoutButton.addEventListener("click", logoutUser);
  }

  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const targetSectionId = button.getAttribute("data-section");

      navButtons.forEach(function (navButton) {
        navButton.classList.remove("active");
      });

      contentSections.forEach(function (section) {
        section.classList.remove("active");
      });

      button.classList.add("active");

      const targetSection = document.getElementById(targetSectionId);

      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
}

function initializeAuthModeSwitch() {
  if (loginModeButton) {
    loginModeButton.addEventListener("click", function () {
      setAuthMode("login");
    });
  }

  if (registerModeButton) {
    registerModeButton.addEventListener("click", function () {
      setAuthMode("register");
    });
  }

  setAuthMode("login");
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";

  if (loginModeButton) {
    loginModeButton.classList.toggle("active", authMode === "login");
  }

  if (registerModeButton) {
    registerModeButton.classList.toggle("active", authMode === "register");
  }

  if (displayNameField) {
    displayNameField.classList.toggle("hidden", authMode !== "register");
  }

  if (authSubmitButton) {
    authSubmitButton.textContent = authMode === "register" ? "Criar conta" : "Entrar";
  }

  if (authHelperText) {
    authHelperText.textContent = authMode === "register"
      ? "O nome será usado no Dashboard, exemplo: Bom dia, Junior."
      : "Para contas já criadas no Firebase, entre normalmente com e-mail e senha.";
  }

  showLoginMessage("");
}

function initializeLoginForm() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    const displayName = registerDisplayName ? registerDisplayName.value.trim() : "";

    if (email === "" || password === "") {
      showLoginMessage("Informe e-mail e senha.");
      return;
    }

    if (authMode === "register" && displayName === "") {
      showLoginMessage("Informe o nome de usuário.");
      return;
    }

    try {
      if (authMode === "register") {
        showLoginMessage("Criando conta...");

        const credential = await auth.createUserWithEmailAndPassword(email, password);

        if (credential && credential.user) {
          await saveUserDisplayName(credential.user, displayName);
        }

        loginForm.reset();
        setAuthMode("login");
        showLoginMessage("");
        return;
      }

      showLoginMessage("Entrando...");
      await auth.signInWithEmailAndPassword(email, password);
      loginForm.reset();
      showLoginMessage("");
    } catch (error) {
      showLoginMessage(getAuthErrorMessage(error));
    }
  });
}

function initializeProfileForm() {
  const profileForm = document.getElementById("profileForm");

  if (!profileForm) {
    return;
  }

  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!currentUser) {
      showProfileMessage("Faça login para atualizar seu perfil.");
      return;
    }

    const profileDisplayName = document.getElementById("profileDisplayName");
    const name = profileDisplayName ? profileDisplayName.value.trim() : "";

    if (name === "") {
      showProfileMessage("Informe o nome de usuário.");
      return;
    }

    try {
      showProfileMessage("Salvando nome...");
      await saveUserDisplayName(currentUser, name);
      currentUserProfile = { displayName: name };
      updateUserIdentityUI();
      refreshApplication();
      showProfileMessage("Nome salvo com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar nome de usuário:", error);
      showProfileMessage("Não foi possível salvar o nome agora.");
    }
  });
}


function initializeSaleForm() {
  if (!saleForm) {
    return;
  }

  saleForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!currentUser || !salesCollection) {
      saleMessage.innerHTML = `
        <div class="empty-state">
          Faça login para salvar uma venda.
        </div>
      `;
      return;
    }

    if (!canManageContent()) {
      saleMessage.innerHTML = `
        <div class="empty-state">
          Seu acesso atual é de usuário comum. Apenas administradores podem cadastrar novas vendas.
        </div>
      `;
      return;
    }

    const clientName = document.getElementById("clientName").value.trim();
    const clientPhone = document.getElementById("clientPhone").value.trim();
    const vehicleModel = document.getElementById("vehicleModel").value.trim();
    const vehicleYear = document.getElementById("vehicleYear").value.trim();
    const vehicleFipeValue = getVexF03Value("vehicleFipeValue");
    const vehicleVersion = getVexF03Value("vehicleVersion");
    const vehicleTransmission = getVexF03Value("vehicleTransmission");
    const vehicleColor = getVexF03Value("vehicleColor");
    const vehiclePlate = getVexF03Value("vehiclePlate");
    const vehicleKm = getVexF03Value("vehicleKm");
    const saleValue = document.getElementById("saleValue").value.trim();
    const saleDate = document.getElementById("saleDate").value;
    const transferType = document.getElementById("transferType").value;
    const afterSaleStatus = document.getElementById("afterSaleStatus").value;
    const saleNotes = document.getElementById("saleNotes").value.trim();

    if (
      clientName === "" ||
      clientPhone === "" ||
      vehicleModel === "" ||
      vehicleYear === "" ||
      saleValue === "" ||
      saleDate === "" ||
      transferType === "" ||
      afterSaleStatus === ""
    ) {
      saleMessage.innerHTML = `
        <div class="empty-state">
          Preencha todos os campos obrigatórios antes de salvar a venda.
        </div>
      `;

      return;
    }

    const newSale = {
      clientName: clientName,
      clientPhone: clientPhone,
      vehicleModel: vehicleModel,
      vehicleYear: vehicleYear,
      vehicleFipeValue: vehicleFipeValue,
      vehicleFipeValueNumber: parseVexF03Number(vehicleFipeValue),
      vehicleVersion: vehicleVersion,
      vehicleTransmission: vehicleTransmission,
      vehicleColor: vehicleColor,
      vehiclePlate: vehiclePlate,
      vehicleKm: vehicleKm,
      saleValue: saleValue,
      saleDate: saleDate,
      transferType: transferType,
      afterSaleStatus: afterSaleStatus,
      saleNotes: saleNotes,
      totalCommission: 250,
      frankCommission: 125,
      lucasCommission: 125,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      createdAtLocal: new Date().toISOString()
    };

    await saveSale(newSale);
  });
}

function initializeHistoryFilters() {
  if (historySearch) {
    historySearch.addEventListener("input", renderHistory);
  }

  if (historyStatusFilter) {
    historyStatusFilter.addEventListener("change", renderHistory);
  }

  if (historyTransferFilter) {
    historyTransferFilter.addEventListener("change", renderHistory);
  }

  if (clearHistoryFiltersButton) {
    clearHistoryFiltersButton.addEventListener("click", function () {
      if (historySearch) historySearch.value = "";
      if (historyStatusFilter) historyStatusFilter.value = "";
      if (historyTransferFilter) historyTransferFilter.value = "";
      renderHistory();
    });
  }
}

function listenAuthenticationState() {
  if (!auth) {
    return;
  }

  auth.onAuthStateChanged(async function (user) {
    if (user) {
      currentUser = user;
      currentUserProfile = await loadUserProfile(user);
      showDashboard();
      updateUserIdentityUI();
      updateAccessControlUI();
      setupUserSalesCollection(user);
      loadUserSales();
      loadUsersForAdmin();
    } else {
      currentUser = null;
      currentUserProfile = null;
      users = [];
      sales = [];
      salesCollection = null;
      stopSalesListener();
      stopUsersListener();
      refreshApplication();
      showLogin();
    }
  });
}

function setupUserSalesCollection(user) {
  salesCollection = db
    .collection("users")
    .doc(user.uid)
    .collection("sales");
}

function loadUserSales() {
  stopSalesListener();

  if (!salesCollection) {
    return;
  }

  unsubscribeSales = salesCollection
    .orderBy("createdAtLocal", "desc")
    .onSnapshot(
      function (snapshot) {
        sales = snapshot.docs.map(function (doc) {
          return {
            id: doc.id,
            ...doc.data()
          };
        });

        refreshApplication();
      },
      function (error) {
        console.error("Erro ao carregar vendas:", error);

        if (saleMessage) {
          saleMessage.innerHTML = `
            <div class="empty-state">
              Erro ao carregar vendas. Verifique as regras do Firestore.
            </div>
          `;
        }
      }
    );
}

function stopSalesListener() {
  if (unsubscribeSales) {
    unsubscribeSales();
    unsubscribeSales = null;
  }
}

async function saveSale(sale) {
  try {
    setSaleMessageLoading();

    const docRef = await salesCollection.add(sale);

    const saleWithId = {
      id: docRef.id,
      ...sale
    };

    const alreadyExists = sales.some(function (item) {
      return item.id === docRef.id;
    });

    if (!alreadyExists) {
      sales.unshift(saleWithId);
      refreshApplication();
    }

    renderSaleConfirmation(saleWithId, "Venda salva na nuvem com sucesso.");
    saleForm.reset();
    goToSection("historySection");
  } catch (error) {
    console.error("Erro ao salvar venda:", error);

    saleMessage.innerHTML = `
      <div class="empty-state">
        Erro ao salvar venda. Verifique sua conexão ou as regras do Firestore.
      </div>
    `;
  }
}

function goToSection(sectionId) {
  navButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.getAttribute("data-section") === sectionId) {
      button.classList.add("active");
    }
  });

  contentSections.forEach(function (section) {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }
}

async function deleteSale(saleId) {
  if (!canManageContent()) {
    alert("Apenas administradores podem excluir vendas.");
    return;
  }

  const confirmDelete = confirm("Deseja excluir esta venda?");

  if (!confirmDelete || !salesCollection) {
    return;
  }

  try {
    await salesCollection.doc(saleId).delete();

    sales = sales.filter(function (sale) {
      return sale.id !== saleId;
    });

    refreshApplication();
  } catch (error) {
    console.error("Erro ao excluir venda:", error);
    alert("Erro ao excluir venda.");
  }
}

async function updateSaleStatus(saleId, newStatus) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar o status da venda.");
    refreshApplication();
    return;
  }

  if (!salesCollection || !saleId || !newStatus) {
    return;
  }

  try {
    await salesCollection.doc(saleId).update({
      afterSaleStatus: newStatus,
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function (sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          afterSaleStatus: newStatus
        };
      }

      return sale;
    });

    refreshApplication();
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    alert("Erro ao atualizar status.");
  }
}

async function updateSaleTransfer(saleId, newTransfer) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar a transferência.");
    refreshApplication();
    return;
  }

  if (!salesCollection || !saleId || !newTransfer) {
    return;
  }

  try {
    await salesCollection.doc(saleId).update({
      transferType: newTransfer,
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function (sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          transferType: newTransfer
        };
      }

      return sale;
    });

    refreshApplication();
  } catch (error) {
    console.error("Erro ao atualizar transferência:", error);
    alert("Erro ao atualizar transferência.");
  }
}

async function logoutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    alert("Erro ao sair do sistema.");
  }
}

function showDashboard() {
  homeScreen.classList.remove("active");
  dashboardScreen.classList.add("active");

  updateUserIdentityUI();
}

function showLogin() {
  dashboardScreen.classList.remove("active");
  homeScreen.classList.add("active");

  if (userEmailLabel) {
    userEmailLabel.textContent = "";
  }

  updateProfileForm();
}

function showLoginMessage(message) {
  if (!loginMessage) {
    return;
  }

  if (message === "") {
    loginMessage.innerHTML = "";
    return;
  }

  loginMessage.innerHTML = `
    <div class="empty-state">
      ${escapeHTML(message)}
    </div>
  `;
}

function setSaleMessageLoading() {
  saleMessage.innerHTML = `
    <div class="empty-state">
      Salvando venda...
    </div>
  `;
}

function refreshApplication() {
  renderHistory();
  updateDashboardCards();
  updateVexDashboardExecutive();
  updateReports();
}

function renderSaleConfirmation(sale, message) {
  saleMessage.innerHTML = `
    <div class="commission-box">
      <p>${message}</p>

      <div class="report-preview">
        <div>
          <strong>Cliente</strong>
          <span>${escapeHTML(sale.clientName)}</span>
        </div>

        <div>
          <strong>Telefone</strong>
          <span>${escapeHTML(sale.clientPhone)}</span>
        </div>

        <div>
          <strong>Veículo</strong>
          <span>${escapeHTML(sale.vehicleModel)} - ${escapeHTML(sale.vehicleYear)}</span>
        </div>

        <div>
          <strong>Valor da venda</strong>
          <span>${escapeHTML(sale.saleValue)}</span>
        </div>

        <div>
          <strong>Data</strong>
          <span>${formatDateToBrazil(sale.saleDate)}</span>
        </div>

        <div>
          <strong>Transferência</strong>
          <span>${escapeHTML(sale.transferType)}</span>
        </div>

        <div>
          <strong>Status</strong>
          <span>${escapeHTML(sale.afterSaleStatus)}</span>
        </div>

        <div>
          <strong>Comissão total</strong>
          <span>R$ 250,00</span>
        </div>
      </div>
    </div>
  `;
}

function getFilteredSales() {
  const searchValue = historySearch ? historySearch.value.trim().toLowerCase() : "";
  const statusValue = historyStatusFilter ? historyStatusFilter.value : "";
  const transferValue = historyTransferFilter ? historyTransferFilter.value : "";

  return sales.filter(function (sale) {
    const text = `
      ${sale.clientName || ""}
      ${sale.clientPhone || ""}
      ${sale.vehicleModel || ""}
      ${sale.vehicleYear || ""}
      ${sale.vehicleFipeValue || ""}
      ${sale.vehicleVersion || ""}
      ${sale.vehicleTransmission || ""}
      ${sale.vehicleColor || ""}
      ${sale.vehiclePlate || ""}
      ${sale.vehicleKm || ""}
      ${sale.saleValue || ""}
      ${sale.saleDate || ""}
      ${sale.transferType || ""}
      ${sale.afterSaleStatus || ""}
      ${sale.saleNotes || ""}
    `.toLowerCase();

    const matchesSearch = searchValue === "" || text.includes(searchValue);
    const matchesStatus = statusValue === "" || sale.afterSaleStatus === statusValue;
    const matchesTransfer = transferValue === "" || sale.transferType === transferValue;

    return matchesSearch && matchesStatus && matchesTransfer;
  });
}

function renderHistory() {
  if (typeof renderVexVehiclesPremium === "function" && renderVexVehiclesPremium()) {
    return;
  }

  if (!historyList || !historyCounter) {
    return;
  }

  prepareHistoryVexLayout();

  const filteredSales = getFilteredSales();

  if (sales.length === 0) {
    historyList.innerHTML = `
      <div class="vex-empty-premium">
        <div class="vex-empty-icon">V</div>
        <strong>Nenhum veículo vendido ainda.</strong>
        <span>Assim que uma venda for cadastrada, ela aparecerá aqui no formato VEX Premium.</span>
      </div>
    `;

    historyCounter.textContent = "0 veículos";
    return;
  }

  if (filteredSales.length === 0) {
    historyList.innerHTML = `
      <div class="vex-empty-premium">
        <div class="vex-empty-icon">V</div>
        <strong>Nenhum veículo encontrado.</strong>
        <span>Tente limpar os filtros ou pesquisar outro cliente, veículo ou status.</span>
      </div>
    `;

    historyCounter.textContent = "0 encontrados";
    return;
  }

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veículo(s)`;
  historyList.classList.add("vex-vehicle-list");

  historyList.innerHTML = filteredSales.map(function (sale, index) {
    const statusClass = getStatusClass(sale.afterSaleStatus);
    const value = formatSaleValuePremium(sale.saleValue);

    return `
      <article class="vex-vehicle-card" onclick="openSaleDetails('${sale.id}')">
        <div class="vex-vehicle-rank">${String(index + 1).padStart(2, "0")}</div>

        ${renderVehiclePhoto(sale, "list")}

        <div class="vex-vehicle-main">
          <div class="vex-vehicle-title-row">
            <div>
              <h4>${escapeHTML(sale.vehicleModel)} <span>${escapeHTML(sale.vehicleYear)}</span></h4>
              <p>${escapeHTML(sale.clientName)} • ${formatDateToBrazil(sale.saleDate)}</p>
            </div>

            <strong class="vex-vehicle-price">${escapeHTML(value)}</strong>
          </div>

          <div class="vex-vehicle-meta">
            <span>Telefone: <strong>${escapeHTML(sale.clientPhone)}</strong></span>
            <span>Transferência: <strong>${escapeHTML(sale.transferType)}</strong></span>
            <span class="vex-status-pill ${statusClass}">${escapeHTML(sale.afterSaleStatus)}</span>
          </div>
        </div>

        <button class="vex-open-details" type="button" onclick="event.stopPropagation(); openSaleDetails('${sale.id}')">
          Ver detalhes
        </button>
      </article>
    `;
  }).join("");
}

function initializeVexPremiumExperience() {
  injectVexPremiumStyles();
  createSaleDetailsDrawer();
  prepareHistoryVexLayout();
}

function prepareHistoryVexLayout() {
  const historySection = document.getElementById("historySection");

  if (!historySection) {
    return;
  }

  const title = historySection.querySelector(".section-header h2");
  const description = historySection.querySelector(".section-header p");
  const eyebrow = historySection.querySelector(".eyebrow");

  if (eyebrow) eyebrow.textContent = "VEX MULTIMARCAS";
  if (title) title.textContent = "Veículos Vendidos";
  if (description) description.textContent = "Relação premium de veículos vendidos. Clique no veículo para abrir status, transferência, comissão e observações.";
}

function createSaleDetailsDrawer() {
  if (document.getElementById("saleDetailsOverlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "saleDetailsOverlay";
  overlay.className = "sale-details-overlay";
  overlay.innerHTML = `
    <aside class="sale-details-drawer">
      <button class="sale-details-close" type="button" onclick="closeSaleDetails()">×</button>
      <div id="saleDetailsContent"></div>
    </aside>
  `;

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeSaleDetails();
    }
  });

  document.body.appendChild(overlay);
}

function openSaleDetails(saleId) {
  const sale = sales.find(function (item) {
    return item.id === saleId;
  });

  const overlay = document.getElementById("saleDetailsOverlay");
  const content = document.getElementById("saleDetailsContent");

  if (!sale || !overlay || !content) {
    return;
  }

  content.innerHTML = `
    <div class="drawer-hero">
      ${renderVehiclePhoto(sale, "drawer")}
      <span class="drawer-kicker">Veículo vendido</span>
      <h3>${escapeHTML(sale.vehicleModel)} ${escapeHTML(sale.vehicleYear)}</h3>
      <strong>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</strong>
      <p>${escapeHTML(sale.clientName)} • ${formatDateToBrazil(sale.saleDate)}</p>
    </div>

    <div class="drawer-section">
      <h4>Dados da venda</h4>
      <div class="drawer-grid">
        <div><span>Cliente</span><strong>${escapeHTML(sale.clientName)}</strong></div>
        <div><span>Telefone</span><strong>${escapeHTML(sale.clientPhone)}</strong></div>
        <div><span>Veículo</span><strong>${escapeHTML(sale.vehicleModel)}</strong></div>
        <div><span>Ano</span><strong>${escapeHTML(sale.vehicleYear)}</strong></div>
        <div><span>Valor</span><strong>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</strong></div>
        <div><span>Data</span><strong>${formatDateToBrazil(sale.saleDate)}</strong></div>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Pós-venda e transferência</h4>
      ${renderAdminDrawerControls(sale)}
    </div>

    <div class="drawer-section commission-drawer">
      <h4>Comissão</h4>
      <div class="commission-total">R$ 250,00</div>
      <div class="drawer-grid two">
        <div><span>Frank Luiz</span><strong>R$ 125,00</strong></div>
        <div><span>Lucas Luiz</span><strong>R$ 125,00</strong></div>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Observações</h4>
      <p class="drawer-notes">${escapeHTML(sale.saleNotes || "Sem observações cadastradas.")}</p>
    </div>

    <div class="drawer-actions">
      ${canManageContent() ? `<button class="secondary-button" type="button" onclick="deleteSale('${sale.id}'); closeSaleDetails();">Excluir</button>` : ""}
      <button class="primary-button" type="button" onclick="closeSaleDetails();">Concluir</button>
    </div>
  `;

  overlay.classList.add("active");
}

function renderAdminDrawerControls(sale) {
  if (!canManageContent()) {
    return `
      <div class="readonly-notice">
        Seu acesso é de usuário comum. Apenas administradores podem alterar status ou transferência.
      </div>
      <div class="drawer-grid two">
        <div><span>Status</span><strong>${escapeHTML(sale.afterSaleStatus || "-")}</strong></div>
        <div><span>Transferência</span><strong>${escapeHTML(sale.transferType || "-")}</strong></div>
      </div>
    `;
  }

  return `
    <label class="drawer-label">
      Status
      <select onchange="updateSaleStatus('${sale.id}', this.value)">
        ${getStatusOptions(sale.afterSaleStatus)}
      </select>
    </label>

    <label class="drawer-label">
      Transferência
      <select onchange="updateSaleTransfer('${sale.id}', this.value)">
        ${getTransferOptions(sale.transferType)}
      </select>
    </label>
  `;
}

function closeSaleDetails() {
  const overlay = document.getElementById("saleDetailsOverlay");

  if (overlay) {
    overlay.classList.remove("active");
  }
}

function renderVehiclePhoto(sale, mode) {
  const className = mode === "drawer" ? "vex-vehicle-photo-large" : "vex-vehicle-photo";

  return `
    <div class="${className} vex-logo-placeholder" aria-hidden="true">
      <div class="vex-car-symbol">🚗</div>
      <div class="vex-logo-text">
        <strong>VEX</strong>
        <span>MULTIMARCAS</span>
      </div>
    </div>
  `;
}

function getStatusClass(status) {
  if (status === "Finalizado" || status === "Transferido") {
    return "is-success";
  }

  if (status === "Aguardando Cliente" || status === "Pendente") {
    return "is-warning";
  }

  return "is-progress";
}

function formatSaleValuePremium(value) {
  const numericValue = parseSaleCurrencyValue(value);

  if (numericValue > 0) {
    return formatCurrencyToBrazil(numericValue);
  }

  return value || "R$ 0,00";
}

function parseSaleCurrencyValue(value) {
  const cleanValue = String(value || "")
    .replaceAll("R$", "")
    .replaceAll(" ", "")
    .replaceAll(".", "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");

  const number = Number(cleanValue);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
}

function injectVexPremiumStyles() {
  if (document.getElementById("vexPremiumHistoryStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vexPremiumHistoryStyles";
  style.textContent = `
    :root {
      --vex-red: #e10600;
      --vex-red-strong: #ff1b12;
      --vex-black: #030409;
      --vex-graphite: #111827;
      --vex-card: rgba(10, 14, 25, 0.92);
      --vex-card-soft: rgba(18, 24, 38, 0.88);
      --vex-line: rgba(255, 255, 255, 0.10);
      --vex-text: #ffffff;
      --vex-muted: #9ca3af;
    }

    #historySection .section-header {
      position: relative;
      border: 1px solid rgba(225, 6, 0, 0.24);
      border-radius: 28px;
      padding: 24px;
      background:
        linear-gradient(135deg, rgba(225, 6, 0, 0.18), transparent 28%),
        linear-gradient(145deg, rgba(5, 5, 5, 0.96), rgba(14, 18, 32, 0.92));
      overflow: hidden;
    }

    #historySection .section-header::after {
      content: "VEX";
      position: absolute;
      right: 22px;
      bottom: -22px;
      font-size: 92px;
      font-weight: 600;
      letter-spacing: -0.12em;
      color: rgba(225, 6, 0, 0.10);
      pointer-events: none;
    }

    #historySection .eyebrow {
      background: rgba(225, 6, 0, 0.14);
      color: #fff;
      border-color: rgba(225, 6, 0, 0.38);
    }

    #historySection .filters-card {
      border-color: rgba(225, 6, 0, 0.22);
      background: linear-gradient(145deg, rgba(8, 10, 18, 0.96), rgba(15, 23, 42, 0.90));
    }

    .vex-vehicle-list {
      display: grid;
      gap: 14px;
    }

    .vex-vehicle-card {
      display: grid;
      grid-template-columns: 54px 88px 1fr auto;
      gap: 16px;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-left: 4px solid var(--vex-red);
      border-radius: 24px;
      padding: 16px;
      background:
        radial-gradient(circle at 0% 50%, rgba(225, 6, 0, 0.18), transparent 28%),
        linear-gradient(145deg, rgba(6, 8, 15, 0.98), rgba(17, 24, 39, 0.92));
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
      cursor: pointer;
      transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }

    .vex-vehicle-card:hover {
      transform: translateY(-2px);
      border-color: rgba(225, 6, 0, 0.44);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.44);
    }

    .vex-vehicle-rank {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      color: white;
      font-weight: 600;
      background: linear-gradient(135deg, var(--vex-red), #7f0905);
      box-shadow: 0 14px 34px rgba(225, 6, 0, 0.28);
    }

    .vex-vehicle-photo {
      width: 88px;
      height: 64px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background:
        linear-gradient(135deg, rgba(225, 6, 0, 0.94), rgba(42, 8, 8, 0.96)),
        #111827;
      color: white;
      font-weight: 600;
      letter-spacing: -0.08em;
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .vex-vehicle-main {
      min-width: 0;
    }

    .vex-vehicle-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }

    .vex-vehicle-title-row h4 {
      margin: 0;
      color: var(--vex-text);
      font-size: 18px;
      line-height: 1.15;
      letter-spacing: -0.03em;
    }

    .vex-vehicle-title-row h4 span {
      color: var(--vex-red-strong);
    }

    .vex-vehicle-title-row p,
    .vex-vehicle-meta span {
      color: var(--vex-muted);
      font-size: 13px;
    }

    .vex-vehicle-price {
      white-space: nowrap;
      color: white;
      font-size: 22px;
      letter-spacing: -0.04em;
      text-shadow: 0 0 18px rgba(225, 6, 0, 0.18);
    }

    .vex-vehicle-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .vex-vehicle-meta span:not(.vex-status-pill) {
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
      border-radius: 999px;
      padding: 7px 10px;
    }

    .vex-status-pill {
      border-radius: 999px;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .vex-status-pill.is-success {
      color: #bbf7d0;
      background: rgba(34, 197, 94, 0.14);
      border-color: rgba(34, 197, 94, 0.34);
    }

    .vex-status-pill.is-warning {
      color: #fde68a;
      background: rgba(245, 158, 11, 0.14);
      border-color: rgba(245, 158, 11, 0.34);
    }

    .vex-status-pill.is-progress {
      color: #fecaca;
      background: rgba(225, 6, 0, 0.14);
      border-color: rgba(225, 6, 0, 0.34);
    }

    .vex-open-details {
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.06);
      color: white;
      font-weight: 600;
      padding: 12px 14px;
    }

    .vex-empty-premium {
      border: 1px solid rgba(225, 6, 0, 0.22);
      border-radius: 24px;
      padding: 28px;
      background: linear-gradient(145deg, rgba(5, 5, 5, 0.96), rgba(17, 24, 39, 0.9));
      display: grid;
      gap: 10px;
      color: white;
    }

    .vex-empty-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: var(--vex-red);
      font-weight: 600;
    }

    .sale-details-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      background: rgba(0, 0, 0, 0);
      transition: background 0.24s ease;
    }

    .sale-details-overlay.active {
      pointer-events: auto;
      background: rgba(0, 0, 0, 0.58);
    }

    .sale-details-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: min(520px, 100%);
      height: 100%;
      overflow-y: auto;
      background:
        radial-gradient(circle at top left, rgba(225, 6, 0, 0.24), transparent 34%),
        linear-gradient(180deg, #050505, #0b1020);
      border-left: 1px solid rgba(255, 255, 255, 0.10);
      box-shadow: -30px 0 80px rgba(0, 0, 0, 0.48);
      transform: translateX(105%);
      transition: transform 0.3s ease;
      padding: 22px;
    }

    .sale-details-overlay.active .sale-details-drawer {
      transform: translateX(0);
    }

    .sale-details-close {
      position: sticky;
      top: 0;
      margin-left: auto;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.08);
      color: white;
      font-size: 24px;
      z-index: 2;
    }

    .drawer-hero,
    .drawer-section {
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.055);
      padding: 20px;
      margin-bottom: 16px;
    }

    .drawer-logo-mark {
      width: 82px;
      height: 52px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: var(--vex-red);
      font-weight: 600;
      letter-spacing: -0.08em;
      margin-bottom: 18px;
    }

    .drawer-kicker {
      color: #fecaca;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.14em;
    }

    .drawer-hero h3 {
      margin: 8px 0;
      font-size: 30px;
      letter-spacing: -0.06em;
      color: white;
    }

    .drawer-hero > strong,
    .commission-total {
      display: block;
      color: #fff;
      font-size: 34px;
      font-weight: 600;
      letter-spacing: -0.06em;
      margin: 8px 0;
    }

    .drawer-hero p,
    .drawer-notes,
    .drawer-grid span,
    .drawer-label {
      color: var(--vex-muted);
    }

    .drawer-section h4 {
      color: white;
      margin: 0 0 14px 0;
      font-size: 16px;
    }

    .drawer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .drawer-grid.two {
      grid-template-columns: 1fr 1fr;
    }

    .drawer-grid div {
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.055);
      padding: 12px;
      display: grid;
      gap: 5px;
    }

    .drawer-grid strong {
      color: white;
      overflow-wrap: anywhere;
    }

    .drawer-label {
      display: grid;
      gap: 8px;
      margin-bottom: 12px;
      font-weight: 650;
    }

    .drawer-label select {
      width: 100%;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: #070b16;
      color: white;
      padding: 13px;
    }

    .commission-drawer {
      border-color: rgba(225, 6, 0, 0.28);
    }

    .drawer-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    @media (max-width: 780px) {
      .vex-vehicle-card {
        grid-template-columns: 44px 1fr;
      }

      .vex-vehicle-photo,
      .vex-open-details {
        display: none;
      }

      .vex-vehicle-title-row {
        display: grid;
      }

      .drawer-grid,
      .drawer-grid.two,
      .drawer-actions {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}


function initializeVexDashboardExecutive() {
  injectVexDashboardStyles();
  prepareVexDashboardLayout();
  prepareVexNavigationLabels();
}

function prepareVexNavigationLabels() {
  navButtons.forEach(function (button) {
    const target = button.getAttribute("data-section");

    if (target === "historySection") {
      button.textContent = "Veículos";
    }

    if (target === "newSaleSection") {
      button.textContent = "+ Nova Venda";
    }
  });
}

function prepareVexDashboardLayout() {
  const dashboardSection = document.getElementById("dashboardSection");

  if (!dashboardSection || dashboardSection.getAttribute("data-vex-dashboard-ready") === "true") {
    return;
  }

  dashboardSection.setAttribute("data-vex-dashboard-ready", "true");

  dashboardSection.innerHTML = `
    <div class="vex-dashboard-shell">
      <section class="vex-dashboard-hero">
        <div>
          <span class="vex-kicker" style="display:block;text-align:center">VEX MULTIMARCAS</span>
          <h2 id="vexGreetingTitle" style="text-align:center">Bom dia 👋</h2>
          <p id="vexCurrentDate">Dashboard Executivo Premium</p>
        </div>

        <div class="vex-brand-card">
          <strong>VEX</strong>
          <span>🔑 Vire a chave do seu sonho</span>
        </div>
      </section>

      <section class="vex-executive-grid">
        <article class="vex-commission-card">
          <div class="vex-card-topline">
            <span>Comissão do mês</span>
            <small id="vexMonthlySalesCount">0 veículos</small>
          </div>

          <strong id="vexMonthlyCommission">R$ 0,00</strong>

          <div class="vex-progress-info">
            <span id="vexGoalLabel">Meta: R$ 6.000,00</span>
            <span id="vexGoalPercent">0%</span>
          </div>

          <div class="vex-progress-track">
            <div id="vexGoalBar" class="vex-progress-fill"></div>
          </div>
        </article>

        <article class="vex-alert-card">
          <span>Central inteligente</span>
          <strong>Hoje na VEX</strong>
          <div id="vexSmartAlerts" class="vex-alert-list"></div>
        </article>
      </section>

      <section class="vex-kpi-grid">
        <article class="vex-kpi-card">
          <span>Veículos vendidos</span>
          <strong id="totalSalesCard">0</strong>
          <small>Total geral</small>
        </article>

        <article class="vex-kpi-card">
          <span>Valor vendido no mês</span>
          <strong id="vexMonthlySoldValue">R$ 0,00</strong>
          <small>Somente mês atual</small>
        </article>

        <article class="vex-kpi-card">
          <span>Ticket médio</span>
          <strong id="vexAverageTicket">R$ 0,00</strong>
          <small>Média por veículo</small>
        </article>

        <article class="vex-kpi-card">
          <span>Pendências</span>
          <strong id="pendingAfterSalesCard">0</strong>
          <small>Pós-vendas em aberto</small>
        </article>
      </section>

      <section class="vex-dashboard-columns">
        <article class="vex-panel-card">
          <div class="vex-panel-header">
            <div>
              <span class="vex-kicker">Últimos veículos</span>
              <h3>Vendidos recentemente</h3>
            </div>
            <button class="vex-mini-button" type="button" onclick="goToSection('historySection')">Ver veículos</button>
          </div>
          <div id="vexLatestVehicles" class="vex-latest-list"></div>
        </article>

        <article class="vex-panel-card">
          <div class="vex-panel-header">
            <div>
              <span class="vex-kicker">Atividades</span>
              <h3>Resumo operacional</h3>
            </div>
          </div>
          <div id="vexActivityTimeline" class="vex-timeline"></div>
        </article>
      </section>
    </div>
  `;
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();

  const totalSales = sales.length;
  const monthlyCommission = getTotalCommissionValue(currentMonthSales);
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const averageTicket = currentMonthSales.length > 0 ? monthlySoldValue / currentMonthSales.length : 0;
  const pendingAfterSales = sales.filter(function (sale) {
    return sale.afterSaleStatus !== "Finalizado";
  }).length;
  const pendingTransfers = sales.filter(function (sale) {
    return sale.afterSaleStatus === "Transferência em andamento" || sale.afterSaleStatus === "Aguardando Cliente" || sale.transferType === "Pela loja";
  }).length;

  const commissionGoal = 6000;
  const goalPercent = commissionGoal > 0 ? Math.min((monthlyCommission / commissionGoal) * 100, 100) : 0;
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexGreetingTitle", getGreetingText());
  setTextById("vexCurrentDate", getCurrentDateLabel());
  setTextById("vexMonthlySalesCount", `${currentMonthSales.length} veículo(s) no mês`);
  setTextById("vexMonthlyCommission", formatCurrencyToBrazil(monthlyCommission));
  setTextById("vexGoalLabel", `Meta: ${formatCurrencyToBrazil(commissionGoal)}`);
  setTextById("vexGoalPercent", `${goalPercent.toFixed(0)}%`);
  setTextById("totalSalesCard", totalSales);
  setTextById("vexMonthlySoldValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexAverageTicket", formatCurrencyToBrazil(averageTicket));
  setTextById("pendingAfterSalesCard", pendingAfterSales);

  const goalBar = document.getElementById("vexGoalBar");
  if (goalBar) {
    goalBar.style.width = `${goalPercent}%`;
  }

  renderVexSmartAlerts(pendingAfterSales, pendingTransfers, goalPercent, growth);
  renderVexLatestVehicles();
  renderVexActivityTimeline();
}

function renderVexSmartAlerts(pendingAfterSales, pendingTransfers, goalPercent, growth) {
  const container = document.getElementById("vexSmartAlerts");

  if (!container) {
    return;
  }

  const growthText = growth === null ? "Novo mês iniciado" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% vs mês anterior`;

  container.innerHTML = `
    <div><span>🔴</span><strong>${pendingAfterSales}</strong><small>pós-venda(s) pendente(s)</small></div>
    <div><span>📄</span><strong>${pendingTransfers}</strong><small>transferência(s) em atenção</small></div>
    <div><span>🎯</span><strong>${goalPercent.toFixed(0)}%</strong><small>da meta do mês</small></div>
    <div><span>📈</span><strong>${escapeHTML(growthText)}</strong><small>crescimento</small></div>
  `;
}

function renderVexLatestVehicles() {
  const container = document.getElementById("vexLatestVehicles");

  if (!container) {
    return;
  }

  const latestSales = sales.slice(0, 5);

  if (latestSales.length === 0) {
    container.innerHTML = `<div class="vex-dashboard-empty">Nenhum veículo vendido ainda.</div>`;
    return;
  }

  container.innerHTML = latestSales.map(function (sale) {
    return `
      <button class="vex-latest-item" type="button" onclick="openSaleDetails('${sale.id}')">
        <span class="vex-latest-icon">🚗</span>
        <span>
          <strong>${escapeHTML(sale.vehicleModel || "Veículo")}</strong>
          <small>${escapeHTML(sale.clientName || "Cliente")} • ${formatDateToBrazil(sale.saleDate)}</small>
        </span>
        <em>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</em>
      </button>
    `;
  }).join("");
}

function renderVexActivityTimeline() {
  const container = document.getElementById("vexActivityTimeline");

  if (!container) {
    return;
  }

  const latestSales = sales.slice(0, 4);

  if (latestSales.length === 0) {
    container.innerHTML = `<div class="vex-dashboard-empty">As atividades aparecerão conforme as vendas forem cadastradas.</div>`;
    return;
  }

  container.innerHTML = latestSales.map(function (sale) {
    return `
      <div class="vex-timeline-item">
        <span></span>
        <div>
          <strong>${escapeHTML(sale.vehicleModel || "Veículo")}</strong>
          <small>Venda registrada • ${escapeHTML(sale.afterSaleStatus || "Status")}</small>
        </div>
        <em>${formatDateToBrazil(sale.saleDate)}</em>
      </div>
    `;
  }).join("");
}

function getCurrentMonthSales() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return sales.filter(function (sale) {
    const date = createDateFromSaleDate(sale.saleDate);
    return date && date.getMonth() === month && date.getFullYear() === year;
  });
}

function getPreviousMonthSales() {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = previous.getMonth();
  const year = previous.getFullYear();

  return sales.filter(function (sale) {
    const date = createDateFromSaleDate(sale.saleDate);
    return date && date.getMonth() === month && date.getFullYear() === year;
  });
}

function createDateFromSaleDate(date) {
  if (!date || !date.includes("-")) {
    return null;
  }

  const parts = date.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function getTotalSoldValue(list) {
  return list.reduce(function (total, sale) {
    return total + parseSaleCurrencyValue(sale.saleValue);
  }, 0);
}

function getTotalCommissionValue(list) {
  return list.reduce(function (total, sale) {
    return total + Number(sale.totalCommission || 250);
  }, 0);
}

function calculateVexGrowth(currentValue, previousValue) {
  if (previousValue <= 0 && currentValue > 0) {
    return null;
  }

  if (previousValue <= 0 && currentValue <= 0) {
    return 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}


function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isBootstrapAdminEmail(email) {
  return ADMIN_EMAILS.includes(normalizeEmail(email));
}

function getCurrentUserRole() {
  if (isBootstrapAdminEmail(currentUser && currentUser.email)) {
    return "admin";
  }

  if (currentUserProfile && currentUserProfile.role === "admin") {
    return "admin";
  }

  return "user";
}

function canManageContent() {
  return getCurrentUserRole() === "admin";
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrador" : "Usuário";
}

function updateAccessControlUI() {
  const isAdmin = canManageContent();

  document.querySelectorAll(".admin-only").forEach(function (element) {
    element.classList.toggle("hidden", !isAdmin);
  });

  if (usersNavButton) {
    usersNavButton.classList.toggle("hidden", !isAdmin);
  }

  const saleSubmitButton = saleForm ? saleForm.querySelector('button[type="submit"]') : null;
  if (saleSubmitButton) {
    saleSubmitButton.disabled = !isAdmin;
    saleSubmitButton.textContent = isAdmin ? "Salvar venda" : "Somente ADM pode salvar venda";
  }
}

function stopUsersListener() {
  if (unsubscribeUsers) {
    unsubscribeUsers();
    unsubscribeUsers = null;
  }
}

function loadUsersForAdmin() {
  stopUsersListener();

  if (!db || !currentUser || !canManageContent()) {
    renderUsersList();
    return;
  }

  unsubscribeUsers = db.collection("users")
    .onSnapshot(
      function (snapshot) {
        users = snapshot.docs.map(function (doc) {
          return {
            id: doc.id,
            ...doc.data()
          };
        });

        users.sort(function (a, b) {
          const nameA = String(a.displayName || a.email || "").toLowerCase();
          const nameB = String(b.displayName || b.email || "").toLowerCase();
          return nameA.localeCompare(nameB, "pt-BR");
        });

        renderUsersList();

        if (usersMessage) {
          usersMessage.innerHTML = "";
        }
      },
      function (error) {
        console.error("Erro ao carregar usuários:", error);
        users = currentUser ? [{
          id: currentUser.uid,
          displayName: getCurrentUserDisplayName(),
          email: currentUser.email || "",
          role: getCurrentUserRole(),
          fallback: true
        }] : [];
        renderUsersList();
        if (usersMessage) {
          usersMessage.innerHTML = '<div class="empty-state">Não foi possível carregar todos os usuários. Confirme as regras do Firestore. Enquanto isso, sua conta ADM foi exibida em modo local.</div>';
        }
      }
    );
}

function renderUsersList() {
  if (!usersList) {
    return;
  }

  if (!canManageContent()) {
    usersList.innerHTML = "";
    return;
  }

  if (!users || users.length === 0) {
    usersList.innerHTML = `
      <div class="empty-state">
        Nenhum usuário encontrado ainda.<br>
        Os usuários aparecem aqui depois que acessam o aplicativo pela primeira vez.
      </div>
    `;
    return;
  }

  usersList.innerHTML = users.map(function (user) {
    const role = user.role === "admin" ? "admin" : "user";
    const isCurrent = currentUser && user.id === currentUser.uid;
    const name = user.displayName || createFriendlyNameFromEmail(user.email || "");
    const email = user.email || "E-mail não informado";
    const disabled = isCurrent ? "disabled" : "";
    const hint = isCurrent ? "Esta é sua conta atual. Não é possível rebaixar você mesmo pelo painel." : "";
    const roleBadgeClass = role === "admin" ? "role-badge admin" : "role-badge user";
    const lastLogin = user.lastLoginAtLocal ? formatUserDate(user.lastLoginAtLocal) : "Último acesso não registrado";

    return `
      <article class="user-card">
        <div class="user-card-main">
          <div class="user-mini-avatar">${escapeHTML(name.charAt(0).toUpperCase() || "U")}</div>
          <div>
            <strong>${escapeHTML(name)}</strong>
            <span>${escapeHTML(email)}</span>
            <small>${escapeHTML(lastLogin)}</small>
            <small>${escapeHTML(hint)}</small>
          </div>
        </div>

        <div class="user-card-actions">
          <span class="${roleBadgeClass}">${getRoleLabel(role)}</span>
          <select class="role-select" ${disabled} onchange="updateUserRole('${user.id}', this.value)">
            <option value="user" ${role === "user" ? "selected" : ""}>Usuário</option>
            <option value="admin" ${role === "admin" ? "selected" : ""}>Administrador</option>
          </select>
        </div>
      </article>
    `;
  }).join("");
}

async function updateUserRole(userId, role) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar permissões.");
    return;
  }

  if (!db || !userId) {
    return;
  }

  if (currentUser && userId === currentUser.uid) {
    alert("Por segurança, você não pode alterar o próprio acesso por este painel.");
    renderUsersList();
    return;
  }

  const cleanRole = role === "admin" ? "admin" : "user";

  try {
    await db.collection("users").doc(userId).set({
      role: cleanRole,
      updatedAtLocal: new Date().toISOString(),
      updatedBy: currentUser ? currentUser.uid : ""
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao atualizar permissão:", error);
    alert("Não foi possível atualizar a permissão. Verifique as regras do Firestore.");
    renderUsersList();
  }
}

function formatUserDate(value) {
  if (!value) {
    return "Último acesso não registrado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Último acesso não registrado";
  }

  return `Último acesso: ${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function getGreetingText() {
  const hour = new Date().getHours();
  const name = getCurrentUserDisplayName();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return `${greeting}, ${name} 👋`;
}

function getCurrentUserDisplayName() {
  if (currentUserProfile && currentUserProfile.displayName) {
    return currentUserProfile.displayName;
  }

  if (currentUser && currentUser.displayName) {
    return currentUser.displayName;
  }

  if (currentUser && currentUser.email) {
    return createFriendlyNameFromEmail(currentUser.email);
  }

  return "Junior";
}

function createFriendlyNameFromEmail(email) {
  const prefix = String(email || "")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim();

  if (prefix.toLowerCase().includes("junior")) {
    return "Junior";
  }

  if (prefix === "") {
    return "Usuário";
  }

  return prefix
    .split(" ")
    .filter(Boolean)
    .map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

async function saveUserDisplayName(user, displayName) {
  const cleanName = String(displayName || "").trim();

  if (!user || cleanName === "") {
    return;
  }

  if (typeof user.updateProfile === "function") {
    await user.updateProfile({ displayName: cleanName });
  }

  const role = await ensureUserProfileDocument(user, cleanName);
  currentUserProfile = {
    displayName: cleanName,
    role: role
  };
}

async function ensureUserProfileDocument(user, displayName) {
  if (!user || !db) {
    return isBootstrapAdminEmail(user && user.email) ? "admin" : "user";
  }

  const userRef = db.collection("users").doc(user.uid);
  const defaultRole = isBootstrapAdminEmail(user.email) ? "admin" : "user";

  try {
    const doc = await userRef.get();
    const existingData = doc.exists && doc.data() ? doc.data() : {};
    const finalRole = isBootstrapAdminEmail(user.email) ? "admin" : (existingData.role || defaultRole);

    await userRef.set({
      displayName: displayName || existingData.displayName || user.displayName || createFriendlyNameFromEmail(user.email || ""),
      email: user.email || existingData.email || "",
      role: finalRole,
      updatedAtLocal: new Date().toISOString(),
      lastLoginAtLocal: new Date().toISOString(),
      active: typeof existingData.active === "boolean" ? existingData.active : true,
      createdAtLocal: existingData.createdAtLocal || new Date().toISOString()
    }, { merge: true });

    return finalRole;
  } catch (error) {
    console.warn("Não foi possível garantir o perfil do usuário no Firestore:", error);
    return defaultRole;
  }
}

async function loadUserProfile(user) {
  const profile = {
    displayName: user && user.displayName ? user.displayName : "",
    role: isBootstrapAdminEmail(user && user.email) ? "admin" : "user"
  };

  if (!user || !db) {
    return profile;
  }

  try {
    const doc = await db.collection("users").doc(user.uid).get();

    if (doc.exists && doc.data()) {
      const data = doc.data();

      if (data.displayName) {
        profile.displayName = data.displayName;
      }

      if (data.role) {
        profile.role = data.role === "admin" ? "admin" : "user";
      }
    }

    if (isBootstrapAdminEmail(user.email)) {
      profile.role = "admin";
    }

    await ensureUserProfileDocument(user, profile.displayName || createFriendlyNameFromEmail(user.email || ""));
  } catch (error) {
    console.warn("Não foi possível ler o perfil do usuário no Firestore:", error);
  }

  return profile;
}

function updateUserIdentityUI() {
  const name = getCurrentUserDisplayName();
  const email = currentUser && currentUser.email ? currentUser.email : "";

  if (userEmailLabel) {
    userEmailLabel.textContent = email ? `${name} • ${getRoleLabel(getCurrentUserRole())} • ${email}` : "";
  }

  updateProfileForm();
  updateAccessControlUI();
}

function updateProfileForm() {
  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileEmail = document.getElementById("profileEmail");
  const profileAvatar = document.getElementById("profileAvatar");

  if (profileDisplayName) {
    profileDisplayName.value = currentUser ? getCurrentUserDisplayName() : "";
  }

  if (profileEmail) {
    profileEmail.value = currentUser && currentUser.email ? currentUser.email : "";
  }

  if (profileRole) {
    profileRole.value = currentUser ? getRoleLabel(getCurrentUserRole()) : "";
  }

  if (profileAvatar) {
    const name = getCurrentUserDisplayName();
    profileAvatar.textContent = name.charAt(0).toUpperCase();
  }
}

function showProfileMessage(message) {
  const profileMessage = document.getElementById("profileMessage");

  if (!profileMessage) {
    return;
  }

  if (message === "") {
    profileMessage.innerHTML = "";
    return;
  }

  profileMessage.innerHTML = `
    <div class="empty-state compact-message">
      ${escapeHTML(message)}
    </div>
  `;
}

function getCurrentDateLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function setTextById(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function injectVexDashboardStyles() {
  if (document.getElementById("vexDashboardExecutiveStyles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vexDashboardExecutiveStyles";
  style.textContent = `
    .vex-dashboard-shell {
      display: grid;
      gap: 18px;
      animation: vexFadeUp 0.35s ease both;
    }

    .vex-dashboard-hero,
    .vex-commission-card,
    .vex-alert-card,
    .vex-kpi-card,
    .vex-panel-card {
      border: 1px solid rgba(255,255,255,0.10);
      background:
        radial-gradient(circle at top left, rgba(225,6,0,0.20), transparent 30%),
        linear-gradient(145deg, rgba(5,5,5,0.98), rgba(17,24,39,0.92));
      box-shadow: 0 24px 80px rgba(0,0,0,0.42);
      border-radius: 28px;
    }

    .vex-dashboard-hero {
      padding: 28px;
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: stretch;
      overflow: hidden;
      position: relative;
    }

    .vex-dashboard-hero::after {
      content: "VEX";
      position: absolute;
      right: 26px;
      bottom: -28px;
      color: rgba(225,6,0,0.12);
      font-size: 118px;
      font-weight: 600;
      letter-spacing: -0.14em;
      pointer-events: none;
    }

    .vex-kicker {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      border: 1px solid rgba(225,6,0,0.36);
      background: rgba(225,6,0,0.14);
      color: #fff;
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    .vex-dashboard-hero h2 {
      margin: 14px 0 8px;
      color: white;
      font-size: clamp(30px, 4vw, 58px);
      letter-spacing: -0.07em;
      line-height: 0.98;
    }

    .vex-dashboard-hero p {
      color: #9ca3af;
      text-transform: capitalize;
    }

    .vex-brand-card {
      min-width: 220px;
      border-radius: 24px;
      border: 1px solid rgba(225,6,0,0.28);
      background: linear-gradient(145deg, rgba(225,6,0,0.22), rgba(255,255,255,0.05));
      display: grid;
      place-items: center;
      align-content: center;
      gap: 4px;
      position: relative;
      z-index: 1;
    }

    .vex-brand-card strong {
      color: #e10600;
      font-size: 46px;
      font-weight: 600;
      letter-spacing: -0.12em;
      line-height: 1;
    }

    .vex-brand-card span {
      color: white;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .vex-executive-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 18px;
    }

    .vex-commission-card,
    .vex-alert-card,
    .vex-kpi-card,
    .vex-panel-card {
      padding: 22px;
    }

    .vex-card-topline,
    .vex-progress-info,
    .vex-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .vex-card-topline span,
    .vex-kpi-card span,
    .vex-alert-card > span,
    .vex-progress-info,
    .vex-kpi-card small,
    .vex-latest-item small,
    .vex-timeline-item small,
    .vex-timeline-item em {
      color: #9ca3af;
    }

    .vex-card-topline span,
    .vex-kpi-card span,
    .vex-alert-card > span {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.11em;
    }

    .vex-card-topline small {
      color: #fecaca;
      font-weight: 650;
    }

    .vex-commission-card > strong {
      display: block;
      margin: 18px 0;
      color: white;
      font-size: clamp(42px, 7vw, 82px);
      letter-spacing: -0.08em;
      line-height: 0.95;
      text-shadow: 0 0 34px rgba(225,6,0,0.18);
    }

    .vex-progress-track {
      height: 13px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      overflow: hidden;
      margin-top: 10px;
    }

    .vex-progress-fill {
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, #e10600, #ff4b42);
      transition: width 0.45s ease;
      box-shadow: 0 0 22px rgba(225,6,0,0.44);
    }

    .vex-alert-card strong,
    .vex-panel-card h3 {
      display: block;
      margin: 8px 0 14px;
      color: white;
      font-size: 24px;
      letter-spacing: -0.04em;
    }

    .vex-alert-list {
      display: grid;
      gap: 10px;
    }

    .vex-alert-list div {
      display: grid;
      grid-template-columns: 34px 54px 1fr;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 10px;
      background: rgba(255,255,255,0.045);
    }

    .vex-alert-list strong {
      margin: 0;
      font-size: 20px;
    }

    .vex-alert-list small {
      color: #9ca3af;
    }

    .vex-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    .vex-kpi-card {
      display: grid;
      gap: 10px;
      min-height: 138px;
      align-content: space-between;
      transition: transform 0.22s ease, border-color 0.22s ease;
    }

    .vex-kpi-card:hover {
      transform: translateY(-2px);
      border-color: rgba(225,6,0,0.36);
    }

    .vex-kpi-card strong {
      color: white;
      font-size: clamp(26px, 3vw, 38px);
      letter-spacing: -0.06em;
      line-height: 1;
    }

    .vex-dashboard-columns {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 18px;
    }

    .vex-mini-button {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: white;
      border-radius: 14px;
      padding: 10px 12px;
      font-weight: 600;
    }

    .vex-latest-list,
    .vex-timeline {
      display: grid;
      gap: 10px;
    }

    .vex-latest-item {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      background: rgba(255,255,255,0.045);
      padding: 12px;
      color: white;
      display: grid;
      grid-template-columns: 42px 1fr auto;
      align-items: center;
      gap: 12px;
      text-align: left;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .vex-latest-item:hover {
      transform: translateX(3px);
      background: rgba(225,6,0,0.10);
    }

    .vex-latest-icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: rgba(225,6,0,0.18);
    }

    .vex-latest-item strong,
    .vex-latest-item small {
      display: block;
    }

    .vex-latest-item em {
      color: #fff;
      font-style: normal;
      font-weight: 600;
      white-space: nowrap;
    }

    .vex-timeline-item {
      display: grid;
      grid-template-columns: 12px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .vex-timeline-item > span {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #e10600;
      box-shadow: 0 0 20px rgba(225,6,0,0.58);
    }

    .vex-timeline-item strong,
    .vex-timeline-item small {
      display: block;
    }

    .vex-dashboard-empty {
      border: 1px dashed rgba(255,255,255,0.14);
      border-radius: 18px;
      padding: 18px;
      color: #9ca3af;
    }

    .vex-logo-placeholder {
      background:
        radial-gradient(circle at top, rgba(225,6,0,0.28), transparent 55%),
        linear-gradient(135deg, #050505, #161616) !important;
      border-color: rgba(225,6,0,0.38) !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0 !important;
    }

    .vex-car-symbol {
      font-size: 22px;
      filter: drop-shadow(0 0 12px rgba(225,6,0,0.38));
    }

    .vex-logo-text {
      display: grid;
      line-height: 1;
    }

    .vex-logo-text strong {
      color: #e10600;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.10em;
    }

    .vex-logo-text span {
      color: white;
      font-size: 7px;
      font-weight: 600;
      letter-spacing: 0.16em;
    }

    .vex-vehicle-photo-large.vex-logo-placeholder {
      width: 100%;
      min-height: 160px;
      border-radius: 24px;
      margin-bottom: 18px;
    }

    .vex-vehicle-photo-large .vex-car-symbol {
      font-size: 42px;
    }

    .vex-vehicle-photo-large .vex-logo-text strong {
      font-size: 48px;
    }

    .vex-vehicle-photo-large .vex-logo-text span {
      font-size: 12px;
    }

    @keyframes vexFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1120px) {
      .vex-executive-grid,
      .vex-dashboard-columns {
        grid-template-columns: 1fr;
      }

      .vex-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 720px) {
      .vex-dashboard-hero {
        display: grid;
      }

      .vex-brand-card {
        min-width: 0;
        min-height: 120px;
      }

      .vex-kpi-grid {
        grid-template-columns: 1fr;
      }

      .vex-latest-item {
        grid-template-columns: 42px 1fr;
      }

      .vex-latest-item em {
        grid-column: 2;
      }
    }
  `;

  document.head.appendChild(style);
}

function getStatusOptions(selectedStatus) {
  const statuses = [
    "Pendente",
    "Em andamento",
    "Aguardando Cliente",
    "Transferência em andamento",
    "Transferido",
    "Finalizado"
  ];

  return statuses.map(function (status) {
    const selected = status === selectedStatus ? "selected" : "";
    return `<option value="${status}" ${selected}>${status}</option>`;
  }).join("");
}

function getTransferOptions(selectedTransfer) {
  const transfers = [
    "Pela loja",
    "Pelo cliente"
  ];

  return transfers.map(function (transfer) {
    const selected = transfer === selectedTransfer ? "selected" : "";
    return `<option value="${transfer}" ${selected}>${transfer}</option>`;
  }).join("");
}

function updateDashboardCards() {
  const totalSalesElement = document.getElementById("totalSalesCard");
  const totalCommissionElement = document.getElementById("totalCommissionCard");
  const pendingAfterSalesElement = document.getElementById("pendingAfterSalesCard");
  const transferSalesElement = document.getElementById("transferSalesCard");

  const totalSales = sales.length;
  const totalCommission = sales.reduce(function (total, sale) {
    return total + Number(sale.totalCommission || 250);
  }, 0);

  const pendingAfterSales = sales.filter(function (sale) {
    return sale.afterSaleStatus !== "Finalizado";
  }).length;

  const transferSales = sales.filter(function (sale) {
    return sale.transferType === "Pela loja" || sale.transferType === "Pelo cliente";
  }).length;

  if (totalSalesElement) totalSalesElement.textContent = totalSales;
  if (totalCommissionElement) totalCommissionElement.textContent = formatCurrencyToBrazil(totalCommission);
  if (pendingAfterSalesElement) pendingAfterSalesElement.textContent = pendingAfterSales;
  if (transferSalesElement) transferSalesElement.textContent = transferSales;
}

function updateReports() {
  if (!reportTotalSales) return;

  const totalSales = sales.length;

  const totalCommission = sales.reduce(function (total, sale) {
    return total + Number(sale.totalCommission || 0);
  }, 0);

  const frankCommission = sales.reduce(function (total, sale) {
    return total + Number(sale.frankCommission || 0);
  }, 0);

  const lucasCommission = sales.reduce(function (total, sale) {
    return total + Number(sale.lucasCommission || 0);
  }, 0);

  const storeTransfer = sales.filter(function (sale) {
    return sale.transferType === "Pela loja";
  }).length;

  const clientTransfer = sales.filter(function (sale) {
    return sale.transferType === "Pelo cliente";
  }).length;

  const pendingAfterSales = sales.filter(function (sale) {
    return sale.afterSaleStatus !== "Finalizado";
  }).length;

  const finishedAfterSales = sales.filter(function (sale) {
    return sale.afterSaleStatus === "Finalizado";
  }).length;

  reportTotalSales.textContent = totalSales;
  reportTotalCommission.textContent = formatCurrencyToBrazil(totalCommission);
  reportFrankCommission.textContent = formatCurrencyToBrazil(frankCommission);
  reportLucasCommission.textContent = formatCurrencyToBrazil(lucasCommission);
  reportStoreTransfer.textContent = storeTransfer;
  reportClientTransfer.textContent = clientTransfer;
  reportPendingAfterSales.textContent = pendingAfterSales;
  reportFinishedAfterSales.textContent = finishedAfterSales;
}

function getAuthErrorMessage(error) {
  const code = error.code;

  if (code === "auth/invalid-email") {
    return "E-mail inválido.";
  }

  if (code === "auth/user-not-found") {
    return "Usuário não encontrado.";
  }

  if (code === "auth/wrong-password") {
    return "Senha incorreta.";
  }

  if (code === "auth/invalid-credential") {
    return "E-mail ou senha incorretos.";
  }

  if (code === "auth/too-many-requests") {
    return "Muitas tentativas. Aguarde e tente novamente.";
  }

  if (code === "auth/email-already-in-use") {
    return "Este e-mail já possui conta. Use Entrar.";
  }

  if (code === "auth/weak-password") {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Cadastro por e-mail/senha não está habilitado no Firebase Authentication.";
  }

  return authMode === "register"
    ? "Erro ao criar conta. Verifique os dados."
    : "Erro ao entrar. Verifique o e-mail e a senha.";
}

function formatCurrencyToBrazil(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatDateToBrazil(date) {
  if (!date || !date.includes("-")) {
    return "Data inválida";
  }

  const dateParts = date.split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  return `${day}/${month}/${year}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.deleteSale = deleteSale;
window.updateSaleStatus = updateSaleStatus;
window.updateSaleTransfer = updateSaleTransfer;
window.updateUserRole = updateUserRole;
window.openSaleDetails = openSaleDetails;
window.closeSaleDetails = closeSaleDetails;

window.goToSection = goToSection;



/* =========================================================
   VEX HUB PRO v2.0 — Fase 02
   Veículos Premium + Drawer
   ========================================================= */

function initializeVexPhase02Vehicles() {
  renameHistoryToVehicles();
  ensureVehicleDrawerRoot();
}

function renameHistoryToVehicles() {
  const buttons = document.querySelectorAll(".nav-item");

  buttons.forEach(function (button) {
    const section = button.getAttribute("data-section") || "";
    const text = (button.textContent || "").toLowerCase();

    if (section.includes("history") || text.includes("histórico") || text.includes("historico")) {
      button.textContent = "🚗 Veículos";
    }
  });
}

function ensureVehicleDrawerRoot() {
  if (document.getElementById("vexVehicleDrawerRoot")) {
    return;
  }

  const drawer = document.createElement("div");
  drawer.id = "vexVehicleDrawerRoot";
  drawer.className = "vex-drawer-root";
  document.body.appendChild(drawer);
}

function getVexStatusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("finalizado")) return "vex-status-finalizado";
  if (normalized.includes("transferido")) return "vex-status-transferido";
  if (normalized.includes("transferência") || normalized.includes("transferencia")) return "vex-status-transferencia";
  if (normalized.includes("andamento")) return "vex-status-andamento";
  if (normalized.includes("aguardando")) return "vex-status-aguardando";
  if (normalized.includes("pendente")) return "vex-status-pendente";

  return "";
}

function getVehicleDisplayPrice(sale) {
  if (typeof formatSaleValue === "function") {
    return formatSaleValue(sale);
  }

  if (typeof formatCurrencyToBrazil === "function" && sale.saleValueNumber) {
    return formatCurrencyToBrazil(sale.saleValueNumber);
  }

  return escapeHTML(sale.saleValue || "R$ 0,00");
}

function renderVexVehiclesPremium() {
  if (!historyList || !historyCounter) {
    return false;
  }

  const filteredSales = getFilteredSales();

  const historySection = document.getElementById("historySection");
  if (historySection) {
    const header = historySection.querySelector(".section-header");
    if (header && !header.classList.contains("vex-vehicles-header")) {
      header.classList.add("vex-vehicles-header");
      const titleBlock = header.querySelector("div");
      if (titleBlock) {
        titleBlock.classList.add("vex-vehicles-title");
        const eyebrow = titleBlock.querySelector(".eyebrow");
        const title = titleBlock.querySelector("h2");
        const desc = titleBlock.querySelector("p");

        if (eyebrow) eyebrow.textContent = "Catálogo inteligente";
        if (title) title.textContent = "Veículos Vendidos";
        if (desc) desc.textContent = "Lista premium de veículos vendidos com detalhes completos em painel lateral.";
      }
    }
  }

  if (sales.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        Nenhum veículo vendido registrado ainda.
      </div>
    `;

    historyCounter.textContent = "0 veículos";
    return true;
  }

  if (filteredSales.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        Nenhum veículo encontrado com os filtros aplicados.
      </div>
    `;

    historyCounter.textContent = "0 encontrados";
    return true;
  }

  const totalValue = filteredSales.reduce(function(total, sale) {
    return total + (typeof getSaleNumericValue === "function" ? getSaleNumericValue(sale) : Number(sale.saleValueNumber || 0));
  }, 0);

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veículo(s)`;

  historyList.className = "vex-vehicle-list";

  historyList.innerHTML = `
    <div class="vex-vehicles-summary vex-vehicles-summary-compact">
      <span>Total filtrado</span>
      <strong>${typeof formatCurrencyToBrazil === "function" ? formatCurrencyToBrazil(totalValue) : "R$ " + totalValue}</strong>
    </div>

    <div class="vex-vehicle-compact-feed">
      ${filteredSales.map(function (sale) {
        const statusClass = getVexStatusClass(sale.afterSaleStatus);
        const vehicleName = `${sale.vehicleModel || "Veículo"} ${sale.vehicleYear || ""}`.trim();

        return `
          <article class="vex-vehicle-card vex-vehicle-card-compact" onclick="openVexVehicleDrawer('${sale.id}')">
            <div class="vex-vehicle-compact-main">
              <h3 class="vex-vehicle-compact-title">${escapeHTML(vehicleName)}</h3>
              <div class="vex-vehicle-compact-subline">
                <span>${escapeHTML(sale.clientName || "Cliente não informado")}</span>
                <span>${formatDateToBrazil(sale.saleDate)}</span>
                <span>${escapeHTML(sale.transferType || "Transferência não informada")}</span>
              </div>
            </div>

            <div class="vex-vehicle-compact-meta">
              <strong class="vex-vehicle-price">${getVehicleDisplayPrice(sale)}</strong>
              <span class="vex-status-badge ${statusClass}">
                ${escapeHTML(sale.afterSaleStatus || "Sem status")}
              </span>
            </div>

            <div class="vex-card-chevron">›</div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  return true;
}

function openVexVehicleDrawer(saleId) {
  const sale = sales.find(function(item) {
    return item.id === saleId;
  });

  if (!sale) {
    return;
  }

  const drawer = document.getElementById("vexVehicleDrawerRoot");
  if (!drawer) {
    return;
  }

  const statusClass = getVexStatusClass(sale.afterSaleStatus);

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">×</button>

      <section class="vex-drawer-hero">
        <div class="vex-vehicle-icon">🚗</div>
        <span class="eyebrow">Veículo vendido</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veículo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente não informado")} • ${formatDateToBrazil(sale.saleDate)}</p>
        <div class="vex-drawer-price">${getVehicleDisplayPrice(sale)}</div>
      </section>

      <div class="vex-detail-grid">
        <div class="vex-detail-item">
          <span>Cliente</span>
          <strong>${escapeHTML(sale.clientName || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Telefone</span>
          <strong>${escapeHTML(sale.clientPhone || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Data da venda</span>
          <strong>${formatDateToBrazil(sale.saleDate)}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Preço FIPE / tabela</span>
          <strong>${typeof getFipeDisplayValue === "function" ? getFipeDisplayValue(sale) : "-"}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Versão</span>
          <strong>${escapeHTML(sale.vehicleVersion || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Câmbio</span>
          <strong>${escapeHTML(sale.vehicleTransmission || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Cor</span>
          <strong>${escapeHTML(sale.vehicleColor || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Placa</span>
          <strong>${escapeHTML(sale.vehiclePlate || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>KM atual</span>
          <strong>${escapeHTML(sale.vehicleKm || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Transferência</span>
          <strong>${escapeHTML(sale.transferType || "-")}</strong>
        </div>

        <div class="vex-detail-item full">
          <span>Status</span>
          <strong>
            ${canManageContent() ? `<select class="history-inline-select" onchange="updateSaleStatus('${sale.id}', this.value)">${getStatusOptions(sale.afterSaleStatus)}</select>` : escapeHTML(sale.afterSaleStatus || "-")}
          </strong>
        </div>

        <div class="vex-detail-item full">
          <span>Alterar transferência</span>
          <strong>
            ${canManageContent() ? `<select class="history-inline-select" onchange="updateSaleTransfer('${sale.id}', this.value)">${getTransferOptions(sale.transferType)}</select>` : escapeHTML(sale.transferType || "-")}
          </strong>
        </div>

        <div class="vex-detail-item">
          <span>Comissão total</span>
          <strong>R$ 250,00</strong>
        </div>

        <div class="vex-detail-item">
          <span>Frank Luiz</span>
          <strong>R$ 125,00</strong>
        </div>

        <div class="vex-detail-item">
          <span>Lucas Luiz</span>
          <strong>R$ 125,00</strong>
        </div>

        <div class="vex-detail-item full">
          <span>Observações</span>
          <strong>${escapeHTML(sale.saleNotes || "Sem observações")}</strong>
        </div>
      </div>

      <div class="vex-drawer-actions">
        <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        ${canManageContent() ? `<button class="secondary-button" type="button" onclick="deleteSale('${sale.id}')">Excluir</button>` : ""}
      </div>
    </aside>
  `;

  drawer.classList.add("active");
}

function closeVexVehicleDrawer() {
  const drawer = document.getElementById("vexVehicleDrawerRoot");

  if (drawer) {
    drawer.classList.remove("active");
  }
}

window.openVexVehicleDrawer = openVexVehicleDrawer;
window.closeVexVehicleDrawer = closeVexVehicleDrawer;



/* =========================================================
   VEX HUB PRO v2.0 — Fase 03 BUILD 02
   Campos extras inseridos sem recriar o formulário
   ========================================================= */

function initializeVexPhase03Build02() {
  insertVexPhase03Build02Fields();
  initializeVexPhase03Build02Masks();
}

function insertVexPhase03Build02Fields() {
  const form = document.getElementById("saleForm");
  const vehicleYear = document.getElementById("vehicleYear");

  if (!form || !vehicleYear || document.getElementById("vehiclePlate")) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "vex-f03-extra-fields";

  wrapper.innerHTML = `
    <label>
      Preço FIPE / tabela
      <input id="vehicleFipeValue" type="text" placeholder="Ex: R$ 41.990,00" />
    </label>

    <label>
      Versão
      <input id="vehicleVersion" type="text" placeholder="Ex: Completo, LX, GLX, XEI" />
    </label>

    <label>
      Câmbio
      <select id="vehicleTransmission">
        <option value="">Selecione</option>
        <option value="Automático">Automático</option>
        <option value="Manual">Manual</option>
      </select>
    </label>

    <label>
      Cor
      <input id="vehicleColor" type="text" placeholder="Ex: Preto, Prata, Vermelho" />
    </label>

    <label>
      Placa
      <input id="vehiclePlate" type="text" placeholder="Ex: ABC1D23" maxlength="7" />
    </label>

    <label>
      KM atual
      <input id="vehicleKm" type="text" placeholder="Ex: 103.570" />
    </label>
  `;

  const vehicleYearLabel = vehicleYear.closest("label");

  if (vehicleYearLabel && vehicleYearLabel.parentNode) {
    vehicleYearLabel.parentNode.insertBefore(wrapper, vehicleYearLabel.nextSibling);
  } else {
    form.insertBefore(wrapper, form.firstChild);
  }

  initializeVexPhase03Build02Masks();
}

function initializeVexPhase03Build02Masks() {
  const phone = document.getElementById("clientPhone");
  const saleValue = document.getElementById("saleValue");
  const fipe = document.getElementById("vehicleFipeValue");
  const km = document.getElementById("vehicleKm");
  const plate = document.getElementById("vehiclePlate");

  if (phone && phone.dataset.vexF03Phone !== "true") {
    phone.dataset.vexF03Phone = "true";
    phone.addEventListener("input", function () {
      phone.value = maskVexF03Phone(phone.value);
    });
  }

  [saleValue, fipe].forEach(function (input) {
    if (input && input.dataset.vexF03Money !== "true") {
      input.dataset.vexF03Money = "true";
      input.addEventListener("input", function () {
        input.value = maskVexF03Money(input.value);
      });
    }
  });

  if (km && km.dataset.vexF03Km !== "true") {
    km.dataset.vexF03Km = "true";
    km.addEventListener("input", function () {
      km.value = maskVexF03Integer(km.value);
    });
  }

  if (plate && plate.dataset.vexF03Plate !== "true") {
    plate.dataset.vexF03Plate = "true";
    plate.addEventListener("input", function () {
      plate.value = String(plate.value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 7);
    });
  }
}

function maskVexF03Phone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskVexF03Money(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function maskVexF03Integer(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR");
}

function getVexF03Value(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function parseVexF03Number(value) {
  const clean = String(value || "")
    .replaceAll("R$", "")
    .replaceAll(" ", "")
    .replaceAll(".", "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const number = Number(clean);
  return Number.isNaN(number) ? 0 : number;
}

function getVehicleSpecsHTML(sale) {
  const specs = [];

  if (sale.vehicleVersion) specs.push(sale.vehicleVersion);
  if (sale.vehicleTransmission) specs.push(sale.vehicleTransmission);
  if (sale.vehicleColor) specs.push(sale.vehicleColor);
  if (sale.vehiclePlate) specs.push(sale.vehiclePlate);
  if (sale.vehicleKm) specs.push(`${sale.vehicleKm} km`);

  if (specs.length === 0) return "";

  return `
    <div class="vex-vehicle-specs">
      ${specs.map(function (spec) {
        return `<span class="vex-spec-pill">${escapeHTML(spec)}</span>`;
      }).join("")}
    </div>
  `;
}

function getFipeDisplayValue(sale) {
  if (sale.vehicleFipeValue) return escapeHTML(sale.vehicleFipeValue);
  if (sale.vehicleFipeValueNumber && typeof formatCurrencyToBrazil === "function") {
    return formatCurrencyToBrazil(sale.vehicleFipeValueNumber);
  }
  return "-";
}

/* =========================================================
   VEX HUB PRO v1.0 PREMIUM UI — Sprint 6
   UX Lista Premium + refinamento visual estrutural
   ========================================================= */

function initializeVexPremiumUISprint6() {
  injectVexPremiumUISprint6Styles();
  prepareVexSprint6Copy();
}

function prepareVexSprint6Copy() {
  const historySection = document.getElementById("historySection");
  if (historySection) {
    const title = historySection.querySelector(".section-header h2");
    const description = historySection.querySelector(".section-header p");
    const eyebrow = historySection.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = "Catálogo VEX";
    if (title) title.textContent = "Veículos";
    if (description) description.textContent = "Lista compacta para localizar veículos rapidamente. Clique em qualquer linha para ver os detalhes completos.";
  }

  const saleSection = document.getElementById("newSaleSection");
  if (saleSection) {
    const title = saleSection.querySelector(".section-header h2");
    const description = saleSection.querySelector(".section-header p");
    if (title) title.textContent = "Nova Venda";
    if (description) description.textContent = "Cadastro organizado por cliente, veículo, financeiro e entrega.";
  }
}

function getVexVehicleOneLine(sale) {
  const parts = [];
  if (sale.vehicleModel) parts.push(sale.vehicleModel);
  if (sale.vehicleYear) parts.push(sale.vehicleYear);
  if (sale.vehicleVersion) parts.push(sale.vehicleVersion);
  if (sale.vehicleTransmission) parts.push(sale.vehicleTransmission);
  if (sale.vehicleColor) parts.push(sale.vehicleColor);
  if (sale.vehiclePlate) parts.push(sale.vehiclePlate);
  return parts.filter(Boolean).join(" • ") || "Veículo não informado";
}

function getVexVehicleSmallSpecs(sale) {
  const parts = [];
  if (sale.clientName) parts.push(sale.clientName);
  if (sale.clientPhone) parts.push(sale.clientPhone);
  if (sale.transferType) parts.push(sale.transferType);
  if (sale.saleDate) parts.push(formatDateToBrazil(sale.saleDate));
  return parts.filter(Boolean).join(" • ") || "Informações complementares não informadas";
}

function renderVexVehiclesPremium() {
  if (!historyList || !historyCounter) {
    return false;
  }

  prepareVexSprint6Copy();

  const filteredSales = getFilteredSales();

  if (sales.length === 0) {
    historyList.className = "vex-premium-list-shell";
    historyList.innerHTML = `
      <div class="vex-s6-empty">
        <strong>Nenhum veículo vendido ainda.</strong>
        <span>Quando uma venda for salva, o veículo aparecerá aqui em formato de lista compacta.</span>
      </div>
    `;
    historyCounter.textContent = "0 veículos";
    return true;
  }

  if (filteredSales.length === 0) {
    historyList.className = "vex-premium-list-shell";
    historyList.innerHTML = `
      <div class="vex-s6-empty">
        <strong>Nenhum veículo encontrado.</strong>
        <span>Limpe os filtros ou tente outro cliente, telefone, veículo, placa ou status.</span>
      </div>
    `;
    historyCounter.textContent = "0 encontrados";
    return true;
  }

  const totalValue = filteredSales.reduce(function(total, sale) {
    return total + parseSaleCurrencyValue(sale.saleValue);
  }, 0);

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veículo(s)`;
  historyList.className = "vex-premium-list-shell";

  historyList.innerHTML = `
    <div class="vex-s6-list-toolbar">
      <div>
        <span>Total filtrado</span>
        <strong>${formatCurrencyToBrazil(totalValue)}</strong>
      </div>
      <small>${filteredSales.length} veículo(s) na lista</small>
    </div>

    <div class="vex-s6-vehicle-list">
      ${filteredSales.map(function (sale) {
        const statusClass = getVexStatusClass(sale.afterSaleStatus);
        const vehicleLine = getVexVehicleOneLine(sale);
        const subLine = getVexVehicleSmallSpecs(sale);
        const value = formatSaleValuePremium(sale.saleValue);

        return `
          <button class="vex-s6-vehicle-row" type="button" onclick="openVexVehicleDrawer('${sale.id}')" title="${escapeHTML(vehicleLine)}">
            <span class="vex-s6-row-icon">🚗</span>

            <span class="vex-s6-row-main">
              <strong>${escapeHTML(vehicleLine)}</strong>
              <small>${escapeHTML(subLine)}</small>
            </span>

            <span class="vex-s6-row-value">${escapeHTML(value)}</span>
            <span class="vex-s6-row-status ${statusClass}">${escapeHTML(sale.afterSaleStatus || "Sem status")}</span>
            <span class="vex-s6-row-arrow">›</span>
          </button>
        `;
      }).join("")}
    </div>
  `;

  return true;
}

function updateReports() {
  if (!reportTotalSales) return;

  const totalSales = sales.length;
  const totalCommission = sales.reduce(function (total, sale) { return total + Number(sale.totalCommission || 0); }, 0);
  const frankCommission = sales.reduce(function (total, sale) { return total + Number(sale.frankCommission || 0); }, 0);
  const lucasCommission = sales.reduce(function (total, sale) { return total + Number(sale.lucasCommission || 0); }, 0);
  const soldValue = sales.reduce(function(total, sale) { return total + parseSaleCurrencyValue(sale.saleValue); }, 0);
  const storeTransfer = sales.filter(function (sale) { return sale.transferType === "Pela loja"; }).length;
  const clientTransfer = sales.filter(function (sale) { return sale.transferType === "Pelo cliente"; }).length;
  const pendingAfterSales = sales.filter(function (sale) { return sale.afterSaleStatus !== "Finalizado"; }).length;
  const finishedAfterSales = sales.filter(function (sale) { return sale.afterSaleStatus === "Finalizado"; }).length;

  reportTotalSales.textContent = totalSales;
  reportTotalCommission.textContent = formatCurrencyToBrazil(totalCommission);
  reportFrankCommission.textContent = formatCurrencyToBrazil(frankCommission);
  reportLucasCommission.textContent = formatCurrencyToBrazil(lucasCommission);
  reportStoreTransfer.textContent = storeTransfer;
  reportClientTransfer.textContent = clientTransfer;
  reportPendingAfterSales.textContent = pendingAfterSales;
  reportFinishedAfterSales.textContent = finishedAfterSales;

  const reportsSection = document.getElementById("reportsSection");
  if (reportsSection && reportsSection.dataset.vexS6Reports !== "true") {
    reportsSection.dataset.vexS6Reports = "true";
    const header = reportsSection.querySelector(".section-header p");
    if (header) header.textContent = "Indicadores executivos das vendas cadastradas.";
  }
}

function injectVexPremiumUISprint6Styles() {
  if (document.getElementById("vexPremiumUISprint6Styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vexPremiumUISprint6Styles";
  style.textContent = `
    :root {
      --vex-s6-bg: #050609;
      --vex-s6-card: rgba(12, 15, 24, 0.94);
      --vex-s6-card-soft: rgba(255, 255, 255, 0.045);
      --vex-s6-line: rgba(255, 255, 255, 0.10);
      --vex-s6-line-red: rgba(225, 6, 0, 0.34);
      --vex-s6-red: #e10600;
      --vex-s6-red-bright: #ff2a22;
      --vex-s6-text: #ffffff;
      --vex-s6-muted: #a3a7b3;
      --vex-s6-radius: 20px;
      --vex-s6-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
    }

    .workspace {
      background:
        radial-gradient(circle at top right, rgba(225, 6, 0, 0.10), transparent 30%),
        linear-gradient(180deg, #07080d 0%, #050609 100%);
    }

    .content-section {
      animation: vexS6Fade 0.22s ease both;
    }

    @keyframes vexS6Fade {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .section-header,
    .filters-card,
    .form-card,
    .reports-grid > div,
    .user-card,
    .profile-card,
    .admin-info-card {
      border-radius: var(--vex-s6-radius) !important;
      border: 1px solid var(--vex-s6-line) !important;
      box-shadow: var(--vex-s6-shadow);
    }

    #historySection .section-header {
      padding: 18px 20px !important;
      min-height: unset !important;
    }

    #historySection .section-header::after {
      display: none !important;
    }

    #historySection .filters-card {
      display: grid;
      grid-template-columns: minmax(260px, 1fr) minmax(170px, 220px) minmax(170px, 220px) auto;
      gap: 10px;
      align-items: center;
      padding: 12px !important;
      margin: 14px 0 !important;
    }

    #historySection .filters-card input,
    #historySection .filters-card select,
    #historySection .filters-card button {
      min-height: 44px;
      border-radius: 14px;
    }

    .vex-premium-list-shell {
      display: grid;
      gap: 10px;
    }

    .vex-s6-list-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid rgba(225, 6, 0, 0.22);
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(225, 6, 0, 0.12), rgba(255, 255, 255, 0.035));
      color: var(--vex-s6-text);
    }

    .vex-s6-list-toolbar div {
      display: flex;
      align-items: baseline;
      gap: 10px;
      min-width: 0;
    }

    .vex-s6-list-toolbar span,
    .vex-s6-list-toolbar small {
      color: var(--vex-s6-muted);
      font-size: 12px;
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .vex-s6-list-toolbar strong {
      font-size: 18px;
      letter-spacing: -0.04em;
    }

    .vex-s6-vehicle-list {
      display: grid;
      gap: 6px;
    }

    .vex-s6-vehicle-row {
      width: 100%;
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) minmax(112px, auto) minmax(120px, auto) 18px;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 9px 12px;
      text-align: left;
      color: var(--vex-s6-text);
      border: 1px solid rgba(255, 255, 255, 0.075);
      border-left: 3px solid rgba(225, 6, 0, 0.78);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.058), rgba(255, 255, 255, 0.022));
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
    }

    .vex-s6-vehicle-row:hover {
      transform: translateY(-1px);
      border-color: rgba(225, 6, 0, 0.34);
      background: linear-gradient(135deg, rgba(225, 6, 0, 0.12), rgba(255, 255, 255, 0.038));
    }

    .vex-s6-row-icon {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: rgba(225, 6, 0, 0.15);
      border: 1px solid rgba(225, 6, 0, 0.22);
      font-size: 15px;
    }

    .vex-s6-row-main {
      min-width: 0;
      display: grid;
      gap: 3px;
    }

    .vex-s6-row-main strong {
      display: block;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.025em;
      color: #fff;
    }

    .vex-s6-row-main small {
      display: block;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--vex-s6-muted);
      font-size: 12px;
      font-weight: 600;
    }

    .vex-s6-row-value {
      justify-self: end;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .vex-s6-row-status {
      justify-self: end;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fecaca;
      background: rgba(225, 6, 0, 0.13);
    }

    .vex-s6-row-status.vex-status-finalizado,
    .vex-s6-row-status.vex-status-transferido {
      color: #bbf7d0;
      background: rgba(34, 197, 94, 0.13);
      border-color: rgba(34, 197, 94, 0.28);
    }

    .vex-s6-row-status.vex-status-pendente,
    .vex-s6-row-status.vex-status-aguardando {
      color: #fde68a;
      background: rgba(245, 158, 11, 0.13);
      border-color: rgba(245, 158, 11, 0.28);
    }

    .vex-s6-row-arrow {
      color: rgba(255,255,255,.44);
      font-size: 24px;
      line-height: 1;
    }

    .vex-s6-empty {
      display: grid;
      gap: 8px;
      padding: 22px;
      border: 1px solid var(--vex-s6-line);
      border-radius: 20px;
      background: var(--vex-s6-card-soft);
      color: #fff;
    }

    .vex-s6-empty span {
      color: var(--vex-s6-muted);
    }

    #newSaleSection .form-card {
      padding: 18px !important;
    }

    #saleForm .form-grid,
    #saleForm .vex-f03-extra-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 18px;
      background: rgba(255,255,255,.032);
      margin-bottom: 12px;
    }

    #saleForm label {
      gap: 7px;
      font-size: 12px;
      color: var(--vex-s6-muted);
      font-weight: 650;
      letter-spacing: .02em;
    }

    #saleForm input,
    #saleForm select,
    #saleForm textarea,
    #profileForm input,
    .role-select {
      border-radius: 14px !important;
      min-height: 46px;
    }

    #saleForm textarea {
      min-height: 92px;
    }

    #reportsSection .reports-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    #reportsSection .reports-grid > div {
      min-height: 98px;
      padding: 16px !important;
      background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.022)) !important;
    }

    #reportsSection .reports-grid strong {
      font-size: 24px;
      letter-spacing: -0.05em;
    }

    .users-list {
      display: grid;
      gap: 8px;
    }

    .user-card {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      align-items: center;
      min-height: 74px;
      padding: 12px !important;
    }

    .user-card-main {
      min-width: 0;
    }

    .user-card-main strong,
    .user-card-main span,
    .user-card-main small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-card {
      max-width: 760px;
    }

    .vex-drawer-panel {
      max-width: 560px;
    }

    .vex-drawer-hero h2 {
      line-height: 1.05;
      letter-spacing: -0.06em;
      overflow-wrap: anywhere;
    }

    @media (max-width: 980px) {
      #historySection .filters-card,
      #reportsSection .reports-grid {
        grid-template-columns: 1fr 1fr;
      }

      .vex-s6-vehicle-row {
        grid-template-columns: 30px minmax(0, 1fr) auto 16px;
      }

      .vex-s6-row-status {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .workspace {
        padding-bottom: 84px;
      }

      .sidebar-nav {
        position: fixed;
        left: 10px;
        right: 10px;
        bottom: 10px;
        z-index: 200;
        display: grid !important;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        padding: 8px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 22px;
        background: rgba(5, 6, 9, 0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 20px 55px rgba(0,0,0,.40);
      }

      .sidebar-nav .nav-item {
        min-height: 42px;
        padding: 8px 6px;
        border-radius: 15px;
        font-size: 0;
      }

      .sidebar-nav .nav-item[data-section="dashboardSection"]::before { content: "🏠"; font-size: 18px; }
      .sidebar-nav .nav-item[data-section="newSaleSection"]::before { content: "➕"; font-size: 18px; }
      .sidebar-nav .nav-item[data-section="historySection"]::before { content: "🚗"; font-size: 18px; }
      .sidebar-nav .nav-item[data-section="reportsSection"]::before { content: "📊"; font-size: 18px; }
      .sidebar-nav .nav-item[data-section="profileSection"]::before { content: "👤"; font-size: 18px; }
      .sidebar-nav .nav-item[data-section="usersSection"]::before { content: "⚙️"; font-size: 18px; }

      #historySection .section-header {
        padding: 14px !important;
      }

      #historySection .filters-card,
      #reportsSection .reports-grid,
      #saleForm .form-grid,
      #saleForm .vex-f03-extra-fields,
      .user-card {
        grid-template-columns: 1fr !important;
      }

      .vex-s6-list-toolbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .vex-s6-vehicle-row {
        grid-template-columns: 28px minmax(0, 1fr) 16px;
        min-height: 48px;
        padding: 8px 10px;
      }

      .vex-s6-row-main strong {
        font-size: 14px;
      }

      .vex-s6-row-main small {
        font-size: 11px;
      }

      .vex-s6-row-value,
      .vex-s6-row-status {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
}

initializeVexPremiumUISprint6();


/* =========================================================
   VEX HUB PRO v1.0 PREMIUM UI — Sprint 7
   Identidade Visual VEX + Polimento PWA
   ========================================================= */

function initializeVexIdentitySprint7() {
  injectVexIdentitySprint7Styles();
  applyVexOfficialLogo();
  prepareVexPwaInstallExperience();
  prepareVexIdentityCopy();
}

function applyVexOfficialLogo() {
  const logoPath = "assets/logo/vex-logo-white.png";
  const badges = document.querySelectorAll(".brand-badge");

  badges.forEach(function (badge) {
    if (badge.dataset.vexLogoApplied === "true") {
      return;
    }

    badge.dataset.vexLogoApplied = "true";
    badge.setAttribute("aria-label", "VEX Multimarcas");
    badge.innerHTML = '<img src="' + logoPath + '" alt="VEX" loading="eager" />';
  });

  const brandPanel = document.querySelector(".brand-panel");
  if (brandPanel && !brandPanel.querySelector(".vex-s7-logo-signature")) {
    const signature = document.createElement("div");
    signature.className = "vex-s7-logo-signature";
    signature.innerHTML = '<img src="' + logoPath + '" alt="VEX Multimarcas" loading="eager" />';
    brandPanel.insertBefore(signature, brandPanel.firstChild);
  }
}

function prepareVexPwaInstallExperience() {
  if (window.__vexS7PwaPrepared) {
    return;
  }

  window.__vexS7PwaPrepared = true;
  let deferredInstallPrompt = null;

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderVexInstallButton();
  });

  window.addEventListener("appinstalled", function () {
    deferredInstallPrompt = null;
    const installButton = document.getElementById("vexInstallAppButton");
    if (installButton) {
      installButton.remove();
    }
  });

  function renderVexInstallButton() {
    const sidebarFooter = document.querySelector(".sidebar-footer");

    if (!sidebarFooter || document.getElementById("vexInstallAppButton")) {
      return;
    }

    const installButton = document.createElement("button");
    installButton.id = "vexInstallAppButton";
    installButton.className = "ghost-button vex-s7-install-button";
    installButton.type = "button";
    installButton.textContent = "Instalar app";

    installButton.addEventListener("click", async function () {
      if (!deferredInstallPrompt) {
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installButton.remove();
    });

    sidebarFooter.insertBefore(installButton, sidebarFooter.firstChild);
  }
}

function prepareVexIdentityCopy() {
  const brandTitle = document.querySelector(".brand-panel h1");
  const brandText = document.querySelector(".brand-panel p");
  const sidebarSubtitle = document.querySelector(".sidebar-brand span");

  if (brandTitle) {
    brandTitle.textContent = "VEX HUB";
  }

  if (brandText) {
    brandText.textContent = "Gestão premium para vendas, comissões, pós-venda e operação automotiva em um app rápido, limpo e pronto para uso diário.";
  }

  if (sidebarSubtitle) {
    sidebarSubtitle.textContent = "VEX Multimarcas";
  }
}

function injectVexIdentitySprint7Styles() {
  if (document.getElementById("vexIdentitySprint7Styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vexIdentitySprint7Styles";
  style.textContent = `
    :root {
      --vex-s7-red: #e10600;
      --vex-s7-black: #050505;
      --vex-s7-card: rgba(12, 12, 12, 0.82);
      --vex-s7-line: rgba(255, 255, 255, 0.11);
    }

    body {
      background:
        radial-gradient(circle at 12% 4%, rgba(225, 6, 0, 0.24), transparent 30%),
        radial-gradient(circle at 94% 8%, rgba(255, 255, 255, 0.055), transparent 24%),
        linear-gradient(145deg, #030303 0%, #090909 48%, #111111 100%) !important;
    }

    .brand-panel {
      position: relative;
      overflow: hidden;
    }

    .brand-panel::before {
      content: "";
      position: absolute;
      inset: 1px;
      border-radius: inherit;
      background:
        radial-gradient(circle at top left, rgba(225, 6, 0, 0.22), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.018));
      pointer-events: none;
    }

    .brand-panel > * {
      position: relative;
      z-index: 1;
    }

    .vex-s7-logo-signature {
      width: min(250px, 64%);
      margin-bottom: 28px;
      padding: 16px 18px;
      border: 1px solid rgba(225, 6, 0, 0.26);
      border-radius: 24px;
      background: rgba(0, 0, 0, 0.24);
      box-shadow: 0 22px 72px rgba(0, 0, 0, 0.34);
    }

    .vex-s7-logo-signature img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    .brand-panel > .brand-badge:not(.small) {
      display: none;
    }

    .brand-badge,
    .brand-badge.small {
      padding: 7px;
      background:
        radial-gradient(circle at top, rgba(225, 6, 0, 0.42), transparent 60%),
        #070707 !important;
      border: 1px solid rgba(225, 6, 0, 0.30);
      box-shadow: 0 16px 42px rgba(225, 6, 0, 0.20) !important;
    }

    .brand-badge img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .sidebar-brand .brand-badge.small {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      flex: 0 0 auto;
    }

    .sidebar-brand strong {
      font-size: 14px;
      letter-spacing: 0.02em;
    }

    .sidebar-brand span {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .login-card,
    .form-card,
    .filters-card,
    .month-goal-card,
    .metric-card,
    .dashboard-card,
    .reports-grid > div,
    .admin-info-card,
    .user-card,
    .profile-card {
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.022)),
        rgba(7, 7, 7, 0.82) !important;
    }

    .primary-button {
      box-shadow: 0 14px 36px rgba(225, 6, 0, 0.22);
    }

    .primary-button:active,
    .secondary-button:active,
    .ghost-button:active,
    .nav-item:active,
    .vex-s6-vehicle-row:active {
      transform: scale(0.985) !important;
    }

    .vex-s7-install-button {
      border-color: rgba(225, 6, 0, 0.32) !important;
      background: rgba(225, 6, 0, 0.10) !important;
    }

    @media (max-width: 860px) {
      .vex-s7-logo-signature {
        width: min(210px, 72%);
        margin-bottom: 20px;
      }
    }

    @media (max-width: 640px) {
      .sidebar-brand .brand-badge.small {
        width: 42px;
        height: 42px;
      }

      .vex-s7-install-button {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
}

initializeVexIdentitySprint7();


/* =========================================================
   VEX HUB PRO v1.0 PREMIUM UI — Sprint 8
   App Mobile Premium + Responsividade Final
   ========================================================= */

function initializeVexMobileSprint8() {
  injectVexMobileSprint8Styles();
  prepareVexMobileNavigationSprint8();
  prepareVexMobileQuickActionSprint8();
  prepareVexSectionScrollSprint8();
}

function prepareVexMobileNavigationSprint8() {
  const labels = {
    dashboardSection: "Início",
    newSaleSection: "Venda",
    historySection: "Veículos",
    reportsSection: "Dados",
    profileSection: "Perfil",
    usersSection: "Users"
  };

  document.querySelectorAll(".nav-item").forEach(function (button) {
    const section = button.getAttribute("data-section") || "";
    if (!button.dataset.vexS8Label) {
      button.dataset.vexS8Label = labels[section] || button.textContent.trim();
    }
  });
}

function prepareVexMobileQuickActionSprint8() {
  if (document.getElementById("vexS8QuickSaleButton")) {
    return;
  }

  const dashboard = document.getElementById("dashboardScreen");
  if (!dashboard) {
    return;
  }

  const quickButton = document.createElement("button");
  quickButton.id = "vexS8QuickSaleButton";
  quickButton.className = "vex-s8-quick-sale";
  quickButton.type = "button";
  quickButton.setAttribute("aria-label", "Nova venda");
  quickButton.textContent = "+";

  quickButton.addEventListener("click", function () {
    const newSaleButton = document.querySelector('.nav-item[data-section="newSaleSection"]');
    if (newSaleButton) {
      newSaleButton.click();
    }
  });

  dashboard.appendChild(quickButton);
}

function prepareVexSectionScrollSprint8() {
  if (window.__vexS8ScrollPrepared) {
    return;
  }

  window.__vexS8ScrollPrepared = true;

  document.querySelectorAll(".nav-item").forEach(function (button) {
    button.addEventListener("click", function () {
      const workspace = document.querySelector(".workspace");
      if (workspace) {
        workspace.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function injectVexMobileSprint8Styles() {
  if (document.getElementById("vexMobileSprint8Styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vexMobileSprint8Styles";
  style.textContent = `
    html {
      scroll-behavior: smooth;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    body {
      overscroll-behavior-y: none;
    }

    .workspace {
      min-width: 0;
    }

    .content-section.active {
      min-width: 0;
    }

    .vex-s8-quick-sale {
      display: none;
    }

    .nav-item {
      position: relative;
    }

    .nav-item::after {
      content: "";
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 7px;
      height: 2px;
      border-radius: 999px;
      background: rgba(225, 6, 0, 0.82);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.2s ease;
    }

    .nav-item.active::after {
      transform: scaleX(1);
    }

    @media (max-width: 760px) {
      body {
        background-attachment: fixed !important;
      }

      .screen.active#dashboardScreen,
      #dashboardScreen.screen.active {
        display: block;
      }

      .sidebar {
        position: fixed !important;
        z-index: 50;
        left: 12px;
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom));
        top: auto !important;
        width: auto !important;
        min-height: 0 !important;
        height: 74px;
        padding: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 24px;
        background: rgba(6, 6, 6, 0.82) !important;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.50);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .sidebar-brand,
      .sidebar-footer {
        display: none !important;
      }

      .sidebar-nav {
        height: 100%;
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 4px;
        align-items: stretch;
      }

      .nav-item {
        min-width: 0;
        height: 58px;
        padding: 10px 4px 8px !important;
        border-radius: 18px !important;
        display: grid;
        place-items: center;
        text-align: center !important;
        font-size: 0 !important;
        color: rgba(255, 255, 255, 0.68) !important;
        background: transparent !important;
      }

      .nav-item::before {
        content: attr(data-vex-s8-label);
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        line-height: 1;
        font-weight: 650;
        letter-spacing: -0.02em;
      }

      .nav-item::after {
        left: 22%;
        right: 22%;
        bottom: 8px;
      }

      .nav-item.active {
        color: #ffffff !important;
        background: rgba(225, 6, 0, 0.13) !important;
        border-color: rgba(225, 6, 0, 0.20) !important;
      }

      .nav-item[data-section="usersSection"].hidden,
      .admin-only.hidden {
        display: none !important;
      }

      .workspace {
        width: 100%;
        padding: 18px 14px 118px !important;
        overflow: visible !important;
      }

      .section-header,
      .premium-header {
        display: grid !important;
        grid-template-columns: 1fr;
        gap: 14px;
        margin-bottom: 18px;
      }

      .section-header h2,
      .login-card h2 {
        font-size: clamp(27px, 8vw, 34px) !important;
      }

      .section-header p {
        font-size: 14px;
        line-height: 1.55;
      }

      .executive-grid,
      .dashboard-grid,
      .reports-grid,
      .form-grid,
      .filters-card,
      .report-preview {
        grid-template-columns: 1fr !important;
      }

      .filters-card {
        position: sticky;
        top: 10px;
        z-index: 8;
        padding: 12px !important;
        gap: 10px !important;
        border-radius: 22px !important;
      }

      .metric-card,
      .dashboard-card,
      .reports-grid > div,
      .form-card,
      .filters-card,
      .month-goal-card,
      .commission-box {
        border-radius: 22px !important;
      }

      .metric-card,
      .dashboard-card,
      .reports-grid > div {
        min-height: auto !important;
        padding: 18px !important;
      }

      .hero-metric {
        grid-column: span 1 !important;
      }

      input,
      select,
      textarea,
      button {
        font-size: 16px;
      }

      .vex-s6-vehicle-row {
        border-radius: 20px !important;
      }

      .vex-s8-quick-sale {
        display: grid;
        place-items: center;
        position: fixed;
        z-index: 60;
        right: 20px;
        bottom: calc(96px + env(safe-area-inset-bottom));
        width: 56px;
        height: 56px;
        border: 1px solid rgba(225, 6, 0, 0.36);
        border-radius: 20px;
        color: #ffffff;
        background: linear-gradient(145deg, rgba(225, 6, 0, 0.95), rgba(100, 0, 0, 0.95));
        box-shadow: 0 20px 52px rgba(225, 6, 0, 0.28), 0 14px 44px rgba(0, 0, 0, 0.36);
        font-size: 30px;
        line-height: 1;
        font-weight: 600;
      }

      #newSaleSection.active ~ .vex-s8-quick-sale,
      body:has(#newSaleSection.active) .vex-s8-quick-sale {
        display: none;
      }
    }

    @media (max-width: 520px) {
      .login-layout {
        width: min(100% - 24px, 420px) !important;
      }

      .brand-panel,
      .login-card {
        padding: 26px !important;
      }

      .brand-panel h1 {
        font-size: clamp(42px, 14vw, 58px) !important;
      }

      .authenticity-seal {
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.001ms !important;
      }
    }
  `;

  document.head.appendChild(style);
}

initializeVexMobileSprint8();


/* =========================================================
   Sprint 9 — Premium Polish
   Polimento visual/UX sem alterar Firebase, initialize() ou regras de negócio.
   ========================================================= */
function initializeVexSprint9PremiumPolish() {
  injectVexSprint9Styles();
  createVexSprint9ToastLayer();
  enhanceVexSprint9NavigationFeedback();
  enhanceVexSprint9FormsFeedback();
  enhanceVexSprint9EmptyStates();
  enhanceVexSprint9OfflineBadge();
  window.addEventListener("online", function () { showVexSprint9Toast("Conexão restabelecida.", "success"); });
  window.addEventListener("offline", function () { showVexSprint9Toast("Você está offline. O app continua disponível.", "warning"); });
}

function injectVexSprint9Styles() {
  if (document.getElementById("vexSprint9PremiumPolishStyles")) return;

  const style = document.createElement("style");
  style.id = "vexSprint9PremiumPolishStyles";
  style.textContent = `
    :root {
      --accent: #e10600;
      --accent-2: #ff3b30;
      --vex-s9-card: rgba(12, 12, 12, 0.78);
      --vex-s9-card-strong: rgba(18, 18, 18, 0.94);
      --vex-s9-line: rgba(255, 255, 255, 0.10);
      --vex-s9-soft: rgba(255, 255, 255, 0.055);
      --vex-s9-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
    }

    html { scroll-behavior: smooth; }

    body {
      background:
        radial-gradient(circle at top left, rgba(225, 6, 0, 0.18), transparent 32%),
        radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.07), transparent 34%),
        #050505 !important;
    }

    .content-section { animation: vexS9FadeIn 180ms ease both; }

    .metric-card,
    .dashboard-card,
    .reports-grid > div,
    .form-card,
    .filters-card,
    .login-card,
    .brand-panel,
    .month-goal-card,
    .commission-box,
    .executive-notification,
    .vex-s6-vehicle-row,
    .vex-vehicle-card-compact,
    .empty-state,
    .vex-s6-empty {
      background: linear-gradient(145deg, var(--vex-s9-card-strong), rgba(8, 8, 8, 0.68)) !important;
      border-color: var(--vex-s9-line) !important;
      box-shadow: var(--vex-s9-shadow) !important;
    }

    .metric-card,
    .dashboard-card,
    .reports-grid > div,
    .form-card,
    .filters-card,
    .vex-s6-vehicle-row,
    .nav-item,
    .primary-button,
    .secondary-button,
    .ghost-button {
      transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
    }

    .metric-card:hover,
    .dashboard-card:hover,
    .reports-grid > div:hover,
    .vex-s6-vehicle-row:hover {
      transform: translateY(-2px);
      border-color: rgba(225, 6, 0, 0.28) !important;
    }

    .primary-button,
    .auth-submit-button,
    button[type="submit"] {
      background: linear-gradient(135deg, #e10600, #6f0000) !important;
      box-shadow: 0 16px 42px rgba(225, 6, 0, 0.22);
    }

    button:active { transform: scale(0.985); }
    button[aria-busy="true"] { opacity: 0.72; pointer-events: none; }

    input,
    select,
    textarea {
      background: rgba(0, 0, 0, 0.34) !important;
      border-color: rgba(255, 255, 255, 0.11) !important;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: rgba(225, 6, 0, 0.62) !important;
      box-shadow: 0 0 0 4px rgba(225, 6, 0, 0.12) !important;
    }

    .vex-s9-toast-layer {
      position: fixed;
      z-index: 9999;
      top: calc(18px + env(safe-area-inset-top));
      right: 18px;
      display: grid;
      gap: 10px;
      width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }

    .vex-s9-toast {
      display: grid;
      grid-template-columns: 10px 1fr;
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      background: rgba(10, 10, 10, 0.88);
      color: #fff;
      box-shadow: 0 20px 58px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: vexS9ToastIn 180ms ease both;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
    }

    .vex-s9-toast::before {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #e10600;
      box-shadow: 0 0 0 5px rgba(225, 6, 0, 0.12);
    }

    .vex-s9-toast.success::before { background: #34d399; box-shadow: 0 0 0 5px rgba(52, 211, 153, 0.12); }
    .vex-s9-toast.warning::before { background: #fbbf24; box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.12); }
    .vex-s9-toast.error::before { background: #fb7185; box-shadow: 0 0 0 5px rgba(251, 113, 133, 0.12); }

    .vex-s9-empty-polish {
      position: relative;
      overflow: hidden;
      min-height: 138px;
    }

    .vex-s9-empty-polish::after {
      content: "VEX";
      position: absolute;
      right: 20px;
      bottom: 12px;
      color: rgba(255, 255, 255, 0.035);
      font-size: 54px;
      font-weight: 600;
      letter-spacing: -0.08em;
      pointer-events: none;
    }

    .vex-s9-offline-badge {
      position: fixed;
      z-index: 9998;
      left: 18px;
      bottom: calc(18px + env(safe-area-inset-bottom));
      display: none;
      padding: 10px 13px;
      border-radius: 999px;
      background: rgba(251, 191, 36, 0.12);
      border: 1px solid rgba(251, 191, 36, 0.22);
      color: #fde68a;
      font-size: 12px;
      font-weight: 650;
      backdrop-filter: blur(16px);
    }

    body.vex-s9-offline .vex-s9-offline-badge { display: block; }

    .vex-s9-skeleton {
      position: relative;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.06) !important;
    }

    .vex-s9-skeleton::before {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      animation: vexS9Skeleton 1.2s ease infinite;
    }

    @media (max-width: 760px) {
      .vex-s9-toast-layer {
        top: auto;
        right: 12px;
        bottom: calc(174px + env(safe-area-inset-bottom));
        width: calc(100vw - 24px);
      }

      .vex-s9-offline-badge {
        left: 14px;
        bottom: calc(92px + env(safe-area-inset-bottom));
      }
    }

    @keyframes vexS9FadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes vexS9ToastIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes vexS9Skeleton {
      to { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

function createVexSprint9ToastLayer() {
  if (document.querySelector(".vex-s9-toast-layer")) return;
  const layer = document.createElement("div");
  layer.className = "vex-s9-toast-layer";
  layer.setAttribute("aria-live", "polite");
  document.body.appendChild(layer);
}

function showVexSprint9Toast(message, type) {
  const layer = document.querySelector(".vex-s9-toast-layer");
  if (!layer || !message) return;
  const toast = document.createElement("div");
  toast.className = "vex-s9-toast " + (type || "info");
  toast.textContent = message;
  layer.appendChild(toast);
  window.setTimeout(function () {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px) scale(0.98)";
  }, 2600);
  window.setTimeout(function () { toast.remove(); }, 3000);
}

function enhanceVexSprint9NavigationFeedback() {
  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const label = (button.textContent || button.getAttribute("data-vex-s8-label") || "Tela").trim();
      if (label) showVexSprint9Toast(label + " aberta.", "success");
    });
  });
}

function enhanceVexSprint9FormsFeedback() {
  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function () {
      const submit = form.querySelector('button[type="submit"], .primary-button');
      if (!submit) return;
      submit.setAttribute("aria-busy", "true");
      window.setTimeout(function () { submit.removeAttribute("aria-busy"); }, 1800);
    });
  });
}

function enhanceVexSprint9EmptyStates() {
  const observer = new MutationObserver(function () {
    document.querySelectorAll(".empty-state, .vex-s6-empty").forEach(function (item) {
      item.classList.add("vex-s9-empty-polish");
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(".empty-state, .vex-s6-empty").forEach(function (item) {
    item.classList.add("vex-s9-empty-polish");
  });
}

function enhanceVexSprint9OfflineBadge() {
  if (!document.querySelector(".vex-s9-offline-badge")) {
    const badge = document.createElement("div");
    badge.className = "vex-s9-offline-badge";
    badge.textContent = "Modo offline";
    document.body.appendChild(badge);
  }

  function syncOfflineState() {
    document.body.classList.toggle("vex-s9-offline", navigator.onLine === false);
  }

  syncOfflineState();
  window.addEventListener("online", syncOfflineState);
  window.addEventListener("offline", syncOfflineState);
}

initializeVexSprint9PremiumPolish();

/* =========================================================
   VEX HUB PRO - Sprint 10
   Performance Feel + Command UX (non-invasive)
   Não altera Firebase, initializeApplication, Auth ou Firestore.
========================================================= */
function initializeVexSprint10PerformanceUX() {
  injectVexSprint10Styles();
  enhanceVexSprint10ViewTransitions();
  enhanceVexSprint10KeyboardShortcuts();
  enhanceVexSprint10FormFocus();
  enhanceVexSprint10ScrollToTop();
  enhanceVexSprint10SafeArea();
}

function injectVexSprint10Styles() {
  if (document.getElementById("vex-s10-performance-ux-style")) return;
  const style = document.createElement("style");
  style.id = "vex-s10-performance-ux-style";
  style.textContent = `
    :root {
      --vex-s10-fast: 140ms;
      --vex-s10-med: 220ms;
    }

    html {
      scroll-behavior: smooth;
    }

    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      z-index: 10000;
      background: linear-gradient(90deg, transparent, rgba(225, 6, 0, 0.95), transparent);
      opacity: 0.72;
      pointer-events: none;
    }

    .content-section {
      content-visibility: auto;
      contain-intrinsic-size: 900px;
    }

    .content-section.active {
      content-visibility: visible;
      animation: vexS10SectionIn var(--vex-s10-med) ease both;
    }

    .workspace,
    .form-card,
    .dashboard-card,
    .metric-card,
    .reports-grid > div,
    .vex-vehicle-card,
    .vex-vehicle-card-compact {
      will-change: transform;
      transform: translateZ(0);
    }

    .nav-item,
    .vex-mobile-nav-item,
    .primary-button,
    .ghost-button,
    .secondary-button,
    button {
      -webkit-tap-highlight-color: transparent;
    }

    .nav-item:focus-visible,
    .vex-mobile-nav-item:focus-visible,
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: 2px solid rgba(225, 6, 0, 0.78) !important;
      outline-offset: 3px;
    }

    .vex-s10-focus-mode .form-card,
    .vex-s10-focus-mode .login-card {
      box-shadow: 0 28px 90px rgba(225, 6, 0, 0.13), 0 20px 70px rgba(0, 0, 0, 0.46) !important;
    }

    .vex-s10-focus-mode .sidebar,
    .vex-s10-focus-mode .dashboard-grid,
    .vex-s10-focus-mode .executive-grid {
      opacity: 0.92;
    }

    .vex-s10-scroll-top {
      position: fixed;
      z-index: 9997;
      right: 18px;
      bottom: calc(18px + env(safe-area-inset-bottom));
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(10, 10, 10, 0.78);
      color: #fff;
      display: grid;
      place-items: center;
      opacity: 0;
      transform: translateY(8px) scale(0.96);
      pointer-events: none;
      transition: opacity var(--vex-s10-fast) ease, transform var(--vex-s10-fast) ease;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.36);
    }

    .vex-s10-scroll-top.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .vex-s10-shortcut-hint {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
      min-width: 21px;
      height: 21px;
      padding: 0 7px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.10);
      color: rgba(255,255,255,0.48);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    @media (max-width: 760px) {
      .vex-s10-shortcut-hint { display: none; }
      .vex-s10-scroll-top {
        right: 14px;
        bottom: calc(96px + env(safe-area-inset-bottom));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .content-section.active { animation: none; }
      *, *::before, *::after { transition-duration: 1ms !important; animation-duration: 1ms !important; }
    }

    @keyframes vexS10SectionIn {
      from { opacity: 0; transform: translateY(7px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

function enhanceVexSprint10ViewTransitions() {
  document.querySelectorAll(".nav-item").forEach(function (button) {
    button.addEventListener("click", function () {
      document.body.classList.add("vex-s10-routing");
      window.setTimeout(function () {
        document.body.classList.remove("vex-s10-routing");
      }, 180);
    }, { passive: true });
  });
}

function enhanceVexSprint10KeyboardShortcuts() {
  const shortcuts = [
    { selector: '[data-section="dashboardSection"]', key: "1" },
    { selector: '[data-section="newSaleSection"]', key: "2" },
    { selector: '[data-section="historySection"]', key: "3" },
    { selector: '[data-section="reportsSection"]', key: "4" },
    { selector: '[data-section="profileSection"]', key: "5" }
  ];

  shortcuts.forEach(function (item) {
    const button = document.querySelector(item.selector);
    if (!button || button.querySelector(".vex-s10-shortcut-hint")) return;
    const hint = document.createElement("span");
    hint.className = "vex-s10-shortcut-hint";
    hint.textContent = item.key;
    button.appendChild(hint);
  });

  document.addEventListener("keydown", function (event) {
    const activeTag = (document.activeElement && document.activeElement.tagName || "").toLowerCase();
    if (["input", "select", "textarea"].indexOf(activeTag) >= 0) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const target = shortcuts.find(function (item) { return item.key === event.key; });
    if (!target) return;
    const button = document.querySelector(target.selector);
    if (button && !button.classList.contains("hidden")) {
      event.preventDefault();
      button.click();
    }
  });
}

function enhanceVexSprint10FormFocus() {
  document.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("focus", function () {
      document.body.classList.add("vex-s10-focus-mode");
    }, { passive: true });
    field.addEventListener("blur", function () {
      window.setTimeout(function () {
        if (!document.querySelector("input:focus, select:focus, textarea:focus")) {
          document.body.classList.remove("vex-s10-focus-mode");
        }
      }, 20);
    }, { passive: true });
  });
}

function enhanceVexSprint10ScrollToTop() {
  if (document.querySelector(".vex-s10-scroll-top")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "vex-s10-scroll-top";
  button.setAttribute("aria-label", "Voltar ao topo");
  button.textContent = "↑";
  document.body.appendChild(button);

  const workspace = document.querySelector(".workspace");
  const scrollTarget = workspace || window;

  function getScrollTop() {
    return workspace ? workspace.scrollTop : window.scrollY;
  }

  function syncVisibility() {
    button.classList.toggle("visible", getScrollTop() > 260);
  }

  button.addEventListener("click", function () {
    if (workspace) workspace.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  scrollTarget.addEventListener("scroll", syncVisibility, { passive: true });
  syncVisibility();
}

function enhanceVexSprint10SafeArea() {
  document.documentElement.style.setProperty("--vex-safe-top", "env(safe-area-inset-top)");
  document.documentElement.style.setProperty("--vex-safe-bottom", "env(safe-area-inset-bottom)");
}

initializeVexSprint10PerformanceUX();

/* Sprint 11 - Premium Final Quality Layer
   Camada incremental de UX: não altera Firebase, initialize(), Auth, Firestore ou regras de negócio. */
function initializeVexSprint11FinalQuality() {
  injectVexSprint11Styles();
  enhanceVexSprint11SectionAwareness();
  enhanceVexSprint11SaleProgress();
  enhanceVexSprint11ButtonFeedback();
  enhanceVexSprint11KeyboardComfort();
}

function injectVexSprint11Styles() {
  if (document.getElementById("vex-s11-style")) return;
  const style = document.createElement("style");
  style.id = "vex-s11-style";
  style.textContent = `
    :root {
      --vex-s11-red: #e10600;
      --vex-s11-ink: #0b0b0f;
      --vex-s11-line: rgba(255,255,255,0.10);
      --vex-s11-soft: rgba(255,255,255,0.06);
      --vex-s11-radius: 24px;
      --vex-s11-ease: cubic-bezier(.2,.8,.2,1);
    }

    body.vex-s11-ready .content-section.active {
      animation: vexS11SectionIn 180ms var(--vex-s11-ease) both;
    }

    @keyframes vexS11SectionIn {
      from { opacity: .78; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .vex-s11-command-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 0 0 18px;
      padding: 12px 14px;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035));
      box-shadow: 0 18px 48px rgba(0,0,0,0.18);
      backdrop-filter: blur(16px);
    }

    .vex-s11-command-strip strong {
      font-size: 13px;
      letter-spacing: -0.01em;
      color: rgba(255,255,255,0.92);
    }

    .vex-s11-command-strip span {
      font-size: 11px;
      color: rgba(255,255,255,0.58);
    }

    .vex-s11-command-strip .vex-s11-status-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #34d399;
      box-shadow: 0 0 0 5px rgba(52, 211, 153, 0.10);
      flex: 0 0 auto;
    }

    body.vex-s9-offline .vex-s11-command-strip .vex-s11-status-dot {
      background: #fbbf24;
      box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.10);
    }

    .vex-s11-sale-progress {
      margin: 0 0 18px;
      padding: 14px;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.045);
    }

    .vex-s11-sale-progress-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 10px;
      font-size: 12px;
      color: rgba(255,255,255,0.62);
    }

    .vex-s11-sale-progress-row strong {
      color: rgba(255,255,255,0.92);
      font-size: 13px;
    }

    .vex-s11-sale-progress-track {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255,255,255,0.08);
    }

    .vex-s11-sale-progress-fill {
      width: 0%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--vex-s11-red), #ff4b45);
      transition: width 180ms var(--vex-s11-ease);
    }

    .vex-s11-pressing {
      transform: scale(.985) !important;
      filter: brightness(1.04);
    }

    .primary-button, .nav-item, .secondary-button, button {
      -webkit-tap-highlight-color: transparent;
    }

    input:focus, select:focus, textarea:focus {
      scroll-margin: 120px;
    }

    .form-card label:focus-within {
      transform: translateY(-1px);
    }

    .vex-s11-field-filled input,
    .vex-s11-field-filled select,
    .vex-s11-field-filled textarea {
      border-color: rgba(225, 6, 0, 0.28) !important;
      box-shadow: 0 0 0 1px rgba(225, 6, 0, 0.06);
    }

    @media (max-width: 760px) {
      .vex-s11-command-strip {
        margin-bottom: 14px;
        border-radius: 18px;
      }

      .vex-s11-command-strip span {
        display: none;
      }

      .vex-s11-sale-progress {
        border-radius: 18px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.vex-s11-ready .content-section.active { animation: none; }
      .vex-s11-sale-progress-fill { transition: none; }
      .vex-s11-pressing { transform: none !important; }
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add("vex-s11-ready");
}

function enhanceVexSprint11SectionAwareness() {
  const workspace = document.querySelector(".workspace");
  if (!workspace || document.querySelector(".vex-s11-command-strip")) return;

  const strip = document.createElement("div");
  strip.className = "vex-s11-command-strip";
  strip.innerHTML = '<div class="vex-s11-status-dot" aria-hidden="true"></div><div><strong id="vexS11CurrentSection">Dashboard</strong><br><span>Experiência premium otimizada para desktop e app instalado</span></div><span id="vexS11ConnectionLabel">Online</span>';
  workspace.insertBefore(strip, workspace.firstChild);

  const sectionTitle = document.getElementById("vexS11CurrentSection");
  const connection = document.getElementById("vexS11ConnectionLabel");

  function syncSection() {
    const active = document.querySelector(".content-section.active .section-header h2");
    if (active && sectionTitle) sectionTitle.textContent = active.textContent.trim();
    if (connection) connection.textContent = navigator.onLine === false ? "Offline" : "Online";
  }

  document.querySelectorAll(".nav-item").forEach(function (button) {
    button.addEventListener("click", function () { window.setTimeout(syncSection, 20); }, { passive: true });
  });
  window.addEventListener("online", syncSection);
  window.addEventListener("offline", syncSection);
  syncSection();
}

function enhanceVexSprint11SaleProgress() {
  const form = document.getElementById("saleForm");
  if (!form || document.querySelector(".vex-s11-sale-progress")) return;

  const grid = form.querySelector(".form-grid");
  if (!grid) return;

  const progress = document.createElement("div");
  progress.className = "vex-s11-sale-progress";
  progress.innerHTML = '<div class="vex-s11-sale-progress-row"><strong>Progresso do cadastro</strong><span id="vexS11SaleProgressText">0%</span></div><div class="vex-s11-sale-progress-track"><div class="vex-s11-sale-progress-fill" id="vexS11SaleProgressFill"></div></div>';
  form.insertBefore(progress, grid);

  const fields = ["clientName", "clientPhone", "vehicleModel", "vehicleYear", "saleValue", "saleDate", "transferType", "afterSaleStatus"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  const text = document.getElementById("vexS11SaleProgressText");
  const fill = document.getElementById("vexS11SaleProgressFill");

  function syncProgress() {
    const filled = fields.filter(function (field) { return String(field.value || "").trim().length > 0; }).length;
    const percent = fields.length ? Math.round((filled / fields.length) * 100) : 0;
    if (text) text.textContent = percent + "%";
    if (fill) fill.style.width = percent + "%";

    fields.forEach(function (field) {
      const label = field.closest("label");
      if (label) label.classList.toggle("vex-s11-field-filled", String(field.value || "").trim().length > 0);
    });
  }

  fields.forEach(function (field) {
    field.addEventListener("input", syncProgress, { passive: true });
    field.addEventListener("change", syncProgress, { passive: true });
  });
  form.addEventListener("reset", function () { window.setTimeout(syncProgress, 20); });
  syncProgress();
}

function enhanceVexSprint11ButtonFeedback() {
  if (document.body.dataset.vexS11ButtonFeedback === "ready") return;
  document.body.dataset.vexS11ButtonFeedback = "ready";

  document.addEventListener("pointerdown", function (event) {
    const button = event.target && event.target.closest ? event.target.closest("button, .nav-item, .primary-button") : null;
    if (!button) return;
    button.classList.add("vex-s11-pressing");
  }, { passive: true });

  ["pointerup", "pointercancel", "pointerleave"].forEach(function (eventName) {
    document.addEventListener(eventName, function (event) {
      const button = event.target && event.target.closest ? event.target.closest("button, .nav-item, .primary-button") : null;
      if (button) button.classList.remove("vex-s11-pressing");
    }, { passive: true });
  });
}

function enhanceVexSprint11KeyboardComfort() {
  if (document.body.dataset.vexS11KeyboardComfort === "ready") return;
  document.body.dataset.vexS11KeyboardComfort = "ready";

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    const active = document.activeElement;
    if (active && ["INPUT", "SELECT", "TEXTAREA"].indexOf(active.tagName) >= 0) {
      active.blur();
      event.preventDefault();
    }
  });
}

initializeVexSprint11FinalQuality();


function injectVexRC13LegibilityPatch() {
  const existing = document.getElementById("vexRC13LegibilityPatch");
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = "vexRC13LegibilityPatch";
  style.textContent = `
    html, body, button, input, select, textarea, label, small, span, p, strong, h1, h2, h3, h4, h5, a {
      font-family: "Segoe UI", Roboto, Arial, Helvetica, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
      text-shadow: none !important;
    }

    body { font-weight: 400 !important; }

    h1, h2, .brand-panel h1, .vex-dashboard-hero h2, .section-header h2,
    .commission-box strong, .month-goal-card strong {
      font-weight: 700 !important;
      letter-spacing: -0.045em !important;
    }

    label, #saleForm label, .form-card label, .login-card label, .profile-card label {
      font-weight: 600 !important;
      letter-spacing: 0.005em !important;
      color: rgba(226, 232, 240, 0.78) !important;
    }

    input, select, textarea {
      font-weight: 400 !important;
      letter-spacing: 0 !important;
      color: rgba(255,255,255,0.88) !important;
    }

    input::placeholder, textarea::placeholder {
      font-weight: 400 !important;
      letter-spacing: 0 !important;
      color: rgba(226,232,240,0.44) !important;
    }

    button, .primary-btn, .secondary-btn, #authSubmitButton {
      font-weight: 600 !important;
      letter-spacing: -0.01em !important;
    }

    .vex-s6-row-main strong, .vex-vehicle-compact-title, .vex-vehicle-info h3,
    .vex-vehicle-title-row h4, .vex-vehicle-card strong, .sale-card strong, .history-card strong {
      font-weight: 500 !important;
      letter-spacing: -0.006em !important;
      line-height: 1.35 !important;
      color: rgba(255,255,255,0.92) !important;
      text-shadow: none !important;
    }

    .vex-s6-row-main small, .vex-vehicle-compact-subline, .vex-vehicle-meta,
    .vex-vehicle-title-row p, .sale-card small, .history-card small {
      font-weight: 400 !important;
      letter-spacing: 0 !important;
      line-height: 1.45 !important;
      color: rgba(203,213,225,0.70) !important;
      text-shadow: none !important;
    }

    .vex-s6-row-value, .vex-vehicle-price, .vex-vehicle-card-compact .vex-vehicle-price {
      font-weight: 600 !important;
      letter-spacing: -0.006em !important;
    }

    .vex-s6-row-status, .vex-status-badge, .vex-vehicle-card-compact .vex-status-badge, .role-badge {
      font-weight: 600 !important;
      letter-spacing: 0 !important;
    }

    #newSaleSection, #newSaleSection *, #saleForm, #saleForm * {
      text-shadow: none !important;
    }

    #saleForm h2, #saleForm h3, #saleForm h4, #saleForm .vex-f03-extra-fields h3,
    #saleForm .vex-extra-title, #newSaleSection .form-card h3 {
      font-weight: 600 !important;
      letter-spacing: -0.018em !important;
      color: rgba(255,255,255,0.92) !important;
    }

    #saleForm label, #saleForm .field-label, #newSaleSection label {
      font-size: 12px !important;
      font-weight: 600 !important;
      color: rgba(203,213,225,0.72) !important;
    }

    #saleForm input, #saleForm select, #saleForm textarea {
      font-size: 14px !important;
      font-weight: 400 !important;
      color: rgba(255,255,255,0.88) !important;
    }

    @media (min-width: 921px) {
      .brand-panel {
        justify-content: center !important;
        min-height: 610px !important;
        padding-top: 40px !important;
        padding-bottom: 40px !important;
      }
      .brand-panel .vex-s7-logo-signature {
        width: min(230px, 46%) !important;
        margin: 0 0 42px 0 !important;
      }
      .brand-panel h1 { margin-top: 0 !important; }
      .authenticity-seal {
        margin-top: 34px !important;
        max-width: 390px !important;
        padding: 16px 18px !important;
        border-radius: 20px !important;
      }
      .authenticity-seal span { font-weight: 600 !important; letter-spacing: 0.14em !important; }
      .authenticity-seal strong { font-size: 19px !important; font-weight: 600 !important; }
      .authenticity-seal small { font-size: 13px !important; font-weight: 400 !important; }
      .vex-dashboard-hero > div:first-child {
        justify-self: center !important;
        transform: translateX(96px) !important;
      }
    }

    @media (min-width: 1400px) {
      .vex-dashboard-hero > div:first-child { transform: translateX(120px) !important; }
    }

    @media (max-width: 720px) {
      .vex-dashboard-hero > div:first-child { transform: none !important; }
    }
  `;
  document.head.appendChild(style);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectVexRC13LegibilityPatch);
} else {
  injectVexRC13LegibilityPatch();
}
setTimeout(injectVexRC13LegibilityPatch, 250);
setTimeout(injectVexRC13LegibilityPatch, 1000);
