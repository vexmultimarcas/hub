// VEX HUB - app.js
// Correção: venda aparece imediatamente no Histórico + Firestore por usuário

const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const userEmailLabel = document.getElementById("userEmailLabel");

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

initializeApplication();

function initializeApplication() {
  initializeFirebase();
  initializeNavigation();
  initializeLoginForm();
  initializeSaleForm();
  initializeHistoryFilters();
  initializeVexPremiumExperience();
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

function initializeLoginForm() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (email === "" || password === "") {
      showLoginMessage("Informe e-mail e senha.");
      return;
    }

    try {
      showLoginMessage("Entrando...");
      await auth.signInWithEmailAndPassword(email, password);
      loginForm.reset();
      showLoginMessage("");
    } catch (error) {
      showLoginMessage(getAuthErrorMessage(error));
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

    const clientName = document.getElementById("clientName").value.trim();
    const clientPhone = document.getElementById("clientPhone").value.trim();
    const vehicleModel = document.getElementById("vehicleModel").value.trim();
    const vehicleYear = document.getElementById("vehicleYear").value.trim();
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

  auth.onAuthStateChanged(function (user) {
    if (user) {
      currentUser = user;
      showDashboard();
      setupUserSalesCollection(user);
      loadUserSales();
    } else {
      currentUser = null;
      sales = [];
      salesCollection = null;
      stopSalesListener();
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

  if (userEmailLabel && currentUser) {
    userEmailLabel.textContent = currentUser.email;
  }
}

function showLogin() {
  dashboardScreen.classList.remove("active");
  homeScreen.classList.add("active");

  if (userEmailLabel) {
    userEmailLabel.textContent = "";
  }
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
      <button class="secondary-button" type="button" onclick="deleteSale('${sale.id}'); closeSaleDetails();">Excluir</button>
      <button class="primary-button" type="button" onclick="closeSaleDetails();">Concluir</button>
    </div>
  `;

  overlay.classList.add("active");
}

function closeSaleDetails() {
  const overlay = document.getElementById("saleDetailsOverlay");

  if (overlay) {
    overlay.classList.remove("active");
  }
}

function renderVehiclePhoto(sale, mode) {
  const imageUrl = sale.vehiclePhotoUrl || sale.vehicleImageUrl || sale.photoUrl || sale.imageUrl || "";
  const className = mode === "drawer" ? "vex-vehicle-photo-large" : "vex-vehicle-photo";

  if (imageUrl) {
    return `
      <div class="${className} has-image">
        <img src="${escapeHTML(imageUrl)}" alt="Foto do veículo ${escapeHTML(sale.vehicleModel || "")}" />
      </div>
    `;
  }

  return `
    <div class="${className} vex-photo-placeholder" aria-hidden="true">
      <div>
        <strong>VEX</strong>
        <span>MULTIMARCAS</span>
      </div>
      <small>Foto do veículo</small>
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
      font-weight: 950;
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
      font-weight: 950;
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
      font-weight: 950;
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
      font-weight: 900;
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
      font-weight: 900;
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
      font-weight: 950;
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
      font-weight: 950;
      letter-spacing: -0.08em;
      margin-bottom: 18px;
    }

    .drawer-kicker {
      color: #fecaca;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 900;
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
      font-weight: 950;
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
      font-weight: 800;
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
  if (!totalSalesCard) return;

  const totalSales = sales.length;
  const totalCommission = totalSales * 250;

  const pendingAfterSales = sales.filter(function (sale) {
    return sale.afterSaleStatus !== "Finalizado";
  }).length;

  const transferSales = sales.filter(function (sale) {
    return sale.transferType === "Pela loja" || sale.transferType === "Pelo cliente";
  }).length;

  totalSalesCard.textContent = totalSales;
  totalCommissionCard.textContent = formatCurrencyToBrazil(totalCommission);
  pendingAfterSalesCard.textContent = pendingAfterSales;
  transferSalesCard.textContent = transferSales;
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

  return "Erro ao entrar. Verifique o e-mail e a senha.";
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
window.openSaleDetails = openSaleDetails;
window.closeSaleDetails = closeSaleDetails;
