// VEX HUB - app.js
// Correção: venda aparece imediatamente no Histórico + Firestore por usuário

const homeScreen = document.getElementById("homeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const vexLaunchScreen = document.getElementById("vexLaunchScreen");

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
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const userEmailLabel = document.getElementById("userEmailLabel");
const usersNavButton = document.getElementById("usersNavButton");
const usersList = document.getElementById("usersList");
const usersMessage = document.getElementById("usersMessage");
const adminCreateUserForm = document.getElementById("adminCreateUserForm");
const adminNewUserName = document.getElementById("adminNewUserName");
const adminNewUserEmail = document.getElementById("adminNewUserEmail");
const adminNewUserPassword = document.getElementById("adminNewUserPassword");
const adminCreateUserMessage = document.getElementById("adminCreateUserMessage");
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
let editingSaleId = null;
let adminSecondaryFirebaseApp = null;
let vexInventory = [];
let vexInventoryPhotoDraft = "";
let vexInventoryCrlvDraft = null;
let vexInventoryCollection = null;
let unsubscribeVexInventory = null;
let vexInventoryEditingId = "";
let vexInventoryKeyLabelSelectedIds = new Set();


const ADMIN_EMAILS = [
  "frank.since96@gmail.com",
  "consultorjunior.auto@gmail.com"
];

initializeApplication();

function initializeApplication() {
  initializeVexLaunchExperience();
  initializeFirebase();
  initializeNavigation();
  initializeAuthModeSwitch();
  initializeLoginForm();
  initializeProfileForm();
  initializeSaleForm();
  initializeHistoryFilters();
  initializeVexTextAutoFormatting();
  initializeVexCepAutofill();
  initializeVexPhase02Vehicles();
  initializeVexPhase03Build02();
  initializeVexInventory();
  initializeVexPremiumExperience();
  initializeVexDashboardExecutive();
  listenAuthenticationState();
}

function initializeVexLaunchExperience() {
  if (!vexLaunchScreen) return;

  window.setTimeout(function () {
    vexLaunchScreen.classList.add("is-hiding");
  }, 1350);

  window.setTimeout(function () {
    vexLaunchScreen.remove();
  }, 1950);
}

function initializeFirebase() {
  if (typeof firebase === "undefined") {
    showLoginMessage("Firebase nao carregou. Verifique a internet.");
    return;
  }

  auth = firebase.auth();
  db = firebase.firestore();
}

function initializeNavigation() {
  if (logoutButton) {
    logoutButton.addEventListener("click", logoutUser);
  }

  if (adminCreateUserForm) {
    adminCreateUserForm.addEventListener("submit", createUserFromAdminPanel);
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

      if (targetSectionId === "historySection") {
        renderHistory();
      }

      if (targetSectionId === "pendenciesSection") {
        renderVexPendingBoard();
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
    loginModeButton.classList.toggle("hidden", authMode === "login");
  }

  if (registerModeButton) {
    registerModeButton.classList.toggle("active", authMode === "register");
    registerModeButton.classList.toggle("hidden", authMode === "register");
  }

  if (displayNameField) {
    displayNameField.classList.toggle("hidden", authMode !== "register");
  }

  if (authSubmitButton) {
    authSubmitButton.textContent = authMode === "register" ? "Criar conta" : "Entrar";
  }

  if (authTitle) {
    authTitle.textContent = authMode === "register" ? "Criar cadastro" : "Bem-vindo de volta";
  }

  if (authSubtitle) {
    authSubtitle.textContent = authMode === "register"
      ? "Informe seu nome, e-mail e senha para acessar o VEX HUB."
      : "Acesse com seu e-mail e senha autorizados para continuar.";
  }

  if (loginPassword) {
    loginPassword.setAttribute("autocomplete", authMode === "register" ? "new-password" : "current-password");
    loginPassword.setAttribute("placeholder", authMode === "register" ? "Crie uma senha segura" : "Digite sua senha");
  }

  if (authHelperText) {
    authHelperText.textContent = authMode === "register"
      ? "O nome será usado no Dashboard, exemplo: Bom dia, Junior."
      : "Para contas já criadas no Firebase, entre normalmente com e-mail e senha.";
  }

  if (authHelperText) {
    authHelperText.textContent = authMode === "register"
      ? "O nome sera usado no Dashboard, exemplo: Bom dia, Junior."
      : "Nao tem cadastro? Use o botao Criar cadastro acima.";
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
      showProfileMessage("Nao foi possível salvar o nome agora.");
    }
  });
}


function getNextVexOrderNumber() {
  const baseNumber = 1057430;
  const existingNumbers = (sales || [])
    .map(function(sale) { return Number(sale.orderNumber || sale.saleNumber || sale.protocol || 0); })
    .filter(function(number) { return Number.isFinite(number) && number >= baseNumber; });

  if (!existingNumbers.length) {
    return baseNumber;
  }

  return Math.max.apply(null, existingNumbers) + 1;
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
    const inventoryMatch = getVexInventoryItemByPlate(vehiclePlate);
    const currentEditingSale = editingSaleId ? sales.find(function(item) { return item.id === editingSaleId; }) : null;
    const inventoryRepasseItems = getVexInventoryRepasseItems(inventoryMatch);

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
          Preencha todos os campos obrigatorios antes de salvar a venda.
        </div>
      `;

      return;
    }

    const newSale = {
      orderNumber: getNextVexOrderNumber(),
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
      vehicleType: inventoryMatch ? inventoryMatch.type || "" : (currentEditingSale ? currentEditingSale.vehicleType || "" : ""),
      vehicleChassis: inventoryMatch ? inventoryMatch.chassis || "" : (currentEditingSale ? currentEditingSale.vehicleChassis || "" : ""),
      vehicleRenavam: inventoryMatch ? inventoryMatch.renavam || "" : (currentEditingSale ? currentEditingSale.vehicleRenavam || "" : ""),
      vehicleFuel: inventoryMatch ? inventoryMatch.fuel || "" : (currentEditingSale ? currentEditingSale.vehicleFuel || "" : ""),
      vehiclePhotoUrl: inventoryMatch ? inventoryMatch.photoUrl || "" : (currentEditingSale ? currentEditingSale.vehiclePhotoUrl || "" : ""),
      inventoryVehicleId: inventoryMatch ? inventoryMatch.id || "" : (currentEditingSale ? currentEditingSale.inventoryVehicleId || "" : ""),
      saleValue: saleValue,
      saleDate: saleDate,
      transferType: transferType,
      afterSaleStatus: afterSaleStatus,
      transferStage: currentEditingSale && currentEditingSale.transferStage ? currentEditingSale.transferStage : getDefaultVexTransferStage(transferType, afterSaleStatus),
      saleNotes: saleNotes,
      totalCommission: 250,
      frankCommission: 125,
      lucasCommission: 125,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      createdAtLocal: new Date().toISOString()
    };

    if (inventoryRepasseItems.length && !hasVexSaleRepasseItems(currentEditingSale)) {
      const currentFormalization = currentEditingSale && currentEditingSale.formalization ? currentEditingSale.formalization : {};
      const currentRepasse = currentFormalization.repasse || {};
      newSale.formalization = {
        ...currentFormalization,
        repasse: {
          ...currentRepasse,
          items: inventoryRepasseItems,
          notes: currentRepasse.notes || ""
        }
      };
    }

    if (editingSaleId) {
      await updateExistingSale(editingSaleId, newSale);
    } else {
      await saveSale(newSale);
    }
  });
}

function getVexInventoryRepasseItems(inventoryItem) {
  const source = inventoryItem && inventoryItem.notes ? String(inventoryItem.notes) : "";
  if (!source.trim()) return [];

  return source
    .split(/\n|;|\|/g)
    .map(function(line) {
      return line.trim().replace(/^[-•]+/, "").trim();
    })
    .filter(Boolean)
    .slice(0, 8)
    .map(function(description) {
      return {
        category: "Material",
        description: description
      };
    });
}

function hasVexSaleRepasseItems(sale) {
  const items = sale && sale.formalization && sale.formalization.repasse && Array.isArray(sale.formalization.repasse.items)
    ? sale.formalization.repasse.items
    : [];

  return items.some(function(item) {
    return item && item.description && item.description.trim();
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

  const historyMonthFilter = document.getElementById("historyMonthFilter");
  if (historyMonthFilter) {
    historyMonthFilter.addEventListener("change", function () {
      renderHistory();
      updateReports();
    });
  }

  if (clearHistoryFiltersButton) {
    clearHistoryFiltersButton.addEventListener("click", function () {
      if (historySearch) historySearch.value = "";
      if (historyStatusFilter) historyStatusFilter.value = "";
      if (historyTransferFilter) historyTransferFilter.value = "";
      const historyMonthFilter = document.getElementById("historyMonthFilter");
      if (historyMonthFilter) historyMonthFilter.value = "all";
      renderHistory();
      updateReports();
    });
  }
}

function shouldVexAutoFormatTextField(field) {
  if (!field || field.dataset.vexAutoText === "true") return false;

  const tag = String(field.tagName || "").toLowerCase();
  const type = String(field.type || "").toLowerCase();
  const id = String(field.id || "").toLowerCase();
  const name = String(field.name || "").toLowerCase();

  if (tag !== "textarea" && tag !== "input") return false;
  if (["email", "password", "date", "number", "hidden", "file", "checkbox", "radio"].includes(type)) return false;
  if (/(email|senha|password|cpf|cnpj|rg|cep|phone|telefone|celular|placa|plate|renavam|chassi|chassis|valor|value|km|quilometragem|date|data)/i.test(id + " " + name)) return false;

  return true;
}

function formatVexTextForDisplay(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  if (text.length <= 3 && text === text.toUpperCase()) return text;

  return text.toLowerCase().replace(/(^|[\s./-])([a-zà-ÿ])/g, function(match, prefix, letter) {
    return prefix + letter.toUpperCase();
  });
}

function initializeVexTextAutoFormatting() {
  document.addEventListener("blur", function(event) {
    const field = event.target;
    if (!shouldVexAutoFormatTextField(field)) return;
    field.value = formatVexTextForDisplay(field.value);
  }, true);
}

function setVexFieldValueIfEmpty(id, value) {
  const field = document.getElementById(id);
  if (field && !String(field.value || "").trim() && value) {
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

async function fillVexAddressFromCep(cepValue, mapping, messageElementId) {
  const cep = String(cepValue || "").replace(/\D/g, "");
  if (cep.length !== 8) return;

  const message = messageElementId ? document.getElementById(messageElementId) : null;

  try {
    if (message) message.innerHTML = `<div class="empty-state">Buscando endereco pelo CEP...</div>`;
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (!response.ok || data.erro) {
      if (message) message.innerHTML = `<div class="empty-state">CEP nao encontrado. Preencha o endereco manualmente.</div>`;
      return;
    }

    setVexFieldValueIfEmpty(mapping.street, data.logradouro);
    setVexFieldValueIfEmpty(mapping.district, data.bairro);
    setVexFieldValueIfEmpty(mapping.city, data.localidade);
    setVexFieldValueIfEmpty(mapping.state, data.uf);

    if (message) message.innerHTML = `<div class="success-state">Endereco preenchido automaticamente pelo CEP.</div>`;
  } catch (error) {
    console.warn("Nao foi possível buscar o CEP:", error);
    if (message) message.innerHTML = `<div class="empty-state">Nao foi possível consultar o CEP agora. Preencha o endereco manualmente.</div>`;
  }
}

function initializeVexCepAutofill() {
  document.addEventListener("blur", function(event) {
    const field = event.target;
    if (!field || field.id !== "formalClientCep") return;

    fillVexAddressFromCep(field.value, {
      street: "formalClientStreet",
      district: "formalClientDistrict",
      city: "formalClientCity",
      state: "formalClientState"
    }, "formalClientMessage");
  }, true);
}

function getVexWhatsappPhone(sale) {
  const rawPhone = sale && sale.formalization && sale.formalization.client && sale.formalization.client.clientPhone
    ? sale.formalization.client.clientPhone
    : sale && sale.clientPhone
      ? sale.clientPhone
      : "";
  const digits = String(rawPhone || "").replace(/\D/g, "");

  if (!digits || digits.length < 10) {
    return "";
  }

  return digits.indexOf("55") === 0 ? digits : "55" + digits;
}

function buildVexWhatsappMessage(sale, context) {
  const clientName = sale && sale.clientName ? sale.clientName : "tudo bem";
  const vehicle = `${sale && sale.vehicleModel ? sale.vehicleModel : "seu veiculo"} ${sale && sale.vehicleYear ? sale.vehicleYear : ""}`.trim();
  const status = sale && sale.afterSaleStatus ? sale.afterSaleStatus : "em andamento";
  const transfer = sale && sale.transferType ? sale.transferType : "nao informada";

  if (context === "transfer") {
    return `Ola, ${clientName}! Tudo bem? Aqui e da VEX Multimarcas. Estou entrando em contato para acompanhar a transferencia do ${vehicle}. Pode me confirmar como esta o andamento?`;
  }

  return `Ola, ${clientName}! Tudo bem? Aqui e da VEX Multimarcas. Estou acompanhando seu atendimento referente ao ${vehicle}. Status atual: ${status}. Transferencia: ${transfer}. Pode me dar um retorno, por favor?`;
}

function openVexClientWhatsapp(saleId, context) {
  const sale = sales.find(function(item) {
    return item.id === saleId;
  });

  if (!sale) {
    alert("Venda nao encontrada para abrir o WhatsApp.");
    return;
  }

  const phone = getVexWhatsappPhone(sale);

  if (!phone) {
    alert("Telefone do cliente nao informado ou invalido.");
    return;
  }

  const message = encodeURIComponent(buildVexWhatsappMessage(sale, context || "followup"));
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
}

function listenAuthenticationState() {
  if (!auth) {
    return;
  }

  auth.onAuthStateChanged(async function (user) {
    if (user) {
      currentUser = user;
      currentUserProfile = await loadUserProfile(user);

      if (currentUserProfile && currentUserProfile.active === false) {
        await auth.signOut();
        showLogin();
        showLoginMessage("Seu acesso esta bloqueado. Fale com um administrador.");
        return;
      }

      showDashboard();
      updateUserIdentityUI();
      updateAccessControlUI();
      setupUserSalesCollection(user);
      loadUserSales();
      setupVexInventoryCloud();
      loadUsersForAdmin();
    } else {
      currentUser = null;
      currentUserProfile = null;
      users = [];
      sales = [];
      salesCollection = null;
      vexInventoryCollection = null;
      stopSalesListener();
      stopVexInventoryListener();
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

  if (!db || !currentUser) {
    return;
  }

  unsubscribeSales = db.collectionGroup("sales")
    .onSnapshot(
      function (snapshot) {
        sales = snapshot.docs.map(function (doc) {
          const ownerRef = doc.ref.parent && doc.ref.parent.parent ? doc.ref.parent.parent : null;
          return {
            id: doc.id,
            ownerId: ownerRef ? ownerRef.id : "",
            refPath: doc.ref.path,
            ...doc.data()
          };
        });

        sales.sort(function(a, b) {
          return String(b.createdAtLocal || "").localeCompare(String(a.createdAtLocal || ""));
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

function getSaleDocumentRef(saleId) {
  if (!db || !saleId) {
    return null;
  }

  const sale = sales.find(function (item) {
    return item.id === saleId;
  });

  if (sale && sale.ownerId) {
    return db.collection("users").doc(sale.ownerId).collection("sales").doc(saleId);
  }

  return salesCollection ? salesCollection.doc(saleId) : null;
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

    await markVexInventorySoldFromSale(saleWithId);
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


async function updateExistingSale(saleId, updatedSale) {
  if (!canManageContent()) {
    alert("Apenas administradores podem editar vendas.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  try {
    setSaleMessageLoading();

    const payload = {
      ...updatedSale,
      updatedAtLocal: new Date().toISOString(),
      editedByEmail: currentUser ? currentUser.email : ""
    };

    delete payload.createdAtLocal;

    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update(payload);

    sales = sales.map(function (sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          ...payload
        };
      }
      return sale;
    });

    const editedSale = {
      id: saleId,
      ...payload
    };

    clearSaleEditMode();
    await markVexInventorySoldFromSale(editedSale);
    refreshApplication();
    renderSaleConfirmation(editedSale, "Venda atualizada com sucesso.");
    saleForm.reset();
    goToSection("historySection");
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    saleMessage.innerHTML = `
      <div class="empty-state">
        Erro ao atualizar venda. Verifique sua conexão ou as regras do Firestore.
      </div>
    `;
  }
}

function setSaleFieldValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value || "";
  }
}

function startEditSale(saleId) {
  if (!canManageContent()) {
    alert("Apenas administradores podem editar vendas.");
    return;
  }

  const sale = sales.find(function (item) {
    return item.id === saleId;
  });

  if (!sale || !saleForm) {
    return;
  }

  editingSaleId = saleId;

  closeVexVehicleDrawer();
  closeSaleDetails();

  setSaleFieldValue("clientName", sale.clientName);
  setSaleFieldValue("clientPhone", sale.clientPhone);
  setSaleFieldValue("vehicleModel", sale.vehicleModel);
  setSaleFieldValue("vehicleYear", sale.vehicleYear);
  setSaleFieldValue("vehicleFipeValue", sale.vehicleFipeValue);
  setSaleFieldValue("vehicleVersion", sale.vehicleVersion);
  setSaleFieldValue("vehicleTransmission", sale.vehicleTransmission);
  setSaleFieldValue("vehicleColor", sale.vehicleColor);
  setSaleFieldValue("vehiclePlate", sale.vehiclePlate);
  setSaleFieldValue("vehicleKm", sale.vehicleKm);
  setSaleFieldValue("saleValue", sale.saleValue);
  setSaleFieldValue("saleDate", sale.saleDate);
  setSaleFieldValue("transferType", sale.transferType);
  setSaleFieldValue("afterSaleStatus", sale.afterSaleStatus);
  setSaleFieldValue("saleNotes", sale.saleNotes);

  updateSaleEditModeUI(sale);
  goToSection("newSaleSection");

  window.setTimeout(function () {
    const firstField = document.getElementById("clientName");
    if (firstField) firstField.focus();
  }, 120);
}

function updateSaleEditModeUI(sale) {
  const submitButton = saleForm ? saleForm.querySelector('button[type="submit"]') : null;
  const saleHeader = document.querySelector("#newSaleSection .section-header h2");
  const saleDescription = document.querySelector("#newSaleSection .section-header p");

  if (submitButton) {
    submitButton.textContent = "Salvar alterações";
  }

  if (saleHeader) {
    saleHeader.textContent = "Editar Venda";
  }

  if (saleDescription) {
    saleDescription.textContent = "Modo ADM: atualize os dados da venda existente sem criar uma nova venda.";
  }

  if (saleMessage) {
    saleMessage.innerHTML = `
      <div class="empty-state vex-edit-mode-message">
        Editando: <strong>${escapeHTML(sale.vehicleModel || "Veiculo")}</strong>  - ${escapeHTML(sale.clientName || "Cliente")}
        <br>
        <button class="secondary-button" type="button" onclick="cancelSaleEditMode()">Cancelar edição</button>
      </div>
    `;
  }
}

function clearSaleEditMode() {
  editingSaleId = null;

  const submitButton = saleForm ? saleForm.querySelector('button[type="submit"]') : null;
  const saleHeader = document.querySelector("#newSaleSection .section-header h2");
  const saleDescription = document.querySelector("#newSaleSection .section-header p");

  if (submitButton) {
    submitButton.textContent = canManageContent() ? "Salvar venda" : "Somente ADM pode salvar venda";
  }

  if (saleHeader) {
    saleHeader.textContent = "Nova Venda";
  }

  if (saleDescription) {
    saleDescription.textContent = "Cadastro organizado por cliente, veiculo, financeiro e entrega.";
  }
}

function cancelSaleEditMode() {
  clearSaleEditMode();
  if (saleForm) saleForm.reset();
  if (saleMessage) saleMessage.innerHTML = "";
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

  if (!confirmDelete) {
    return;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.delete();

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

  if (!saleId || !newStatus) {
    return;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
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

const VEX_TRANSFER_STAGES = [
  "Pendente",
  "Aguardando cliente",
  "Aguardando contratos reconhecidos",
  "Aguardando laudo ECV",
  "Enviar ao despachante",
  "Aguardando ATPV / despachante",
  "Documentos entregues ao cliente",
  "Transferido"
];

function normalizeVexTransferStage(stage) {
  return String(stage || "").trim();
}

function getDefaultVexTransferStage(transferType, afterSaleStatus) {
  const status = String(afterSaleStatus || "").toLowerCase();
  if (status.includes("transferido") || status.includes("finalizado")) return "Transferido";
  if (String(transferType || "") === "Pelo cliente") return "Aguardando cliente";
  return "Pendente";
}

function getVexTransferStage(sale) {
  const stored = normalizeVexTransferStage(sale && sale.transferStage);
  return stored || getDefaultVexTransferStage(sale && sale.transferType, sale && sale.afterSaleStatus);
}

function getVexTransferStageTone(stage) {
  const value = normalizeVexTransferStage(stage).toLowerCase();
  if (value === "transferido") return "done";
  if (value === "documentos entregues ao cliente" || value.includes("atpv") || value.includes("despachante") || value.includes("enviar")) return "progress";
  return "pending";
}

function getVexTransferStageDescription(stage, transferType) {
  const value = normalizeVexTransferStage(stage);
  if (value === "Aguardando contratos reconhecidos") return String(transferType || "") === "Pela loja" ? "Contrato, termo e procuracao no cartorio." : "Contrato e termo no cartorio.";
  if (value === "Aguardando laudo ECV") return "Laudo ECV pendente no vistoriador.";
  if (value === "Enviar ao despachante") return "Enviar documentos, laudo e comprovantes.";
  if (value === "Aguardando ATPV / despachante") return "Processo em andamento com despachante.";
  if (value === "Documentos entregues ao cliente") return "Parte da loja concluida; cliente precisa finalizar.";
  if (value === "Transferido") return "Transferencia concluida.";
  if (value === "Aguardando cliente") return "Aguardando acao ou retorno do cliente.";
  return "Etapa inicial da transferencia.";
}

function getVexTransferStageOptions(selectedStage) {
  const selected = normalizeVexTransferStage(selectedStage);
  return VEX_TRANSFER_STAGES.map(function(stage) {
    return `<option value="${escapeHTML(stage)}" ${stage === selected ? "selected" : ""}>${escapeHTML(stage)}</option>`;
  }).join("");
}

function renderVexTransferStageChip(sale, extraClass) {
  const stage = getVexTransferStage(sale);
  const tone = getVexTransferStageTone(stage);
  return `<span class="vex-transfer-stage-chip vex-transfer-stage-${tone}${extraClass ? " " + extraClass : ""}">${escapeHTML(stage)}</span>`;
}

async function updateSaleTransferStage(saleId, newStage) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar a etapa da transferencia.");
    refreshApplication();
    return;
  }

  if (!saleId || !newStage) return;

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    const payload = {
      transferStage: newStage,
      updatedAtLocal: new Date().toISOString()
    };

    if (newStage === "Transferido") {
      payload.afterSaleStatus = "Transferido";
    } else if (newStage === "Aguardando ATPV / despachante" || newStage === "Enviar ao despachante") {
      payload.afterSaleStatus = "Transferencia em andamento";
    } else if (newStage === "Aguardando cliente" || newStage === "Documentos entregues ao cliente") {
      payload.afterSaleStatus = "Aguardando Cliente";
    }

    await saleRef.update(payload);

    sales = sales.map(function(sale) {
      if (sale.id !== saleId) return sale;
      return {
        ...sale,
        ...payload
      };
    });

    refreshApplication();
  } catch (error) {
    console.error("Erro ao atualizar etapa da transferencia:", error);
    alert("Erro ao atualizar etapa da transferencia.");
  }
}
function getVexTransferChecklistDefinitions(sale) {
  const transferType = String(sale && sale.transferType || "").toLowerCase();
  const storeFlow = transferType.includes("loja");

  if (storeFlow) {
    return [
      { key: "contractsSigned", label: "Contratos assinados", hint: "Contrato, termo e procuracao assinados pelo cliente." },
      { key: "notaryDone", label: "Reconhecimento em cartorio", hint: "Documentos reconhecidos antes do envio ao ADM." },
      { key: "ecvDone", label: "Laudo ECV", hint: "Laudo feito no vistoriador combinado." },
      { key: "sentToAdmin", label: "Enviado ao ADM", hint: "Laudo, documentos e comprovantes enviados para conferencia." },
      { key: "sentToDispatcher", label: "Despachante acionado", hint: "Processo enviado ao despachante." },
      { key: "waitingDocument", label: "Aguardando ATPV / documento", hint: "Aguardando retorno do despachante." },
      { key: "transferred", label: "Transferido", hint: "Documento novo emitido no nome do comprador." }
    ];
  }

  return [
    { key: "contractSigned", label: "Contrato assinado", hint: "Contrato particular assinado." },
    { key: "termSigned", label: "Termo assinado", hint: "Termo de repasse/garantia assinado quando aplicavel." },
    { key: "saleStarted", label: "Venda comunicada", hint: "Entrada/ATPV iniciado pelo responsavel da loja." },
    { key: "documentsDelivered", label: "Documentos entregues", hint: "Documentos entregues para o cliente finalizar." },
    { key: "waitingClient", label: "Aguardando cliente", hint: "Cliente ainda precisa concluir a transferencia." },
    { key: "transferred", label: "Transferido", hint: "Transferencia finalizada pelo cliente." }
  ];
}

function getVexTransferChecklistState(sale) {
  const current = sale && sale.transferChecklist && typeof sale.transferChecklist === "object" ? sale.transferChecklist : {};
  return current;
}

function getVexTransferChecklistProgress(sale) {
  const definitions = getVexTransferChecklistDefinitions(sale);
  const state = getVexTransferChecklistState(sale);
  const done = definitions.filter(function(item) { return !!state[item.key]; }).length;
  const total = definitions.length || 1;
  return {
    done: done,
    total: total,
    percent: Math.round((done / total) * 100)
  };
}

function renderVexTransferChecklist(sale) {
  const definitions = getVexTransferChecklistDefinitions(sale);
  const state = getVexTransferChecklistState(sale);
  const progress = getVexTransferChecklistProgress(sale);

  return `
    <div class="vex-transfer-checklist">
      <div class="vex-transfer-checklist-head">
        <div>
          <span>Checklist operacional</span>
          <strong>${progress.done} de ${progress.total} concluidos</strong>
        </div>
        <em>${progress.percent}%</em>
      </div>
      <div class="vex-transfer-checklist-bar"><i style="width:${progress.percent}%"></i></div>
      <div class="vex-transfer-checklist-items">
        ${definitions.map(function(item) {
          const checked = !!state[item.key];
          return `
            <label class="vex-transfer-check-item ${checked ? "is-done" : "is-pending"}">
              <input type="checkbox" ${checked ? "checked" : ""} ${canManageContent() ? `onchange="updateSaleTransferChecklist('${sale.id}', '${item.key}', this.checked)"` : "disabled"}>
              <span>
                <strong>${escapeHTML(item.label)}</strong>
                <small>${escapeHTML(item.hint)}</small>
              </span>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

async function updateSaleTransferChecklist(saleId, key, checked) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar o checklist da transferencia.");
    openVexVehicleDrawer(saleId);
    return;
  }

  if (!saleId || !key) return;

  try {
    const sale = sales.find(function(item) { return item.id === saleId; });
    const current = getVexTransferChecklistState(sale);
    const nextChecklist = {
      ...current,
      [key]: !!checked
    };

    const payload = {
      transferChecklist: nextChecklist,
      updatedAtLocal: new Date().toISOString()
    };

    if (checked && key === "transferred") {
      payload.transferStage = "Transferido";
      payload.afterSaleStatus = "Transferido";
    } else if (checked && key === "waitingDocument") {
      payload.transferStage = "Aguardando ATPV / despachante";
      payload.afterSaleStatus = "Transferencia em andamento";
    } else if (checked && key === "sentToDispatcher") {
      payload.transferStage = "Enviar ao despachante";
      payload.afterSaleStatus = "Transferencia em andamento";
    } else if (checked && key === "documentsDelivered") {
      payload.transferStage = "Documentos entregues ao cliente";
      payload.afterSaleStatus = "Aguardando Cliente";
    } else if (checked && key === "waitingClient") {
      payload.transferStage = "Aguardando cliente";
      payload.afterSaleStatus = "Aguardando Cliente";
    }
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;
    await saleRef.update(payload);

    sales = sales.map(function(item) {
      if (item.id !== saleId) return item;
      return {
        ...item,
        ...payload
      };
    });

    openVexVehicleDrawer(saleId);
  } catch (error) {
    console.error("Erro ao atualizar checklist da transferencia:", error);
    alert("Erro ao atualizar checklist da transferencia.");
  }
}
async function updateSaleTransferNote(saleId, note) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar a observacao da transferencia.");
    refreshApplication();
    return;
  }

  if (!saleId) return;

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    const payload = {
      transferStageNote: String(note || "").trim(),
      updatedAtLocal: new Date().toISOString()
    };

    await saleRef.update(payload);

    sales = sales.map(function(sale) {
      if (sale.id !== saleId) return sale;
      return {
        ...sale,
        ...payload
      };
    });
  } catch (error) {
    console.error("Erro ao atualizar observacao da transferencia:", error);
    alert("Erro ao atualizar observacao da transferencia.");
  }
}
async function updateSaleTransfer(saleId, newTransfer) {
  if (!canManageContent()) {
    alert("Apenas administradores podem alterar a transferencia.");
    refreshApplication();
    return;
  }

  if (!saleId || !newTransfer) {
    return;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
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
    console.error("Erro ao atualizar transferencia:", error);
    alert("Erro ao atualizar transferencia.");
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
  if (document.getElementById("pendenciesSection")?.classList.contains("active")) {
    renderVexPendingBoard();
  }
  updateReports();
  renderVexInventory();
}

/* =========================================================
   RC3.0.19 - Estoque em nuvem com foto leve
   ========================================================= */
const VEX_INVENTORY_STORAGE_KEY = "vexHubInventoryV1";

function initializeVexInventory() {
  loadVexInventory();
  injectVexInventoryStyles();
  bindVexInventoryForm();
  initializeVexKeyLabels();
  insertVexInventorySaleLookup();
  renderVexInventory();
}

function injectVexInventoryStyles() {
  if (document.getElementById("vexInventoryStyles")) return;

  const style = document.createElement("style");
  style.id = "vexInventoryStyles";
  style.textContent = `
    #inventorySection .inventory-card {
      display: grid;
      gap: 18px;
    }

    .inventory-photo-box {
      display: grid;
      grid-template-columns: 220px auto auto;
      gap: 14px;
      align-items: center;
      padding: 16px;
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 18px;
      background: rgba(255,255,255,.03);
    }

    .inventory-photo-preview {
      width: 220px;
      aspect-ratio: 16 / 10;
      display: grid;
      place-items: center;
      overflow: hidden;
      border: 1px dashed rgba(255,255,255,.22);
      border-radius: 16px;
      color: var(--text-muted, #9ca3af);
      background: rgba(0,0,0,.28);
      font-weight: 800;
      text-align: center;
    }

    .inventory-photo-preview img,
    .inventory-thumb img,
    .vex-vehicle-photo.has-image img,
    .vex-vehicle-photo-large.has-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .inventory-photo-button {
      position: relative;
      overflow: hidden;
      text-align: center;
      cursor: pointer;
    }

    .inventory-photo-button input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .inventory-actions,
    .inventory-item-actions,
    .vex-inventory-sale-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .inventory-filters {
      margin: 18px 0;
    }

    .inventory-list {
      display: grid;
      gap: 12px;
    }

    .inventory-item {
      display: grid;
      grid-template-columns: 132px minmax(0, 1fr) auto;
      gap: 16px;
      align-items: center;
      padding: 14px;
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 18px;
      background: rgba(10, 14, 25, .78);
    }

    .inventory-thumb {
      width: 132px;
      aspect-ratio: 16 / 10;
      display: grid;
      place-items: center;
      overflow: hidden;
      border-radius: 14px;
      color: #fff;
      background: linear-gradient(135deg, #d40000, #161616);
      font-size: 18px;
      font-weight: 950;
    }

    .inventory-info {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .inventory-info strong {
      color: #fff;
      font-size: 18px;
    }

    .inventory-info small,
    .inventory-info span,
    .vex-inventory-sale-lookup small {
      color: #aeb4c2;
      line-height: 1.35;
    }

    .vex-inventory-sale-lookup {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 14px;
      margin: 12px 0 18px;
      border: 1px solid rgba(225, 6, 0, .22);
      border-radius: 18px;
      background: rgba(225, 6, 0, .06);
    }

    .vex-inventory-sale-lookup strong {
      display: block;
      color: #fff;
      margin-bottom: 4px;
    }

    .vex-inventory-sale-actions input {
      width: 120px;
    }

    #saleInventoryLookupMessage {
      grid-column: 1 / -1;
      margin: 0;
      color: #aeb4c2;
      font-size: 13px;
    }

    .empty-state.is-error {
      border-color: rgba(255, 68, 68, .28);
      color: #ffb4b4;
    }

    @media (max-width: 760px) {
      .inventory-photo-box,
      .inventory-item,
      .vex-inventory-sale-lookup {
        grid-template-columns: 1fr;
      }

      .inventory-photo-preview,
      .inventory-thumb {
        width: 100%;
      }

      .inventory-item-actions,
      .vex-inventory-sale-actions {
        width: 100%;
      }

      .inventory-item-actions button,
      .vex-inventory-sale-actions button,
      .vex-inventory-sale-actions input {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}

function loadVexInventory() {
  try {
    const raw = localStorage.getItem(VEX_INVENTORY_STORAGE_KEY);
    vexInventory = raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Nao foi possivel carregar estoque local:", error);
    vexInventory = [];
  }
}

function saveVexInventory() {
  try {
    localStorage.setItem(VEX_INVENTORY_STORAGE_KEY, JSON.stringify(vexInventory));
  } catch (error) {
    console.error("Nao foi possivel salvar estoque local:", error);
    showVexInventoryMessage("A foto pode estar pesada demais. Exclua fotos antigas ou use uma imagem menor.", "error");
  }
}

function stopVexInventoryListener() {
  if (unsubscribeVexInventory) {
    unsubscribeVexInventory();
    unsubscribeVexInventory = null;
  }
}

function setupVexInventoryCloud() {
  stopVexInventoryListener();

  if (!db || !currentUser) {
    return;
  }

  vexInventoryCollection = db.collection("inventory");
  syncLocalVexInventoryToCloud();

  unsubscribeVexInventory = vexInventoryCollection
    .orderBy("updatedAtLocal", "desc")
    .onSnapshot(
      function(snapshot) {
        const cloudInventory = snapshot.docs.map(function(doc) {
          return {
            ...doc.data(),
            id: doc.id
          };
        });
        const byPlate = new Map();

        cloudInventory.forEach(function(item) {
          const key = normalizeVexPlate(item.plate) || item.id;
          if (!byPlate.has(key)) {
            byPlate.set(key, item);
          }
        });

        vexInventory = Array.from(byPlate.values());

        saveVexInventory();
        renderVexInventory();
      },
      function(error) {
        console.error("Erro ao carregar estoque em nuvem:", error);
        showVexInventoryMessage(getVexInventoryCloudBlockedMessage(), "error");
        renderVexInventory();
      }
    );
}

async function syncLocalVexInventoryToCloud() {
  if (!vexInventoryCollection || !canManageContent() || !Array.isArray(vexInventory) || !vexInventory.length) {
    return;
  }

  try {
    await Promise.all(vexInventory.map(function(item) {
      const docId = getVexInventoryDocId(item);
      return vexInventoryCollection.doc(docId).set({
        ...item,
        id: docId,
        migratedFromLocal: true,
        updatedAtLocal: item.updatedAtLocal || new Date().toISOString()
      }, { merge: true });
    }));
  } catch (error) {
    console.warn("Nao foi possivel migrar estoque local para nuvem:", error);
  }
}

function getVexInventoryDocId(item) {
  const plate = normalizeVexPlate(item && item.plate);
  return plate || String(item && item.id ? item.id : `stock-${Date.now()}`);
}

async function persistVexInventoryItem(item) {
  const docId = getVexInventoryDocId(item);
  const payload = {
    ...item,
    id: docId,
    updatedAtLocal: item.updatedAtLocal || new Date().toISOString()
  };

  vexInventory = vexInventory.filter(function(vehicle) {
    return getVexInventoryDocId(vehicle) !== docId;
  });
  vexInventory.unshift(payload);
  saveVexInventory();
  renderVexInventory();

  if (vexInventoryCollection && canManageContent()) {
    await vexInventoryCollection.doc(docId).set(payload, { merge: true });
  }
}

function getVexInventoryCloudBlockedMessage() {
  return "Estoque local ativo. Para aparecer no celular, publique o firestore.rules atualizado no Firebase Console liberando a colecao inventory.";
}

async function removeVexInventoryItemFromCloud(id) {
  if (!vexInventoryCollection || !canManageContent()) {
    return;
  }

  await vexInventoryCollection.doc(id).delete();
}

function bindVexInventoryForm() {
  const form = document.getElementById("inventoryForm");
  const addButton = document.getElementById("inventoryAddButton");
  const cancelButton = document.getElementById("inventoryCancelButton");
  const photoInput = document.getElementById("inventoryPhotoInput");
  const galleryInput = document.getElementById("inventoryGalleryInput");
  const removePhotoButton = document.getElementById("inventoryRemovePhotoButton");
  const crlvInput = document.getElementById("inventoryCrlvInput");
  const removeCrlvButton = document.getElementById("inventoryRemoveCrlvButton");
  const parseButton = document.getElementById("inventoryParseButton");
  const clearButton = document.getElementById("inventoryClearButton");
  const search = document.getElementById("inventorySearch");
  const keyLabelsToggleButton = document.getElementById("inventoryKeyLabelsToggleButton");
  const keyLabelsStatusFilter = document.getElementById("inventoryKeyLabelsStatusFilter");
  const keyLabelsSelectAllButton = document.getElementById("inventoryKeyLabelsSelectAllButton");
  const keyLabelsClearButton = document.getElementById("inventoryKeyLabelsClearButton");
  const keyLabelsGenerateButton = document.getElementById("inventoryKeyLabelsGenerateButton");

  if (form && form.dataset.vexInventoryReady !== "true") {
    form.dataset.vexInventoryReady = "true";
    form.addEventListener("submit", saveVexInventoryFromForm);
  }

  if (addButton && addButton.dataset.vexInventoryReady !== "true") {
    addButton.dataset.vexInventoryReady = "true";
    addButton.addEventListener("click", function() {
      clearVexInventoryForm({ keepOpen: true });
      openVexInventoryForm("add");
    });
  }

  if (cancelButton && cancelButton.dataset.vexInventoryReady !== "true") {
    cancelButton.dataset.vexInventoryReady = "true";
    cancelButton.addEventListener("click", function() {
      clearVexInventoryForm();
    });
  }

  if (photoInput && photoInput.dataset.vexInventoryReady !== "true") {
    photoInput.dataset.vexInventoryReady = "true";
    photoInput.addEventListener("change", handleVexInventoryPhotoInput);
  }

  if (galleryInput && galleryInput.dataset.vexInventoryReady !== "true") {
    galleryInput.dataset.vexInventoryReady = "true";
    galleryInput.addEventListener("change", handleVexInventoryPhotoInput);
  }

  if (removePhotoButton && removePhotoButton.dataset.vexInventoryReady !== "true") {
    removePhotoButton.dataset.vexInventoryReady = "true";
    removePhotoButton.addEventListener("click", function() {
      vexInventoryPhotoDraft = "";
      updateVexInventoryPhotoPreview("");
    });
  }

  if (crlvInput && crlvInput.dataset.vexInventoryReady !== "true") {
    crlvInput.dataset.vexInventoryReady = "true";
    crlvInput.addEventListener("change", handleVexInventoryCrlvInput);
  }

  if (removeCrlvButton && removeCrlvButton.dataset.vexInventoryReady !== "true") {
    removeCrlvButton.dataset.vexInventoryReady = "true";
    removeCrlvButton.addEventListener("click", function() {
      vexInventoryCrlvDraft = null;
      updateVexInventoryCrlvPreview(null);
    });
  }

  if (parseButton && parseButton.dataset.vexInventoryReady !== "true") {
    parseButton.dataset.vexInventoryReady = "true";
    parseButton.addEventListener("click", parseVexInventoryRawText);
  }

  if (clearButton && clearButton.dataset.vexInventoryReady !== "true") {
    clearButton.dataset.vexInventoryReady = "true";
    clearButton.addEventListener("click", clearVexInventoryForm);
  }

  if (search && search.dataset.vexInventoryReady !== "true") {
    search.dataset.vexInventoryReady = "true";
    search.addEventListener("input", renderVexInventory);
  }


  if (keyLabelsToggleButton && keyLabelsToggleButton.dataset.vexInventoryReady !== "true") {
    keyLabelsToggleButton.dataset.vexInventoryReady = "true";
    keyLabelsToggleButton.addEventListener("click", toggleVexInventoryKeyLabelsPanel);
  }

  if (keyLabelsStatusFilter && keyLabelsStatusFilter.dataset.vexInventoryReady !== "true") {
    keyLabelsStatusFilter.dataset.vexInventoryReady = "true";
    keyLabelsStatusFilter.addEventListener("change", function() {
      vexInventoryKeyLabelSelectedIds.clear();
      renderVexInventory();
      updateVexInventoryKeyLabelSummary();
    });
  }

  if (keyLabelsSelectAllButton && keyLabelsSelectAllButton.dataset.vexInventoryReady !== "true") {
    keyLabelsSelectAllButton.dataset.vexInventoryReady = "true";
    keyLabelsSelectAllButton.addEventListener("click", selectAllVexInventoryKeyLabels);
  }

  if (keyLabelsClearButton && keyLabelsClearButton.dataset.vexInventoryReady !== "true") {
    keyLabelsClearButton.dataset.vexInventoryReady = "true";
    keyLabelsClearButton.addEventListener("click", clearVexInventoryKeyLabelSelection);
  }

  if (keyLabelsGenerateButton && keyLabelsGenerateButton.dataset.vexInventoryReady !== "true") {
    keyLabelsGenerateButton.dataset.vexInventoryReady = "true";
    keyLabelsGenerateButton.addEventListener("click", generateVexInventoryKeyLabelsPdf);
  }
  initializeVexInventoryMasks();
}

function initializeVexInventoryMasks() {
  const plate = document.getElementById("inventoryPlate");
  const chassis = document.getElementById("inventoryChassis");
  const renavam = document.getElementById("inventoryRenavam");
  const km = document.getElementById("inventoryKm");
  const fipe = document.getElementById("inventoryFipeValue");

  if (plate && plate.dataset.vexInventoryMask !== "true") {
    plate.dataset.vexInventoryMask = "true";
    plate.addEventListener("input", function() {
      plate.value = normalizeVexPlate(plate.value);
    });
  }

  if (km && km.dataset.vexInventoryMask !== "true") {
    km.dataset.vexInventoryMask = "true";
    km.addEventListener("input", function() {
      km.value = maskVexF03Integer(km.value);
    });
  }

  if (chassis && chassis.dataset.vexInventoryMask !== "true") {
    chassis.dataset.vexInventoryMask = "true";
    chassis.addEventListener("input", function() {
      chassis.value = String(chassis.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
    });
  }

  if (renavam && renavam.dataset.vexInventoryMask !== "true") {
    renavam.dataset.vexInventoryMask = "true";
    renavam.addEventListener("input", function() {
      renavam.value = String(renavam.value || "").replace(/\D/g, "").slice(0, 11);
    });
  }

  if (fipe && fipe.dataset.vexInventoryMask !== "true") {
    fipe.dataset.vexInventoryMask = "true";
    fipe.addEventListener("input", function() {
      fipe.value = maskVexF03Money(fipe.value);
    });
  }
}

function normalizeVexPlate(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

async function handleVexInventoryPhotoInput(event) {
  const file = event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;

  showVexInventoryMessage("Reduzindo foto para manter o app leve...");

  try {
    vexInventoryPhotoDraft = await compressVexInventoryPhoto(file);
    updateVexInventoryPhotoPreview(vexInventoryPhotoDraft);
    showVexInventoryMessage("Foto anexada e comprimida.");
  } catch (error) {
    console.error("Erro ao comprimir foto:", error);
    showVexInventoryMessage("Nao foi possivel anexar a foto. Tente outra imagem.", "error");
  }
}

function compressVexInventoryPhoto(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();

    reader.onload = function() {
      const image = new Image();

      image.onload = function() {
        const maxWidth = 560;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.56));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateVexInventoryPhotoPreview(photoUrl) {
  const preview = document.getElementById("inventoryPhotoPreview");
  if (!preview) return;

  preview.innerHTML = photoUrl
    ? `<img src="${escapeHTML(photoUrl)}" alt="Foto do veiculo" />`
    : `<span>Foto do veiculo</span>`;
}

function getVexInventoryCrlvSizeKb(crlv) {
  return crlv && crlv.sizeKb ? crlv.sizeKb : 0;
}

function updateVexInventoryCrlvPreview(crlv) {
  const preview = document.getElementById("inventoryCrlvPreview");
  if (!preview) return;

  if (!crlv || !crlv.dataUrl) {
    preview.innerHTML = `
      <strong>CRLV nao anexado</strong>
      <small>Limite recomendado: ate 650 KB para manter sincronizado em nuvem.</small>
    `;
    return;
  }

  preview.innerHTML = `
    <strong>${escapeHTML(crlv.fileName || "CRLV anexado")}</strong>
    <small>${escapeHTML(crlv.mimeType || "arquivo")} | ${getVexInventoryCrlvSizeKb(crlv)} KB</small>
  `;
}

async function handleVexInventoryCrlvInput(event) {
  const file = event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;

  try {
    showVexInventoryMessage("Preparando CRLV para anexar...");
    vexInventoryCrlvDraft = await readVexInventoryCrlvFile(file);
    updateVexInventoryCrlvPreview(vexInventoryCrlvDraft);
    showVexInventoryMessage("CRLV anexado. Confira e salve o veiculo.");
  } catch (error) {
    console.error("Erro ao anexar CRLV:", error);
    showVexInventoryMessage(error && error.message ? error.message : "Nao foi possivel anexar o CRLV.", "error");
  } finally {
    if (event.target) event.target.value = "";
  }
}

function readVexInventoryCrlvFile(file) {
  const mimeType = String(file.type || "");
  const fileName = String(file.name || "crlv");

  if (mimeType.indexOf("image/") === 0) {
    return compressVexInventoryCrlvImage(file).then(function(dataUrl) {
      return {
        fileName: fileName,
        mimeType: "image/jpeg",
        dataUrl: dataUrl,
        sizeKb: Math.ceil(dataUrl.length * 0.75 / 1024),
        uploadedAtLocal: new Date().toISOString(),
        uploadedBy: currentUser ? currentUser.email || currentUser.uid || "" : ""
      };
    });
  }

  if (mimeType !== "application/pdf" && !/\.pdf$/i.test(fileName)) {
    return Promise.reject(new Error("Formato invalido. Anexe PDF, JPG ou PNG."));
  }

  if (file.size > 650 * 1024) {
    return Promise.reject(new Error("PDF grande demais para salvar em nuvem. Use um PDF menor que 650 KB ou uma foto do CRLV."));
  }

  return readVexFileAsDataUrl(file).then(function(dataUrl) {
    return {
      fileName: fileName,
      mimeType: "application/pdf",
      dataUrl: dataUrl,
      sizeKb: Math.ceil(file.size / 1024),
      uploadedAtLocal: new Date().toISOString(),
      uploadedBy: currentUser ? currentUser.email || currentUser.uid || "" : ""
    };
  });
}

function readVexFileAsDataUrl(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressVexInventoryCrlvImage(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();

    reader.onload = function() {
      const image = new Image();

      image.onload = function() {
        const maxWidth = 1100;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.62);
        if (dataUrl.length > 850000) {
          reject(new Error("Imagem do CRLV ainda ficou pesada. Tente recortar a foto ou usar uma imagem menor."));
          return;
        }
        resolve(dataUrl);
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getVexInventoryCrlvHtml(item) {
  const crlv = item && item.crlv;
  if (!crlv || !crlv.dataUrl) {
    return `
      <section class="vex-inventory-crlv-card">
        <span>CRLV</span>
        <strong>Documento nao anexado</strong>
        <p>Quando anexado no estoque, o CRLV aparece aqui para conferencia, download ou impressao.</p>
      </section>
    `;
  }

  return `
    <section class="vex-inventory-crlv-card is-ready">
      <span>CRLV anexado</span>
      <strong>${escapeHTML(crlv.fileName || "Documento do veiculo")}</strong>
      <p>${escapeHTML(crlv.mimeType || "arquivo")} | ${getVexInventoryCrlvSizeKb(crlv)} KB</p>
      <div class="vex-inventory-crlv-actions">
        <button class="secondary-button" type="button" onclick="openVexInventoryCrlv('${escapeHTML(item.id)}')">Visualizar</button>
        <button class="secondary-button" type="button" onclick="downloadVexInventoryCrlv('${escapeHTML(item.id)}')">Baixar</button>
        <button class="secondary-button" type="button" onclick="printVexInventoryCrlv('${escapeHTML(item.id)}')">Imprimir</button>
        <button class="ghost-button" type="button" onclick="deleteVexInventoryCrlv('${escapeHTML(item.id)}')">Excluir CRLV</button>
      </div>
    </section>
  `;
}

function getVexInventoryCheckHtml(item) {
  return `
    <section class="vex-inventory-crlv-check">
      <span>Conferencia do documento</span>
      <p>Confira visualmente se o CRLV bate com os dados cadastrados no estoque.</p>
      <div>
        ${renderVexInventoryDetail("Placa", item.plate)}
        ${renderVexInventoryDetail("Chassi", item.chassis)}
        ${renderVexInventoryDetail("Renavam", item.renavam)}
        ${renderVexInventoryDetail("Cor", item.color)}
        ${renderVexInventoryDetail("Ano / modelo", item.year)}
        ${renderVexInventoryDetail("Combustivel", item.fuel)}
      </div>
    </section>
  `;
}

function getVexInventoryCrlvById(id) {
  const item = vexInventory.find(function(vehicle) { return vehicle.id === id; });
  return item && item.crlv && item.crlv.dataUrl ? item.crlv : null;
}

function openVexInventoryCrlv(id) {
  const crlv = getVexInventoryCrlvById(id);
  if (!crlv) {
    alert("CRLV nao anexado para este veiculo.");
    return;
  }
  const win = window.open("", "_blank");
  if (!win) return;
  if (String(crlv.mimeType || "").indexOf("image/") === 0) {
    win.document.write(`<title>${escapeHTML(crlv.fileName || "CRLV")}</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh;"><img src="${crlv.dataUrl}" style="max-width:100%;height:auto;" /></body>`);
  } else {
    win.document.write(`<title>${escapeHTML(crlv.fileName || "CRLV")}</title><iframe src="${crlv.dataUrl}" style="border:0;width:100%;height:100vh;"></iframe>`);
  }
  win.document.close();
}

function downloadVexInventoryCrlv(id) {
  const crlv = getVexInventoryCrlvById(id);
  if (!crlv) return;
  const link = document.createElement("a");
  link.href = crlv.dataUrl;
  link.download = crlv.fileName || "crlv-veiculo";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function printVexInventoryCrlv(id) {
  const crlv = getVexInventoryCrlvById(id);
  if (!crlv) return;
  const win = window.open("", "_blank");
  if (!win) return;
  const body = String(crlv.mimeType || "").indexOf("image/") === 0
    ? `<img src="${crlv.dataUrl}" style="max-width:100%;height:auto;" />`
    : `<iframe src="${crlv.dataUrl}" style="border:0;width:100%;height:100vh;"></iframe>`;
  win.document.write(`<html><head><title>${escapeHTML(crlv.fileName || "CRLV")}</title></head><body style="margin:0;">${body}<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script></body></html>`);
  win.document.close();
}

async function deleteVexInventoryCrlv(id) {
  if (!confirm("Excluir o CRLV anexado deste veiculo?")) return;
  const itemToSave = vexInventory.find(function(item) { return item.id === id; });
  if (!itemToSave) return;

  const updatedItem = { ...itemToSave, crlv: null, updatedAtLocal: new Date().toISOString() };
  vexInventory = vexInventory.map(function(item) {
    return item.id === id ? updatedItem : item;
  });
  saveVexInventory();
  renderVexInventory();
  openVexInventoryDetails(id);

  try {
    if (vexInventoryCollection && canManageContent()) {
      await vexInventoryCollection.doc(id).set(updatedItem, { merge: true });
    }
  } catch (error) {
    showVexInventoryMessage("CRLV removido localmente, mas nao sincronizou em nuvem.", "error");
  }
}
function openVexInventoryForm(mode) {
  const section = document.getElementById("inventorySection");
  const title = document.getElementById("inventoryFormTitle");

  if (section) {
    section.classList.add("inventory-form-open");
  }

  if (title) {
    title.textContent = mode === "edit" ? "Editar veiculo" : "Adicionar veiculo";
  }

  const form = document.getElementById("inventoryForm");
  if (form && typeof form.scrollIntoView === "function") {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function closeVexInventoryForm() {
  const section = document.getElementById("inventorySection");
  if (section) {
    section.classList.remove("inventory-form-open");
  }
}

function getVexInventoryFormData() {
  return {
    plate: normalizeVexPlate(getElementValue("inventoryPlate")),
    model: getElementValue("inventoryModel"),
    year: getElementValue("inventoryYear"),
    version: getElementValue("inventoryVersion"),
    transmission: getElementValue("inventoryTransmission"),
    color: getElementValue("inventoryColor"),
    type: getElementValue("inventoryType"),
    fuel: getElementValue("inventoryFuel"),
    chassis: getElementValue("inventoryChassis"),
    renavam: getElementValue("inventoryRenavam"),
    km: getElementValue("inventoryKm"),
    fipeValue: getElementValue("inventoryFipeValue"),
    status: getElementValue("inventoryStatus") || "Disponivel",
    cdaSeller: getElementValue("inventoryCdaSeller"),
    cdaSaleDate: getElementValue("inventoryCdaSaleDate"),
    cdaSaleMode: getElementValue("inventoryCdaSaleMode"),
    notes: getElementValue("inventoryNotes"),
    rawText: getElementValue("inventoryRawText"),
    photoUrl: vexInventoryPhotoDraft,
    crlv: vexInventoryCrlvDraft
  };
}

function getElementValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

async function saveVexInventoryFromForm(event) {
  event.preventDefault();

  if (!canManageContent()) {
    showVexInventoryMessage("Apenas administradores podem cadastrar estoque.", "error");
    return;
  }

  const data = getVexInventoryFormData();

  if (!data.plate || !data.model || !data.year) {
    showVexInventoryMessage("Informe pelo menos placa, veiculo/modelo e ano.", "error");
    return;
  }

  const editingItem = vexInventoryEditingId
    ? vexInventory.find(function(vehicle) { return vehicle.id === vexInventoryEditingId; })
    : null;
  const existing = editingItem || getVexInventoryItemByPlate(data.plate);
  const item = {
    ...(existing || {}),
    ...data,
    id: existing ? existing.id : getVexInventoryDocId(data),
    status: data.status || (existing ? existing.status : "Disponivel"),
    fipeValueNumber: parseSaleCurrencyValue(data.fipeValue),
    updatedAtLocal: new Date().toISOString(),
    createdAtLocal: existing ? existing.createdAtLocal : new Date().toISOString()
  };

  try {
    const nextDocId = getVexInventoryDocId(item);
    const previousDocId = vexInventoryEditingId || "";
    if (previousDocId && previousDocId !== nextDocId) {
      vexInventory = vexInventory.filter(function(vehicle) {
        return vehicle.id !== previousDocId;
      });
      if (vexInventoryCollection && canManageContent()) {
        await vexInventoryCollection.doc(previousDocId).delete();
      }
    }

    await persistVexInventoryItem(item);
    clearVexInventoryForm();
    showVexInventoryMessage(vexInventoryCollection ? "Veiculo salvo no estoque em nuvem." : "Veiculo salvo neste aparelho.");
  } catch (error) {
    console.error("Erro ao salvar estoque:", error);
    clearVexInventoryForm();
    showVexInventoryMessage(getVexInventoryCloudBlockedMessage(), "error");
  }
}

function getVexInventoryItemByPlate(plate) {
  const normalized = normalizeVexPlate(plate);
  if (!normalized) return null;
  return vexInventory.find(function(item) {
    return normalizeVexPlate(item.plate) === normalized;
  }) || null;
}

function normalizeVexInventoryStatus(status) {
  return String(status || "Disponivel").trim().toLowerCase();
}

function isVexInventorySoldStatus(status) {
  return normalizeVexInventoryStatus(status).indexOf("vendido") === 0;
}

function isVexInventoryCdaSoldStatus(status) {
  return normalizeVexInventoryStatus(status) === "vendido repasse cda";
}

function isVexInventoryCdaStoreSoldStatus(status) {
  return normalizeVexInventoryStatus(status) === "vendido cda loja";
}

function isVexInventoryCdaStoreHandledByVex(item) {
  return isVexInventoryCdaStoreSoldStatus(item && item.status) && String(item.cdaSaleMode || "") === "Gerar venda no VEX HUB";
}

function isVexInventoryBlockedForSale(item) {
  if (!item || !isVexInventorySoldStatus(item.status)) return false;
  return !isVexInventoryCdaStoreHandledByVex(item);
}

function getVexInventoryStatusBadgeClass(status) {
  if (isVexInventoryCdaStoreSoldStatus(status)) return "inventory-status-cda-store-sold";
  if (isVexInventoryCdaSoldStatus(status)) return "inventory-status-cda-sold";
  if (isVexInventorySoldStatus(status)) return "inventory-status-sold";
  if (normalizeVexInventoryStatus(status) === "reservado") return "inventory-status-reserved";
  return "inventory-status-available";
}

function getVexInventorySoldRibbon(status) {
  if (isVexInventoryCdaStoreSoldStatus(status)) return "Vendido Loja CDA";
  if (isVexInventoryCdaSoldStatus(status)) return "Vendido CDA";
  if (isVexInventorySoldStatus(status)) return "Vendido VEX";
  return "";
}

function initializeVexKeyLabels() {
  updateVexInventoryKeyLabelSummary();
}

function isVexKeyLabelsPanelOpen() {
  const section = document.getElementById("inventorySection");
  return Boolean(section && section.classList.contains("inventory-key-labels-open"));
}

function toggleVexInventoryKeyLabelsPanel() {
  const section = document.getElementById("inventorySection");
  const panel = document.getElementById("inventoryKeyLabelsPanel");
  if (!section || !panel) return;

  const isOpen = section.classList.toggle("inventory-key-labels-open");
  panel.classList.toggle("hidden", !isOpen);
  renderVexInventory();
  updateVexInventoryKeyLabelSummary();
}

function getVexInventoryKeyLabelMode() {
  const filter = document.getElementById("inventoryKeyLabelsStatusFilter");
  return filter ? filter.value || "Disponivel" : "Disponivel";
}

function isVexInventoryEligibleForKeyLabel(item) {
  const mode = getVexInventoryKeyLabelMode();
  if (mode === "Todos") return true;
  if (mode === "Vendido") return isVexInventorySoldStatus(item && item.status);
  return normalizeVexInventoryStatus(item && item.status) === "disponivel";
}

function toggleVexInventoryKeyLabelSelection(id, checked) {
  if (!id) return;
  if (checked) {
    vexInventoryKeyLabelSelectedIds.add(id);
  } else {
    vexInventoryKeyLabelSelectedIds.delete(id);
  }
  updateVexInventoryKeyLabelSummary();
}

function getVexInventoryKeyLabelCandidates() {
  return vexInventory.filter(function(item) {
    return item && item.id && isVexInventoryEligibleForKeyLabel(item);
  });
}

function getVexInventorySelectedKeyLabelItems() {
  const selected = new Set(Array.from(vexInventoryKeyLabelSelectedIds));
  return vexInventory.filter(function(item) {
    return item && selected.has(item.id) && isVexInventoryEligibleForKeyLabel(item);
  });
}

function selectAllVexInventoryKeyLabels() {
  vexInventoryKeyLabelSelectedIds = new Set(getVexInventoryKeyLabelCandidates().map(function(item) { return item.id; }));
  renderVexInventory();
  updateVexInventoryKeyLabelSummary();
}

function clearVexInventoryKeyLabelSelection() {
  vexInventoryKeyLabelSelectedIds.clear();
  renderVexInventory();
  updateVexInventoryKeyLabelSummary();
}

function updateVexInventoryKeyLabelSummary() {
  const selectedItems = getVexInventorySelectedKeyLabelItems();
  const candidates = getVexInventoryKeyLabelCandidates();
  const summary = document.getElementById("inventoryKeyLabelsSummary");
  const generateButton = document.getElementById("inventoryKeyLabelsGenerateButton");
  const selectAllButton = document.getElementById("inventoryKeyLabelsSelectAllButton");

  if (summary) {
    summary.textContent = `${selectedItems.length} selecionado(s) de ${candidates.length}`;
  }

  if (generateButton) {
    generateButton.disabled = selectedItems.length === 0;
  }

  if (selectAllButton) {
    const mode = getVexInventoryKeyLabelMode();
    selectAllButton.textContent = mode === "Disponivel" ? "Selecionar todos disponiveis" : "Selecionar todos do filtro";
  }
}

function getVexKeyLabelFirstYear(year) {
  const match = String(year || "").match(/\d{4}/);
  return match ? match[0] : "";
}

function getVexKeyLabelVehicleTitle(item) {
  const rawModel = String(item && item.model ? item.model : "VEICULO").replace(/\s+/g, " ").trim();
  return simplifyVexKeyLabelModel(rawModel).toUpperCase();
}

function simplifyVexKeyLabelModel(model) {
  let clean = normalizeVexPdfText(model).toUpperCase();
  if (clean.indexOf("/") >= 0) {
    clean = clean.split("/").slice(1).join(" ").trim() || clean;
  }

  clean = clean
    .replace(/\bCHEVROLET\b/g, "")
    .replace(/\bCHEV\b/g, "")
    .replace(/\bVOLKSWAGEN\b/g, "")
    .replace(/\bHYUNDAI\b/g, "")
    .replace(/\bTOYOTA\b/g, "")
    .replace(/\bCITROEN\b/g, "")
    .replace(/\bRENAULT\b/g, "")
    .replace(/\bNISSAN\b/g, "")
    .replace(/\bHONDA\b/g, "")
    .replace(/\bFORD\b/g, "")
    .replace(/\bFIAT\b/g, "")
    .replace(/\bKIA\b/g, "")
    .replace(/\bGM\b/g, "")
    .replace(/\bVW\b/g, "")
    .replace(/\bSD\b/g, "SEDAN")
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  const keep = [];

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (!keep.length) {
      keep.push(word);
      continue;
    }

    if (/^\d\.\d/.test(word)) break;
    if (/^\d{1,2}(V|MT|AT|P|P\.)/.test(word)) break;
    if (/^(FLEX|FF|MT|AT|AUT|AUTOMATICO|MANUAL|COMPLETO|LT|LS|EX|EXL|GL|GLS|SPORT|PREC|PRES|PACK|PK|HB|XR|XS|XEI|GLX|LTD|TDI|T8V|8V)$/.test(word)) break;
    if (/^[A-Z]{1,3}\d/.test(word)) break;

    keep.push(word);
    if (keep.length >= 2) break;
  }

  return keep.join(" ") || clean.split(/\s+/).slice(0, 2).join(" ") || "VEICULO";
}
function normalizeVexPdfText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\\]/g, " ")
    .replace(/[^A-Za-z0-9 .\/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeVexPdfText(value) {
  return normalizeVexPdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function fitVexPdfFontSize(text, maxWidth, baseSize, minSize) {
  const length = Math.max(1, String(text || "").length);
  const estimated = length * baseSize * 0.54;
  if (estimated <= maxWidth) return baseSize;
  return Math.max(minSize, Math.min(baseSize, maxWidth / (length * 0.54)));
}

function estimateVexPdfTextWidth(text, fontSize) {
  return Math.max(1, String(text || "").length) * fontSize * 0.54;
}

function createVexPdfDocument(contentStream) {
  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  objects.push(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach(function(object, index) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function buildVexInventoryKeyLabelsPdf(items) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const cm = 28.3464567;
  const mm = 2.83464567;
  const labelWidth = 3.3 * cm;
  const labelHeight = 1.8 * cm;
  const gapX = 2 * mm;
  const gapY = 3 * mm;
  const cols = 6;
  const rows = Math.floor((pageHeight + gapY) / (labelHeight + gapY));
  const gridWidth = cols * labelWidth + (cols - 1) * gapX;
  const startX = Math.max(0, (pageWidth - gridWidth) / 2);
  const startY = pageHeight - 1 * mm - labelHeight;
  const stream = [];

  stream.push('0.3 w 0.6 0.6 0.6 RG');

  items.forEach(function(item, index) {
    if (index >= cols * rows) return;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * (labelWidth + gapX);
    const y = startY - row * (labelHeight + gapY);
    const model = getVexKeyLabelVehicleTitle(item);
    const year = getVexKeyLabelFirstYear(item && item.year);
    const plate = normalizeVexPlate(item && item.plate) || "SEMPLACA";
    const modelSize = fitVexPdfFontSize(model, labelWidth - 8, 8, 5.6);
    const yearSize = 7;
    const plateSize = fitVexPdfFontSize(plate, labelWidth - 8, 10, 8.5);
    const modelX = x + (labelWidth - estimateVexPdfTextWidth(model, modelSize)) / 2;
    const yearX = x + (labelWidth - estimateVexPdfTextWidth(year, yearSize)) / 2;
    const plateX = x + (labelWidth - estimateVexPdfTextWidth(plate, plateSize)) / 2;

    stream.push(`${x.toFixed(2)} ${y.toFixed(2)} ${labelWidth.toFixed(2)} ${labelHeight.toFixed(2)} re S`);
    stream.push(`BT /F1 ${modelSize.toFixed(2)} Tf 0 0 0 rg ${modelX.toFixed(2)} ${(y + 36).toFixed(2)} Td (${escapeVexPdfText(model)}) Tj ET`);
    stream.push(`BT /F1 ${yearSize.toFixed(2)} Tf 0 0 0 rg ${yearX.toFixed(2)} ${(y + 27).toFixed(2)} Td (${escapeVexPdfText(year)}) Tj ET`);
    stream.push(`BT /F1 ${plateSize.toFixed(2)} Tf 0 0 0 rg ${plateX.toFixed(2)} ${(y + 12).toFixed(2)} Td (${escapeVexPdfText(plate)}) Tj ET`);
  });

  return createVexPdfDocument(stream.join("\n"));
}
function downloadVexBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

async function saveVexInventoryKeyLabelsHistory(items) {
  if (!db || !currentUser || !items.length) return;

  const batchId = `etiquetas-${Date.now()}`;
  const payload = {
    id: batchId,
    usuario: currentUser.email || currentUser.uid || "",
    userId: currentUser.uid || "",
    data_hora: firebase && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
    quantidade: items.length,
    veiculosSelecionados: items.map(function(item) {
      return {
        id: item.id || "",
        modelo: item.model || "",
        ano: item.year || "",
        placa: item.plate || "",
        status: item.status || ""
      };
    })
  };

  try {
    await db.collection("etiquetas_geradas").doc(batchId).set(payload, { merge: true });
  } catch (error) {
    console.warn("Historico de etiquetas nao salvo:", error);
  }
}

async function generateVexInventoryKeyLabelsPdf() {
  const items = getVexInventorySelectedKeyLabelItems();
  if (!items.length) {
    alert("Selecione pelo menos um veiculo para gerar etiquetas.");
    return;
  }

  const pdf = buildVexInventoryKeyLabelsPdf(items);
  const blob = new Blob([pdf], { type: "application/pdf" });
  downloadVexBlob(blob, "etiquetas_chaves_estoque.pdf");
  await saveVexInventoryKeyLabelsHistory(items);
}
function renderVexInventory() {
  const list = document.getElementById("inventoryList");
  const counter = document.getElementById("inventoryCounter");
  if (!list) return;

  const search = String(getElementValue("inventorySearch")).toLowerCase();
  const filtered = vexInventory.filter(function(item) {
    const haystack = [item.plate, item.model, item.year, item.version, item.transmission, item.color, item.type, item.fuel, item.chassis, item.renavam].join(" ").toLowerCase();
    return !search || haystack.includes(search);
  }).sort(function(a, b) {
    const modelA = String(a.model || "").trim();
    const modelB = String(b.model || "").trim();
    const modelOrder = modelA.localeCompare(modelB, "pt-BR", { sensitivity: "base" });

    if (modelOrder !== 0) {
      return modelOrder;
    }

    return String(a.year || "").localeCompare(String(b.year || ""), "pt-BR", { sensitivity: "base" });
  });

  if (counter) {
    counter.textContent = `${vexInventory.length} veiculos`;
  }

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">Nenhum veiculo no estoque ainda.</div>`;
    return;
  }

  list.innerHTML = filtered.map(function(item) {
    const status = String(item.status || "Disponivel");
    const isSold = isVexInventorySoldStatus(status);
    const isReserved = normalizeVexInventoryStatus(status) === "reservado";
    const isCdaSold = isVexInventoryCdaSoldStatus(status);
    const isCdaStoreSold = isVexInventoryCdaStoreSoldStatus(status);
    const isSaleBlocked = isVexInventoryBlockedForSale(item);
    const itemClass = isSold ? (isCdaStoreSold ? " is-sold is-cda-store-sold" : (isCdaSold ? " is-sold is-cda-sold" : " is-sold")) : (isReserved ? " is-reserved" : "");
    const statusBadgeClass = getVexInventoryStatusBadgeClass(status);
    const useSaleDisabled = isSaleBlocked ? " disabled" : "";
    const ribbonText = getVexInventorySoldRibbon(status);
    const ribbonClass = isCdaStoreSold ? " inventory-cda-store-ribbon" : (isCdaSold ? " inventory-cda-ribbon" : "");
    const soldRibbon = ribbonText ? `<div class="inventory-sold-ribbon${ribbonClass}">${escapeHTML(ribbonText)}</div>` : "";
    const keyLabelChecked = vexInventoryKeyLabelSelectedIds.has(item.id) ? " checked" : "";
    const keyLabelDisabled = isVexKeyLabelsPanelOpen() && !isVexInventoryEligibleForKeyLabel(item) ? " disabled" : "";

    return `
      <article class="inventory-item${itemClass}${keyLabelChecked ? " is-key-label-selected" : ""}">
        <label class="inventory-key-label-check"><input type="checkbox" class="inventory-key-label-checkbox" data-inventory-key-label-id="${escapeHTML(item.id)}" onchange="toggleVexInventoryKeyLabelSelection('${escapeHTML(item.id)}', this.checked)"${keyLabelChecked}${keyLabelDisabled} /><span>Etiqueta</span></label>
        <div class="inventory-thumb">${item.photoUrl ? `<img src="${escapeHTML(item.photoUrl)}" alt="${escapeHTML(item.model)}" />` : `<span>${escapeHTML(item.plate || "VEX")}</span>`}${soldRibbon}</div>
        <div class="inventory-info">
          <strong>${escapeHTML(item.model)} <em class="inventory-status-pill ${statusBadgeClass}">${escapeHTML(status)}</em></strong>
          <small>${escapeHTML(item.year || "-")} - ${escapeHTML(item.version || "-")} - ${escapeHTML(item.color || "-")} - ${escapeHTML(item.type || "-")}</small>
          <span>Combustivel ${escapeHTML(item.fuel || "-")}</span>
          <span>Placa ${escapeHTML(item.plate)} | KM ${escapeHTML(item.km || "-")} | FIPE ${escapeHTML(item.fipeValue || "-")}</span>
          <span>Chassi ${escapeHTML(item.chassis || "-")} | Renavam ${escapeHTML(item.renavam || "-")}</span>
          <span>${item.crlv && item.crlv.dataUrl ? "CRLV anexado" : "CRLV nao anexado"}</span>
          ${isCdaSold ? `<span>Repasse CDA${item.cdaSeller ? ` | ${escapeHTML(item.cdaSeller)}` : ""}${item.cdaSaleDate ? ` | ${escapeHTML(formatDateToBrazil(item.cdaSaleDate))}` : ""}</span>` : ""}
          ${isCdaStoreSold ? `<span>CDA Loja${item.cdaSaleMode ? ` | ${escapeHTML(item.cdaSaleMode)}` : ""}${item.cdaSaleDate ? ` | ${escapeHTML(formatDateToBrazil(item.cdaSaleDate))}` : ""}</span>` : ""}
        </div>
        <div class="inventory-item-actions">
          <button class="secondary-button" type="button" onclick="openVexInventoryDetails('${escapeHTML(item.id)}')">Visualizar</button>
          <button class="secondary-button" type="button" onclick="fillSaleFromInventory('${escapeHTML(item.id)}')"${useSaleDisabled}>Usar na venda</button>
          <button class="ghost-button" type="button" onclick="editVexInventoryItem('${escapeHTML(item.id)}')">Editar</button>
          <button class="ghost-button" type="button" onclick="deleteVexInventoryPhoto('${escapeHTML(item.id)}')">Excluir foto</button>
          <button class="ghost-button" type="button" onclick="deleteVexInventoryItem('${escapeHTML(item.id)}')">Excluir</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderVexInventoryDetail(label, value) {
  return `
    <div class="vex-inventory-detail-row">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value || "-")}</strong>
    </div>
  `;
}

function openVexInventoryDetails(id) {
  const item = vexInventory.find(function(vehicle) { return vehicle.id === id; });
  const drawer = document.getElementById("vexVehicleDrawerRoot");
  if (!item || !drawer) return;

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>
    <aside class="vex-drawer-panel vex-inventory-details-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-inventory-details-head">
        <span class="eyebrow">Estoque</span>
        <h2>${escapeHTML(item.model || "Veiculo sem modelo")}</h2>
        <p>${escapeHTML([item.year, item.version, item.color].filter(Boolean).join(" - ") || "Dados principais nao informados")}</p>
      </section>

      <section class="vex-inventory-details-photo ${item.photoUrl ? "has-image" : ""}">
        ${item.photoUrl ? `<img src="${escapeHTML(item.photoUrl)}" alt="${escapeHTML(item.model || "Veiculo")}" />` : `<span>${escapeHTML(item.plate || "VEX")}</span>`}
      </section>

      <section class="vex-inventory-details-grid">
        ${renderVexInventoryDetail("Placa", item.plate)}
        ${renderVexInventoryDetail("KM", item.km)}
        ${renderVexInventoryDetail("FIPE / tabela", item.fipeValue)}
        ${renderVexInventoryDetail("Ano / modelo", item.year)}
        ${renderVexInventoryDetail("Versao", item.version)}
        ${renderVexInventoryDetail("Cambio", item.transmission)}
        ${renderVexInventoryDetail("Cor", item.color)}
        ${renderVexInventoryDetail("Tipo", item.type)}
        ${renderVexInventoryDetail("Combustivel", item.fuel)}
        ${renderVexInventoryDetail("Chassi", item.chassis)}
        ${renderVexInventoryDetail("Renavam", item.renavam)}
        ${renderVexInventoryDetail("Status", item.status || "Disponivel")}
        ${isVexInventoryCdaSoldStatus(item.status) ? renderVexInventoryDetail("Vendido por CDA", item.cdaSeller || "Nao informado") : ""}
        ${isVexInventoryCdaSoldStatus(item.status) ? renderVexInventoryDetail("Data repasse CDA", item.cdaSaleDate ? formatDateToBrazil(item.cdaSaleDate) : "-") : ""}
        ${isVexInventoryCdaStoreSoldStatus(item.status) ? renderVexInventoryDetail("Venda CDA Loja", item.cdaSaleMode || "Nao informado") : ""}
        ${isVexInventoryCdaStoreSoldStatus(item.status) ? renderVexInventoryDetail("Data CDA Loja", item.cdaSaleDate ? formatDateToBrazil(item.cdaSaleDate) : "-") : ""}
      </section>

      ${getVexInventoryCrlvHtml(item)}
      ${getVexInventoryCheckHtml(item)}

      ${item.notes ? `
        <section class="vex-inventory-details-notes">
          <span>Material / observacoes</span>
          <p>${escapeHTML(item.notes)}</p>
        </section>
      ` : ""}

      <div class="vex-drawer-actions vex-drawer-actions-safe">
        ${isVexInventoryBlockedForSale(item) ? `<button class="primary-button" type="button" disabled>Veiculo vendido</button>` : `<button class="primary-button" type="button" onclick="fillSaleFromInventory('${escapeHTML(item.id)}'); closeVexVehicleDrawer();">Usar na venda</button>`}
        <button class="secondary-button" type="button" onclick="editVexInventoryItem('${escapeHTML(item.id)}'); closeVexVehicleDrawer();">Editar</button>
        <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
      </div>
    </aside>
  `;

  drawer.classList.add("active");
}

function editVexInventoryItem(id) {
  const item = vexInventory.find(function(vehicle) { return vehicle.id === id; });
  if (!item) return;

  vexInventoryEditingId = item.id || "";
  setSaleFieldValue("inventoryPlate", item.plate);
  setSaleFieldValue("inventoryModel", item.model);
  setSaleFieldValue("inventoryYear", item.year);
  setSaleFieldValue("inventoryVersion", item.version);
  setSaleFieldValue("inventoryTransmission", item.transmission);
  setSaleFieldValue("inventoryColor", item.color);
  setSaleFieldValue("inventoryType", item.type);
  setSaleFieldValue("inventoryFuel", item.fuel);
  setSaleFieldValue("inventoryChassis", item.chassis);
  setSaleFieldValue("inventoryRenavam", item.renavam);
  setSaleFieldValue("inventoryKm", item.km);
  setSaleFieldValue("inventoryFipeValue", item.fipeValue);
  setSaleFieldValue("inventoryStatus", item.status || "Disponivel");
  setSaleFieldValue("inventoryCdaSeller", item.cdaSeller || "");
  setSaleFieldValue("inventoryCdaSaleDate", item.cdaSaleDate || "");
  setSaleFieldValue("inventoryCdaSaleMode", item.cdaSaleMode || "");
  setSaleFieldValue("inventoryNotes", item.notes);
  setSaleFieldValue("inventoryRawText", item.rawText);
  vexInventoryPhotoDraft = item.photoUrl || "";
  vexInventoryCrlvDraft = item.crlv || null;
  updateVexInventoryPhotoPreview(vexInventoryPhotoDraft);
  updateVexInventoryCrlvPreview(vexInventoryCrlvDraft);
  openVexInventoryForm("edit");
  showVexInventoryMessage("Editando veiculo do estoque.");
}

async function deleteVexInventoryPhoto(id) {
  const itemToSave = vexInventory.find(function(item) { return item.id === id; });
  if (!itemToSave) return;

  const updatedItem = { ...itemToSave, photoUrl: "", updatedAtLocal: new Date().toISOString() };

  vexInventory = vexInventory.map(function(item) {
    if (item.id === id) {
      return updatedItem;
    }
    return item;
  });
  saveVexInventory();
  renderVexInventory();

  try {
    if (vexInventoryCollection && canManageContent()) {
      await vexInventoryCollection.doc(id).set(updatedItem, { merge: true });
    }
  } catch (error) {
    showVexInventoryMessage("Foto removida localmente, mas nao sincronizou em nuvem.", "error");
  }
}

async function deleteVexInventoryItem(id) {
  if (!confirm("Excluir este veiculo do estoque?")) return;
  vexInventory = vexInventory.filter(function(item) { return item.id !== id; });
  saveVexInventory();
  renderVexInventory();

  try {
    await removeVexInventoryItemFromCloud(id);
  } catch (error) {
    showVexInventoryMessage("Veiculo excluido localmente, mas nao sincronizou em nuvem.", "error");
  }
}

function clearVexInventoryForm(options) {
  const keepOpen = Boolean(options && options.keepOpen);
  const form = document.getElementById("inventoryForm");
  if (form) form.reset();
  vexInventoryPhotoDraft = "";
  vexInventoryCrlvDraft = null;
  vexInventoryEditingId = "";
  updateVexInventoryPhotoPreview("");
  updateVexInventoryCrlvPreview(null);
  if (!keepOpen) {
    closeVexInventoryForm();
  }
}

function showVexInventoryMessage(message, type) {
  const target = document.getElementById("inventoryMessage");
  if (!target) return;
  target.innerHTML = message ? `<div class="empty-state ${type === "error" ? "is-error" : ""}">${escapeHTML(message)}</div>` : "";
}

function parseVexInventoryRawText() {
  const raw = getElementValue("inventoryRawText");
  if (!raw) {
    showVexInventoryMessage("Cole o material do veiculo antes de ler.", "error");
    return;
  }

  const compact = raw.replace(/\s+/g, " ");
  const plate = compact.match(/\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/i);
  const km = compact.match(/(?:km|quilometragem)[^\d]{0,12}([\d.]{2,})/i) || compact.match(/\b(\d{2,3}\.?\d{3})\s*km\b/i);
  const fipe = compact.match(/(?:fipe|tabela)[^\d]{0,20}(?:r\$)?\s*([\d.]+,\d{2})/i);
  const chassis = compact.match(/(?:chassi|chassis)[\s:.-]+([A-Z0-9]{11,17})/i);
  const renavam = compact.match(/(?:renavam)[\s:.-]+(\d{9,11})/i);
  const type = compact.match(/(?:tipo|categoria)[\s:.-]+([^,.;]+)/i);
  const fuel = compact.match(/(?:combustivel|combustivel)[\s:.-]+([^,.;]+)/i);
  const year = compact.match(/\b(19|20)\d{2}\s*\/\s*(19|20)\d{2}\b/) || compact.match(/\b(19|20)\d{2}\b/);
  const color = compact.match(/(?:cor)[\s:.-]+([^,.;]+)/i);
  const transmission = /autom[aá]tico/i.test(compact) ? "Automatico" : (/manual/i.test(compact) ? "Manual" : "");

  if (plate) setSaleFieldValue("inventoryPlate", normalizeVexPlate(plate[0]));
  if (km) setSaleFieldValue("inventoryKm", maskVexF03Integer(km[1]));
  if (fipe) setSaleFieldValue("inventoryFipeValue", maskVexF03Money(fipe[1]));
  if (year) setSaleFieldValue("inventoryYear", year[0].replace(/\s+/g, ""));
  if (color) setSaleFieldValue("inventoryColor", color[1].trim().split(" ")[0]);
  if (chassis) setSaleFieldValue("inventoryChassis", String(chassis[1]).toUpperCase());
  if (renavam) setSaleFieldValue("inventoryRenavam", renavam[1]);
  if (type) setSaleFieldValue("inventoryType", type[1].trim());
  if (fuel) setSaleFieldValue("inventoryFuel", fuel[1].trim());
  if (transmission) setSaleFieldValue("inventoryTransmission", transmission);

  const modelInput = document.getElementById("inventoryModel");
  if (modelInput && !modelInput.value.trim()) {
    modelInput.value = compact.split(/[.;\n]/)[0].slice(0, 70).trim();
  }

  showVexInventoryMessage("Texto lido. Confira os campos antes de salvar.");
}

function insertVexInventorySaleLookup() {
  const saleFormElement = document.getElementById("saleForm");
  const vehiclePlate = document.getElementById("vehiclePlate");
  if (!saleFormElement || !vehiclePlate) return;

  moveVexSalePlateToFirstField();
  if (document.getElementById("vexInventorySaleLookup")) return;

  const panel = document.createElement("div");
  panel.id = "vexInventorySaleLookup";
  panel.className = "vex-inventory-sale-lookup";
  panel.innerHTML = `
    <div>
      <strong>Placa primeiro</strong>
      <small>Digite a placa no primeiro campo da venda. Se o carro estiver no estoque, o app preenche modelo, ano, FIPE, versao, cambio, cor, KM, chassi, renavam e material.</small>
    </div>
    <p id="saleInventoryLookupMessage"></p>
  `;

  const formGrid = saleFormElement.querySelector(".form-grid");
  saleFormElement.insertBefore(panel, formGrid || saleFormElement.firstChild);
}

function moveVexSalePlateToFirstField() {
  const formGrid = document.querySelector("#saleForm .form-grid");
  const plate = document.getElementById("vehiclePlate");
  const plateLabel = plate ? plate.closest("label") : null;
  if (!formGrid || !plateLabel || plateLabel.dataset.vexPlateFirst === "true") return;

  plateLabel.dataset.vexPlateFirst = "true";
  formGrid.insertBefore(plateLabel, formGrid.firstElementChild);

  const plateLabelText = Array.from(plateLabel.childNodes).find(function(node) {
    return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
  });

  if (plateLabelText) {
    plateLabelText.textContent = "Placa do estoque";
  }
}

function fillSaleFromInventoryLookup() {
  const input = document.getElementById("saleInventoryPlateLookup") || document.getElementById("vehiclePlate");
  const plate = input ? input.value : "";
  const item = getVexInventoryItemByPlate(plate);
  const message = document.getElementById("saleInventoryLookupMessage");

  if (!item) {
    if (message) message.textContent = "Placa nao encontrada no estoque.";
    return;
  }

  if (isVexInventoryBlockedForSale(item)) {
    if (message) message.textContent = "Veiculo ja marcado como vendido no estoque.";
    return;
  }

  applyVexInventoryToSaleForm(item);
  if (message) message.textContent = "Dados carregados do estoque. Confira KM e valor da venda.";
}

function autofillSaleFromInventoryPlate(plate) {
  const normalized = normalizeVexPlate(plate);
  const message = document.getElementById("saleInventoryLookupMessage");

  if (normalized.length !== 7) {
    return;
  }

  const item = getVexInventoryItemByPlate(normalized);

  if (!item) {
    if (message) message.textContent = "Placa nao encontrada no estoque.";
    return;
  }

  if (isVexInventoryBlockedForSale(item)) {
    if (message) message.textContent = "Veiculo ja marcado como vendido no estoque.";
    return;
  }

  applyVexInventoryToSaleForm(item);
  if (message) message.textContent = "Dados carregados automaticamente do estoque. Confira KM e valor da venda.";
}

function fillSaleFromInventory(id) {
  const item = vexInventory.find(function(vehicle) { return vehicle.id === id; });
  if (!item) return;
  if (isVexInventoryBlockedForSale(item)) {
    showVexInventoryMessage("Este veiculo ja esta marcado como vendido no estoque.", "error");
    return;
  }
  applyVexInventoryToSaleForm(item);
  goToSection("newSaleSection");
}

function applyVexInventoryToSaleForm(item) {
  setSaleFieldValue("vehicleModel", item.model);
  setSaleFieldValue("vehicleYear", item.year);
  setSaleFieldValue("vehicleFipeValue", item.fipeValue);
  setSaleFieldValue("vehicleVersion", item.version);
  setSaleFieldValue("vehicleTransmission", item.transmission);
  setSaleFieldValue("vehicleColor", item.color);
  setSaleFieldValue("vehiclePlate", item.plate);
  setSaleFieldValue("vehicleKm", item.km);
  setSaleFieldValue("saleInventoryPlateLookup", item.plate);
}

async function markVexInventorySoldFromSale(sale) {
  const id = sale && sale.inventoryVehicleId ? sale.inventoryVehicleId : "";
  const plate = sale && sale.vehiclePlate ? sale.vehiclePlate : "";
  const item = id
    ? vexInventory.find(function(vehicle) { return vehicle.id === id; })
    : getVexInventoryItemByPlate(plate);

  if (!item || isVexInventoryBlockedForSale(item)) {
    return;
  }

  const updatedItem = {
    ...item,
    status: "Vendido",
    soldSaleId: sale.id || "",
    soldAtLocal: new Date().toISOString(),
    updatedAtLocal: new Date().toISOString()
  };

  await persistVexInventoryItem(updatedItem);
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
          <strong>Veiculo</strong>
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
          <strong>Transferencia</strong>
          <span>${escapeHTML(sale.transferType)}</span>
        </div>

        <div>
          <strong>Status</strong>
          <span>${escapeHTML(sale.afterSaleStatus)}</span>
        </div>

        <div>
          <strong>Comissao total</strong>
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
        <strong>Nenhum veiculo vendido ainda.</strong>
        <span>Assim que uma venda for cadastrada, ela aparecera aqui no formato VEX Premium.</span>
      </div>
    `;

    historyCounter.textContent = "0 veiculos";
    return;
  }

  if (filteredSales.length === 0) {
    historyList.innerHTML = `
      <div class="vex-empty-premium">
        <div class="vex-empty-icon">V</div>
        <strong>Nenhum veiculo encontrado.</strong>
        <span>Tente limpar os filtros ou pesquisar outro cliente, veiculo ou status.</span>
      </div>
    `;

    historyCounter.textContent = "0 encontrados";
    return;
  }

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veiculo(s)`;
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
              <p>${escapeHTML(sale.clientName)}  - ${formatDateToBrazil(sale.saleDate)}</p>
            </div>

            <strong class="vex-vehicle-price">${escapeHTML(value)}</strong>
          </div>

          <div class="vex-vehicle-meta">
            <span>Telefone: <strong>${escapeHTML(sale.clientPhone)}</strong></span>
            <span>Transferencia: <strong>${escapeHTML(sale.transferType)}</strong></span>
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
  if (title) title.textContent = "Veiculos Vendidos";
  if (description) description.textContent = "Relação premium de veiculos vendidos. Clique no veiculo para abrir status, transferencia, comissão e observacoes.";
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
      <button class="sale-details-close" type="button" onclick="closeSaleDetails()">X</button>
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
      <span class="drawer-kicker">Veiculo vendido</span>
      <h3>${escapeHTML(sale.vehicleModel)} ${escapeHTML(sale.vehicleYear)}</h3>
      <strong>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</strong>
      <p>${escapeHTML(sale.clientName)}  - ${formatDateToBrazil(sale.saleDate)}</p>
    </div>

    <div class="drawer-section">
      <h4>Dados da venda</h4>
      <div class="drawer-grid">
        <div><span>Cliente</span><strong>${escapeHTML(sale.clientName)}</strong></div>
        <div><span>Telefone</span><strong>${escapeHTML(sale.clientPhone)}</strong></div>
        <div><span>Veiculo</span><strong>${escapeHTML(sale.vehicleModel)}</strong></div>
        <div><span>Ano</span><strong>${escapeHTML(sale.vehicleYear)}</strong></div>
        <div><span>Valor</span><strong>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</strong></div>
        <div><span>Data</span><strong>${formatDateToBrazil(sale.saleDate)}</strong></div>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Pós-venda e transferencia</h4>
      ${renderAdminDrawerControls(sale)}
    </div>

    <div class="drawer-section commission-drawer">
      <h4>Comissao</h4>
      <div class="commission-total">R$ 250,00</div>
      <div class="drawer-grid two">
        <div><span>Frank Luiz</span><strong>R$ 125,00</strong></div>
        <div><span>Lucas Luiz</span><strong>R$ 125,00</strong></div>
      </div>
    </div>

    <div class="drawer-section">
      <h4>Observacoes</h4>
      <p class="drawer-notes">${escapeHTML(sale.saleNotes || "Sem observacoes cadastradas.")}</p>
    </div>

    <div class="drawer-actions vex-drawer-actions-safe">
      ${canManageContent() ? `<button class="primary-button" type="button" onclick="startEditSale('${sale.id}')">Editar</button>` : ""}
      <button class="primary-button" type="button" onclick="openVexFormalization('${sale.id}')">Formalizacao</button>
      <button class="secondary-button" type="button" onclick="openVexClientWhatsapp('${sale.id}', 'transfer')">WhatsApp</button>
      <button class="secondary-button" type="button" onclick="closeSaleDetails();">Fechar</button>
      ${canManageContent() ? `<button class="danger-button" type="button" onclick="deleteSale('${sale.id}'); closeSaleDetails();">Excluir</button>` : ""}
    </div>
  `;

  overlay.classList.add("active");
}

function renderAdminDrawerControls(sale) {
  if (!canManageContent()) {
    return `
      <div class="readonly-notice">
        Seu acesso é de usuário comum. Apenas administradores podem alterar status ou transferencia.
      </div>
      <div class="drawer-grid two">
        <div><span>Status</span><strong>${escapeHTML(sale.afterSaleStatus || "-")}</strong></div>
        <div><span>Transferencia</span>${canManageContent() ? `<select class="history-inline-select vex-transfer-mode-select" onchange="updateSaleTransfer('${sale.id}', this.value)">${getTransferOptions(sale.transferType)}</select>` : `<strong>${escapeHTML(sale.transferType || "-")}</strong>`}</div>
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
      Transferencia
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
  const photoUrl = sale && sale.vehiclePhotoUrl ? sale.vehiclePhotoUrl : "";

  if (photoUrl) {
    return `
      <div class="${className} has-image">
        <img src="${escapeHTML(photoUrl)}" alt="Foto do veiculo ${escapeHTML(sale.vehicleModel || "")}" />
      </div>
    `;
  }

  return `
    <div class="${className} vex-logo-placeholder" aria-hidden="true">
      <div class="vex-car-symbol">VE</div>
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
      button.textContent = "Veiculos";
    }

    if (target === "newSaleSection") {
      button.textContent = "+ Nova Venda";
    }
  });
}

function getVexDaysSinceSale(sale) {
  if (!sale || !sale.saleDate) return 0;
  const date = new Date(sale.saleDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function isVexSaleTransferFinished(sale) {
  const status = String((sale && sale.afterSaleStatus) || "").toLowerCase();
  const stage = String(getVexTransferStage(sale) || "").toLowerCase();
  return status.includes("transferido") || status.includes("finalizado") || stage.includes("transferido");
}

function getVexNextTransferChecklistItem(sale) {
  const definitions = typeof getVexTransferChecklistDefinitions === "function" ? getVexTransferChecklistDefinitions(sale) : [];
  const state = typeof getVexTransferChecklistState === "function" ? getVexTransferChecklistState(sale) : {};
  return definitions.find(function(item) { return !state[item.key]; }) || null;
}

function getVexDashboardPendingItems() {
  if (!Array.isArray(sales)) return [];

  return sales
    .filter(function(sale) { return !isVexSaleTransferFinished(sale); })
    .map(function(sale) {
      const days = getVexDaysSinceSale(sale);
      const nextItem = getVexNextTransferChecklistItem(sale);
      const stage = getVexTransferStage(sale);
      const transfer = sale.transferType || "Transferencia nao informada";
      let tone = "normal";
      let label = "Acompanhar";
      let detail = nextItem ? nextItem.label : stage;
      let score = 1;

      if (days >= 25) {
        tone = "critical";
        label = "Prazo critico";
        score = 100 + days;
        detail = `${days} dias desde a venda - ${detail}`;
      } else if (String(stage).toLowerCase().includes("cliente")) {
        tone = "client";
        label = "Aguardando cliente";
        score = 70 + days;
      } else if (String(stage).toLowerCase().includes("despachante") || String(stage).toLowerCase().includes("atpv")) {
        tone = "progress";
        label = "Despachante / ATPV";
        score = 55 + days;
      } else if (nextItem) {
        tone = "pending";
        label = "Pendente";
        score = 35 + days;
      }

      return {
        id: sale.id,
        label: label,
        tone: tone,
        score: score,
        title: `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim(),
        subtitle: `${sale.clientName || "Cliente nao informado"} - ${transfer}`,
        detail: detail,
        date: sale.saleDate ? formatDateToBrazil(sale.saleDate) : "Sem data"
      };
    })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function renderVexPendingBoard() {
  const board = document.getElementById("vexPendingBoard");
  const counter = document.getElementById("vexPendingBoardCount");
  if (!board) return;

  const items = getVexDashboardPendingItems();
  if (counter) counter.textContent = `${items.length} prioridade(s)`;

  if (!items.length) {
    board.innerHTML = `
      <div class="vex-pending-empty">
        <strong>Nenhuma pendencia critica agora.</strong>
        <span>As transferencias em aberto aparecerao aqui automaticamente.</span>
      </div>
    `;
    return;
  }

  board.innerHTML = items.map(function(item) {
    return `
      <button class="vex-pending-item is-${escapeHTML(item.tone)}" type="button" onclick="openVexVehicleDrawer('${escapeHTML(item.id)}')">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.subtitle)}</small>
        <em>${escapeHTML(item.detail)} - ${escapeHTML(item.date)}</em>
      </button>
    `;
  }).join("");
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

        <div class="vex-detail-item full vex-transfer-stage-detail">
          <span>Etapa da transferencia</span>
          <strong>
            ${canManageContent() ? `<select class="history-inline-select vex-transfer-stage-select" onchange="updateSaleTransferStage('${sale.id}', this.value)">${getVexTransferStageOptions(getVexTransferStage(sale))}</select>` : renderVexTransferStageChip(sale)}
          </strong>
          <small>${escapeHTML(getVexTransferStageDescription(getVexTransferStage(sale), sale.transferType))}</small>
          <div class="vex-transfer-flow-grid">
            <div>
              <span>Modo</span>
              ${canManageContent() ? `<select class="history-inline-select vex-transfer-mode-select" onchange="updateSaleTransfer('${sale.id}', this.value)">${getTransferOptions(sale.transferType)}</select>` : `<strong>${escapeHTML(sale.transferType || "-")}</strong>`}
            </div>
            <div>
              <span>Sinal visual</span>
              ${renderVexTransferStageChip(sale)}
            </div>
          </div>
          <label class="vex-transfer-note-label" for="transferNote-${sale.id}">Observacao operacional</label>
          ${canManageContent() ? `<textarea id="transferNote-${sale.id}" class="vex-transfer-note-input" rows="3" onblur="updateSaleTransferNote('${sale.id}', this.value)" placeholder="Ex: cliente trazendo documentos reconhecidos.">${escapeHTML(sale.transferStageNote || "")}</textarea>` : `<p class="vex-transfer-note-readonly">${escapeHTML(sale.transferStageNote || "Sem observacao operacional.")}</p>`}
          ${renderVexTransferChecklist(sale)}
        </div>

        <div class="vex-brand-card">
          <strong>VEX</strong>
          <span>🔑 Vire a chave do seu sonho</span>
        </div>
      </section>

      <section class="vex-executive-grid">
        <article class="vex-commission-card">
          <div class="vex-card-topline">
            <span>Comissao do mês</span>
            <small id="vexMonthlySalesCount">0 veiculos</small>
          </div>

          <strong id="vexMonthlyCommission">R$ 0,00</strong>
          <div id="vexCommissionBreakdown" class="vex-commission-breakdown">
            <span>Lucas: R$ 0,00</span>
            <span>Frank: R$ 0,00</span>
          </div>

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
          <span>Veiculos vendidos</span>
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
          <small>Média por veiculo</small>
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
              <span class="vex-kicker">Últimos veiculos</span>
              <h3>Vendidos recentemente</h3>
            </div>
            <button class="vex-mini-button" type="button" onclick="goToSection('historySection')">Ver veiculos</button>
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
    return sale.afterSaleStatus === "Transferencia em andamento" || sale.afterSaleStatus === "Aguardando Cliente" || sale.transferType === "Pela loja";
  }).length;

  const commissionGoal = 6000;
  const goalPercent = commissionGoal > 0 ? Math.min((monthlyCommission / commissionGoal) * 100, 100) : 0;
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexGreetingTitle", getGreetingText());
  setTextById("vexCurrentDate", getCurrentDateLabel());
  setTextById("vexMonthlySalesCount", `${currentMonthSales.length} veiculo(s) no mês`);
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
    <div><span>DR</span><strong>${pendingTransfers}</strong><small>transferencia(s) em atenção</small></div>
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
    container.innerHTML = `<div class="vex-dashboard-empty">Nenhum veiculo vendido ainda.</div>`;
    return;
  }

  container.innerHTML = latestSales.map(function (sale) {
    return `
      <button class="vex-latest-item" type="button" onclick="openSaleDetails('${sale.id}')">
        <span class="vex-latest-icon">VE</span>
        <span>
          <strong>${escapeHTML(sale.vehicleModel || "Veiculo")}</strong>
          <small>${escapeHTML(sale.clientName || "Cliente")}  - ${formatDateToBrazil(sale.saleDate)}</small>
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
          <strong>${escapeHTML(sale.vehicleModel || "Veiculo")}</strong>
          <small>Venda registrada  - ${escapeHTML(sale.afterSaleStatus || "Status")}</small>
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
        const isPermissionError = error && error.code === "permission-denied";
        users = currentUser ? [{
          id: currentUser.uid,
          displayName: getCurrentUserDisplayName(),
          email: currentUser.email || "",
          role: getCurrentUserRole(),
          fallback: true
        }] : [];
        renderUsersList();
        if (usersMessage) {
          usersMessage.innerHTML = isPermissionError
            ? '<div class="empty-state">O Firestore bloqueou a leitura da coleção de usuários. Publique as regras oficiais em <b>Firestore Database &gt; Rules</b> para permitir que administradores leiam <b>users</b>. Enquanto isso, sua conta ADM foi exibida em modo local.</div>'
            : '<div class="empty-state">Nao foi possível carregar todos os usuários. Verifique a conexão ou as regras do Firestore. Enquanto isso, sua conta ADM foi exibida em modo local.</div>';
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
    const email = user.email || "E-mail nao informado";
    const disabled = isCurrent ? "disabled" : "";
    const hint = isCurrent ? "Esta é sua conta atual. Nao é possível rebaixar você mesmo pelo painel." : "";
    const roleBadgeClass = role === "admin" ? "role-badge admin" : "role-badge user";
    const isActive = user.active !== false;
    const accessBadgeClass = isActive ? "access-badge active" : "access-badge blocked";
    const accessLabel = isActive ? "Ativo" : "Bloqueado";
    const blockButtonLabel = isActive ? "Bloquear acesso" : "Desbloquear acesso";
    const lastLogin = user.lastLoginAtLocal ? formatUserDate(user.lastLoginAtLocal) : "Último acesso nao registrado";

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
          <span class="${accessBadgeClass}">${accessLabel}</span>
          <select class="role-select" ${disabled} onchange="updateUserRole('${user.id}', this.value)">
            <option value="user" ${role === "user" ? "selected" : ""}>Usuário</option>
            <option value="admin" ${role === "admin" ? "selected" : ""}>Administrador</option>
          </select>
          <button class="secondary-button user-access-button" type="button" ${disabled} onclick="toggleUserAccess('${user.id}', ${isActive ? "false" : "true"})">${blockButtonLabel}</button>
        </div>
      </article>
    `;
  }).join("");
}

function getAdminSecondaryAuth() {
  if (typeof firebase === "undefined" || !auth) {
    return null;
  }

  if (!adminSecondaryFirebaseApp) {
    try {
      adminSecondaryFirebaseApp = firebase.app("vexAdminUserCreate");
    } catch (error) {
      adminSecondaryFirebaseApp = firebase.initializeApp(firebase.app().options, "vexAdminUserCreate");
    }
  }

  return adminSecondaryFirebaseApp.auth();
}

function showAdminCreateUserMessage(message, type) {
  if (!adminCreateUserMessage) {
    return;
  }

  adminCreateUserMessage.innerHTML = `<div class="${type === "success" ? "success-state" : "empty-state"}">${message}</div>`;
}

async function createUserFromAdminPanel(event) {
  event.preventDefault();

  if (!canManageContent()) {
    showAdminCreateUserMessage("Apenas administradores podem cadastrar usuários.", "error");
    return;
  }

  const displayName = String(adminNewUserName ? adminNewUserName.value : "").trim();
  const email = normalizeEmail(adminNewUserEmail ? adminNewUserEmail.value : "");
  const password = String(adminNewUserPassword ? adminNewUserPassword.value : "");

  if (!displayName) {
    showAdminCreateUserMessage("Informe o nome do usuário.", "error");
    return;
  }

  if (!email) {
    showAdminCreateUserMessage("Informe o e-mail do usuário.", "error");
    return;
  }

  if (password.length < 6) {
    showAdminCreateUserMessage("A senha provisoria precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  const secondaryAuth = getAdminSecondaryAuth();
  if (!secondaryAuth || !db) {
    showAdminCreateUserMessage("Firebase ainda nao está pronto. Tente novamente em alguns segundos.", "error");
    return;
  }

  const submitButton = adminCreateUserForm ? adminCreateUserForm.querySelector('button[type="submit"]') : null;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Cadastrando...";
  }

  try {
    const credential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
    const createdUser = credential && credential.user ? credential.user : null;

    if (!createdUser) {
      throw new Error("Usuário nao retornado pelo Firebase Authentication.");
    }

    if (typeof createdUser.updateProfile === "function") {
      await createdUser.updateProfile({ displayName: displayName });
    }

    await db.collection("users").doc(createdUser.uid).set({
      displayName: displayName,
      email: email,
      role: "user",
      active: true,
      createdAtLocal: new Date().toISOString(),
      updatedAtLocal: new Date().toISOString(),
      createdBy: currentUser ? currentUser.uid : ""
    }, { merge: true });

    await secondaryAuth.signOut();

    if (adminCreateUserForm) {
      adminCreateUserForm.reset();
    }

    showAdminCreateUserMessage("Usuário cadastrado com sucesso. Ele já aparece na lista como Usuário.", "success");
  } catch (error) {
    console.error("Erro ao cadastrar usuário pelo painel ADM:", error);
    const code = error && error.code ? error.code : "";

    if (code === "auth/email-already-in-use") {
      showAdminCreateUserMessage("Este e-mail já existe no Firebase Authentication. Se ele nao aparece na lista, publique as regras oficiais e peça para o usuário fazer o primeiro login.", "error");
    } else if (code === "permission-denied") {
      showAdminCreateUserMessage("O acesso foi criado no Authentication, mas o Firestore bloqueou o registro no painel. Publique o arquivo firestore.rules no Firebase Console.", "error");
    } else {
      showAdminCreateUserMessage("Nao foi possível cadastrar o usuário. Verifique os dados, conexão e regras do Firestore.", "error");
    }
  } finally {
    try {
      await secondaryAuth.signOut();
    } catch (error) {
      console.warn("Nao foi possível encerrar a sessão secundária:", error);
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Cadastrar usuário";
    }
  }
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
    alert("Por segurança, você nao pode alterar o próprio acesso por este painel.");
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
    alert("Nao foi possível atualizar a permissão. Verifique as regras do Firestore.");
    renderUsersList();
  }
}

async function toggleUserAccess(userId, active) {
  if (!canManageContent()) {
    alert("Apenas administradores podem bloquear ou desbloquear usuários.");
    return;
  }

  if (!db || !userId) {
    return;
  }

  if (currentUser && userId === currentUser.uid) {
    alert("Por segurança, você nao pode bloquear a própria conta.");
    renderUsersList();
    return;
  }

  try {
    await db.collection("users").doc(userId).set({
      active: Boolean(active),
      updatedAtLocal: new Date().toISOString(),
      updatedBy: currentUser ? currentUser.uid : ""
    }, { merge: true });
  } catch (error) {
    console.error("Erro ao alterar acesso do usuário:", error);
    alert("Nao foi possível alterar o acesso. Verifique as regras do Firestore.");
    renderUsersList();
  }
}

function formatUserDate(value) {
  if (!value) {
    return "Último acesso nao registrado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Último acesso nao registrado";
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
    console.warn("Nao foi possível garantir o perfil do usuário no Firestore:", error);
    return defaultRole;
  }
}

async function loadUserProfile(user) {
  const profile = {
    displayName: user && user.displayName ? user.displayName : "",
    role: isBootstrapAdminEmail(user && user.email) ? "admin" : "user",
    active: true
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

      if (typeof data.active === "boolean") {
        profile.active = data.active;
      }
    }

    if (isBootstrapAdminEmail(user.email)) {
      profile.role = "admin";
      profile.active = true;
    }

    await ensureUserProfileDocument(user, profile.displayName || createFriendlyNameFromEmail(user.email || ""));
  } catch (error) {
    console.warn("Nao foi possível ler o perfil do usuário no Firestore:", error);
  }

  return profile;
}

function updateUserIdentityUI() {
  const name = getCurrentUserDisplayName();
  const email = currentUser && currentUser.email ? currentUser.email : "";

  if (userEmailLabel) {
    userEmailLabel.textContent = email ? `${name}  - ${getRoleLabel(getCurrentUserRole())}  - ${email}` : "";
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
    "Transferencia em andamento",
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
  if (reportTotalCommission) reportTotalCommission.textContent = formatCurrencyToBrazil(totalCommission);
  if (reportFrankCommission) reportFrankCommission.textContent = formatCurrencyToBrazil(frankCommission);
  if (reportLucasCommission) reportLucasCommission.textContent = formatCurrencyToBrazil(lucasCommission);
  if (reportStoreTransfer) if (reportStoreTransfer) reportStoreTransfer.textContent = storeTransfer;
  if (reportClientTransfer) if (reportClientTransfer) reportClientTransfer.textContent = clientTransfer;
  if (reportPendingAfterSales) if (reportPendingAfterSales) reportPendingAfterSales.textContent = pendingAfterSales;
  if (reportFinishedAfterSales) if (reportFinishedAfterSales) reportFinishedAfterSales.textContent = finishedAfterSales;
}

function getAuthErrorMessage(error) {
  const code = error.code;

  if (code === "auth/invalid-email") {
    return "E-mail inválido.";
  }

  if (code === "auth/user-not-found") {
    return "Usuário nao encontrado.";
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
    return "Cadastro por e-mail/senha nao está habilitado no Firebase Authentication.";
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
  if (!date) {
    return "Data inválida";
  }

  if (String(date).includes("/")) {
    return String(date);
  }

  if (!String(date).includes("-")) {
    return "Data inválida";
  }

  const dateParts = String(date).split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  return `${day}/${month}/${year}`;
}

/* =========================================================
   RC3.0.9 - WhatsApp rapido para pendencias
   ========================================================= */
function renderVexSmartAlerts(pendingAfterSales, pendingTransfers, goalPercent, growth) {
  const container = document.getElementById("vexSmartAlerts");

  if (!container) {
    return;
  }

  const growthText = growth === null ? "Novo mes iniciado" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}% vs mes anterior`;
  const pendingContacts = sales.filter(function(sale) {
    return sale.afterSaleStatus !== "Finalizado";
  }).sort(function(a, b) {
    return new Date(b.saleDate || b.createdAtLocal || 0).getTime() - new Date(a.saleDate || a.createdAtLocal || 0).getTime();
  });
  const pendingContactHtml = pendingContacts.length ? `
    <div class="vex-alert-contact-panel">
      <span class="vex-alert-contact-title">Todos em aberto (${pendingContacts.length})</span>
      ${pendingContacts.map(function(sale) {
        const reason = sale.transferType === "Pela loja" || sale.afterSaleStatus === "Transferencia em andamento" || sale.afterSaleStatus === "TransferÃªncia em andamento" ? "transfer" : "followup";

        return `
          <article class="vex-alert-contact-row">
            <span>
              <strong>${escapeHTML(sale.clientName || "Cliente")}</strong>
              <small>${escapeHTML(sale.vehicleModel || "Veiculo")} - ${escapeHTML(sale.afterSaleStatus || "Pendente")}</small>
            </span>
            <button type="button" onclick="openVexClientWhatsapp('${sale.id}', '${reason}')">WhatsApp</button>
          </article>
        `;
      }).join("")}
    </div>
  ` : "";

  container.innerHTML = `
    <div><span>!</span><strong>${pendingAfterSales}</strong><small>pos-venda(s) pendente(s)</small></div>
    <div><span>TR</span><strong>${pendingTransfers}</strong><small>transferencia(s) em atencao</small></div>
    <div><span>%</span><strong>${goalPercent.toFixed(0)}%</strong><small>da meta do mes</small></div>
    <div><span>+</span><strong>${escapeHTML(growthText)}</strong><small>crescimento</small></div>
    ${pendingContactHtml}
  `;
}

function renderVexLatestVehicles() {
  const container = document.getElementById("vexLatestVehicles");

  if (!container) {
    return;
  }

  const latestSales = sales.slice(0, 5);

  if (latestSales.length === 0) {
    container.innerHTML = `<div class="vex-dashboard-empty">Nenhum veiculo vendido ainda.</div>`;
    return;
  }

  container.innerHTML = latestSales.map(function (sale) {
    const hasPendingContact = sale.afterSaleStatus !== "Finalizado" || sale.transferType === "Pela loja";
    const whatsappReason = sale.transferType === "Pela loja" || sale.afterSaleStatus === "Transferencia em andamento" || sale.afterSaleStatus === "TransferÃªncia em andamento" ? "transfer" : "followup";

    return `
      <button class="vex-latest-item" type="button" onclick="openSaleDetails('${sale.id}')">
        <span class="vex-latest-icon">V</span>
        <span>
          <strong>${escapeHTML(sale.vehicleModel || "Veiculo")}</strong>
          <small>${escapeHTML(sale.clientName || "Cliente")} - ${formatDateToBrazil(sale.saleDate)}</small>
        </span>
        <span class="vex-latest-actions">
          <em>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</em>
          ${hasPendingContact ? `<span class="vex-whatsapp-chip" onclick="event.stopPropagation(); openVexClientWhatsapp('${sale.id}', '${whatsappReason}')">WhatsApp</span>` : ""}
        </span>
      </button>
    `;
  }).join("");
}

/* =========================================================
   RC3.0.12 - Central de Pendencias Premium
   ========================================================= */
function getVexPendingCategories() {
  const categories = [
    { key: "transfer", label: "Transferencia", rows: [] },
    { key: "afterSale", label: "Pos-venda", rows: [] },
    { key: "docs", label: "Documentos", rows: [] },
    { key: "payment", label: "Pagamento", rows: [] },
    { key: "formalization", label: "Formalizacao", rows: [] },
    { key: "phone", label: "Sem telefone", rows: [] }
  ];
  const byKey = categories.reduce(function(map, category) {
    map[category.key] = category;
    return map;
  }, {});

  sales.forEach(function(sale) {
    const client = getVexFormalizationClientData(sale);
    const vehicle = getVexFormalizationVehicleData(sale);
    const payment = getVexFormalizationPaymentData(sale);
    const docs = getVexFormalizationReceivedDocsData(sale);
    const transfer = getVexFormalizationTransferData(sale);
    const transferStatus = getVexTransferStatus(transfer);
    const clientCompletion = getVexClientCompletion(client);
    const vehicleCompletion = getVexVehicleCompletion(vehicle);
    const paymentCompletion = getVexPaymentCompletion(payment, sale);
    const docsCompletion = getVexReceivedDocsCompletion(docs);
    const transferCompletion = getVexTransferCompletion(transfer);
    const phone = getVexWhatsappPhone(sale);
    const base = {
      id: sale.id,
      clientName: sale.clientName || client.clientName || "Cliente",
      vehicleName: `${sale.vehicleModel || vehicle.vehicleModel || "Veiculo"} ${sale.vehicleYear || vehicle.vehicleYear || ""}`.trim(),
      saleDate: sale.saleDate || sale.createdAtLocal || "",
      hasPhone: Boolean(phone)
    };

    if (sale.afterSaleStatus !== "Finalizado") {
      byKey.afterSale.rows.push({
        ...base,
        status: sale.afterSaleStatus || "Pendente",
        action: "openSaleDetails",
        whatsapp: "followup"
      });
    }

    if (transferStatus.className !== "done" || (sale.transferType === "Pela loja" && sale.afterSaleStatus !== "Finalizado")) {
      byKey.transfer.rows.push({
        ...base,
        status: transferStatus.label,
        action: "openVexFormalizationTransfer",
        whatsapp: "transfer",
        danger: transferStatus.className === "danger",
        warning: transferStatus.className === "warning"
      });
    }

    if (!docsCompletion.complete) {
      byKey.docs.rows.push({
        ...base,
        status: `${docsCompletion.done}/${docsCompletion.total} recebidos`,
        action: "openVexFormalizationReceivedDocs",
        whatsapp: "followup"
      });
    }

    if (!paymentCompletion.complete) {
      byKey.payment.rows.push({
        ...base,
        status: paymentCompletion.totalOk ? "Conferencia pendente" : "Valor divergente",
        action: "openVexFormalizationPayment",
        whatsapp: "followup",
        warning: true
      });
    }

    if (!clientCompletion.complete || !vehicleCompletion.complete || !paymentCompletion.complete || !docsCompletion.complete || !transferCompletion.complete) {
      byKey.formalization.rows.push({
        ...base,
        status: `${Math.round((clientCompletion.percent + vehicleCompletion.percent + paymentCompletion.percent + docsCompletion.percent + transferCompletion.percent) / 5)}% completo`,
        action: "openVexFormalization",
        whatsapp: "followup"
      });
    }

    if (!phone && sale.afterSaleStatus !== "Finalizado") {
      byKey.phone.rows.push({
        ...base,
        status: "Cadastrar telefone",
        action: "openVexFormalizationClient",
        whatsapp: ""
      });
    }
  });

  categories.forEach(function(category) {
    category.rows.sort(function(a, b) {
      if (a.danger !== b.danger) return a.danger ? -1 : 1;
      if (a.warning !== b.warning) return a.warning ? -1 : 1;
      return new Date(b.saleDate || 0).getTime() - new Date(a.saleDate || 0).getTime();
    });
  });

  return categories;
}

function renderVexPendingCategory(category) {
  if (!category.rows.length) {
    return "";
  }

  return `
    <section class="vex-pending-category vex-pending-${category.key}">
      <header>
        <strong>${escapeHTML(category.label)}</strong>
        <span>${category.rows.length}</span>
      </header>
      <div class="vex-pending-list">
        ${category.rows.map(function(row) {
          const statusClass = row.danger ? "danger" : row.warning ? "warning" : "";
          const actionName = row.action || "openVexFormalization";
          return `
            <article class="vex-pending-row ${statusClass}">
              <div>
                <strong>${escapeHTML(row.clientName)}</strong>
                <small>${escapeHTML(row.vehicleName)} - ${escapeHTML(row.status)}</small>
              </div>
              <div class="vex-pending-actions">
                ${row.hasPhone && row.whatsapp ? `<button type="button" onclick="openVexClientWhatsapp('${row.id}', '${row.whatsapp}')">WhatsApp</button>` : `<button type="button" class="muted" onclick="openVexFormalizationClient('${row.id}')">Sem telefone</button>`}
                <button type="button" onclick="${actionName}('${row.id}')">Abrir</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderVexSmartAlerts(pendingAfterSales, pendingTransfers, goalPercent, growth) {
  const container = document.getElementById("vexSmartAlerts");

  if (!container) {
    return;
  }

  const categories = getVexPendingCategories();
  const totalPendencies = categories.reduce(function(total, category) {
    return total + category.rows.length;
  }, 0);
  const transferCategory = categories.find(function(category) { return category.key === "transfer"; });
  const phoneCategory = categories.find(function(category) { return category.key === "phone"; });
  const growthText = growth === null ? "Novo mes" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`;
  const categoryHtml = categories.map(renderVexPendingCategory).filter(Boolean).join("");

  container.innerHTML = `
    <div><span>!</span><strong>${pendingAfterSales}</strong><small>pos-vendas em aberto</small></div>
    <div><span>TR</span><strong>${transferCategory ? transferCategory.rows.length : pendingTransfers}</strong><small>transferencias</small></div>
    <div><span>TEL</span><strong>${phoneCategory ? phoneCategory.rows.length : 0}</strong><small>sem telefone valido</small></div>
    <div><span>+</span><strong>${escapeHTML(growthText)}</strong><small>crescimento</small></div>
    <div class="vex-pending-center">
      <div class="vex-pending-center-title">
        <span>Central de Pendencias</span>
        <strong>${totalPendencies}</strong>
      </div>
      ${categoryHtml || `<p class="vex-pending-empty">Nenhuma pendencia encontrada.</p>`}
    </div>
  `;
}

/* =========================================================
   RC3.0.13 - Dashboard Clean Loja
   ========================================================= */
function getVexDaysSinceSale(sale) {
  if (!sale || !sale.saleDate) return 0;
  const date = new Date(sale.saleDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function isVexSaleTransferFinished(sale) {
  const status = String((sale && sale.afterSaleStatus) || "").toLowerCase();
  const stage = String(getVexTransferStage(sale) || "").toLowerCase();
  return status.includes("transferido") || status.includes("finalizado") || stage.includes("transferido");
}

function getVexNextTransferChecklistItem(sale) {
  const definitions = typeof getVexTransferChecklistDefinitions === "function" ? getVexTransferChecklistDefinitions(sale) : [];
  const state = typeof getVexTransferChecklistState === "function" ? getVexTransferChecklistState(sale) : {};
  return definitions.find(function(item) { return !state[item.key]; }) || null;
}

function getVexDashboardPendingItems() {
  if (!Array.isArray(sales)) return [];

  return sales
    .filter(function(sale) { return !isVexSaleTransferFinished(sale); })
    .map(function(sale) {
      const days = getVexDaysSinceSale(sale);
      const nextItem = getVexNextTransferChecklistItem(sale);
      const stage = getVexTransferStage(sale);
      const transfer = sale.transferType || "Transferencia nao informada";
      let tone = "normal";
      let label = "Acompanhar";
      let detail = nextItem ? nextItem.label : stage;
      let score = 1;

      if (days >= 25) {
        tone = "critical";
        label = "Prazo critico";
        score = 100 + days;
        detail = `${days} dias desde a venda - ${detail}`;
      } else if (String(stage).toLowerCase().includes("cliente")) {
        tone = "client";
        label = "Aguardando cliente";
        score = 70 + days;
      } else if (String(stage).toLowerCase().includes("despachante") || String(stage).toLowerCase().includes("atpv")) {
        tone = "progress";
        label = "Despachante / ATPV";
        score = 55 + days;
      } else if (nextItem) {
        tone = "pending";
        label = "Pendente";
        score = 35 + days;
      }

      return {
        id: sale.id,
        label: label,
        tone: tone,
        score: score,
        title: `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim(),
        subtitle: `${sale.clientName || "Cliente nao informado"} - ${transfer}`,
        detail: detail,
        date: sale.saleDate ? formatDateToBrazil(sale.saleDate) : "Sem data"
      };
    })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function renderVexPendingBoard() {
  const board = document.getElementById("vexPendingBoard");
  const counter = document.getElementById("vexPendingBoardCount");
  if (!board) return;

  const items = getVexDashboardPendingItems();
  if (counter) counter.textContent = `${items.length} prioridade(s)`;

  if (!items.length) {
    board.innerHTML = `
      <div class="vex-pending-empty">
        <strong>Nenhuma pendencia critica agora.</strong>
        <span>As transferencias em aberto aparecerao aqui automaticamente.</span>
      </div>
    `;
    return;
  }

  board.innerHTML = items.map(function(item) {
    return `
      <button class="vex-pending-item is-${escapeHTML(item.tone)}" type="button" onclick="openVexVehicleDrawer('${escapeHTML(item.id)}')">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.subtitle)}</small>
        <em>${escapeHTML(item.detail)} - ${escapeHTML(item.date)}</em>
      </button>
    `;
  }).join("");
}
function prepareVexDashboardLayout() {
  const dashboardSection = document.getElementById("dashboardSection");

  if (!dashboardSection || dashboardSection.getAttribute("data-vex-dashboard-ready") === "rc3-0-13") {
    return;
  }

  dashboardSection.setAttribute("data-vex-dashboard-ready", "rc3-0-13");

  dashboardSection.innerHTML = `
    <div class="vex-dashboard-shell vex-dashboard-clean">
      <section class="vex-clean-hero">
        <div>
          <span class="vex-kicker">VEX MULTIMARCAS</span>
          <h2 id="vexGreetingTitle">Dashboard</h2>
          <p id="vexCurrentDate">Visao geral da loja</p>
        </div>
        <button class="primary-button vex-clean-action" type="button" onclick="goToSection('newSaleSection')">Nova venda</button>
      </section>

      <section class="vex-clean-kpis">
        <article>
          <span>Vendidos no mes</span>
          <strong id="vexCleanMonthSales">0</strong>
          <small>Veiculos lancados</small>
        </article>
        <article>
          <span>Valor vendido</span>
          <strong id="vexCleanMonthValue">R$ 0,00</strong>
          <small>Somente mes atual</small>
        </article>
        <article>
          <span>Crescimento</span>
          <strong id="vexCleanGrowth">0%</strong>
          <small>Comparado ao mes anterior</small>
        </article>
      </section>
<section class="vex-clean-grid">
        <article class="vex-clean-panel vex-clean-latest-panel">
          <div class="vex-clean-panel-header">
            <div>
              <span class="vex-kicker">Ultimos carros</span>
              <h3>Vendidos recentemente</h3>
            </div>
            <button class="vex-mini-button" type="button" onclick="goToSection('historySection')">Ver todos</button>
          </div>
          <div id="vexLatestVehicles" class="vex-clean-latest-list"></div>
        </article>

        <article class="vex-clean-panel">
          <div class="vex-clean-panel-header">
            <div>
              <span class="vex-kicker">Crescimento</span>
              <h3>Vendas por mes</h3>
            </div>
          </div>
          <div id="vexMonthlyGrowthChart" class="vex-clean-chart"></div>
        </article>
      </section>
    </div>
  `;
}

function getVexMonthlySalesBuckets(monthsCount) {
  const months = [];
  const now = new Date();
  const storeOpening = new Date(2026, 3, 1);
  const firstMonth = new Date(Math.max(storeOpening.getTime(), new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1).getTime()));

  for (let date = new Date(firstMonth.getFullYear(), firstMonth.getMonth(), 1); date <= now; date.setMonth(date.getMonth() + 1)) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      count: 0,
      value: 0
    });
  }

  sales.forEach(function(sale) {
    const rawDate = sale.saleDate || sale.createdAtLocal || "";
    const parsedDate = rawDate ? new Date(rawDate) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return;

    const key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find(function(item) {
      return item.key === key;
    });

    if (bucket) {
      bucket.count += 1;
      bucket.value += sale.saleValueNumber ? Number(sale.saleValueNumber) : parseSaleCurrencyValue(sale.saleValue || "");
    }
  });

  return months;
}

function renderVexMonthlyGrowthChart() {
  const container = document.getElementById("vexMonthlyGrowthChart");
  if (!container) return;

  const months = getVexMonthlySalesBuckets(6);
  const maxCount = Math.max(1, ...months.map(function(month) { return month.count; }));

  container.innerHTML = months.map(function(month) {
    const height = Math.max(8, Math.round((month.count / maxCount) * 100));
    return `
      <div class="vex-clean-chart-item">
        <div class="vex-clean-chart-bar-wrap">
          <span class="vex-clean-chart-bar" style="height:${height}%"></span>
        </div>
        <strong>${month.count}</strong>
        <small>${escapeHTML(month.label)}</small>
      </div>
    `;
  }).join("");
}

function renderVexLatestVehicles() {
  const container = document.getElementById("vexLatestVehicles");

  if (!container) {
    return;
  }

  const latestSales = sales.slice(0, 6);

  if (latestSales.length === 0) {
    container.innerHTML = `<div class="vex-dashboard-empty">Nenhum veiculo vendido ainda.</div>`;
    return;
  }

  container.innerHTML = latestSales.map(function(sale) {
    const vehicleName = `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim();
    return `
      <button class="vex-clean-latest-item" type="button" onclick="openSaleDetails('${sale.id}')">
        <span class="vex-clean-car-mark">V</span>
        <span>
          <strong>${escapeHTML(vehicleName)}</strong>
          <small>${escapeHTML(sale.clientName || "Cliente")} - ${formatDateToBrazil(sale.saleDate)}</small>
        </span>
        <em>${escapeHTML(formatSaleValuePremium(sale.saleValue))}</em>
      </button>
    `;
  }).join("");
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexGreetingTitle", getGreetingText());
  setTextById("vexCurrentDate", getCurrentDateLabel());
  setTextById("vexCleanMonthSales", currentMonthSales.length);
  setTextById("vexCleanMonthValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexCleanGrowth", growth === null ? "Novo mes" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`);

  renderVexLatestVehicles();
  renderVexMonthlyGrowthChart();
}

/* =========================================================
   RC3.0.27 - Visual Clean Loja (override definitivo)
   ========================================================= */
function getVexInventoryAvailableCountFinal() {
  if (!Array.isArray(vexInventory)) return 0;
  return vexInventory.filter((item) => !isVexInventorySoldStatus(item.status || "Disponivel")).length;
}

function getVexDaysSinceSale(sale) {
  if (!sale || !sale.saleDate) return 0;
  const date = new Date(sale.saleDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function isVexSaleTransferFinished(sale) {
  const status = String((sale && sale.afterSaleStatus) || "").toLowerCase();
  const stage = String(getVexTransferStage(sale) || "").toLowerCase();
  return status.includes("transferido") || status.includes("finalizado") || stage.includes("transferido");
}

function getVexNextTransferChecklistItem(sale) {
  const definitions = typeof getVexTransferChecklistDefinitions === "function" ? getVexTransferChecklistDefinitions(sale) : [];
  const state = typeof getVexTransferChecklistState === "function" ? getVexTransferChecklistState(sale) : {};
  return definitions.find(function(item) { return !state[item.key]; }) || null;
}

function getVexDashboardPendingItems() {
  if (!Array.isArray(sales)) return [];

  return sales
    .filter(function(sale) { return !isVexSaleTransferFinished(sale); })
    .map(function(sale) {
      const days = getVexDaysSinceSale(sale);
      const nextItem = getVexNextTransferChecklistItem(sale);
      const stage = getVexTransferStage(sale);
      const transfer = sale.transferType || "Transferencia nao informada";
      let tone = "normal";
      let label = "Acompanhar";
      let detail = nextItem ? nextItem.label : stage;
      let score = 1;

      if (days >= 25) {
        tone = "critical";
        label = "Prazo critico";
        score = 100 + days;
        detail = `${days} dias desde a venda - ${detail}`;
      } else if (String(stage).toLowerCase().includes("cliente")) {
        tone = "client";
        label = "Aguardando cliente";
        score = 70 + days;
      } else if (String(stage).toLowerCase().includes("despachante") || String(stage).toLowerCase().includes("atpv")) {
        tone = "progress";
        label = "Despachante / ATPV";
        score = 55 + days;
      } else if (nextItem) {
        tone = "pending";
        label = "Pendente";
        score = 35 + days;
      }

      return {
        id: sale.id,
        label: label,
        tone: tone,
        score: score,
        title: `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim(),
        subtitle: `${sale.clientName || "Cliente nao informado"} - ${transfer}`,
        detail: detail,
        date: sale.saleDate ? formatDateToBrazil(sale.saleDate) : "Sem data"
      };
    })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function renderVexPendingBoard() {
  const board = document.getElementById("vexPendingBoard");
  const counter = document.getElementById("vexPendingBoardCount");
  if (!board) return;

  const items = getVexDashboardPendingItems();
  if (counter) counter.textContent = `${items.length} prioridade(s)`;

  if (!items.length) {
    board.innerHTML = `
      <div class="vex-pending-empty">
        <strong>Nenhuma pendencia critica agora.</strong>
        <span>As transferencias em aberto aparecerao aqui automaticamente.</span>
      </div>
    `;
    return;
  }

  board.innerHTML = items.map(function(item) {
    return `
      <button class="vex-pending-item is-${escapeHTML(item.tone)}" type="button" onclick="openVexVehicleDrawer('${escapeHTML(item.id)}')">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.subtitle)}</small>
        <em>${escapeHTML(item.detail)} - ${escapeHTML(item.date)}</em>
      </button>
    `;
  }).join("");
}
function prepareVexDashboardLayout() {
  const dashboardSection = document.getElementById("dashboardSection");
  if (!dashboardSection) return;
  if (dashboardSection.getAttribute("data-vex-dashboard-ready") === "rc3-0-27-final") return;

  dashboardSection.setAttribute("data-vex-dashboard-ready", "rc3-0-27-final");
  dashboardSection.innerHTML = `
    <div class="vex-dashboard-minimal">
      <section class="vex-clean-kpis" aria-label="Resumo da loja">
        <article class="vex-clean-kpi">
          <span>Vendidos no mes</span>
          <strong id="vexCleanMonthSales">0</strong>
          <small>veiculos</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Valor vendido</span>
          <strong id="vexCleanMonthValue">R$ 0,00</strong>
          <small>mes atual</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Estoque</span>
          <strong id="vexCleanInventoryCount">0</strong>
          <small>disponiveis</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Crescimento</span>
          <strong id="vexCleanGrowth">0%</strong>
          <small>vs. mes anterior</small>
        </article>
      </section>
<section class="vex-clean-grid">
        <article class="vex-clean-panel vex-clean-panel-main">
          <div class="vex-clean-panel-head">
            <div>
              <span>Ultimas vendas</span>
              <h2>Carros vendidos recentemente</h2>
            </div>
            <button class="ghost-button vex-clean-action" type="button" data-section-target="saleSection">Nova venda</button>
          </div>
          <div id="vexLatestVehicles" class="vex-clean-latest-list"></div>
        </article>

        <article class="vex-clean-panel">
          <div class="vex-clean-panel-head">
            <div>
              <span>Evolucao</span>
              <h2>Vendas por mes</h2>
            </div>
            <button class="ghost-button vex-clean-action" type="button" data-section-target="inventorySection">Estoque</button>
          </div>
          <div id="vexMonthlyGrowthChart" class="vex-clean-chart"></div>
        </article>
      </section>
    </div>
  `;

  dashboardSection.querySelectorAll("[data-section-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-section-target");
      if (target) navigateToSection(target);
    });
  });
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexCleanMonthSales", currentMonthSales.length);
  setTextById("vexCleanMonthValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexCleanInventoryCount", getVexInventoryAvailableCountFinal());
  setTextById("vexCleanGrowth", growth === null ? "Novo mes" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`);

  renderVexLatestVehicles();
  renderVexMonthlyGrowthChart();
}

/* =========================================================
   RC3.0.44 - Correcao final de contraste em drawers
   Entra por ultimo para vencer estilos antigos injetados.
   ========================================================= */
function injectVexFinalContrastStyles() {
  if (document.getElementById("vex-final-contrast-styles")) return;

  const style = document.createElement("style");
  style.id = "vex-final-contrast-styles";
  style.textContent = `
    html body .sale-details-overlay .sale-details-drawer,
    html body .vex-drawer-root .vex-drawer-panel {
      background: #f6f8fb !important;
      color: #0f172a !important;
    }

    html body .sale-details-overlay .drawer-section,
    html body .sale-details-overlay .drawer-hero,
    html body .vex-drawer-root .vex-drawer-hero,
    html body .vex-drawer-root .vex-formalization-form-card,
    html body .vex-drawer-root .vex-formalization-summary-item,
    html body .vex-drawer-root .vex-detail-item,
    html body .vex-drawer-root .vex-document-card {
      background: #ffffff !important;
      color: #0f172a !important;
      border-color: #d8e0ea !important;
      box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08) !important;
    }

    html body .sale-details-overlay h1,
    html body .sale-details-overlay h2,
    html body .sale-details-overlay h3,
    html body .sale-details-overlay h4,
    html body .sale-details-overlay strong,
    html body .vex-drawer-root h1,
    html body .vex-drawer-root h2,
    html body .vex-drawer-root h3,
    html body .vex-drawer-root h4,
    html body .vex-drawer-root strong {
      color: #050b16 !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    html body .sale-details-overlay p,
    html body .sale-details-overlay span,
    html body .sale-details-overlay small,
    html body .sale-details-overlay label,
    html body .vex-drawer-root p,
    html body .vex-drawer-root span,
    html body .vex-drawer-root small,
    html body .vex-drawer-root label {
      color: #334155 !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    html body .vex-drawer-root .vex-formalization-field span,
    html body .sale-details-overlay .drawer-grid span,
    html body .vex-drawer-root .vex-detail-item span,
    html body .vex-drawer-root .vex-formalization-summary-item span {
      color: #475467 !important;
      font-weight: 950 !important;
      letter-spacing: 0.06em !important;
      text-transform: uppercase !important;
    }

    html body .sale-details-overlay input,
    html body .sale-details-overlay select,
    html body .sale-details-overlay textarea,
    html body .vex-drawer-root input,
    html body .vex-drawer-root select,
    html body .vex-drawer-root textarea,
    html body .vex-drawer-root .formalPaymentMethodValue,
    html body .vex-drawer-root .formalPaymentMethodType {
      background: #ffffff !important;
      color: #050b16 !important;
      -webkit-text-fill-color: #050b16 !important;
      border: 1px solid #cbd5e1 !important;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05) !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root input::placeholder,
    html body .vex-drawer-root textarea::placeholder,
    html body .sale-details-overlay input::placeholder,
    html body .sale-details-overlay textarea::placeholder {
      color: #64748b !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-step {
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #d8e0ea !important;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06) !important;
    }

    html body .vex-drawer-root .vex-formalization-step.done {
      background: #f0fdf4 !important;
      border-color: #86efac !important;
    }

    html body .vex-drawer-root .vex-formalization-step.pending {
      background: #fff7ed !important;
      border-color: #fdba74 !important;
    }

    html body .vex-drawer-root .vex-formalization-step small,
    html body .vex-drawer-root .vex-formalization-step em {
      color: #334155 !important;
      opacity: 1 !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe,
    html body .sale-details-overlay .vex-drawer-actions-safe,
    html body .sale-details-overlay .drawer-actions {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
      align-items: stretch !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe button,
    html body .sale-details-overlay .vex-drawer-actions-safe button,
    html body .sale-details-overlay .drawer-actions button {
      width: 100% !important;
      min-height: 50px !important;
      border-radius: 14px !important;
      font-weight: 950 !important;
      opacity: 1 !important;
      text-shadow: none !important;
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10) !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe .primary-button,
    html body .sale-details-overlay .vex-drawer-actions-safe .primary-button,
    html body .sale-details-overlay .drawer-actions .primary-button {
      background: linear-gradient(135deg, #d90404, #970000) !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border: 0 !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe .secondary-button,
    html body .sale-details-overlay .vex-drawer-actions-safe .secondary-button,
    html body .sale-details-overlay .drawer-actions .secondary-button {
      background: #111820 !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border: 1px solid #111820 !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe .danger-button,
    html body .sale-details-overlay .vex-drawer-actions-safe .danger-button,
    html body .sale-details-overlay .drawer-actions .danger-button {
      background: #fff1f2 !important;
      color: #b91c1c !important;
      -webkit-text-fill-color: #b91c1c !important;
      border: 1px solid #fca5a5 !important;
    }

    html body .vex-drawer-root .vex-drawer-actions-safe button:disabled,
    html body .sale-details-overlay .drawer-actions button:disabled {
      background: #e5e7eb !important;
      color: #64748b !important;
      -webkit-text-fill-color: #64748b !important;
      border: 1px solid #cbd5e1 !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root .vex-message-preview,
    html body .vex-drawer-root pre,
    html body .sale-details-overlay .drawer-notes {
      background: #ffffff !important;
      color: #0f172a !important;
      -webkit-text-fill-color: #0f172a !important;
      border: 1px solid #cbd5e1 !important;
    }

    @media (max-width: 640px) {
      html body .vex-drawer-root .vex-drawer-actions-safe,
      html body .sale-details-overlay .vex-drawer-actions-safe,
      html body .sale-details-overlay .drawer-actions {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexFinalContrastStyles();

/* =========================================================
   RC3.0.47 - Menu lateral VEX Oficial
   Visual premium preto fosco com destaque vermelho.
   ========================================================= */

setTimeout(() => {
  const dashboardSection = document.getElementById("dashboardSection");
  if (dashboardSection) dashboardSection.removeAttribute("data-vex-dashboard-ready");
  if (typeof updateVexDashboardExecutive === "function") updateVexDashboardExecutive();
  const inventoryCardFix = document.getElementById("vexRC332InventoryCardFix");
  if (inventoryCardFix) inventoryCardFix.remove();
  if (typeof injectVexRC332InventoryCardFix === "function") injectVexRC332InventoryCardFix();
}, 0);

/* =========================================================
   RC3.0.32 - Ajuste final do card de visualizacao do estoque
   ========================================================= */
function injectVexRC332InventoryCardFix() {
  if (document.getElementById("vexRC332InventoryCardFix")) return;

  const style = document.createElement("style");
  style.id = "vexRC332InventoryCardFix";
  style.textContent = `
    .vex-inventory-details-panel {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
      overflow-y: auto !important;
    }

    .vex-inventory-details-head,
    .vex-inventory-details-photo,
    .vex-inventory-details-grid,
    .vex-inventory-details-notes,
    .vex-inventory-details-panel .vex-drawer-actions {
      position: relative !important;
      z-index: auto !important;
      transform: none !important;
      inset: auto !important;
    }

    .vex-inventory-details-head {
      order: 1 !important;
      flex: 0 0 auto !important;
    }

    .vex-inventory-details-photo {
      order: 2 !important;
      flex: 0 0 auto !important;
      width: 100% !important;
      min-height: 210px !important;
      max-height: 360px !important;
      margin: 0 !important;
      overflow: hidden !important;
      background-image: none !important;
    }

    .vex-inventory-details-photo img {
      position: static !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 210px !important;
      object-fit: cover !important;
      display: block !important;
    }

    .vex-inventory-details-grid {
      order: 3 !important;
      flex: 0 0 auto !important;
      margin-top: 0 !important;
      clear: both !important;
    }

    .vex-inventory-details-notes {
      order: 4 !important;
      flex: 0 0 auto !important;
    }

    .vex-inventory-details-panel .vex-drawer-actions {
      order: 5 !important;
      flex: 0 0 auto !important;
    }
  `;

  document.head.appendChild(style);
}

injectVexRC332InventoryCardFix();

/* =========================================================
   RC3.0.30 - Contraste clean + visualizacao do estoque
   ========================================================= */
function injectVexRC331InventoryViewStyles() {
  if (document.getElementById("vexRC331InventoryViewStyles")) return;

  const style = document.createElement("style");
  style.id = "vexRC331InventoryViewStyles";
  style.textContent = `
    .vex-inventory-details-panel {
      display: grid;
      gap: 16px;
      max-width: 680px;
      background: #10151f !important;
      color: #ffffff !important;
    }

    .vex-inventory-details-head {
      padding-right: 38px;
    }

    .vex-inventory-details-head h2 {
      margin: 10px 0 6px;
      color: #ffffff !important;
      font-size: clamp(24px, 4vw, 34px);
      line-height: 1.08;
      letter-spacing: 0;
    }

    .vex-inventory-details-head p {
      margin: 0;
      color: #aeb7c7 !important;
      font-weight: 700;
    }

    .vex-inventory-details-photo {
      width: 100%;
      aspect-ratio: 16 / 10;
      border-radius: 18px;
      overflow: hidden;
      display: grid;
      place-items: center;
      background: #090c12;
      color: #ffffff;
      font-size: 34px;
      font-weight: 950;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .vex-inventory-details-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .vex-inventory-details-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .vex-inventory-detail-row,
    .vex-inventory-details-notes {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 12px;
    }

    .vex-inventory-detail-row span,
    .vex-inventory-details-notes span {
      display: block;
      color: #aeb7c7;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .vex-inventory-detail-row strong,
    .vex-inventory-details-notes p {
      color: #ffffff !important;
      font-size: 14px;
      line-height: 1.35;
      margin: 0;
      word-break: break-word;
    }

    @media (max-width: 640px) {
      .vex-inventory-details-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexRC331InventoryViewStyles();

/* =========================================================
   RC3.0.32 - Tema claro VEX com contraste controlado
   ========================================================= */
// Tema claro experimental pausado. A base visual atual permanece preservada.

/* =========================================================
   RC3.0.27 - Visual Clean Loja
   Dashboard objetivo + tema mais leve
   ========================================================= */
function getVexInventoryAvailableCount() {
  return (vexInventory || []).filter(function(item) {
    return !isVexInventorySoldStatus(item.status || "Disponivel");
  }).length;
}

function getVexDaysSinceSale(sale) {
  if (!sale || !sale.saleDate) return 0;
  const date = new Date(sale.saleDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function isVexSaleTransferFinished(sale) {
  const status = String((sale && sale.afterSaleStatus) || "").toLowerCase();
  const stage = String(getVexTransferStage(sale) || "").toLowerCase();
  return status.includes("transferido") || status.includes("finalizado") || stage.includes("transferido");
}

function getVexNextTransferChecklistItem(sale) {
  const definitions = typeof getVexTransferChecklistDefinitions === "function" ? getVexTransferChecklistDefinitions(sale) : [];
  const state = typeof getVexTransferChecklistState === "function" ? getVexTransferChecklistState(sale) : {};
  return definitions.find(function(item) { return !state[item.key]; }) || null;
}

function getVexDashboardPendingItems() {
  if (!Array.isArray(sales)) return [];

  return sales
    .filter(function(sale) { return !isVexSaleTransferFinished(sale); })
    .map(function(sale) {
      const days = getVexDaysSinceSale(sale);
      const nextItem = getVexNextTransferChecklistItem(sale);
      const stage = getVexTransferStage(sale);
      const transfer = sale.transferType || "Transferencia nao informada";
      let tone = "normal";
      let label = "Acompanhar";
      let detail = nextItem ? nextItem.label : stage;
      let score = 1;

      if (days >= 25) {
        tone = "critical";
        label = "Prazo critico";
        score = 100 + days;
        detail = `${days} dias desde a venda - ${detail}`;
      } else if (String(stage).toLowerCase().includes("cliente")) {
        tone = "client";
        label = "Aguardando cliente";
        score = 70 + days;
      } else if (String(stage).toLowerCase().includes("despachante") || String(stage).toLowerCase().includes("atpv")) {
        tone = "progress";
        label = "Despachante / ATPV";
        score = 55 + days;
      } else if (nextItem) {
        tone = "pending";
        label = "Pendente";
        score = 35 + days;
      }

      return {
        id: sale.id,
        label: label,
        tone: tone,
        score: score,
        title: `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim(),
        subtitle: `${sale.clientName || "Cliente nao informado"} - ${transfer}`,
        detail: detail,
        date: sale.saleDate ? formatDateToBrazil(sale.saleDate) : "Sem data"
      };
    })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function renderVexPendingBoard() {
  const board = document.getElementById("vexPendingBoard");
  const counter = document.getElementById("vexPendingBoardCount");
  if (!board) return;

  const items = getVexDashboardPendingItems();
  if (counter) counter.textContent = `${items.length} prioridade(s)`;

  if (!items.length) {
    board.innerHTML = `
      <div class="vex-pending-empty">
        <strong>Nenhuma pendencia critica agora.</strong>
        <span>As transferencias em aberto aparecerao aqui automaticamente.</span>
      </div>
    `;
    return;
  }

  board.innerHTML = items.map(function(item) {
    return `
      <button class="vex-pending-item is-${escapeHTML(item.tone)}" type="button" onclick="openVexVehicleDrawer('${escapeHTML(item.id)}')">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.subtitle)}</small>
        <em>${escapeHTML(item.detail)} - ${escapeHTML(item.date)}</em>
      </button>
    `;
  }).join("");
}
function prepareVexDashboardLayout() {
  const dashboardSection = document.getElementById("dashboardSection");

  if (!dashboardSection || dashboardSection.getAttribute("data-vex-dashboard-ready") === "rc3-0-27") {
    return;
  }

  dashboardSection.setAttribute("data-vex-dashboard-ready", "rc3-0-27");
  dashboardSection.innerHTML = `
    <div class="vex-dashboard-shell vex-dashboard-clean vex-dashboard-minimal">
      <section class="vex-clean-kpis">
        <article>
          <span>Vendidos no mes</span>
          <strong id="vexCleanMonthSales">0</strong>
          <small>Vendas lancadas</small>
        </article>
        <article>
          <span>Valor vendido</span>
          <strong id="vexCleanMonthValue">R$ 0,00</strong>
          <small>Somente mes atual</small>
        </article>
        <article>
          <span>Estoque</span>
          <strong id="vexCleanInventoryCount">0</strong>
          <small>Veiculos disponiveis</small>
        </article>
        <article>
          <span>Crescimento</span>
          <strong id="vexCleanGrowth">0%</strong>
          <small>Vs. mes anterior</small>
        </article>
      </section>
<section class="vex-clean-grid">
        <article class="vex-clean-panel vex-clean-latest-panel">
          <div class="vex-clean-panel-header">
            <div>
              <span class="vex-kicker">Vendas</span>
              <h3>Ultimos carros vendidos</h3>
            </div>
            <button class="vex-mini-button" type="button" onclick="goToSection('newSaleSection')">Nova venda</button>
          </div>
          <div id="vexLatestVehicles" class="vex-clean-latest-list"></div>
        </article>

        <article class="vex-clean-panel">
          <div class="vex-clean-panel-header">
            <div>
              <span class="vex-kicker">Mes a mes</span>
              <h3>Crescimento</h3>
            </div>
            <button class="vex-mini-button" type="button" onclick="goToSection('inventorySection')">Estoque</button>
          </div>
          <div id="vexMonthlyGrowthChart" class="vex-clean-chart"></div>
        </article>
      </section>
    </div>
  `;
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexCleanMonthSales", currentMonthSales.length);
  setTextById("vexCleanMonthValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexCleanInventoryCount", getVexInventoryAvailableCount());
  setTextById("vexCleanGrowth", growth === null ? "Novo" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`);

  renderVexLatestVehicles();
  renderVexMonthlyGrowthChart();
}

/* =========================================================
   RC3.0.14 - Relatorios PDF de vendas e comissao
   ========================================================= */
function getVexSalesReportDefinition(type) {
  if (type === "frank") {
    return { type: "frank", title: "COMISSAO FRANK LUIZ", fileTitle: "Relatorio de Comissao - Frank Luiz", seller: "Frank Luiz", field: "frankCommission", defaultValue: 125, showCommission: true };
  }

  if (type === "lucas") {
    return { type: "lucas", title: "COMISSAO LUCAS LUIZ", fileTitle: "Relatorio de Comissao - Lucas Luiz", seller: "Lucas Luiz", field: "lucasCommission", defaultValue: 125, showCommission: true };
  }

  return { type: "partner", title: "RELATORIO DE VENDAS", fileTitle: "Relatorio de Vendas", seller: "Socio", field: "", defaultValue: 0, showCommission: false };
}

function getVexReportCommissionValue(sale, definition) {
  if (!definition.showCommission) return 0;
  const value = sale[definition.field];
  if (value === undefined || value === null || value === "") {
    return definition.defaultValue;
  }
  return Number(value || 0);
}

function getVexReportSaleRows(definition) {
  return getSalesBySelectedPeriod().slice().sort(function(a, b) {
    return new Date(a.saleDate || 0).getTime() - new Date(b.saleDate || 0).getTime();
  }).map(function(sale, index) {
    const vehicle = getVexFormalizationVehicleData(sale);
    const repasse = getVexFormalizationRepasseData(sale);
    const tableValue = parseSaleCurrencyValue(repasse.fipeValue || sale.vehicleFipeValue || "");
    const saleValue = sale.saleValueNumber ? Number(sale.saleValueNumber) : parseSaleCurrencyValue(sale.saleValue || repasse.saleValue || "");
    const inventoryMatch = getVexInventoryItemByPlate(vehicle.vehiclePlate || sale.vehiclePlate || "");

    return {
      index: index + 1,
      photoUrl: sale.vehiclePhotoUrl || (inventoryMatch ? inventoryMatch.photoUrl || "" : ""),
      model: `${vehicle.vehicleBrand || ""} ${vehicle.vehicleModel || sale.vehicleModel || ""}`.trim() || "Veiculo",
      year: vehicle.vehicleYear || sale.vehicleYear || "",
      version: vehicle.vehicleVersion || sale.vehicleVersion || "",
      transmission: vehicle.vehicleTransmission || sale.vehicleTransmission || "",
      fuel: vehicle.vehicleFuel || sale.vehicleFuel || (inventoryMatch ? inventoryMatch.fuel || "" : ""),
      color: vehicle.vehicleColor || sale.vehicleColor || "",
      plate: vehicle.vehiclePlate || sale.vehiclePlate || "",
      km: vehicle.vehicleKm || sale.vehicleKm || "",
      saleDate: sale.saleDate || "",
      tableValue,
      saleValue,
      commission: getVexReportCommissionValue(sale, definition)
    };
  });
}

function getVexReportSafeMoney(value) {
  return formatCurrencyToBrazil(Number(value || 0));
}

function getVexReportPhotoCell(row) {
  if (row.photoUrl) {
    return `
      <td class="photo-cell">
        <div class="vehicle-photo-card">
          <img src="${escapeHTML(row.photoUrl)}" alt="${escapeHTML(row.model)}" />
        </div>
      </td>
    `;
  }

  return `
    <td class="photo-cell">
      <div class="vehicle-photo-card vehicle-photo-card-empty">
        <span>${String(row.index).padStart(2, "0")}</span>
      </div>
    </td>
  `;
}

function getVexReportPeriodTitle() {
  const period = getHistoryMonthFilterValue();

  if (period === "all") {
    return "Todos os periodos";
  }

  if (/^\d{4}-\d{2}$/.test(String(period || ""))) {
    const parts = String(period).split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  const now = new Date();
  const monthDate = period === "previous"
    ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const label = monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildVexSalesReportHtml(type) {
  const definition = getVexSalesReportDefinition(type);
  const rows = getVexReportSaleRows(definition);
  const periodLabel = getVexReportPeriodTitle();
  const reportTitle = `${definition.fileTitle} - ${periodLabel}`;
  const logoSrc = new URL("assets/logo/vex-logo.png", window.location.href).href;
  const totalTable = rows.reduce(function(total, row) { return total + row.tableValue; }, 0);
  const totalSales = rows.reduce(function(total, row) { return total + row.saleValue; }, 0);
  const totalCommission = rows.reduce(function(total, row) { return total + row.commission; }, 0);
  const commissionHeader = definition.showCommission ? `<th>COMISSAO</th>` : "";
  const commissionCells = function(row) {
    return definition.showCommission ? `<td class="money">${getVexReportSafeMoney(row.commission)}</td>` : "";
  };
  const commissionCol = definition.showCommission ? `<col class="commission-col">` : "";
  const rowClass = definition.showCommission ? "with-commission" : "partner-report";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(reportTitle)}</title>
      <style>
        @page { size: A4 landscape; margin: 5mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .report-toolbar { position: sticky; top: 0; z-index: 5; display: flex; justify-content: center; gap: 12px; padding: 12px; background: rgba(5,5,5,.94); box-shadow: 0 8px 22px rgba(0,0,0,.22); }
        .report-toolbar button { border: 0; border-radius: 2px; padding: 11px 20px; color: #fff; background: #d90404; font-size: 13px; font-weight: 900; cursor: pointer; }
        .report-toolbar button.secondary { background: #111820; }
        .report-page { min-height: 100vh; padding: 14px; background: #e5e7eb; }
        .report-shell { overflow: hidden; border: 1.5px solid #d90404; border-radius: 2px; background: #fff; box-shadow: 0 16px 38px rgba(15,23,42,.16); }
        .report-hero { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; padding: 16px 20px; color: #fff; background: linear-gradient(135deg, #090b10, #250302); }
        .report-brand { display: flex; align-items: center; gap: 16px; }
        .report-brand img { width: 118px; height: 62px; object-fit: contain; display: block; }
        .report-brand h1 { margin: 0; font-size: 24px; line-height: 1; letter-spacing: .02em; }
        .report-brand p { margin: 6px 0 0; color: #d8d8d8; font-size: 11px; font-weight: 700; }
        .report-badge { text-align: right; }
        .report-badge strong { display: block; color: #fff; font-size: 24px; white-space: nowrap; }
        .report-badge span { display: block; margin-top: 6px; color: #ffcf42; font-weight: 900; font-size: 17px; white-space: nowrap; }
        .report-title { padding: 11px 16px; color: #fff; background: #d90404; font-size: 20px; font-weight: 900; text-align: center; letter-spacing: .03em; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; background: #fff; }
        .partner-report col.photo-col { width: 8%; }
        .partner-report col.model-col { width: 16%; }
        .partner-report col.year-col { width: 7%; }
        .partner-report col.version-col { width: 8%; }
        .partner-report col.transmission-col { width: 7%; }
        .partner-report col.fuel-col { width: 7%; }
        .partner-report col.color-col { width: 6%; }
        .partner-report col.plate-col { width: 7%; }
        .partner-report col.km-col { width: 7%; }
        .partner-report col.date-col { width: 8%; }
        .partner-report col.money-col { width: 9.5%; }
        .with-commission col.photo-col { width: 7%; }
        .with-commission col.model-col { width: 13.5%; }
        .with-commission col.year-col { width: 6%; }
        .with-commission col.version-col { width: 7%; }
        .with-commission col.transmission-col { width: 6%; }
        .with-commission col.fuel-col { width: 6%; }
        .with-commission col.color-col { width: 5.5%; }
        .with-commission col.plate-col { width: 6.5%; }
        .with-commission col.km-col { width: 6.5%; }
        .with-commission col.date-col { width: 7%; }
        .with-commission col.money-col { width: 8.5%; }
        .with-commission col.commission-col { width: 8.5%; }
        th { padding: 8px 4px; color: #fff; background: #d90404; border: 1px solid rgba(255,255,255,.42); font-size: 9.4px; line-height: 1.1; font-weight: 950; text-transform: uppercase; }
        td { height: 66px; padding: 6px 4px; border: 1px solid #d1d5db; font-size: 9.7px; line-height: 1.16; font-weight: 850; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
        td.model { text-align: left; font-size: 10px; line-height: 1.16; font-weight: 950; color: #111827; }
        td.photo-cell { padding: 4px; background: #f8fafc; }
        .vehicle-photo-card { width: 66px; height: 48px; margin: 0 auto; display: grid; place-items: center; overflow: hidden; border: 1px solid #cfd4dc; border-radius: 2px; background: #fff; box-shadow: 0 4px 10px rgba(17,24,39,.10); }
        .vehicle-photo-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .vehicle-photo-card-empty { background: #111820; color: #fff; }
        .vehicle-photo-card-empty span { color: #fff; font-size: 17px; font-weight: 950; }
        td.money { color: #b00000; font-size: 9.5px; font-weight: 950; white-space: nowrap; letter-spacing: -0.055em; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: clip; }
        .summary { display: grid; grid-template-columns: repeat(${definition.showCommission ? 4 : 3}, minmax(0, 1fr)); gap: 0; color: #fff; background: #080808; border-top: 2px solid #d90404; }
        .summary div { padding: 12px 12px; border-right: 1px solid rgba(255,255,255,.20); text-align: center; }
        .summary span { display: block; color: #ddd; font-size: 11px; font-weight: 900; letter-spacing: .06em; }
        .summary strong { display: block; margin-top: 6px; font-size: 23px; font-weight: 950; white-space: nowrap; }
        .summary .commission strong { color: #ffcf42; font-size: 26px; }
        .empty { padding: 48px; text-align: center; font-size: 18px; font-weight: 800; }
        @media print {
          body { background: #fff; }
          .report-toolbar { display: none; }
          .report-page { padding: 0; min-height: auto; }
          .report-shell { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="report-toolbar">
        <button type="button" onclick="window.print()">Baixar PDF</button>
        <button class="secondary" type="button" onclick="window.close()">Fechar</button>
      </div>
      <main class="report-page">
        <section class="report-shell">
          <header class="report-hero">
            <div class="report-brand">
              <img src="${escapeHTML(logoSrc)}" alt="VEX Multimarcas">
              <div>
                <h1>${escapeHTML(definition.showCommission ? definition.title : "VEX MULTIMARCAS")}</h1>
                <p>Av. Presidente Medice, 212 - Alianca - Osasco-SP</p>
                <p>Relatorio gerado pelo VEX HUB PRO</p>
              </div>
            </div>
            <div class="report-badge">
              <strong>${String(rows.length).padStart(2, "0")} veiculos</strong>
              ${definition.showCommission ? `<span>${rows.length} x ${formatCurrencyToBrazil(definition.defaultValue)}</span>` : ""}
            </div>
          </header>
          <div class="report-title">${escapeHTML(reportTitle)}</div>
          ${rows.length ? `
            <table class="${rowClass}">
              <colgroup>
                <col class="photo-col">
                <col class="model-col">
                <col class="year-col">
                <col class="version-col">
                <col class="transmission-col">
                <col class="fuel-col">
                <col class="color-col">
                <col class="plate-col">
                <col class="km-col">
                <col class="date-col">
                <col class="money-col">
                <col class="money-col">
                ${commissionCol}
              </colgroup>
              <thead>
                <tr>
                  <th>FOTO</th>
                  <th>VEICULO / MODELO</th>
                  <th>ANO/MOD</th>
                  <th>VERSAO</th>
                  <th>CAMBIO</th>
                  <th>COMBUST.</th>
                  <th>COR</th>
                  <th>PLACA</th>
                  <th>KM ATUAL</th>
                  <th>DATA VENDA</th>
                  <th>VALOR FIPE</th>
                  <th>PRECO VENDA</th>
                  ${commissionHeader}
                </tr>
              </thead>
              <tbody>
                ${rows.map(function(row) {
                  return `
                    <tr>
                      ${getVexReportPhotoCell(row)}
                      <td class="model">${escapeHTML(row.model)}</td>
                      <td>${escapeHTML(row.year)}</td>
                      <td>${escapeHTML(row.version || "-")}</td>
                      <td>${escapeHTML(row.transmission || "-")}</td>
                      <td>${escapeHTML(row.fuel || "-")}</td>
                      <td>${escapeHTML(row.color || "-")}</td>
                      <td>${escapeHTML(row.plate || "-")}</td>
                      <td>${escapeHTML(row.km || "-")}</td>
                      <td>${escapeHTML(formatDateToBrazil(row.saleDate))}</td>
                      <td class="money">${getVexReportSafeMoney(row.tableValue)}</td>
                      <td class="money">${getVexReportSafeMoney(row.saleValue)}</td>
                      ${commissionCells(row)}
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
            <footer class="summary">
              <div><span>TOTAL DE VEICULOS</span><strong>${String(rows.length).padStart(2, "0")}</strong></div>
              <div><span>TOTAL FIPE</span><strong>${getVexReportSafeMoney(totalTable)}</strong></div>
              <div><span>TOTAL VENDAS</span><strong>${getVexReportSafeMoney(totalSales)}</strong></div>
              ${definition.showCommission ? `<div class="commission"><span>${escapeHTML(definition.title)}</span><strong>${getVexReportSafeMoney(totalCommission)}</strong></div>` : ""}
            </footer>
          ` : `<div class="empty">Nenhuma venda encontrada para ${escapeHTML(periodLabel)}.</div>`}
        </section>
      </main>
    </body>
    </html>
  `;
}

function printVexSalesReport(type) {
  const html = buildVexSalesReportHtml(type);
  const win = window.open("", "_blank");
  if (!win) {
    alert("O navegador bloqueou a abertura do relatorio. Permita pop-ups para gerar o PDF.");
    return;
  }
  win.document.open();
  win.document.write(html + '<script>window.onload=function(){setTimeout(function(){window.print();},250);}<\\/script>');
  win.document.close();
}

window.printVexSalesReport = printVexSalesReport;

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
window.updateSaleTransferStage = updateSaleTransferStage;
window.updateSaleTransferNote = updateSaleTransferNote;
window.updateSaleTransferChecklist = updateSaleTransferChecklist;
window.updateUserRole = updateUserRole;
window.toggleUserAccess = toggleUserAccess;
window.openVexClientWhatsapp = openVexClientWhatsapp;
window.openSaleDetails = openSaleDetails;
window.closeSaleDetails = closeSaleDetails;
window.fillSaleFromInventoryLookup = fillSaleFromInventoryLookup;
window.fillSaleFromInventory = fillSaleFromInventory;
window.openVexInventoryDetails = openVexInventoryDetails;
window.editVexInventoryItem = editVexInventoryItem;
window.deleteVexInventoryPhoto = deleteVexInventoryPhoto;
window.deleteVexInventoryItem = deleteVexInventoryItem;

window.goToSection = goToSection;



/* =========================================================
   VEX HUB PRO v2.0  - Fase 02
   Veiculos Premium + Drawer
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
      button.textContent = "VE Veiculos";
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
  if (normalized.includes("transferencia") || normalized.includes("transferencia")) return "vex-status-transferencia";
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

        if (eyebrow) eyebrow.textContent = "Catalogo inteligente";
        if (title) title.textContent = "Veiculos Vendidos";
        if (desc) desc.textContent = "Lista premium de veiculos vendidos com detalhes completos em painel lateral.";
      }
    }
  }

  if (sales.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        Nenhum veiculo vendido registrado ainda.
      </div>
    `;

    historyCounter.textContent = "0 veiculos";
    return true;
  }

  if (filteredSales.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        Nenhum veiculo encontrado com os filtros aplicados.
      </div>
    `;

    historyCounter.textContent = "0 encontrados";
    return true;
  }

  const totalValue = filteredSales.reduce(function(total, sale) {
    return total + (typeof getSaleNumericValue === "function" ? getSaleNumericValue(sale) : Number(sale.saleValueNumber || 0));
  }, 0);

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veiculo(s)`;

  historyList.className = "vex-vehicle-list";

  historyList.innerHTML = `
    <div class="vex-vehicles-summary vex-vehicles-summary-compact">
      <span>Total filtrado</span>
      <strong>${typeof formatCurrencyToBrazil === "function" ? formatCurrencyToBrazil(totalValue) : "R$ " + totalValue}</strong>
    </div>

    <div class="vex-vehicle-compact-feed">
      ${filteredSales.map(function (sale) {
        const statusClass = getVexStatusClass(sale.afterSaleStatus);
        const vehicleName = `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim();
        const transferData = typeof getVexFormalizationTransferData === "function" ? getVexFormalizationTransferData(sale) : { responsible: sale.transferType || "" };
        const transferStatus = typeof getVexTransferStatus === "function" ? getVexTransferStatus(transferData) : null;

        return `
          <article class="vex-vehicle-card vex-vehicle-card-compact" onclick="openVexVehicleDrawer('${sale.id}')">
            <div class="vex-vehicle-compact-main">
              <h3 class="vex-vehicle-compact-title">${escapeHTML(vehicleName)}</h3>
              <div class="vex-vehicle-compact-subline">
                <span>${escapeHTML(sale.clientName || "Cliente nao informado")}</span>
                <span>${formatDateToBrazil(sale.saleDate)}</span>
                <span>${escapeHTML(sale.transferType || "Transferencia nao informada")}</span>
                ${transferStatus ? `<span>${transferStatus.icon} ${escapeHTML(transferStatus.label)}</span>` : ""}
              </div>
            </div>

            <div class="vex-vehicle-compact-meta">
              <strong class="vex-vehicle-price">${getVehicleDisplayPrice(sale)}</strong>
              <span class="vex-status-badge ${statusClass}">
                ${escapeHTML(sale.afterSaleStatus || "Sem status")}
              </span>
            </div>

            <div class="vex-card-chevron"> - /div>
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
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero">
        <div class="vex-vehicle-icon">VE</div>
        <span class="eyebrow">Veiculo vendido</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}  - ${formatDateToBrazil(sale.saleDate)}</p>
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
          <span>Preco FIPE / tabela</span>
          <strong>${typeof getFipeDisplayValue === "function" ? getFipeDisplayValue(sale) : "-"}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Versao</span>
          <strong>${escapeHTML(sale.vehicleVersion || "-")}</strong>
        </div>

        <div class="vex-detail-item">
          <span>Cambio</span>
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


        <div class="vex-detail-item full">
          <span>Status</span>
          <strong>
            ${canManageContent() ? `<select class="history-inline-select" onchange="updateSaleStatus('${sale.id}', this.value)">${getStatusOptions(sale.afterSaleStatus)}</select>` : escapeHTML(sale.afterSaleStatus || "-")}
          </strong>
        </div>


        <div class="vex-detail-item full vex-transfer-stage-detail">
          <span>Etapa da transferencia</span>
          <strong>
            ${canManageContent() ? `<select class="history-inline-select vex-transfer-stage-select" onchange="updateSaleTransferStage('${sale.id}', this.value)">${getVexTransferStageOptions(getVexTransferStage(sale))}</select>` : renderVexTransferStageChip(sale)}
          </strong>
          <small>${escapeHTML(getVexTransferStageDescription(getVexTransferStage(sale), sale.transferType))}</small>
          <div class="vex-transfer-flow-grid">
            <div>
              <span>Modo</span>
              ${canManageContent() ? `<select class="history-inline-select vex-transfer-mode-select" onchange="updateSaleTransfer('${sale.id}', this.value)">${getTransferOptions(sale.transferType)}</select>` : `<strong>${escapeHTML(sale.transferType || "-")}</strong>`}
            </div>
            <div>
              <span>Sinal visual</span>
              ${renderVexTransferStageChip(sale)}
            </div>
          </div>
          <label class="vex-transfer-note-label" for="transferNote-${sale.id}">Observacao operacional</label>
          ${canManageContent() ? `<textarea id="transferNote-${sale.id}" class="vex-transfer-note-input" rows="3" onblur="updateSaleTransferNote('${sale.id}', this.value)" placeholder="Ex: cliente trazendo documentos reconhecidos.">${escapeHTML(sale.transferStageNote || "")}</textarea>` : `<p class="vex-transfer-note-readonly">${escapeHTML(sale.transferStageNote || "Sem observacao operacional.")}</p>`}
          ${renderVexTransferChecklist(sale)}
        </div>

        <div class="vex-detail-item">
          <span>Comissao total</span>
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
          <span>Observacoes</span>
          <strong>${escapeHTML(sale.saleNotes || "Sem observacoes")}</strong>
        </div>
      </div>

      <div class="vex-drawer-actions vex-drawer-actions-safe">
        ${canManageContent() ? `<button class="primary-button" type="button" onclick="startEditSale('${sale.id}')">Editar</button>` : ""}
        <button class="primary-button" type="button" onclick="openVexFormalization('${sale.id}')">Formalizacao</button>
        <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        ${canManageContent() ? `<button class="danger-button" type="button" onclick="deleteSale('${sale.id}'); closeVexVehicleDrawer();">Excluir</button>` : ""}
      </div>
    </aside>
  `;

  drawer.classList.add("active");
}


function getVexFormalizationStatus(step) {
  return step.done ? "Concluído" : "Pendente";
}

function renderVexFormalizationSummaryItem(label, value) {
  return `
    <div class="vex-formalization-summary-item">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value || "Nao informado")}</strong>
    </div>
  `;
}


function getVexFormalizationClientData(sale) {
  const client = sale && sale.formalization && sale.formalization.client ? sale.formalization.client : {};

  return {
    clientName: client.clientName || sale.clientName || "",
    clientCpf: client.clientCpf || sale.clientCpf || "",
    clientRg: client.clientRg || sale.clientRg || "",
    clientRgIssuer: client.clientRgIssuer || sale.clientRgIssuer || "",
    clientRgIssuerUf: client.clientRgIssuerUf || sale.clientRgIssuerUf || "",
    clientBirthDate: client.clientBirthDate || sale.clientBirthDate || "",
    clientCivilStatus: client.clientCivilStatus || sale.clientCivilStatus || "",
    clientProfession: client.clientProfession || sale.clientProfession || "",
    clientPhone: client.clientPhone || sale.clientPhone || "",
    clientEmail: client.clientEmail || sale.clientEmail || "",
    clientCep: client.clientCep || sale.clientCep || "",
    clientStreet: client.clientStreet || sale.clientStreet || "",
    clientNumber: client.clientNumber || sale.clientNumber || "",
    clientComplement: client.clientComplement || sale.clientComplement || "",
    clientDistrict: client.clientDistrict || sale.clientDistrict || "",
    clientCity: client.clientCity || sale.clientCity || "",
    clientState: client.clientState || sale.clientState || ""
  };
}

function getVexClientCompletion(clientData) {
  const requiredFields = [
    "clientName",
    "clientCpf",
    "clientRg",
    "clientRgIssuer",
    "clientRgIssuerUf",
    "clientPhone",
    "clientEmail",
    "clientCep",
    "clientStreet",
    "clientNumber",
    "clientDistrict",
    "clientCity",
    "clientState"
  ];

  const doneFields = requiredFields.filter(function(field) {
    return Boolean(clientData[field]);
  }).length;

  return {
    done: doneFields,
    total: requiredFields.length,
    percent: Math.round((doneFields / requiredFields.length) * 100),
    complete: doneFields === requiredFields.length
  };
}

function renderVexFormalizationField(id, label, value, type) {
  return `
    <label class="vex-formalization-field">
      <span>${escapeHTML(label)}</span>
      <input id="${escapeHTML(id)}" type="${escapeHTML(type || "text")}" value="${escapeHTML(value || "")}" autocomplete="off">
    </label>
  `;
}

function openVexFormalizationClient(saleId) {
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

  const client = getVexFormalizationClientData(sale);
  const completion = getVexClientCompletion(client);
  const statusLabel = completion.complete ? "Cliente concluído" : "Cliente pendente";
  const statusIcon = completion.complete ? "OK" : "..";

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">CL</div>
        <span class="eyebrow">Formalizacao  - Cliente</span>
        <h2>${escapeHTML(client.clientName || sale.clientName || "Cliente")}</h2>
        <p>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(statusLabel)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} campos obrigatorios  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationClient(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Dados do comprador</h3>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationField("formalClientName", "Nome completo", client.clientName)}
            ${renderVexFormalizationField("formalClientCpf", "CPF", client.clientCpf)}
            ${renderVexFormalizationField("formalClientRg", "RG", client.clientRg)}
            ${renderVexFormalizationField("formalClientRgIssuer", "Orgao emissor", client.clientRgIssuer)}
            ${renderVexFormalizationField("formalClientRgIssuerUf", "UF emissor", client.clientRgIssuerUf)}
            ${renderVexFormalizationField("formalClientBirthDate", "Data de nascimento", client.clientBirthDate, "date")}
            ${renderVexFormalizationField("formalClientCivilStatus", "Estado civil", client.clientCivilStatus)}
            ${renderVexFormalizationField("formalClientProfession", "Profissão", client.clientProfession)}
            ${renderVexFormalizationField("formalClientPhone", "Telefone", client.clientPhone)}
            ${renderVexFormalizationField("formalClientEmail", "E-mail", client.clientEmail, "email")}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Endereco do comprador</h3>
          <p>Regra padrao: usar sempre o endereco real do cliente. Endereco da loja so em excecao manual e consciente.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationField("formalClientCep", "CEP", client.clientCep)}
            ${renderVexFormalizationField("formalClientStreet", "Rua / Avenida", client.clientStreet)}
            ${renderVexFormalizationField("formalClientNumber", "Numero", client.clientNumber)}
            ${renderVexFormalizationField("formalClientComplement", "Complemento", client.clientComplement)}
            ${renderVexFormalizationField("formalClientDistrict", "Bairro", client.clientDistrict)}
            ${renderVexFormalizationField("formalClientCity", "Cidade", client.clientCity)}
            ${renderVexFormalizationField("formalClientState", "Estado", client.clientState)}
          </div>
        </div>

        <div id="formalClientMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar cliente</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

function getVexFormalizationInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

async function saveVexFormalizationClient(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const clientPayload = {
    clientName: getVexFormalizationInputValue("formalClientName"),
    clientCpf: getVexFormalizationInputValue("formalClientCpf"),
    clientRg: getVexFormalizationInputValue("formalClientRg"),
    clientRgIssuer: getVexFormalizationInputValue("formalClientRgIssuer"),
    clientRgIssuerUf: getVexFormalizationInputValue("formalClientRgIssuerUf"),
    clientBirthDate: getVexFormalizationInputValue("formalClientBirthDate"),
    clientCivilStatus: getVexFormalizationInputValue("formalClientCivilStatus"),
    clientProfession: getVexFormalizationInputValue("formalClientProfession"),
    clientPhone: getVexFormalizationInputValue("formalClientPhone"),
    clientEmail: getVexFormalizationInputValue("formalClientEmail"),
    clientCep: getVexFormalizationInputValue("formalClientCep"),
    clientStreet: getVexFormalizationInputValue("formalClientStreet"),
    clientNumber: getVexFormalizationInputValue("formalClientNumber"),
    clientComplement: getVexFormalizationInputValue("formalClientComplement"),
    clientDistrict: getVexFormalizationInputValue("formalClientDistrict"),
    clientCity: getVexFormalizationInputValue("formalClientCity"),
    clientState: getVexFormalizationInputValue("formalClientState")
  };

  const message = document.getElementById("formalClientMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando dados do cliente...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.client": clientPayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          formalization: {
            ...(sale.formalization || {}),
            client: clientPayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationClient(saleId);
  } catch (error) {
    console.error("Erro ao salvar cliente da formalizacao:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar cliente da formalizacao.");
    }
  }
}


function getVexFormalizationVehicleData(sale) {
  const vehicle = sale && sale.formalization && sale.formalization.vehicle ? sale.formalization.vehicle : {};

  return {
    vehicleBrand: vehicle.vehicleBrand || sale.vehicleBrand || "",
    vehicleModel: vehicle.vehicleModel || sale.vehicleModel || "",
    vehicleVersion: vehicle.vehicleVersion || sale.vehicleVersion || "",
    vehicleType: vehicle.vehicleType || sale.vehicleType || "",
    vehicleYear: vehicle.vehicleYear || sale.vehicleYear || "",
    vehicleColor: vehicle.vehicleColor || sale.vehicleColor || "",
    vehicleKm: vehicle.vehicleKm || sale.vehicleKm || "",
    vehiclePlate: vehicle.vehiclePlate || sale.vehiclePlate || "",
    vehicleChassis: vehicle.vehicleChassis || sale.vehicleChassis || "",
    vehicleRenavam: vehicle.vehicleRenavam || sale.vehicleRenavam || "",
    vehicleFuel: vehicle.vehicleFuel || sale.vehicleFuel || "",
    vehicleTransmission: vehicle.vehicleTransmission || sale.vehicleTransmission || "",
    vehicleDoors: vehicle.vehicleDoors || sale.vehicleDoors || "",
    vehicleCategory: vehicle.vehicleCategory || sale.vehicleCategory || ""
  };
}

function getVexVehicleCompletion(vehicleData) {
  const requiredFields = [
    "vehicleBrand",
    "vehicleModel",
    "vehicleVersion",
    "vehicleType",
    "vehicleYear",
    "vehicleColor",
    "vehicleKm",
    "vehiclePlate",
    "vehicleChassis",
    "vehicleRenavam",
    "vehicleFuel",
    "vehicleTransmission",
    "vehicleDoors",
    "vehicleCategory"
  ];

  const doneFields = requiredFields.filter(function(field) {
    return Boolean(vehicleData[field]);
  }).length;

  return {
    done: doneFields,
    total: requiredFields.length,
    percent: Math.round((doneFields / requiredFields.length) * 100),
    complete: doneFields === requiredFields.length
  };
}

function openVexFormalizationVehicle(saleId) {
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

  const vehicle = getVexFormalizationVehicleData(sale);
  const completion = getVexVehicleCompletion(vehicle);
  const statusLabel = completion.complete ? "Veiculo concluído" : "Veiculo pendente";
  const statusIcon = completion.complete ? "OK" : "..";
  const vehicleTitle = `${vehicle.vehicleBrand || ""} ${vehicle.vehicleModel || sale.vehicleModel || "Veiculo"} ${vehicle.vehicleYear || ""}`.trim();

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">VE</div>
        <span class="eyebrow">Formalizacao  - Veiculo</span>
        <h2>${escapeHTML(vehicleTitle)}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(statusLabel)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} campos obrigatorios  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationVehicle(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Dados do veiculo</h3>
          <p>Confira os dados que já vieram da venda e complete apenas o que faltar para documentos e transferencia.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationField("formalVehicleBrand", "Marca", vehicle.vehicleBrand)}
            ${renderVexFormalizationField("formalVehicleModel", "Modelo", vehicle.vehicleModel)}
            ${renderVexFormalizationField("formalVehicleVersion", "Versao", vehicle.vehicleVersion)}
            ${renderVexFormalizationField("formalVehicleType", "Tipo", vehicle.vehicleType)}
            ${renderVexFormalizationField("formalVehicleYear", "Ano / Modelo", vehicle.vehicleYear)}
            ${renderVexFormalizationField("formalVehicleColor", "Cor", vehicle.vehicleColor)}
            ${renderVexFormalizationField("formalVehicleKm", "KM confirmado", vehicle.vehicleKm)}
            ${renderVexFormalizationField("formalVehiclePlate", "Placa", vehicle.vehiclePlate)}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Dados para transferencia</h3>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationField("formalVehicleChassis", "Chassi", vehicle.vehicleChassis)}
            ${renderVexFormalizationField("formalVehicleRenavam", "Renavam", vehicle.vehicleRenavam)}
            ${renderVexFormalizationField("formalVehicleFuel", "Combustivel", vehicle.vehicleFuel)}
            ${renderVexFormalizationField("formalVehicleTransmission", "Cambio", vehicle.vehicleTransmission)}
            ${renderVexFormalizationField("formalVehicleDoors", "Portas", vehicle.vehicleDoors)}
            ${renderVexFormalizationField("formalVehicleCategory", "Categoria", vehicle.vehicleCategory)}
          </div>
        </div>

        <div id="formalVehicleMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar veiculo</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

async function saveVexFormalizationVehicle(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const vehiclePayload = {
    vehicleBrand: getVexFormalizationInputValue("formalVehicleBrand"),
    vehicleModel: getVexFormalizationInputValue("formalVehicleModel"),
    vehicleVersion: getVexFormalizationInputValue("formalVehicleVersion"),
    vehicleType: getVexFormalizationInputValue("formalVehicleType"),
    vehicleYear: getVexFormalizationInputValue("formalVehicleYear"),
    vehicleColor: getVexFormalizationInputValue("formalVehicleColor"),
    vehicleKm: getVexFormalizationInputValue("formalVehicleKm"),
    vehiclePlate: getVexFormalizationInputValue("formalVehiclePlate"),
    vehicleChassis: getVexFormalizationInputValue("formalVehicleChassis"),
    vehicleRenavam: getVexFormalizationInputValue("formalVehicleRenavam"),
    vehicleFuel: getVexFormalizationInputValue("formalVehicleFuel"),
    vehicleTransmission: getVexFormalizationInputValue("formalVehicleTransmission"),
    vehicleDoors: getVexFormalizationInputValue("formalVehicleDoors"),
    vehicleCategory: getVexFormalizationInputValue("formalVehicleCategory")
  };

  const message = document.getElementById("formalVehicleMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando dados do veiculo...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.vehicle": vehiclePayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          formalization: {
            ...(sale.formalization || {}),
            vehicle: vehiclePayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationVehicle(saleId);
  } catch (error) {
    console.error("Erro ao salvar veiculo da formalizacao:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar veiculo da formalizacao.");
    }
  }
}


function getVexFormalizationPaymentData(sale) {
  const payment = sale && sale.formalization && sale.formalization.payment ? sale.formalization.payment : {};
  const saleTotal = sale && sale.saleValueNumber ? Number(sale.saleValueNumber) : parseSaleCurrencyValue(sale ? sale.saleValue : "");

  const methods = Array.isArray(payment.methods) && payment.methods.length
    ? payment.methods
    : [{ type: "PIX", value: sale && sale.saleValue ? sale.saleValue : "" }];

  return {
    methods: methods.map(function(method) {
      return {
        type: method.type || "PIX",
        value: method.value || ""
      };
    }),
    vehicleTotal: payment.vehicleTotal || (saleTotal ? formatCurrencyToBrazil(saleTotal) : ""),
    transferCharged: payment.transferCharged || "Nao",
    transferValue: payment.transferValue || "",
    ipvaValue: payment.ipvaValue || "",
    ipvaPaidBy: payment.ipvaPaidBy || "Loja",
    licensingValue: payment.licensingValue || "",
    licensingPaidBy: payment.licensingPaidBy || "Loja",
    notes: payment.notes || ""
  };
}

function getVexPaymentMethodsTotal(methods) {
  return (methods || []).reduce(function(total, method) {
    return total + parseSaleCurrencyValue(method.value);
  }, 0);
}

function hasVexTradeInPayment(methods) {
  return (methods || []).some(function(method) {
    const type = normalizeVexText(method.type || "").toUpperCase();
    return type.includes("VEICULO TROCA") || type.includes("TROCA");
  });
}

function getVexPaymentChangeValue(methodsTotal, vehicleTotal, methods) {
  if (vehicleTotal <= 0 || methodsTotal <= vehicleTotal) return 0;
  return hasVexTradeInPayment(methods) ? methodsTotal - vehicleTotal : 0;
}

function getVexPaymentCustomerExtrasTotal(payment) {
  let total = 0;
  if (payment.transferCharged === "Sim") {
    total += parseSaleCurrencyValue(payment.transferValue);
  }
  if (payment.ipvaPaidBy === "Cliente") {
    total += parseSaleCurrencyValue(payment.ipvaValue);
  }
  if (payment.licensingPaidBy === "Cliente") {
    total += parseSaleCurrencyValue(payment.licensingValue);
  }
  return total;
}

function getVexPaymentCompletion(payment, sale) {
  const vehicleTotal = sale && sale.saleValueNumber ? Number(sale.saleValueNumber) : parseSaleCurrencyValue(sale ? sale.saleValue : "");
  const methods = (payment.methods || []).filter(function(method) {
    return method.type && parseSaleCurrencyValue(method.value) > 0;
  });
  const methodsTotal = getVexPaymentMethodsTotal(payment.methods);
  const changeValue = getVexPaymentChangeValue(methodsTotal, vehicleTotal, methods);
  const hasPayment = methods.length > 0;
  const totalOk = vehicleTotal > 0 ? Math.abs((methodsTotal - changeValue) - vehicleTotal) < 0.01 : hasPayment;
  const transferOk = payment.transferCharged === "Nao" || parseSaleCurrencyValue(payment.transferValue) > 0;

  const checks = [hasPayment, totalOk, transferOk, Boolean(payment.ipvaPaidBy), Boolean(payment.licensingPaidBy)];
  const doneFields = checks.filter(Boolean).length;

  return {
    done: doneFields,
    total: checks.length,
    percent: Math.round((doneFields / checks.length) * 100),
    complete: checks.every(Boolean),
    methodsTotal: methodsTotal,
    vehicleTotal: vehicleTotal,
    changeValue: changeValue,
    netVehiclePayment: methodsTotal - changeValue,
    customerTotal: methodsTotal - changeValue + getVexPaymentCustomerExtrasTotal(payment),
    totalOk: totalOk
  };
}

function renderVexFormalizationSelect(id, label, value, options) {
  return `
    <label class="vex-formalization-field">
      <span>${escapeHTML(label)}</span>
      <select id="${escapeHTML(id)}">
        ${options.map(function(option) {
          return `<option value="${escapeHTML(option)}" ${option === value ? "selected" : ""}>${escapeHTML(option)}</option>`;
        }).join("")}
      </select>
    </label>
  `;
}

function renderVexPaymentMethodRow(method, index) {
  const options = ["PIX", "Financiamento", "Veiculo troca", "Cartão de crédito", "Crédito em conta", "Parcelamento loja", "Dinheiro", "Outro"];
  return `
    <div class="vex-payment-method-row" data-payment-row="true">
      <label class="vex-formalization-field">
        <span>Forma</span>
        <select class="formalPaymentMethodType">
          ${options.map(function(option) {
            return `<option value="${escapeHTML(option)}" ${option === method.type ? "selected" : ""}>${escapeHTML(option)}</option>`;
          }).join("")}
        </select>
      </label>
      <label class="vex-formalization-field">
        <span>Valor</span>
        <input class="formalPaymentMethodValue" type="text" value="${escapeHTML(method.value || "")}" placeholder="Ex: R$ 10.000,00" autocomplete="off">
      </label>
      <button class="secondary-button vex-payment-remove" type="button" onclick="removeVexPaymentMethodRow(this)">Remover</button>
    </div>
  `;
}

function addVexPaymentMethodRow() {
  const list = document.getElementById("formalPaymentMethodsList");
  if (!list) return;
  list.insertAdjacentHTML("beforeend", renderVexPaymentMethodRow({ type: "PIX", value: "" }, Date.now()));
}

function removeVexPaymentMethodRow(button) {
  const list = document.getElementById("formalPaymentMethodsList");
  const rows = list ? list.querySelectorAll("[data-payment-row='true']") : [];
  if (rows.length <= 1) {
    const row = button.closest("[data-payment-row='true']");
    if (row) {
      const value = row.querySelector(".formalPaymentMethodValue");
      if (value) value.value = "";
    }
    return;
  }
  const row = button.closest("[data-payment-row='true']");
  if (row) row.remove();
}

function openVexFormalizationPayment(saleId) {
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

  const payment = getVexFormalizationPaymentData(sale);
  const completion = getVexPaymentCompletion(payment, sale);
  const statusLabel = completion.complete ? "Pagamento concluído" : "Pagamento pendente";
  const statusIcon = completion.complete ? "OK" : "..";
  const diff = completion.vehicleTotal - completion.methodsTotal;
  const paymentStatusText = completion.totalOk
    ? (completion.changeValue > 0 ? "Conferido com troco de " + formatCurrencyToBrazil(completion.changeValue) : "Conferido")
    : "Divergencia de " + formatCurrencyToBrazil(Math.abs(diff));

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">$</div>
        <span class="eyebrow">Formalizacao  - Pagamento</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(statusLabel)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} conferências  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationPayment(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Formas de pagamento do veiculo</h3>
          <p>Informe uma ou mais formas. O total das formas deve bater com o valor do veiculo para contrato.</p>
          <div id="formalPaymentMethodsList" class="vex-payment-method-list">
            ${payment.methods.map(renderVexPaymentMethodRow).join("")}
          </div>
          <button class="secondary-button" type="button" onclick="addVexPaymentMethodRow()">+ Adicionar forma</button>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Conferência</h3>
          <div class="vex-formalization-summary">
            ${renderVexFormalizationSummaryItem("Valor do veiculo", formatCurrencyToBrazil(completion.vehicleTotal || 0))}
            ${renderVexFormalizationSummaryItem("Total informado nas formas", formatCurrencyToBrazil(completion.methodsTotal || 0))}
            ${renderVexFormalizationSummaryItem("Status", completion.totalOk ? "Conferido" : "Divergência de " + formatCurrencyToBrazil(Math.abs(diff)))}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Transferencia e taxas da negociação</h3>
          <p>Esses dados serão usados principalmente na mensagem do Grupo Vendas e, quando necessário, nos documentos.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationSelect("formalTransferCharged", "Transferencia cobrada do cliente?", payment.transferCharged, ["Nao", "Sim"])}
            ${renderVexFormalizationField("formalTransferValue", "Valor da transferencia", payment.transferValue)}
            ${renderVexFormalizationField("formalIpvaValue", "IPVA", payment.ipvaValue)}
            ${renderVexFormalizationSelect("formalIpvaPaidBy", "IPVA pago por", payment.ipvaPaidBy, ["Loja", "Cliente", "Nao se aplica"])}
            ${renderVexFormalizationField("formalLicensingValue", "Licenciamento", payment.licensingValue)}
            ${renderVexFormalizationSelect("formalLicensingPaidBy", "Licenciamento pago por", payment.licensingPaidBy, ["Loja", "Cliente", "Nao se aplica"])}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Resumo para o grupo</h3>
          <div class="vex-formalization-summary">
            ${renderVexFormalizationSummaryItem("Total pago/cobrado do cliente", formatCurrencyToBrazil(completion.customerTotal || 0))}
            ${renderVexFormalizationSummaryItem("Observação automática", getVexPaymentResponsibilityText(payment))}
          </div>
          <label class="vex-formalization-field full">
            <span>Observacoes da negociação</span>
            <textarea id="formalPaymentNotes" rows="3" placeholder="Digite apenas observacoes reais da negociação. Deixe em branco se nao houver.">${escapeHTML(payment.notes || "")}</textarea>
          </label>
        </div>

        <div id="formalPaymentMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar pagamento</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

function getVexPaymentResponsibilityText(payment) {
  const parts = [];
  const ipvaPaidBy = normalizeVexText(payment.ipvaPaidBy || "");
  const licensingPaidBy = normalizeVexText(payment.licensingPaidBy || "");
  if (payment.ipvaPaidBy && !ipvaPaidBy.includes("NAO SE APLICA") && parseSaleCurrencyValue(payment.ipvaValue) > 0) {
    parts.push("IPVA pago " + (payment.ipvaPaidBy === "Loja" ? "pela loja" : "pelo cliente"));
  }
  if (payment.licensingPaidBy && !licensingPaidBy.includes("NAO SE APLICA") && parseSaleCurrencyValue(payment.licensingValue) > 0) {
    parts.push("Licenciamento pago " + (payment.licensingPaidBy === "Loja" ? "pela loja" : "pelo cliente"));
  }
  return parts.length ? parts.join(". ") + "." : "Sem observação automática.";
}

function collectVexPaymentMethodsFromForm() {
  const list = document.getElementById("formalPaymentMethodsList");
  const rows = list ? Array.from(list.querySelectorAll("[data-payment-row='true']")) : [];

  return rows.map(function(row) {
    const type = row.querySelector(".formalPaymentMethodType");
    const value = row.querySelector(".formalPaymentMethodValue");
    return {
      type: type ? type.value : "PIX",
      value: value ? value.value.trim() : ""
    };
  }).filter(function(method) {
    return method.type || method.value;
  });
}

async function saveVexFormalizationPayment(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const paymentPayload = {
    methods: collectVexPaymentMethodsFromForm(),
    transferCharged: getVexFormalizationInputValue("formalTransferCharged"),
    transferValue: getVexFormalizationInputValue("formalTransferValue"),
    ipvaValue: getVexFormalizationInputValue("formalIpvaValue"),
    ipvaPaidBy: getVexFormalizationInputValue("formalIpvaPaidBy"),
    licensingValue: getVexFormalizationInputValue("formalLicensingValue"),
    licensingPaidBy: getVexFormalizationInputValue("formalLicensingPaidBy"),
    notes: getVexFormalizationInputValue("formalPaymentNotes")
  };

  paymentPayload.methodsTotalNumber = getVexPaymentMethodsTotal(paymentPayload.methods);
  paymentPayload.changeValueNumber = getVexPaymentChangeValue(
    paymentPayload.methodsTotalNumber,
    parseSaleCurrencyValue(getVexFormalizationPaymentData(sales.find(function(item) { return item.id === saleId; })).vehicleTotal),
    paymentPayload.methods
  );
  paymentPayload.changeValue = paymentPayload.changeValueNumber > 0 ? formatCurrencyToBrazil(paymentPayload.changeValueNumber) : "";
  paymentPayload.customerTotalNumber = paymentPayload.methodsTotalNumber - paymentPayload.changeValueNumber + getVexPaymentCustomerExtrasTotal(paymentPayload);

  const message = document.getElementById("formalPaymentMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando dados de pagamento...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.payment": paymentPayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          formalization: {
            ...(sale.formalization || {}),
            payment: paymentPayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationPayment(saleId);
  } catch (error) {
    console.error("Erro ao salvar pagamento da formalizacao:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar pagamento da formalizacao.");
    }
  }
}


function getVexFormalizationRepasseData(sale) {
  const repasse = sale && sale.formalization && sale.formalization.repasse ? sale.formalization.repasse : {};
  const saleTotal = sale && sale.saleValueNumber ? Number(sale.saleValueNumber) : parseSaleCurrencyValue(sale ? sale.saleValue : "");
  const fipeTotal = sale && sale.vehicleFipeValueNumber ? Number(sale.vehicleFipeValueNumber) : parseSaleCurrencyValue(sale ? sale.vehicleFipeValue : "");
  const savedItems = Array.isArray(repasse.items) ? repasse.items : [];
  const inventoryMatch = !savedItems.length && sale ? getVexInventoryItemByPlate(sale.vehiclePlate || "") : null;
  const inventoryItems = getVexInventoryRepasseItems(inventoryMatch);
  const items = savedItems.length ? savedItems : inventoryItems;

  return {
    saleCondition: repasse.saleCondition || "Sem garantia",
    fipeValue: repasse.fipeValue || (fipeTotal ? formatCurrencyToBrazil(fipeTotal) : ""),
    saleValue: repasse.saleValue || (saleTotal ? formatCurrencyToBrazil(saleTotal) : ""),
    items: items.map(function(item) {
      return {
        category: item.category || "Outros",
        description: item.description || ""
      };
    }),
    notes: repasse.notes || ""
  };
}

function getVexRepasseDiscountValue(repasse) {
  const fipe = parseSaleCurrencyValue(repasse.fipeValue);
  const saleValue = parseSaleCurrencyValue(repasse.saleValue);
  return Math.max(0, fipe - saleValue);
}

function getVexRepasseItems(repasse) {
  return (repasse.items || []).filter(function(item) {
    return item.description && item.description.trim();
  });
}

function getVexRepasseCompletion(repasse) {
  const items = getVexRepasseItems(repasse);
  const fipeValue = parseSaleCurrencyValue(repasse.fipeValue);
  const saleValue = parseSaleCurrencyValue(repasse.saleValue);
  const discountValue = getVexRepasseDiscountValue(repasse);

  const checks = [
    Boolean(repasse.saleCondition),
    fipeValue > 0,
    saleValue > 0,
    discountValue >= 0,
    items.length > 0
  ];

  const doneFields = checks.filter(Boolean).length;

  return {
    done: doneFields,
    total: checks.length,
    percent: Math.round((doneFields / checks.length) * 100),
    complete: checks.every(Boolean),
    fipeValue: fipeValue,
    saleValue: saleValue,
    discountValue: discountValue,
    itemsCount: items.length
  };
}

function renderVexOperationalItemRow(item) {
  const categories = ["Histórico", "Estrutural", "Mecânica", "Estética", "Documentação", "Outros"];
  if (!categories.includes("Material")) categories.unshift("Material");
  const safeItem = item || { category: "Outros", description: "" };

  return `
    <div class="vex-operational-item-row" data-operational-item-row="true">
      <label class="vex-formalization-field">
        <span>Categoria</span>
        <select class="formalOperationalItemCategory">
          ${categories.map(function(category) {
            return `<option value="${escapeHTML(category)}" ${category === safeItem.category ? "selected" : ""}>${escapeHTML(category)}</option>`;
          }).join("")}
        </select>
      </label>
      <label class="vex-formalization-field">
        <span>Descrição</span>
        <input class="formalOperationalItemDescription" type="text" value="${escapeHTML(safeItem.description || "")}" placeholder="Ex: Leilão média monta" autocomplete="off">
      </label>
      <button class="secondary-button vex-payment-remove" type="button" onclick="removeVexOperationalItemRow(this)">Remover</button>
    </div>
  `;
}

function addVexOperationalItemRow() {
  const list = document.getElementById("formalOperationalItemsList");
  if (!list) return;
  list.insertAdjacentHTML("beforeend", renderVexOperationalItemRow({ category: "Outros", description: "" }));
}

function removeVexOperationalItemRow(button) {
  const list = document.getElementById("formalOperationalItemsList");
  const rows = list ? list.querySelectorAll("[data-operational-item-row='true']") : [];
  if (rows.length <= 1) {
    const row = button.closest("[data-operational-item-row='true']");
    if (row) {
      const description = row.querySelector(".formalOperationalItemDescription");
      if (description) description.value = "";
    }
    return;
  }

  const row = button.closest("[data-operational-item-row='true']");
  if (row) row.remove();
}

function collectVexOperationalItemsFromForm() {
  const list = document.getElementById("formalOperationalItemsList");
  const rows = list ? Array.from(list.querySelectorAll("[data-operational-item-row='true']")) : [];

  return rows.map(function(row) {
    const category = row.querySelector(".formalOperationalItemCategory");
    const description = row.querySelector(".formalOperationalItemDescription");
    return {
      category: category ? category.value : "Outros",
      description: description ? description.value.trim() : ""
    };
  }).filter(function(item) {
    return item.description;
  });
}

function openVexFormalizationRepasse(saleId) {
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

  const repasse = getVexFormalizationRepasseData(sale);
  const completion = getVexRepasseCompletion(repasse);
  const statusLabel = completion.complete ? "Repasse concluído" : "Repasse pendente";
  const statusIcon = completion.complete ? "OK" : "..";
  const rows = repasse.items.length ? repasse.items : [{ category: "Histórico", description: "" }];

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">🛡�?/div>
        <span class="eyebrow">Formalizacao  - Repasse e Gastos</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(statusLabel)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} conferências  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationRepasse(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Tipo de venda</h3>
          <p>Esta informação será reutilizada no Grupo Vendas, no contrato e no termo de repasse.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationSelect("formalSaleCondition", "Condição da venda", repasse.saleCondition, ["Com garantia", "Sem garantia", "Repasse"])}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Abatimento FIPE</h3>
          <p>O abatimento é calculado automaticamente pela diferença entre FIPE/tabela e valor de venda.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexFormalizationField("formalFipeValue", "Valor FIPE / tabela", repasse.fipeValue)}
            ${renderVexFormalizationField("formalRepasseSaleValue", "Valor de venda", repasse.saleValue)}
          </div>
          <div class="vex-formalization-summary">
            ${renderVexFormalizationSummaryItem("FIPE / tabela", formatCurrencyToBrazil(completion.fipeValue || 0))}
            ${renderVexFormalizationSummaryItem("Valor de venda", formatCurrencyToBrazil(completion.saleValue || 0))}
            ${renderVexFormalizationSummaryItem("Abatimento", formatCurrencyToBrazil(completion.discountValue || 0))}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Gastos / Material do veiculo</h3>
          <p>Cadastre em itens separados. Essa lista será reutilizada no Grupo Preparacao, Grupo Vendas, contrato e termo.</p>
          <div id="formalOperationalItemsList" class="vex-operational-item-list">
            ${rows.map(renderVexOperationalItemRow).join("")}
          </div>
          <button class="secondary-button" type="button" onclick="addVexOperationalItemRow()">+ Adicionar item</button>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Observacoes internas</h3>
          <label class="vex-formalization-field full">
            <span>Observacoes</span>
            <textarea id="formalRepasseNotes" rows="3" placeholder="Observação interna sobre repasse, garantia ou condicao autorizada pela gerência.">${escapeHTML(repasse.notes || "")}</textarea>
          </label>
        </div>

        <div id="formalRepasseMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar repasse/gastos</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

async function saveVexFormalizationRepasse(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const repassePayload = {
    saleCondition: getVexFormalizationInputValue("formalSaleCondition"),
    fipeValue: getVexFormalizationInputValue("formalFipeValue"),
    saleValue: getVexFormalizationInputValue("formalRepasseSaleValue"),
    discountValue: formatCurrencyToBrazil(Math.max(0, parseSaleCurrencyValue(getVexFormalizationInputValue("formalFipeValue")) - parseSaleCurrencyValue(getVexFormalizationInputValue("formalRepasseSaleValue")))),
    discountValueNumber: Math.max(0, parseSaleCurrencyValue(getVexFormalizationInputValue("formalFipeValue")) - parseSaleCurrencyValue(getVexFormalizationInputValue("formalRepasseSaleValue"))),
    items: collectVexOperationalItemsFromForm(),
    notes: getVexFormalizationInputValue("formalRepasseNotes")
  };

  const message = document.getElementById("formalRepasseMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando repasse e gastos...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.repasse": repassePayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          formalization: {
            ...(sale.formalization || {}),
            repasse: repassePayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationRepasse(saleId);
  } catch (error) {
    console.error("Erro ao salvar repasse/gastos da formalizacao:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar repasse/gastos da formalizacao.");
    }
  }
}


function getVexFormalizationTransferData(sale) {
  const transfer = sale && sale.formalization && sale.formalization.transfer ? sale.formalization.transfer : {};
  const saleResponsible = sale && sale.transferType ? normalizeVexTransferResponsible(sale.transferType) : "";
  const storedResponsible = transfer.responsible ? normalizeVexTransferResponsible(transfer.responsible) : "";

  return {
    responsible: saleResponsible || storedResponsible || "Cliente",
    recognitionDate: transfer.recognitionDate || "",
    protocol: transfer.protocol || "",
    notes: transfer.notes || ""
  };
}

function normalizeVexTransferResponsible(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("loja") || normalized.includes("gente") || normalized.includes("vex")) {
    return "Loja";
  }
  if (normalized.includes("cliente")) {
    return "Cliente";
  }
  return value || "Cliente";
}

function addDaysToIsoDate(isoDate, days) {
  if (!isoDate || !isoDate.includes("-")) {
    return "";
  }

  const date = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getVexDaysUntil(isoDate) {
  if (!isoDate || !isoDate.includes("-")) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getVexTransferStatus(transfer) {
  const responsible = normalizeVexTransferResponsible(transfer.responsible);

  if (responsible === "Cliente") {
    return {
      label: "Controle encerrado",
      description: "Transferencia por conta do cliente. Procuração nao necessária.",
      icon: "OK",
      className: "done",
      dueDate: "",
      daysLeft: null
    };
  }

  if (!transfer.recognitionDate) {
    return {
      label: "Aguardando reconhecimento",
      description: "Informe a data do reconhecimento da venda para iniciar o prazo de 30 dias.",
      icon: "..",
      className: "pending",
      dueDate: "",
      daysLeft: null
    };
  }

  const dueDate = addDaysToIsoDate(transfer.recognitionDate, 30);
  const daysLeft = getVexDaysUntil(dueDate);

  if (daysLeft === null) {
    return {
      label: "Data inválida",
      description: "Revise a data informada.",
      icon: "..",
      className: "pending",
      dueDate: "",
      daysLeft: null
    };
  }

  if (daysLeft < 0) {
    return {
      label: "Transferencia vencida",
      description: `Vencida há ${Math.abs(daysLeft)} dia(s).`,
      icon: "🔴",
      className: "danger",
      dueDate,
      daysLeft
    };
  }

  if (daysLeft <= 3) {
    return {
      label: "Vencendo",
      description: `Vence em ${daysLeft} dia(s).`,
      icon: "🟠",
      className: "warning",
      dueDate,
      daysLeft
    };
  }

  if (daysLeft <= 10) {
    return {
      label: "Atenção",
      description: `Vence em ${daysLeft} dia(s).`,
      icon: "..",
      className: "pending",
      dueDate,
      daysLeft
    };
  }

  return {
    label: "Em dia",
    description: `Vence em ${daysLeft} dia(s).`,
    icon: "OK",
    className: "done",
    dueDate,
    daysLeft
  };
}

function getVexTransferCompletion(transfer) {
  const responsible = normalizeVexTransferResponsible(transfer.responsible);
  const responsibleOk = responsible === "Loja" || responsible === "Cliente";
  const dateOk = responsible === "Cliente" || Boolean(transfer.recognitionDate);
  const status = getVexTransferStatus({ ...transfer, responsible });
  const complete = responsibleOk && dateOk;

  return {
    done: [responsibleOk, dateOk].filter(Boolean).length,
    total: 2,
    percent: complete ? 100 : Math.round(([responsibleOk, dateOk].filter(Boolean).length / 2) * 100),
    complete,
    status
  };
}

function openVexFormalizationTransfer(saleId) {
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

  const transfer = getVexFormalizationTransferData(sale);
  transfer.responsible = normalizeVexTransferResponsible(transfer.responsible);
  const completion = getVexTransferCompletion(transfer);
  const status = completion.status;
  const dueDateLabel = status.dueDate ? formatDateToBrazil(status.dueDate) : "Calculado após informar a data";
  const recognitionDateLabel = transfer.recognitionDate ? formatDateToBrazil(transfer.recognitionDate) : "Nao informado";
  const showLojaFields = transfer.responsible === "Loja";
  const transferNotesPlaceholder = showLojaFields
    ? "Ex.: Loja ficou responsavel pela transferencia. Acompanhar reconhecimento, prazo e protocolo."
    : "Ex.: Cliente ficou responsavel pela transferencia. Loja entregou os documentos necessarios.";

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">TR</div>
        <span class="eyebrow">Formalizacao  - Transferencia</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}  - ${formatDateToBrazil(sale.saleDate)}</p>

        <div class="vex-formalization-status-pill">
          ${status.icon} ${escapeHTML(status.label)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} etapas concluidas  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationTransfer(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Responsável pela transferencia</h3>
          <p>Defina quem fará a transferencia. Se for pelo cliente, a procuracao fica marcada como nao necessária.</p>
          <div class="vex-formalization-form-grid">
            <label class="vex-formalization-field full">
              <span>Responsável</span>
              <select id="formalTransferResponsible" onchange="openVexFormalizationTransferPreview('${sale.id}', this.value)">
                <option value="Cliente" ${transfer.responsible === "Cliente" ? "selected" : ""}>Cliente</option>
                <option value="Loja" ${transfer.responsible === "Loja" ? "selected" : ""}>Loja</option>
              </select>
            </label>
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Painel de acompanhamento</h3>
          <div class="vex-formalization-summary">
            ${renderVexFormalizationSummaryItem("Responsável", transfer.responsible)}
            ${renderVexFormalizationSummaryItem("Reconhecimento", recognitionDateLabel)}
            ${renderVexFormalizationSummaryItem("Prazo legal", transfer.responsible === "Loja" ? "30 dias" : "Nao necessário")}
            ${renderVexFormalizationSummaryItem("Vencimento", dueDateLabel)}
            ${renderVexFormalizationSummaryItem("Status", `${status.icon} ${status.label}`)}
            ${renderVexFormalizationSummaryItem("Procuração", transfer.responsible === "Loja" ? "Necessária" : "Nao necessária")}
          </div>
          <p class="vex-transfer-status-text">${escapeHTML(status.description)}</p>
        </div>

        ${showLojaFields ? `
          <div class="vex-formalization-form-card">
            <h3>Dados para controle da loja</h3>
            <div class="vex-formalization-form-grid">
              <label class="vex-formalization-field">
                <span>Data do reconhecimento</span>
                <input id="formalTransferRecognitionDate" type="date" value="${escapeHTML(transfer.recognitionDate || "")}">
              </label>
              <label class="vex-formalization-field">
                <span>Protocolo / observação curta</span>
                <input id="formalTransferProtocol" type="text" value="${escapeHTML(transfer.protocol || "")}" placeholder="Opcional">
              </label>
            </div>
          </div>
        ` : `
          <input id="formalTransferRecognitionDate" type="hidden" value="">
          <input id="formalTransferProtocol" type="hidden" value="${escapeHTML(transfer.protocol || "")}">
        `}

        <div class="vex-formalization-form-card">
          <h3>Observacoes internas</h3>
          <label class="vex-formalization-field full">
            <span>Observacoes</span>
            <textarea id="formalTransferNotes" rows="3" placeholder="${escapeHTML(transferNotesPlaceholder)}">${escapeHTML(transfer.notes || "")}</textarea>
          </label>
        </div>

        <div id="formalTransferMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar transferencia</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

function openVexFormalizationTransferPreview(saleId, responsible) {
  const sale = sales.find(function(item) {
    return item.id === saleId;
  });

  if (!sale) {
    return;
  }

  sale.formalization = sale.formalization || {};
  sale.formalization.transfer = {
    ...(sale.formalization.transfer || {}),
    responsible: responsible
  };

  openVexFormalizationTransfer(saleId);
}

async function saveVexFormalizationTransfer(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const responsible = normalizeVexTransferResponsible(getVexFormalizationInputValue("formalTransferResponsible"));
  const transferPayload = {
    responsible: responsible,
    recognitionDate: responsible === "Loja" ? getVexFormalizationInputValue("formalTransferRecognitionDate") : "",
    dueDate: responsible === "Loja" ? addDaysToIsoDate(getVexFormalizationInputValue("formalTransferRecognitionDate"), 30) : "",
    protocol: getVexFormalizationInputValue("formalTransferProtocol"),
    notes: getVexFormalizationInputValue("formalTransferNotes")
  };

  const transferStatus = getVexTransferStatus(transferPayload);
  transferPayload.status = transferStatus.label;
  transferPayload.statusDescription = transferStatus.description;
  transferPayload.daysLeft = transferStatus.daysLeft;
  transferPayload.procurationRequired = responsible === "Loja";

  const message = document.getElementById("formalTransferMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando transferencia...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.transfer": transferPayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      transferType: responsible === "Loja" ? "Pela loja" : "Pelo cliente",
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          transferType: responsible === "Loja" ? "Pela loja" : "Pelo cliente",
          formalization: {
            ...(sale.formalization || {}),
            transfer: transferPayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationTransfer(saleId);
  } catch (error) {
    console.error("Erro ao salvar transferencia da formalizacao:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar transferencia da formalizacao.");
    }
  }
}


function getVexFormalizationReceivedDocsData(sale) {
  const docs = sale && sale.formalization && sale.formalization.receivedDocs ? sale.formalization.receivedDocs : {};

  return {
    idDocument: docs.idDocument || "Pendente",
    addressProof: docs.addressProof || "Pendente",
    paymentProof: docs.paymentProof || "Pendente",
    notes: docs.notes || ""
  };
}

function getVexReceivedDocsCompletion(docs) {
  const idOk = docs.idDocument === "CNH" || docs.idDocument === "RG" || docs.idDocument === "CNH + RG";
  const addressOk = docs.addressProof === "Recebido";
  const paymentOk = docs.paymentProof === "Recebido";
  const checks = [idOk, addressOk, paymentOk];
  const doneFields = checks.filter(Boolean).length;

  return {
    done: doneFields,
    total: checks.length,
    percent: Math.round((doneFields / checks.length) * 100),
    complete: doneFields === checks.length
  };
}

function renderVexReceivedDocsSelect(id, label, options, currentValue) {
  return `
    <label class="vex-formalization-field">
      <span>${escapeHTML(label)}</span>
      <select id="${escapeHTML(id)}">
        ${options.map(function(option) {
          return `<option value="${escapeHTML(option)}" ${option === currentValue ? "selected" : ""}>${escapeHTML(option)}</option>`;
        }).join("")}
      </select>
    </label>
  `;
}

function getVexReceivedDocsMessagePreview(docs) {
  const lines = [];

  if (docs.idDocument === "CNH") {
    lines.push("CNH: �?Em anexo");
  } else if (docs.idDocument === "RG") {
    lines.push("RG: �?Em anexo");
  } else if (docs.idDocument === "CNH + RG") {
    lines.push("CNH: �?Em anexo");
    lines.push("RG: �?Em anexo");
  } else {
    lines.push("Documento de identificação: ⚠️ Pendente");
  }

  lines.push(`Comprovante de endereco: ${docs.addressProof === "Recebido" ? "�?Em anexo" : "⚠️ Pendente"}`);
  lines.push(`Comprovantes de pagamento: ${docs.paymentProof === "Recebido" ? "�?Em anexo" : "⚠️ Pendente"}`);

  return lines.join("\n");
}

function openVexFormalizationReceivedDocs(saleId) {
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

  const docs = getVexFormalizationReceivedDocsData(sale);
  const completion = getVexReceivedDocsCompletion(docs);
  const statusLabel = completion.complete ? "Documentos recebidos concluído" : "Documentos recebidos pendente";
  const statusIcon = completion.complete ? "OK" : "..";
  const preview = getVexReceivedDocsMessagePreview(docs);

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">DR</div>
        <span class="eyebrow">Formalizacao  - Documentos Recebidos</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}  - ${formatDateToBrazil(sale.saleDate)}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(statusLabel)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${completion.percent}%"></div>
        </div>
        <strong>${completion.done} de ${completion.total} itens conferidos  - ${completion.percent}%</strong>
      </section>

      <form class="vex-formalization-form" onsubmit="saveVexFormalizationReceivedDocs(event, '${sale.id}')">
        <div class="vex-formalization-form-card">
          <h3>Documentos para comunicacao e contrato</h3>
          <p>Marque o que já foi recebido. Esses dados serão usados no Grupo Vendas e na conferência da formalizacao.</p>
          <div class="vex-formalization-form-grid">
            ${renderVexReceivedDocsSelect("formalDocsIdDocument", "Documento de identificação", ["Pendente", "CNH", "RG", "CNH + RG"], docs.idDocument)}
            ${renderVexReceivedDocsSelect("formalDocsAddressProof", "Comprovante de endereco", ["Pendente", "Recebido"], docs.addressProof)}
            ${renderVexReceivedDocsSelect("formalDocsPaymentProof", "Comprovantes de pagamento", ["Pendente", "Recebido"], docs.paymentProof)}
          </div>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Prévia para o Grupo Vendas</h3>
          <pre class="vex-message-preview">${escapeHTML(preview)}</pre>
        </div>

        <div class="vex-formalization-form-card">
          <h3>Observacoes internas</h3>
          <label class="vex-formalization-field full">
            <span>Observacoes</span>
            <textarea id="formalDocsNotes" rows="3" placeholder="Ex.: RG enviado no lugar da CNH.">${escapeHTML(docs.notes || "")}</textarea>
          </label>
        </div>

        <div id="formalDocsMessage" class="vex-formalization-inline-message"></div>

        <div class="vex-drawer-actions vex-drawer-actions-safe">
          ${canManageContent() ? `<button class="primary-button" type="submit">Salvar documentos</button>` : ""}
          <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
          <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
        </div>
      </form>
    </aside>
  `;

  drawer.classList.add("active");
}

async function saveVexFormalizationReceivedDocs(event, saleId) {
  event.preventDefault();

  if (!canManageContent()) {
    alert("Apenas administradores podem atualizar a formalizacao.");
    return;
  }

  if (!salesCollection || !saleId) {
    return;
  }

  const docsPayload = {
    idDocument: getVexFormalizationInputValue("formalDocsIdDocument") || "Pendente",
    addressProof: getVexFormalizationInputValue("formalDocsAddressProof") || "Pendente",
    paymentProof: getVexFormalizationInputValue("formalDocsPaymentProof") || "Pendente",
    notes: getVexFormalizationInputValue("formalDocsNotes")
  };

  const message = document.getElementById("formalDocsMessage");
  if (message) {
    message.innerHTML = `<div class="empty-state">Salvando documentos recebidos...</div>`;
  }

  try {
    const saleRef = getSaleDocumentRef(saleId);
    if (!saleRef) return;

    await saleRef.update({
      "formalization.receivedDocs": docsPayload,
      "formalization.updatedAtLocal": new Date().toISOString(),
      updatedAtLocal: new Date().toISOString()
    });

    sales = sales.map(function(sale) {
      if (sale.id === saleId) {
        return {
          ...sale,
          formalization: {
            ...(sale.formalization || {}),
            receivedDocs: docsPayload,
            updatedAtLocal: new Date().toISOString()
          }
        };
      }
      return sale;
    });

    openVexFormalizationReceivedDocs(saleId);
  } catch (error) {
    console.error("Erro ao salvar documentos recebidos:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Erro ao salvar. Verifique sua conexão ou as regras do Firestore.</div>`;
    } else {
      alert("Erro ao salvar documentos recebidos.");
    }
  }
}



function getVexCommunicationVehicleTitle(sale) {
  const vehicle = getVexFormalizationVehicleData(sale);
  return [vehicle.vehicleBrand, vehicle.vehicleModel, vehicle.vehicleVersion, vehicle.vehicleYear]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim() || "Veiculo nao informado";
}

function getVexCommunicationMoney(value) {
  const number = parseSaleCurrencyValue(value);
  if (number <= 0) return "";
  return formatCurrencyToBrazil(number);
}

function getVexCommunicationIdDocumentLine(docs) {
  if (docs.idDocument === "CNH") return "CNH: (Em anexo.) OK";
  if (docs.idDocument === "RG") return "RG: (Em anexo.) OK";
  if (docs.idDocument === "CNH + RG") return "CNH/RG: (Em anexo.) OK";
  return "Documento de identificacao: Pendente";
}

function getVexCommunicationAttachmentLine(label, status) {
  return `${label}: ${status === "Recebido" ? "(Em anexo.) OK" : "Pendente"}`;
}

function getVexCommunicationSaleCondition(repasse) {
  const condition = String(repasse.saleCondition || "").trim();
  if (!condition) return "*SEM GARANTIA*";
  return `*${condition.toUpperCase()}*`;
}

function getVexCommunicationGastosLines(repasse) {
  const items = getVexRepasseItems(repasse);
  if (!items.length) return ["Nenhum gasto/material informado."];
  return items.map(function(item) {
    return item.description;
  });
}

function getVexCommunicationTransferAnswer(sale) {
  const transfer = getVexFormalizationTransferData(sale);
  return normalizeVexTransferResponsible(transfer.responsible) === "Loja" ? "SIM" : "NÃO";
}

function getVexCommunicationTransactionLines(payment) {
  const lines = [];
  const methods = (payment.methods || []).filter(function(method) {
    return method.type && parseSaleCurrencyValue(method.value) > 0;
  });

  methods.forEach(function(method) {
    lines.push(`${method.type}: ${formatCurrencyToBrazil(parseSaleCurrencyValue(method.value))}`);
  });

  if (payment.transferCharged === "Sim" && parseSaleCurrencyValue(payment.transferValue) > 0) {
    lines.push(`Transferencia: ${formatCurrencyToBrazil(parseSaleCurrencyValue(payment.transferValue))}`);
  }

  if (parseSaleCurrencyValue(payment.ipvaValue) > 0) {
    lines.push(`IPVA: ${formatCurrencyToBrazil(parseSaleCurrencyValue(payment.ipvaValue))}`);
  }

  if (parseSaleCurrencyValue(payment.licensingValue) > 0) {
    lines.push(`Licenciamento: ${formatCurrencyToBrazil(parseSaleCurrencyValue(payment.licensingValue))}`);
  }

  return lines;
}

function getVexCommunicationTotal(payment) {
  const methodsTotal = getVexPaymentMethodsTotal(payment.methods || []);
  return methodsTotal + getVexPaymentCustomerExtrasTotal(payment);
}

function getVexCommunicationResponsibilityText(payment) {
  const ipvaValue = parseSaleCurrencyValue(payment.ipvaValue);
  const licensingValue = parseSaleCurrencyValue(payment.licensingValue);
  const ipvaBy = payment.ipvaPaidBy;
  const licensingBy = payment.licensingPaidBy;

  if (ipvaValue <= 0 && licensingValue <= 0) return "";

  if (ipvaValue > 0 && licensingValue > 0 && ipvaBy === "Loja" && licensingBy === "Loja") {
    return "IPVA E LICENCIAMENTO PAGO PELA LOJA.";
  }

  if (ipvaValue > 0 && licensingValue > 0 && ipvaBy === "Cliente" && licensingBy === "Cliente") {
    return "IPVA E LICENCIAMENTO PAGO PELO CLIENTE.";
  }

  const parts = [];
  if (ipvaValue > 0 && ipvaBy && ipvaBy !== "Nao se aplica") {
    parts.push(`IPVA pago ${ipvaBy === "Loja" ? "pela loja" : "pelo cliente"}.`);
  }
  if (licensingValue > 0 && licensingBy && licensingBy !== "Nao se aplica") {
    parts.push(`Licenciamento pago ${licensingBy === "Loja" ? "pela loja" : "pelo cliente"}.`);
  }
  return parts.join(" ").toUpperCase();
}

function buildVexPreparationMessage(sale) {
  const vehicle = getVexFormalizationVehicleData(sale);
  const vehicleTitle = getVexCommunicationVehicleTitle(sale);
  const plate = vehicle.vehiclePlate || sale.vehiclePlate || "Placa nao informada";

  return [
    "VE VEÍCULO VENDIDO",
    "",
    `Veiculo: ${vehicleTitle}`,
    `Placa: ${plate}`,
    "",
    "Solicitamos a retirada dos anúncios.",
    "",
    "Obrigado."
  ].join("\n");
}

function buildVexSalesGroupMessage(sale) {
  const client = getVexFormalizationClientData(sale);
  const vehicle = getVexFormalizationVehicleData(sale);
  const payment = getVexFormalizationPaymentData(sale);
  const repasse = getVexFormalizationRepasseData(sale);
  const docs = getVexFormalizationReceivedDocsData(sale);
  const vehicleTitle = getVexCommunicationVehicleTitle(sale);
  const saleValue = getVexCommunicationMoney(repasse.saleValue || sale.saleValue);
  const transactionLines = getVexCommunicationTransactionLines(payment);
  const total = getVexCommunicationTotal(payment);
  const responsibilityText = getVexCommunicationResponsibilityText(payment);
  const lines = [];

  lines.push(`Veiculo: ${vehicleTitle}`);
  lines.push(`Placa: ${vehicle.vehiclePlate || sale.vehiclePlate || "Nao informada"}`);
  lines.push("");
  lines.push(`Cliente: ${client.clientName || sale.clientName || "Nao informado"}`);
  lines.push("");
  lines.push(getVexCommunicationAttachmentLine("Comprovante de endereco", docs.addressProof));
  lines.push(getVexCommunicationIdDocumentLine(docs));
  lines.push(getVexCommunicationAttachmentLine("Comprovantes de pagamento", docs.paymentProof));
  lines.push("");
  lines.push(`Numero de telefone: ${client.clientPhone || sale.clientPhone || "Nao informado"}`);
  lines.push(`E-mail: ${client.clientEmail || "Nao informado"}`);
  lines.push("");
  lines.push(`Km atual do veiculo: ${vehicle.vehicleKm || sale.vehicleKm || "Nao informado"}`);
  lines.push("");
  lines.push(`Valor de venda no carro: ${saleValue || "Nao informado"}`);
  lines.push("");
  lines.push(getVexCommunicationSaleCondition(repasse));
  lines.push("*GASTOS*");
  getVexCommunicationGastosLines(repasse).forEach(function(item) {
    lines.push(item);
  });
  lines.push("");
  lines.push(`*A transferencia vai ser feita com a gente:* ${getVexCommunicationTransferAnswer(sale)}`);
  lines.push("");
  lines.push("Detalhes da Transação.");
  lines.push("");

  if (transactionLines.length) {
    transactionLines.forEach(function(line) {
      lines.push(line);
    });
  } else {
    lines.push("Forma de pagamento nao informada.");
  }

  lines.push("");
  lines.push(`Total: ${formatCurrencyToBrazil(total || 0)}`);

  if (responsibilityText) {
    lines.push("");
    lines.push(responsibilityText);
  }

  if (payment.notes) {
    lines.push("");
    lines.push(payment.notes);
  }

  return lines.join("\n");
}

function getVexCommunicationPendencies(sale) {
  const client = getVexFormalizationClientData(sale);
  const docs = getVexFormalizationReceivedDocsData(sale);
  const payment = getVexFormalizationPaymentData(sale);
  const repasse = getVexFormalizationRepasseData(sale);
  const pendencies = [];

  if (!client.clientName) pendencies.push("Nome do cliente nao informado");
  if (!client.clientPhone) pendencies.push("Telefone do cliente nao informado");
  if (!client.clientEmail) pendencies.push("E-mail do cliente nao informado");
  if (docs.idDocument === "Pendente") pendencies.push("Documento de identificação pendente");
  if (docs.addressProof !== "Recebido") pendencies.push("Comprovante de endereco pendente");
  if (docs.paymentProof !== "Recebido") pendencies.push("Comprovantes de pagamento pendentes");
  if (!getVexRepasseItems(repasse).length) pendencies.push("Gastos/material nao informados");
  if (!payment.methods || !payment.methods.some(function(method) { return parseSaleCurrencyValue(method.value) > 0; })) {
    pendencies.push("Forma de pagamento nao informada");
  }

  return pendencies;
}

function renderVexCommunicationPendencies(pendencies) {
  if (!pendencies.length) {
    return `<div class="vex-formalization-inline-message success">�?Mensagens prontas para copiar.</div>`;
  }

  return `
    <div class="vex-formalization-inline-message warning">
      <strong>⚠️ Pendências encontradas</strong>
      <ul>
        ${pendencies.map(function(item) { return `<li>${escapeHTML(item)}</li>`; }).join("")}
      </ul>
      <small>O sistema nao bloqueia a cópia, apenas alerta para conferência antes do envio.</small>
    </div>
  `;
}

function renderVexCommunicationBlock(title, subtitle, previewId, message, copyType) {
  return `
    <div class="vex-formalization-form-card vex-communication-card">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(subtitle)}</p>
      <pre id="${escapeHTML(previewId)}" class="vex-message-preview">${escapeHTML(message)}</pre>
      <div class="vex-drawer-actions vex-drawer-actions-safe vex-communication-actions">
        <button class="secondary-button" type="button" onclick="toggleVexCommunicationPreview('${previewId}')">👁 Visualizar</button>
        <button class="primary-button" type="button" onclick="copyVexCommunicationMessage('${copyType}')">FO Copiar</button>
      </div>
    </div>
  `;
}

function openVexFormalizationCommunication(saleId) {
  const sale = sales.find(function(item) {
    return item.id === saleId;
  });

  if (!sale) return;

  const drawer = document.getElementById("vexVehicleDrawerRoot");
  if (!drawer) return;

  const preparationMessage = buildVexPreparationMessage(sale);
  const salesMessage = buildVexSalesGroupMessage(sale);
  const pendencies = getVexCommunicationPendencies(sale);

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">CM</div>
        <span class="eyebrow">Formalizacao  - Comunicacao</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}</p>

        <div class="vex-formalization-status-pill">
          ${pendencies.length ? ".. Conferir pendências" : "OK Comunicacao pronta"}
        </div>
      </section>

      ${renderVexCommunicationPendencies(pendencies)}

      <section class="vex-formalization-form">
        ${renderVexCommunicationBlock("📦 Grupo Preparacao", "Mensagem curta para retirada dos anúncios.", "vexPreparationMessagePreview", preparationMessage, "preparation")}
        ${renderVexCommunicationBlock("CM Grupo Vendas", "Mensagem completa com dados da venda, anexos e negociação.", "vexSalesMessagePreview", salesMessage, "sales")}
      </section>

      <div id="formalCommunicationMessage" class="vex-formalization-inline-message"></div>

      <div class="vex-drawer-actions vex-drawer-actions-safe">
        <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
        <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
      </div>
    </aside>
  `;

  drawer.classList.add("active");
}

function toggleVexCommunicationPreview(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.classList.toggle("is-hidden-mobile-preview");
}

async function copyVexCommunicationMessage(type) {
  const previewId = type === "preparation" ? "vexPreparationMessagePreview" : "vexSalesMessagePreview";
  const preview = document.getElementById(previewId);
  const message = document.getElementById("formalCommunicationMessage");
  const text = preview ? preview.textContent : "";

  if (!text) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (message) {
      message.innerHTML = `<div class="empty-state">�?Mensagem copiada com sucesso.</div>`;
    } else {
      alert("Mensagem copiada com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao copiar mensagem:", error);
    if (message) {
      message.innerHTML = `<div class="empty-state">Nao foi possível copiar automaticamente. Selecione e copie a mensagem manualmente.</div>`;
    } else {
      alert("Nao foi possível copiar automaticamente.");
    }
  }
}


/* =========================================================
   RC3.0  - Document Engine | Contrato, Termo e Procuração
   ========================================================= */

const VEX_DOCUMENT_COMPANY = {
  fantasyName: "VEX MULTIMARCAS",
  legalName: "Vex Comercio de Veiculos LTDA",
  cnpj: "65.844.036/0001-05",
  email: "GILLUISOTAVIOMOTO@GMAIL.COM",
  phone: "+55 (11) 98375 - 6962",
  street: "Avenida Presidente Medici",
  number: "212",
  district: "Aliança",
  city: "Osasco",
  state: "São Paulo",
  cep: "06268-000"
};

const VEX_DOCUMENT_REPRESENTATIVE = {
  name: "GILVAN BATISTA DO NASCIMENTO",
  cpf: "297.612.538-48",
  address: "AVENIDA GETULIO VARGAS, 981  - PIRATININGA  - OSASCO - SP"
};

function normalizeVexText(value) {
  return String(value || "").trim();
}

function getVexCompanyAddress() {
  return `${VEX_DOCUMENT_COMPANY.street}, ${VEX_DOCUMENT_COMPANY.number}  - ${VEX_DOCUMENT_COMPANY.district}, ${VEX_DOCUMENT_COMPANY.city}  - SP`;
}

function getVexClientAddress(client, format) {
  const street = normalizeVexText(client.clientStreet);
  const number = normalizeVexText(client.clientNumber);
  const complement = normalizeVexText(client.clientComplement);
  const district = normalizeVexText(client.clientDistrict);
  const city = normalizeVexText(client.clientCity);
  const state = normalizeVexText(client.clientState);
  const cep = normalizeVexText(client.clientCep);

  if (format === "contract") {
    return {
      line1: `${street}${number ? ", " + number : ""}${complement ? " Complemento: " + complement : ""}`.trim(),
      district: district,
      city: city,
      state: state,
      cep: cep
    };
  }

  return [
    `${street}${number ? ", " + number : ""}${complement ? " - " + complement : ""}`,
    district,
    city && state ? `${city}/${state}` : city || state,
    cep ? `CEP: ${cep}` : ""
  ].filter(Boolean).join("  - ");
}

function getVexDocumentPaymentText(payment) {
  const methods = (payment.methods || []).filter(function(method) {
    return method.type && parseSaleCurrencyValue(method.value) > 0;
  });

  if (!methods.length) return "Nao informado";

  return methods.map(function(method) {
    return `${method.type}: ${formatCurrencyToBrazil(parseSaleCurrencyValue(method.value))}`;
  }).join(" | ");
}

function getVexDocumentPrimaryPaymentText(payment) {
  const methods = (payment.methods || []).filter(function(method) {
    return method.type && parseSaleCurrencyValue(method.value) > 0;
  });

  return methods.length ? methods.map(function(method) { return method.type; }).join(" + ") : "Nao informado";
}

function getVexVehicleFullName(vehicle) {
  return [vehicle.vehicleBrand, vehicle.vehicleModel, vehicle.vehicleVersion].filter(Boolean).join(" ");
}

function getVexVehicleModelWithoutRepeatedBrand(vehicle) {
  const brand = normalizeVexText(vehicle && vehicle.vehicleBrand);
  const model = normalizeVexText(vehicle && vehicle.vehicleModel);

  if (!brand || !model) return model;

  const normalizedBrand = brand.toUpperCase();
  const normalizedModel = model.toUpperCase();

  if (normalizedModel === normalizedBrand) return model;

  if (normalizedModel.startsWith(normalizedBrand + " ")) {
    return model.slice(brand.length).trim();
  }

  return model;
}


function getVexSaleDocumentNumber(sale) {
  const baseNumber = 1057430;
  const candidates = [sale.orderNumber, sale.saleNumber, sale.protocol];
  for (const candidate of candidates) {
    const clean = String(candidate || "").replace(/\D/g, "");
    if (clean && Number(clean) >= baseNumber) return clean;
  }

  const index = (sales || []).findIndex(function(item) { return item.id === sale.id; });
  if (index >= 0) return String(baseNumber + index);

  return String(baseNumber);
}

function buildVexDocumentData(sale) {
  const client = getVexFormalizationClientData(sale);
  const vehicle = getVexFormalizationVehicleData(sale);
  const payment = getVexFormalizationPaymentData(sale);
  const repasse = getVexFormalizationRepasseData(sale);
  const transfer = getVexFormalizationTransferData(sale);
  const receivedDocs = getVexFormalizationReceivedDocsData(sale);
  const saleNumber = getVexSaleDocumentNumber(sale);
  const saleDate = sale.saleDate || sale.createdAtLocal || new Date().toISOString().slice(0, 10);

  return {
    sale: sale,
    company: VEX_DOCUMENT_COMPANY,
    representative: VEX_DOCUMENT_REPRESENTATIVE,
    client: client,
    vehicle: vehicle,
    payment: payment,
    repasse: repasse,
    transfer: transfer,
    receivedDocs: receivedDocs,
    meta: {
      saleNumber: saleNumber,
      saleDate: saleDate,
      saleDateBrazil: formatDateToBrazil(saleDate),
      generatedAt: new Date().toISOString()
    }
  };
}

function getVexRequiredDocumentFields(documentType) {
  const common = [
    { key: "client.clientName", label: "Nome do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientCpf", label: "CPF/CNPJ do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientStreet", label: "Endereco do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientNumber", label: "Numero do endereco", action: "openVexFormalizationClient" },
    { key: "client.clientDistrict", label: "Bairro do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientCity", label: "Cidade do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientState", label: "Estado do cliente", action: "openVexFormalizationClient" },
    { key: "client.clientPhone", label: "Celular do cliente", action: "openVexFormalizationClient" },
    { key: "vehicle.vehicleBrand", label: "Marca do veiculo", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehicleModel", label: "Modelo do veiculo", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehicleVersion", label: "Versao do veiculo", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehicleYear", label: "Ano/modelo", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehiclePlate", label: "Placa", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehicleChassis", label: "Chassi", action: "openVexFormalizationVehicle" },
    { key: "vehicle.vehicleRenavam", label: "Renavam", action: "openVexFormalizationVehicle" },
    { key: "payment.vehicleTotal", label: "Valor da venda", action: "openVexFormalizationPayment" }
  ];

  const byDocument = {
    contract: [
      { key: "client.clientEmail", label: "E-mail do cliente", action: "openVexFormalizationClient" },
      { key: "client.clientBirthDate", label: "Data de nascimento", action: "openVexFormalizationClient" },
      { key: "vehicle.vehicleColor", label: "Cor", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleKm", label: "Quilometragem", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleFuel", label: "Combustivel", action: "openVexFormalizationVehicle" }
    ],
    repasse: [
      { key: "meta.saleNumber", label: "Numero do pedido", action: "openVexFormalization" },
      { key: "client.clientRg", label: "RG/IE", action: "openVexFormalizationClient" },
      { key: "vehicle.vehicleType", label: "Tipo do veiculo", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleDoors", label: "Portas", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleTransmission", label: "Cambio", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleFuel", label: "Combustivel", action: "openVexFormalizationVehicle" },
      { key: "vehicle.vehicleCategory", label: "Categoria", action: "openVexFormalizationVehicle" }
    ],
    procuracao: [
      { key: "client.clientRg", label: "RG", action: "openVexFormalizationClient" },
      { key: "client.clientRgIssuer", label: "Orgao emissor", action: "openVexFormalizationClient" },
      { key: "client.clientRgIssuerUf", label: "UF emissor", action: "openVexFormalizationClient" },
      { key: "client.clientEmail", label: "E-mail do cliente", action: "openVexFormalizationClient" }
    ]
  };

  return common.concat(byDocument[documentType] || []);
}

function getValueByPath(object, path) {
  return path.split(".").reduce(function(current, key) {
    return current && current[key] !== undefined ? current[key] : "";
  }, object);
}

function getVexDocumentPendencies(documentType, data) {
  return getVexRequiredDocumentFields(documentType).filter(function(field) {
    return !normalizeVexText(getValueByPath(data, field.key));
  });
}

function getVexDocumentDefinitions(sale) {
  const isClientTransfer = sale.transferType === "Pelo cliente";
  return [
    { type: "contract", icon: "DOC", title: "Contrato Particular", description: "Compra e venda com dados do cliente, veiculo, financeiro e garantia." },
    { type: "repasse", icon: "REP", title: "Termo de Repasse", description: "Termo de repasse e ciencia de venda sem garantia." },
    { type: "procuracao", icon: "PROC", title: "Procuracao", description: isClientTransfer ? "Opcional quando a transferencia fica com o cliente." : "Procuracao para regularizacao e transferencia." }
  ];
}

function renderVexDocumentPendencies(pendencies) {
  if (!pendencies.length) {
    return `<p class="vex-document-ready">Pronto para gerar</p>`;
  }

  return `
    <div class="vex-document-pendencies">
      <strong>Faltam ${pendencies.length} informação(ões):</strong>
      <ul>
        ${pendencies.slice(0, 5).map(function(item) { return `<li>${escapeHTML(item.label)}</li>`; }).join("")}
      </ul>
    </div>
  `;
}

function renderVexDocumentCard(definition, sale, data) {
  const pendencies = getVexDocumentPendencies(definition.type, data);
  const ready = pendencies.length === 0;
  const action = pendencies[0] && pendencies[0].action ? pendencies[0].action : "openVexFormalization";

  return `
    <article class="vex-document-card ${ready ? "ready" : "pending"}">
      <div class="vex-document-card-header">
        <span>${definition.icon}</span>
        <div>
          <h3>${escapeHTML(definition.title)}</h3>
          <p>${escapeHTML(definition.description)}</p>
        </div>
      </div>
      ${renderVexDocumentPendencies(pendencies)}
      <div class="vex-document-actions">
        ${ready ? `
          <button class="secondary-button" type="button" onclick="previewVexDocument('${sale.id}', '${definition.type}')">Visualizar</button>
          <button class="primary-button" type="button" onclick="downloadVexDocumentDocx('${sale.id}', '${definition.type}')">DOCX</button>
          <button class="secondary-button" type="button" onclick="printVexDocument('${sale.id}', '${definition.type}')">PDF / Imprimir</button>
          <button class="secondary-button" type="button" onclick="shareVexDocumentWhatsapp('${sale.id}', '${definition.type}')">WhatsApp</button>
        ` : `<button class="secondary-button" type="button" onclick="${action}('${sale.id}')">Ir para Formalizacao</button>`}
      </div>
    </article>
  `;
}

function openVexFormalizationDocuments(saleId) {
  const sale = sales.find(function(item) { return item.id === saleId; });
  if (!sale) return;

  const drawer = document.getElementById("vexVehicleDrawerRoot");
  if (!drawer) return;

  const data = buildVexDocumentData(sale);
  const definitions = getVexDocumentDefinitions(sale);
  const readyCount = definitions.filter(function(definition) {
    return getVexDocumentPendencies(definition.type, data).length === 0;
  }).length;
  const progress = Math.round((readyCount / definitions.length) * 100);

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">DC</div>
        <span class="eyebrow">Formalizacao  - Documentos</span>
        <h2>Pedido #${escapeHTML(data.meta.saleNumber)}</h2>
        <p>${escapeHTML(data.client.clientName || "Cliente nao informado")}  - ${escapeHTML(getVexVehicleFullName(data.vehicle) || "Veiculo nao informado")}</p>

        <div class="vex-formalization-status-pill">
          ${progress === 100 ? "OK Venda pronta" : ".. Conferir documentos"}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${progress}%"></div>
        </div>
        <strong>${readyCount} de ${definitions.length} documentos prontos  - ${progress}%</strong>
      </section>

      <section class="vex-formalization-summary">
        ${renderVexFormalizationSummaryItem("Cliente", data.client.clientName)}
        ${renderVexFormalizationSummaryItem("Veiculo", getVexVehicleFullName(data.vehicle))}
        ${renderVexFormalizationSummaryItem("Placa", data.vehicle.vehiclePlate)}
        ${renderVexFormalizationSummaryItem("Valor", data.payment.vehicleTotal)}
      </section>

      <section class="vex-document-grid">
        ${definitions.map(function(definition) { return renderVexDocumentCard(definition, sale, data); }).join("")}
      </section>

      ${progress === 100 ? `
        <div class="vex-document-generate-all">
          <strong>OK Todos os documentos estão prontos.</strong>
          <button class="primary-button" type="button" onclick="downloadAllVexDocuments('${sale.id}')">Baixar todos em DOCX</button>
          <button class="secondary-button" type="button" onclick="printAllVexDocuments('${sale.id}')">Imprimir todos / Salvar PDF</button>
        </div>
      ` : ""}

      <div class="vex-drawer-actions vex-drawer-actions-safe">
        <button class="secondary-button" type="button" onclick="openVexFormalization('${sale.id}')">Voltar</button>
        <button class="secondary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
      </div>
    </aside>
  `;

  drawer.classList.add("active");
}

function getVexDocumentTitle(type) {
  const titles = {
    contract: "Contrato Particular de Compra e Venda",
    repasse: "Termo de Repasse",
    procuracao: "Procuração para Transferencia"
  };
  return titles[type] || "Documento";
}

function buildVexDocumentHtml(type, data) {
  if (type === "contract") return buildVexContractHtml(data);
  if (type === "repasse") return buildVexRepasseHtml(data);
  if (type === "procuracao") return buildVexProcuracaoHtml(data);
  return "";
}

function buildVexContractHtml(data) {
  const clientAddress = getVexClientAddress(data.client, "contract");
  const discount = getVexRepasseDiscountValue(data.repasse);
  const repairItems = getVexRepasseItems(data.repasse).map(function(item) { return item.description; }).filter(Boolean).join(", ");
  const totalValueNumber = parseSaleCurrencyValue(data.payment.vehicleTotal);
  const totalValue = totalValueNumber > 0 ? formatCurrencyToBrazil(totalValueNumber) : (data.payment.vehicleTotal || "");
  const paymentMethods = (data.payment.methods || []).filter(function(method) {
    return method.type && parseSaleCurrencyValue(method.value) > 0;
  });
  const primaryPayment = paymentMethods.length ? paymentMethods.map(function(method) { return normalizeVexText(method.type).toUpperCase(); }).join("+") : getVexDocumentPrimaryPaymentText(data.payment).toUpperCase();
  const companySeller = data.company.fantasyName || "VEX MULTIMARCAS";
  const companyAddress = getVexCompanyAddress();
  const birthDate = data.client.clientBirthDate ? formatDateToBrazil(data.client.clientBirthDate) : "";
  const expensesText = repairItems || data.repasse.notes || "";

  const paymentOrder = [
    { label: "FINANCIAMENTO", keys: ["FINANCIAMENTO"] },
    { label: "VEÍCULO TROCA", keys: ["TROCA", "VEICULO TROCA", "VEÍCULO TROCA"] },
    { label: "CARTÃO DE CRÉDITO", keys: ["CARTAO", "CARTÃO", "CREDITO CARTAO", "CRÉDITO CARTÃO"] },
    { label: "CRÉDITO EM CONTA", keys: ["CRÉDITO EM CONTA", "CREDITO EM CONTA", "CONTA"] },
    { label: "PARCELAMENTO LOJA", keys: ["PARCELAMENTO", "LOJA"] },
    { label: "PIX", keys: ["PIX"] },
    { label: "DINHEIRO", keys: ["DINHEIRO"] }
  ];

  function findPaymentValue(keys) {
    const method = paymentMethods.find(function(item) {
      const normalized = normalizeVexText(item.type).toUpperCase();
      return keys.some(function(key) { return normalized.includes(key); });
    });
    return method ? formatCurrencyToBrazil(parseSaleCurrencyValue(method.value)) : "";
  }

  const matchedPaymentMethods = new Set();
  const usedPaymentRows = paymentOrder.map(function(item) {
    const method = paymentMethods.find(function(paymentMethod) {
      if (matchedPaymentMethods.has(paymentMethod)) return false;
      const normalized = normalizeVexText(paymentMethod.type).toUpperCase();
      return item.keys.some(function(key) { return normalized.includes(key); });
    });
    if (!method) return "";
    matchedPaymentMethods.add(method);
    return `<tr><td>${escapeHTML(item.label)}</td><td>${escapeHTML(formatCurrencyToBrazil(parseSaleCurrencyValue(method.value)))}</td></tr>`;
  }).concat(paymentMethods.map(function(method) {
    if (matchedPaymentMethods.has(method)) return "";
    return `<tr><td>${escapeHTML(normalizeVexText(method.type).toUpperCase())}</td><td>${escapeHTML(formatCurrencyToBrazil(parseSaleCurrencyValue(method.value)))}</td></tr>`;
  })).filter(Boolean).join("") || `<tr><td>${escapeHTML(primaryPayment || "FORMA DE PAGAMENTO")}</td><td>${escapeHTML(totalValue)}</td></tr>`;

  const paymentObservationRow = normalizeVexText(data.payment.notes) ? `<tr><td>Observação</td><td>${escapeHTML(data.payment.notes)}</td></tr>` : "";
  const gastosLine = expensesText ? `GASTOS:${escapeHTML(expensesText).toUpperCase()}` : "GASTOS:";
  const cityForo = (data.company.city || "OSASCO").toUpperCase();

  return `
    <article class="vex-contract-doc">
      <section class="vex-contract-page vex-contract-page-1">
        <h1>CONTRATO PARTICULAR DE COMPRA E VENDA DE VEÍCULO</h1>
        <h2>(COM ABATIMENTO NO PREÇO, <u>SEM GARANTIA</u>- DECLARAÇÃO CIÊNCIA)</h2>

        <p class="contract-center-title">I- DAS PARTES</p>
        <p class="contract-intro">Contrato particular de compra e venda de veículo usado, que entre si fazem:</p>

        <table class="contract-box contract-company-table">
          <tr><td><strong>VENDEDOR:</strong> ${escapeHTML(companySeller)}</td></tr>
          <tr><td><strong>ENDEREÇO:</strong> ${escapeHTML(companyAddress)}</td></tr>
          <tr><td><strong>EMAIL:</strong> ${escapeHTML(data.company.email)}</td></tr>
          <tr><td><strong>TELEFONE:</strong> ${escapeHTML(data.company.phone)}</td></tr>
        </table>

        <table class="contract-box contract-data-table">
          <tr><th colspan="4">DADOS COMPRADOR:</th></tr>
          <tr><td class="label">Nome Completo:</td><td colspan="3">${escapeHTML(data.client.clientName)}</td></tr>
          <tr><td class="label">Endereço:</td><td>${escapeHTML(clientAddress.line1)}</td><td class="label">Complemento:</td><td>${escapeHTML(data.client.clientComplement || "")}</td></tr>
          <tr><td class="label">Bairro:</td><td>${escapeHTML(clientAddress.district)}</td><td class="label">Cidade:</td><td>${escapeHTML(clientAddress.city)}</td></tr>
          <tr><td class="label">Estado:</td><td>${escapeHTML(clientAddress.state)}</td><td class="label">CEP:</td><td>${escapeHTML(clientAddress.cep)}</td></tr>
          <tr><td class="label">E-mail:</td><td>${escapeHTML(data.client.clientEmail)}</td><td class="label">Data de Nascimento:</td><td>${escapeHTML(birthDate)}</td></tr>
          <tr><td class="label">Telefone Fixo:</td><td></td><td class="label">Telefone Celular:</td><td>${escapeHTML(data.client.clientPhone)}</td></tr>
          <tr><td class="label">Observações:</td><td colspan="3">${escapeHTML(data.repasse.notes || "")}</td></tr>
        </table>

        <p class="contract-center-title contract-object-title">II- DO OBJETO</p>
        <p class="contract-center-title contract-small-title">DADOS DO VEÍCULO:</p>
        <table class="contract-box contract-data-table contract-vehicle-table">
          <tr><td class="label">Veículo:</td><td>${escapeHTML(getVexVehicleFullName(data.vehicle))}</td><td class="label">Chassi:</td><td>${escapeHTML(data.vehicle.vehicleChassis)}</td></tr>
          <tr><td class="label">Ano/Modelo:</td><td>${escapeHTML(data.vehicle.vehicleYear)}</td><td class="label">Cor:</td><td>${escapeHTML(data.vehicle.vehicleColor)}</td></tr>
          <tr><td class="label">Placa:</td><td>${escapeHTML(data.vehicle.vehiclePlate)}</td><td class="label">Quilometragem:</td><td>${escapeHTML(data.vehicle.vehicleKm)}</td></tr>
          <tr><td class="label">Renavam:</td><td>${escapeHTML(data.vehicle.vehicleRenavam)}</td><td class="label">Combustível:</td><td>${escapeHTML(data.vehicle.vehicleFuel)}</td></tr>
        </table>

        <p class="contract-value-line">Valor total ajustado: <strong><u>${escapeHTML(totalValue)}</u></strong>, pago da seguinte forma: [${escapeHTML(primaryPayment)}].</p>

        <table class="contract-box contract-payment-table">
          <tr><th colspan="2">FORMA DE PAGAMENTO</th></tr>
          ${usedPaymentRows}
          ${paymentObservationRow}
          <tr class="contract-total-row"><td>TOTAL</td><td>${escapeHTML(totalValue)}</td></tr>
        </table>
        <div class="contract-red-block contract-page-1-red">
          <p>Veículo vendido a preço promocional <strong><u>NÃO POSSUINDO</u></strong> qualquer garantia mecânica.</p>
          <p>Foi dado o abatimento no importe de <strong>${escapeHTML(formatCurrencyToBrazil(discount))}</strong> para que o comprador efetue todas as manutenções necessárias no veículo como preditivas, corretivas e preventivas, que se fizerem necessárias, bem como com eventuais vícios ocultos, em decorrência do abatimento fornecido; Carro consignado.</p>
        </div>
        <p class="contract-gastos"><strong>${gastosLine}</strong></p>
        <p class="contract-paragraph-unique"><strong>Parágrafo único</strong> �?Caso o valor não seja integralmente quitado, o COMPRADOR assume o bem como <strong>fiel depositário</strong>, não podendo vendê-lo, cedê-lo ou transferi-lo até a quitação total, sob pena de responsabilidade civil e penal.</p>
        <p class="contract-page-number">Página 1 de 4</p>
      </section>

      <section class="vex-contract-page vex-contract-page-2">
        <p class="contract-center-title">IV �?DO ABATIMENTO DO PREÇO E RESPONSABILIDADE PELOS REPAROS</p>
        <p><strong><u>Cláusula 1ª</u></strong> �?O COMPRADOR declara que <strong><u>teve ampla liberdade e realizou análise minuciosa do veículo</u></strong>, inclusive tendo sido orientado a submetê-lo à avaliação técnica por mecânico de sua confiança antes da compra. Declara ainda que fez minuciosa análise das condições em que o veículo se encontra, declarando que está ciente e de acordo com os reparos necessários.</p>
        <p><strong><u>Cláusula 2ª</u></strong> �?Foi informado expressamente que <strong>o veículo não passou por qualquer revisão, preparação ou correção prévia para venda, sendo entregue no estado de conservação e uso em que se encontra</strong>, com necessidade de diversos reparos mecânicos, elétricos, estruturais, de suspensão, freios, motor e demais itens, decorrentes de desgaste natural ou falhas já existentes.</p>
        <p><strong><u>Cláusula 3ª</u></strong> �?As partes reconhecem que o <strong><u>veículo é oriundo de repasse</u></strong>, motivo pelo qual <strong><u>foi concedido abatimento sobre o valor de mercado</u></strong>, ajustando-se que o COMPRADOR assume integralmente a responsabilidade de realizar, por sua conta e risco, todas as manutenções necessárias para sua utilização regular e segura.</p>
        <p><strong><u>Cláusula 4ª</u></strong> �?O COMPRADOR <strong><u>afirma, com plena ciência, que está adquirindo o bem no estado em que se encontra e sem garantia mecânica ou geral</u></strong>, tendo sido claramente informado da necessidade de revisão completa e reparos em toda a parte mecânica, elétrica e estrutural do veículo �?não se restringindo aos itens exemplificados, mas abrangendo eventuais defeitos ocultos ou futuros.</p>
        <p><strong><u>Cláusula 5ª</u></strong> �?Reconhece também que <strong><u>o valor do abatimento foi livremente acordado</u></strong> e que não poderá alegar posteriormente insuficiência, visto que teve a oportunidade de examinar o veículo com profissional de sua confiança antes da assinatura deste instrumento, tendo sido orientado a avaliar previamente por um mecânico de sua confiança, quanto a compatibilidade dos reparos a serem feitos e do abatimento ofertado, visto que não poderá posteriormente em hipótese alguma, alegar que o abatimento não tenha sido suficiente para realizar as manutenções necessárias.</p>
        <p class="contract-page-number">Página 2 de 4</p>
      </section>

      <section class="vex-contract-page vex-contract-page-3">
        <p class="contract-center-title">V �?DA TRANSFERÊNCIA DE PROPRIEDADE</p>
        <p><strong><u>Cláusula 1ª</u></strong>: A transferência é de responsabilidade exclusiva do <strong>COMPRADOR</strong>, inclusive seus custos.</p>
        <p><strong><u>Cláusula 2ª</u></strong>: Caso o pagamento se dê via cheque ou forma a prazo, os documentos do veículo serão liberados somente após a quitação ou compensação bancária.</p>
        <p><strong><u>Cláusula 3ª</u></strong>: O Certificado de Registro do Veículo/ Autorização de Transferência Propriedade será entregue apenas após <strong>regularização de eventuais pendências administrativas ou financeiras</strong> entre COMPRADOR e VENDEDOR.</p>

        <p class="contract-center-title contract-section-gap">VI �?DAS NOTIFICAÇÕES</p>
        <p>O <strong>COMPRADOR</strong> nesta oportunidade declara e aceita que todas as comunicações serão consideradas válidas se enviadas:</p>
        <ul class="contract-list">
          <li>Pelo WhatsApp do <strong>COMPRADOR</strong>;</li>
          <li>Por e-mail informado neste contrato;</li>
          <li>Para o endereço físico cadastrado.</li>
        </ul>

        <p class="contract-center-title contract-section-gap">VII �?DA PROCEDÊNCIA</p>
        <p>O <strong>VENDEDOR</strong> declara que, até a presente data, o veículo objeto deste contrato encontra-se livre e desembaraçado de ônus, gravames ou restrições de conhecimento da empresa, conforme verificação realizada nos sistemas oficiais disponíveis.</p>
        <p>Contudo, em atenção ao disposto no art. 447 do Código Civil, as partes reconhecem que a responsabilidade do <strong>VENDEDOR</strong> se limita à sua esfera de conhecimento e atuação, não se estendendo a eventuais registros, apontamentos ou restrições lançadas após a celebração do presente instrumento, ainda que decorrentes de fatos pretéritos a negociação.</p>
        <p>Fica pactuado, portanto, que eventual evicção ou reivindicação de terceiros somente ensejará responsabilidade do <strong>VENDEDOR</strong> nos casos em que comprovadamente tenha agido com dolo ou ciência prévia do vício ou ônus incidente sobre o bem.</p>

        <p class="contract-center-title contract-section-gap">VIII- DA RESCISÃO</p>
        <p><strong>Cláusula Primeira:</strong> A presente negociação é feita em caráter irrevogável, irretratável não se admitindo arrependimento. <strong>Oportunamente foi esclarecido ao COMPRADOR que o VENDEDOR não tem qualquer responsabilidade quanto aos termos acordados em contratos de financiamento firmados entre COMPRADOR e terceiros.</strong></p>
        <p><strong>Cláusula Segunda:</strong> Em caso de inadimplemento de qualquer das obrigações assumidas neste contrato, a parte inocente poderá, a seu exclusivo critério, considerar rescindido o presente instrumento e exigir, da parte inadimplente, o pagamento de multa compensatória equivalente a 10% (dez por cento) sobre o valor total do contrato, independentemente de outras penalidades cabíveis, sem prejuízo da indenização por perdas e danos, se houver.</p>
        <p class="contract-page-number">Página 3 de 4</p>
      </section>

      <section class="vex-contract-page vex-contract-page-4">
        <div class="contract-final-block">
        <p class="contract-center-title contract-section-gap">IX �?DA CONFIDENCIALIDADE</p>
        <p>Este contrato e sua redação são protegidos por <strong>direitos autorais</strong>. É vedada sua reprodução, modificação ou reutilização sem autorização do <strong>VENDEDOR</strong> e/ou da profissional responsável. Violação sujeita às penalidades da <strong>Lei nº 9.610/98.</strong></p>
        <p>O COMPRADOR se compromete a não realizar postagens, publicações ou comentários públicos que impliquem exposição negativa, constrangimento ou ataque à reputação da empresa VENDEDORA, em redes sociais, sites ou quaisquer meios públicos, sob pena de responder civil e criminalmente por danos morais e à imagem.</p>

        <p class="contract-center-title contract-section-gap">X �?DO FORO</p>
        <p>As partes elegem o foro da Comarca de <strong>${escapeHTML(cityForo)}</strong> para solucionar qualquer disputa referente a este contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
        <p>E, por estarem justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, juntamente com duas testemunhas.</p>
        </div>

        <div class="contract-date-line"><strong>${escapeHTML(cityForo)}</strong>, _____ de __________________________ de ____________.</div>
        <div class="contract-signature-line"><strong>VENDEDOR:</strong> _______________________________________________</div>
        <div class="contract-signature-line"><strong>COMPRADOR:</strong> ______________________________________________</div>
        <p class="contract-page-number">Página 4 de 4</p>
      </section>
    </article>
  `;
}

function buildVexRepasseHtml(data) {
  const rgIe = [data.client.clientRg, data.client.clientRgIssuer, data.client.clientRgIssuerUf].filter(Boolean).join(" ");
  const valorVenda = String(data.payment.vehicleTotal || "").replace(/^R\$\s*/i, "");
  const formaPagamento = getVexDocumentPrimaryPaymentText(data.payment).toUpperCase();
  const enderecoCliente = [
    `${normalizeVexText(data.client.clientStreet)}${normalizeVexText(data.client.clientNumber) ? "," + normalizeVexText(data.client.clientNumber) : ""}${normalizeVexText(data.client.clientComplement) ? " - " + normalizeVexText(data.client.clientComplement) : ""}`,
    normalizeVexText(data.client.clientDistrict),
    `${normalizeVexText(data.client.clientCity)} - ${normalizeVexText(data.client.clientState || "SP")}`
  ].filter(function(item) { return normalizeVexText(item).replace(/[-\s]/g, ""); }).join(" �?");

  function field(label, value) {
    return `<div class="vex-repasse-field"><strong>${escapeHTML(label)}:</strong><span>${escapeHTML(value || "")}</span></div>`;
  }

  return `
    <article class="vex-repasse-doc">
      <header class="vex-repasse-header">
        <div class="vex-repasse-brand"><span>VEX</span> MULTIMARCAS</div>
        <div class="vex-repasse-company-line"><strong>Telefone:</strong> ${escapeHTML(data.company.phone)}</div>
        <div class="vex-repasse-company-line"><strong>CNPJ:</strong> ${escapeHTML(data.company.cnpj)}</div>
        <div class="vex-repasse-company-line"><strong>Endereço:</strong> ${escapeHTML(getVexCompanyAddress())}</div>
      </header>

      <h1 class="vex-repasse-title">TERMO DE REPASSE - Pedido: #${escapeHTML(data.meta.saleNumber)}</h1>

      <section class="vex-repasse-section">
        <h2><span class="vex-repasse-icon">�?/span> Dados do Veículo</h2>
        <div class="vex-repasse-box">
          <div class="vex-repasse-grid">
            <div>
              ${field("Marca", data.vehicle.vehicleBrand)}
              ${field("Versão", data.vehicle.vehicleVersion)}
              ${field("KM", data.vehicle.vehicleKm)}
              ${field("Câmbio", data.vehicle.vehicleTransmission)}
              ${field("Placa", data.vehicle.vehiclePlate)}
              ${field("Renavam", data.vehicle.vehicleRenavam)}
              ${field("Categoria", data.vehicle.vehicleCategory)}
            </div>
            <div>
              ${field("Modelo", data.vehicle.vehicleModel)}
              ${field("Tipo", data.vehicle.vehicleType)}
              ${field("Portas", data.vehicle.vehicleDoors)}
              ${field("Combust.", data.vehicle.vehicleFuel)}
              ${field("Chassi", data.vehicle.vehicleChassis)}
              ${field("Ano", data.vehicle.vehicleYear)}
              ${field("Cor", data.vehicle.vehicleColor)}
            </div>
          </div>
        </div>
      </section>

      <section class="vex-repasse-section vex-repasse-proponente">
        <h2><span class="vex-repasse-icon">�?/span> Proponente</h2>
        <div class="vex-repasse-box">
          <div class="vex-repasse-grid">
            <div>
              ${field("Cliente", data.client.clientName)}
              ${field("RG/IE", rgIe)}
              ${field("Endereço", enderecoCliente)}
            </div>
            <div>
              ${field("CPF/CNPJ", data.client.clientCpf)}
              ${field("Celular", data.client.clientPhone)}
            </div>
          </div>
        </div>
      </section>

      <p class="vex-repasse-date"><strong>Data Venda:</strong><span>${escapeHTML(data.meta.saleDateBrazil)}</span></p>

      <p class="vex-repasse-legal vex-repasse-legal-strong">O veículo acima descrito NÃO TERÁ GARANTIA de 3 (três) meses ou 3.000 (três mil) quilômetros, por se tratar de um REPASSE DO VEÍCULO no estado em que se encontra.</p>
      <p class="vex-repasse-legal vex-repasse-sale-text">O VEÍCULO FOI VENDIDO NO VALOR DE ${escapeHTML(valorVenda)} SENDO O PAGAMENTO FEITO ATRAVÉZ DE ${escapeHTML(formaPagamento)}. O VEÍCULO NÃO POSSUI GARANTIA, SENDO VENDIDO NA MODALIDADE REPASSE, NO ESTADO QUE SE ENCONTRA.</p>

      <div class="vex-repasse-signatures">
        <div class="vex-repasse-signature"><div></div><strong>${escapeHTML(data.company.fantasyName)}</strong></div>
        <div class="vex-repasse-signature"><div></div><strong>${escapeHTML(data.client.clientName)}</strong></div>
      </div>
    </article>
  `;
}
function buildVexProcuracaoHtml(data) {
  const rg = [data.client.clientRg, data.client.clientRgIssuer, data.client.clientRgIssuerUf].filter(Boolean).join(" ");
  const enderecoCliente = getVexClientAddress(data.client);
  const veiculo = getVexVehicleFullName(data.vehicle);
  const vehicleModel = getVexVehicleModelWithoutRepeatedBrand(data.vehicle);

  return `
    <article class="vex-procuracao-doc">
      <h1>PROCURAÇÃO PARA TRANSFERÊNCIA DE PROPRIETÁRIO</h1>

      <section class="vex-procuracao-party">
        <p><strong>OUTORGANTE:</strong> ${escapeHTML(data.client.clientName)}</p>
        <div class="vex-procuracao-two-col">
          <p><strong>CPF/CNPJ:</strong> ${escapeHTML(data.client.clientCpf)}</p>
          <p><strong>RG:</strong> ${escapeHTML(rg)}</p>
        </div>
        <p><strong>ENDEREÇO:</strong> ${escapeHTML(enderecoCliente)}</p>
        <div class="vex-procuracao-two-col">
          <p><strong>CELULAR:</strong> ${escapeHTML(data.client.clientPhone)}</p>
          <p><strong>E-MAIL:</strong> ${escapeHTML(data.client.clientEmail)}</p>
        </div>
      </section>

      <section class="vex-procuracao-party vex-procuracao-outorgado">
        <p><strong>OUTORGADO:</strong> ${escapeHTML(data.representative.name)}</p>
        <p><strong>CPF/CNPJ:</strong> ${escapeHTML(data.representative.cpf)}</p>
        <p><strong>ENDEREÇO:</strong> ${escapeHTML(data.representative.address)}</p>
      </section>

      <section class="vex-procuracao-powers">
        <p><strong>PODERES:</strong> Por esse instrumento de Procuração, o Outorgante nomeia e constitui seu bastante procurador o Outorgado, para o fim especial de comprar e vender como proprietário/vendedor/comprador o CRV (Certificado de Registro de Veículos) do veículo com as seguintes características; para o fim especial de regularizar a documentação.</p>
      </section>

      <section class="vex-procuracao-vehicle">
        <p><strong>DADOS DO VEÍCULO:</strong></p>
        <ul>
          <li><strong>PLACA:</strong> ${escapeHTML(data.vehicle.vehiclePlate)} <strong>ANO/MODELO:</strong> ${escapeHTML(data.vehicle.vehicleYear)} <strong>RENAVAM:</strong> ${escapeHTML(data.vehicle.vehicleRenavam)}</li>
          <li><strong>CHASSI:</strong> ${escapeHTML(data.vehicle.vehicleChassis)} <strong>MARCA:</strong> ${escapeHTML(data.vehicle.vehicleBrand)} <strong>MODELO:</strong> ${escapeHTML(vehicleModel)}</li>
          <li><strong>VERSÃO:</strong> ${escapeHTML(data.vehicle.vehicleVersion || veiculo)}</li>
        </ul>
      </section>

      <section class="vex-procuracao-legal">
        <p>Adquirido pelo Outorgante; representar perante as repartições públicas federais, estaduais, municipais, DETRAN e onde mais necessário for; neles assim e requerer, juntar e desentranhar quaisquer guias, papéis, requerimentos, documentos e o que mais se torne necessário, pagar quaisquer impostos, tributos e taxas para efetivar a transferência e efetuar o emplacamento do mesmo, em suma, tudo o mais praticar ao bom e fiel desempenho do presente mandato.</p>
        <p>Todos os dados desta procuração foram fornecidos e conferidos pelo (a) Outorgante, que por eles se responsabiliza nos termos da Lei. Esta procuração é válida até o dia que o CRV for transferido para o proprietário.</p>
      </section>

      <footer class="vex-procuracao-signature">
        <div></div>
        <p>Assinatura do proprietário (Outorgante)</p>
        <p><strong>Obs:</strong> reconhecer firma por autenticidade.</p>
      </footer>
    </article>
  `;
}

function getVexPrintableDocumentHtml(title, bodyHtml, type) {
  const documentType = type || "documents";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHTML(title)}</title><style>
    @page{size:A4;margin:10mm 11mm;}
    *{box-sizing:border-box;}
    body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#f3f4f6;margin:0;padding:18px;}
    .vex-print-sheet{width:190mm;min-height:277mm;margin:0 auto 18px;background:#fff;padding:0;box-shadow:0 10px 28px rgba(15,23,42,.12);}
    .vex-print-content{font-size:10pt;line-height:1.22;padding:10mm 11mm;}
    h1{font-size:13pt;text-align:center;margin:0 0 4px;font-weight:800;text-transform:uppercase;}
    h2{font-size:10.5pt;text-align:center;margin:0 0 8px;font-weight:700;}
    h3{font-size:10pt;margin:7px 0 4px;font-weight:800;}
    p{margin:3px 0;}
    table{width:100%;border-collapse:collapse;margin:4px 0;}
    td{padding:2px 5px;vertical-align:top;}
    .doc-section-title{font-weight:800;margin-top:7px;text-transform:uppercase;}
    .doc-two-col td{width:50%;}
    .doc-signatures{margin-top:16px;text-align:center;}
    .doc-signatures td{padding-top:12px;}
    .doc-payment-table td{border-bottom:1px solid #e5e7eb;}
    .doc-muted{color:#111;}
    .vex-print-contract .vex-print-sheet{width:210mm;min-height:297mm;box-shadow:none;background:#fff;margin:0 auto;}
    .vex-print-contract .vex-print-content{font-family:Arial,Helvetica,sans-serif;font-size:8pt;line-height:1.18;padding:0;color:#111;}
    .vex-contract-doc{width:100%;color:#111;font-family:Arial,Helvetica,sans-serif;background:#fff;}
    .vex-contract-page{width:210mm;min-height:297mm;position:relative;padding:17mm 16mm 12mm 16mm;page-break-after:always;break-after:page;background:#fff;overflow:hidden;}
    .vex-contract-page:last-child{page-break-after:auto;break-after:auto;}
    .vex-print-contract h1{font-size:10.2pt;line-height:1.08;text-align:center;margin:0 0 4px;font-weight:800;text-transform:uppercase;letter-spacing:.05px;}
    .vex-print-contract h2{font-size:8.35pt;line-height:1.08;text-align:center;margin:0 0 11mm;font-weight:700;text-transform:uppercase;font-style:italic;}
    .vex-print-contract p{font-size:10pt;line-height:1.24;margin:2.4px 0;text-align:left;}
    .vex-print-contract strong{font-weight:800;}
    .contract-center-title{font-weight:800;text-align:center!important;text-transform:uppercase;margin:6px 0 4px!important;font-size:10pt!important;}
    .contract-intro{text-align:center!important;margin:0 0 4px!important;font-size:9.4pt!important;}
    .contract-box{width:100%;border-collapse:collapse;border:1px solid #000;margin:0 auto 5px;table-layout:fixed;}
    .contract-box td,.contract-box th{border:1px solid #000;padding:2px 4px;vertical-align:middle;text-align:center;font-size:8.45pt;line-height:1.12;color:#111;}
    .contract-box th{font-weight:800;background:#fff;text-transform:uppercase;}
    .contract-company-table{width:88%;margin-bottom:6px;}
    .contract-company-table td{font-weight:400;font-size:8.45pt;line-height:1.14;padding:3px 4px;}
    .contract-data-table td.label{width:20%;font-weight:800;text-align:center;}
    .contract-data-table td{height:4.8mm;}
    .contract-object-title{margin-top:12mm!important;}
    .contract-small-title{margin:0 0 3px!important;font-size:9.2pt!important;}
    .contract-vehicle-table{margin-bottom:8mm;}
    .contract-value-line{text-align:center!important;margin:0 0 5mm!important;font-size:9.4pt!important;}
    .contract-payment-table{width:100%;margin-top:0;}
    .contract-payment-table td,.contract-payment-table th{font-size:8.65pt;height:4.8mm;padding:2px 5px;}
    .contract-payment-table td:first-child{width:50%;font-weight:800;text-align:center;text-transform:uppercase;}
    .contract-payment-table td:last-child{text-align:center;}
    .contract-total-row td{font-weight:800;}
    .vex-contract-page-1 .contract-company-table td{height:5.4mm;}
    .vex-contract-page-1 .contract-data-table td{height:6.1mm;}
    .vex-contract-page-1 .contract-vehicle-table td{height:6.2mm;}
    .vex-contract-page-1 .contract-payment-table td,.vex-contract-page-1 .contract-payment-table th{height:5.9mm;}
    .contract-red-block{color:#f00;font-weight:700;font-style:italic;margin:4mm 8mm 4mm 8mm;}
    .contract-red-block p{color:#f00;font-size:9.7pt;line-height:1.18;margin:1.5px 0;text-align:left;}
    .contract-page-1-red{margin-top:6mm;margin-bottom:3mm;}
    .contract-gastos{text-align:center!important;margin:0 7mm 3.5px!important;font-size:9.6pt!important;line-height:1.16!important;}
    .contract-paragraph-unique{font-size:9.35pt!important;line-height:1.18!important;margin:0 1mm!important;}
    .contract-section-gap{margin-top:5.5mm!important;}
    .vex-contract-page-2 p{font-size:11.7pt;line-height:1.55;margin:8px 0;text-align:left;}
    .vex-contract-page-3 p{font-size:10.4pt;line-height:1.42;margin:6.2px 0;text-align:left;}
    .vex-contract-page-4 p{font-size:10.4pt;line-height:1.42;margin:6.4px 0;text-align:left;}
    .vex-contract-page-2{padding-top:16mm;padding-left:35mm;padding-right:35mm;}
    .vex-contract-page-3{padding-top:15mm;padding-left:32mm;padding-right:32mm;}
    .vex-contract-page-4{padding-top:24mm;padding-left:32mm;padding-right:32mm;}
    .contract-list{margin:5px 0 7mm 15px;padding:0;font-size:10.2pt;line-height:1.34;}
    .contract-list li{margin:3px 0;}
    .contract-final-block{min-height:146mm;}
    .contract-date-line{font-size:10.2pt;font-weight:400;text-align:left;margin-top:10mm;}
    .contract-signature-line{font-size:10pt;font-weight:400;margin-top:12mm;}
    .contract-page-number{position:absolute;left:0;right:0;bottom:6mm;text-align:center!important;font-size:8.2pt!important;margin:0!important;color:#111;}
    .vex-print-repasse .vex-print-content,.vex-print-procuracao .vex-print-content{font-size:10pt;line-height:1.2;padding:9mm 10mm;}
    .vex-print-repasse h1,.vex-print-procuracao h1{font-size:13pt;}
    .vex-print-repasse h2,.vex-print-procuracao h2{font-size:10.5pt;margin-bottom:8px;}
    .vex-print-repasse .vex-print-sheet{width:210mm;min-height:297mm;box-shadow:none;}
    .vex-print-repasse .vex-print-content{padding:12mm 8mm 10mm;font-size:9pt;line-height:1.12;}
    .vex-repasse-doc{width:100%;min-height:268mm;position:relative;color:#000;font-family:Arial,Helvetica,sans-serif;}
    .vex-repasse-header{margin-left:1mm;margin-bottom:13mm;color:#6b7280;font-size:9pt;line-height:1.15;}
    .vex-repasse-brand{font-size:14pt;line-height:1;font-weight:800;letter-spacing:.2px;color:#737373;margin-bottom:1px;}
    .vex-repasse-brand span{color:#f05b55;}
    .vex-repasse-company-line{margin:0;}
    .vex-repasse-title{font-size:14pt!important;line-height:1!important;margin:0 0 14mm!important;text-align:center!important;text-transform:none!important;font-weight:800!important;}
    .vex-repasse-section{margin:0 0 8mm;}
    .vex-repasse-section h2{font-size:10.5pt!important;line-height:1!important;margin:0 0 4mm!important;text-align:left!important;text-transform:none!important;font-weight:800!important;}
    .vex-repasse-icon{display:inline-block;width:15px;font-size:9pt;margin-right:7px;vertical-align:1px;}
    .vex-repasse-box{border:1.6px solid #000;padding:3px;}
    .vex-repasse-box:before{content:"";display:block;border:1.6px solid #000;position:absolute;inset:0;pointer-events:none;}
    .vex-repasse-box{position:relative;}
    .vex-repasse-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:26mm;padding:8px 12px 9px;min-height:27mm;}
    .vex-repasse-proponente .vex-repasse-grid{min-height:16mm;padding-top:8px;padding-bottom:8px;}
    .vex-repasse-field{display:grid;grid-template-columns:72px 1fr;align-items:start;font-size:8.7pt;line-height:1.13;margin:0;white-space:nowrap;}
    .vex-repasse-field strong{font-weight:800;}
    .vex-repasse-field span{display:block;overflow:hidden;text-overflow:clip;}
    .vex-repasse-date{font-size:9pt;margin:8mm 0 6mm!important;display:flex;gap:24px;}
    .vex-repasse-date strong{font-weight:400;}
    .vex-repasse-legal{font-size:9pt;line-height:1.12;margin:0 0 1.5mm!important;}
    .vex-repasse-legal-strong{font-weight:800;}
    .vex-repasse-sale-text{font-size:10.5pt;line-height:1.13;text-transform:uppercase;}
    .vex-repasse-signatures{display:grid;grid-template-columns:1fr 1fr;column-gap:28px;position:absolute;left:0;right:0;bottom:22mm;text-align:center;}
    .vex-repasse-signature div{border-top:1px solid #000;height:1px;margin:0 0 2px;}
    .vex-repasse-signature strong{font-size:10pt;line-height:1;font-weight:800;text-transform:uppercase;}
    .vex-print-procuracao .vex-print-sheet{width:210mm;min-height:297mm;box-shadow:none;}
    .vex-print-procuracao .vex-print-content{padding:0;font-family:Arial,Helvetica,sans-serif;color:#000;}
    .vex-procuracao-doc{width:100%;min-height:297mm;padding:24mm 22mm 18mm;position:relative;font-size:10.2pt;line-height:1.4;color:#000;background:#fff;}
    .vex-procuracao-doc h1{font-size:14.8pt!important;line-height:1.08!important;margin:0 0 10mm!important;text-align:left!important;text-transform:uppercase!important;font-weight:400!important;letter-spacing:0!important;border-left:2px solid #000;padding-left:2px;white-space:nowrap;}
    .vex-procuracao-doc p{font-size:10.2pt;line-height:1.4;margin:0 0 4mm;text-align:left;}
    .vex-procuracao-doc strong{font-weight:800;}
    .vex-procuracao-party{margin:0 0 8mm;}
    .vex-procuracao-outorgado{margin-bottom:9mm;}
    .vex-procuracao-two-col{display:grid;grid-template-columns:1fr 1fr;column-gap:22mm;align-items:start;}
    .vex-procuracao-two-col p{margin-bottom:4mm;}
    .vex-procuracao-powers{margin:0 0 4mm;}
    .vex-procuracao-vehicle{margin:0 0 6mm;}
    .vex-procuracao-vehicle>p{font-weight:800;margin-bottom:2.5mm;}
    .vex-procuracao-vehicle ul{margin:0 0 0 7mm;padding:0;}
    .vex-procuracao-vehicle li{font-size:10.2pt;line-height:1.4;margin:0 0 3mm;padding-left:2mm;}
    .vex-procuracao-legal{margin-top:5mm;}
    .vex-procuracao-legal p{margin-bottom:4.5mm;}
    .vex-procuracao-signature{margin-top:22mm;}
    .vex-procuracao-signature div{border-top:1.6px solid #000;height:1px;margin:0 0 5mm;}
    .vex-procuracao-signature p{font-size:9.8pt;line-height:1.35;margin:0 0 3mm;}
    @media print{body{background:#fff;padding:0;}.vex-print-sheet{width:auto;min-height:auto;margin:0;box-shadow:none;page-break-after:always;}.vex-print-sheet:last-child{page-break-after:auto;}.vex-print-content{padding:0;}button{display:none;}}
  </style></head><body class="vex-print-${escapeHTML(documentType)}"><section class="vex-print-sheet"><main class="vex-print-content">${bodyHtml}</main></section></body></html>`;
}

function getVexDocumentForSale(saleId, type) {
  const sale = sales.find(function(item) { return item.id === saleId; });
  if (!sale) return null;
  const data = buildVexDocumentData(sale);
  const pendencies = getVexDocumentPendencies(type, data);
  if (pendencies.length) {
    alert("Documento incompleto. Faltam: " + pendencies.map(function(item) { return item.label; }).join(", "));
    return null;
  }
  const title = getVexDocumentTitle(type);
  const body = buildVexDocumentHtml(type, data);
  return { sale: sale, data: data, title: title, body: body, html: getVexPrintableDocumentHtml(title, body, type) };
}

function previewVexDocument(saleId, type) {
  const documentData = getVexDocumentForSale(saleId, type);
  if (!documentData) return;
  const win = window.open("", "_blank");
  if (!win) return alert("Permita pop-ups para visualizar o documento.");
  win.document.open();
  win.document.write(documentData.html);
  win.document.close();
}

function printVexDocument(saleId, type) {
  const documentData = getVexDocumentForSale(saleId, type);
  if (!documentData) return;
  const win = window.open("", "_blank");
  if (!win) return alert("Permita pop-ups para imprimir/salvar PDF.");
  win.document.open();
  win.document.write(documentData.html + '<script>window.onload=function(){window.print();}<\/script>');
  win.document.close();
}

function printAllVexDocuments(saleId) {
  const sale = sales.find(function(item) { return item.id === saleId; });
  if (!sale) return;
  const data = buildVexDocumentData(sale);
  const definitions = getVexDocumentDefinitions(sale);
  const bodies = [];
  for (const definition of definitions) {
    const pendencies = getVexDocumentPendencies(definition.type, data);
    if (pendencies.length) {
      alert("Ainda existem pendências em " + definition.title + ".");
      return;
    }
    bodies.push(`<section style="page-break-after:always">${buildVexDocumentHtml(definition.type, data)}</section>`);
  }
  const win = window.open("", "_blank");
  if (!win) return alert("Permita pop-ups para imprimir/salvar PDF.");
  win.document.open();
  win.document.write(getVexPrintableDocumentHtml("Documentos da venda", bodies.join(""), "documents") + '<script>window.onload=function(){window.print();}<\/script>');
  win.document.close();
}

function vexCrc32FromBytes(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function vexStringToUint8Array(str) {
  return new TextEncoder().encode(str);
}

function vexCreateZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const enc = new TextEncoder();
  function u16(n){ return new Uint8Array([n & 255, (n >>> 8) & 255]); }
  function u32(n){ return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]); }
  files.forEach(function(file) {
    const name = enc.encode(file.name);
    const data = vexStringToUint8Array(file.content);
    const crc = vexCrc32FromBytes(data);
    const local = new Blob([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);
    localParts.push(local);
    centralParts.push(new Blob([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));
    offset += 30 + name.length + data.length;
  });
  const centralSize = centralParts.reduce(function(total, blob) { return total + blob.size; }, 0);
  const end = new Blob([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralSize),u32(offset),u16(0)]);
  return new Blob(localParts.concat(centralParts).concat([end]), { type: "application/zip" });
}

function buildVexMinimalDocx(title, bodyHtml) {
  const text = bodyHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .split("\n")
    .map(function(line) { return line.trim(); })
    .filter(Boolean);
  const paragraphs = text.map(function(line) { return `<w:p><w:r><w:t xml:space="preserve">${escapeHTML(line)}</w:t></w:r></w:p>`; }).join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  return vexCreateZip([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", content: documentXml }
  ]);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

function getVexSafeFilename(text) {
  return String(text || "documento").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function downloadVexDocumentDocx(saleId, type) {
  const documentData = getVexDocumentForSale(saleId, type);
  if (!documentData) return;
  const blob = buildVexMinimalDocx(documentData.title, documentData.body);
  downloadBlob(blob, `${getVexSafeFilename(documentData.title)}-${getVexSafeFilename(documentData.data.client.clientName)}.docx`);
}

function downloadAllVexDocuments(saleId) {
  const sale = sales.find(function(item) { return item.id === saleId; });
  if (!sale) return;
  getVexDocumentDefinitions(sale).forEach(function(definition) {
    downloadVexDocumentDocx(saleId, definition.type);
  });
}

function shareVexDocumentWhatsapp(saleId, type) {
  const documentData = getVexDocumentForSale(saleId, type);
  if (!documentData) return;
  const phone = String(documentData.data.client.clientPhone || "").replace(/\D/g, "");
  const message = encodeURIComponent(`Olá, ${documentData.data.client.clientName}. Segue o documento: ${documentData.title}.`);
  window.open(`https://wa.me/${phone ? "55" + phone.replace(/^55/, "") : ""}?text=${message}`, "_blank");
}

function injectVexDocumentEngineStyles() {
  if (document.getElementById("vexDocumentEngineStyles")) return;
  const style = document.createElement("style");
  style.id = "vexDocumentEngineStyles";
  style.textContent = `
    .vex-document-grid{display:grid;gap:16px;margin:18px 0;}
    .vex-document-card{border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:linear-gradient(145deg,rgba(13,18,31,.94),rgba(9,12,21,.94));}
    .vex-document-card.ready{border-color:rgba(34,197,94,.34);} .vex-document-card.pending{border-color:rgba(245,158,11,.34);}
    .vex-document-card-header{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;}
    .vex-document-card-header>span{font-size:28px}.vex-document-card h3{margin:0 0 4px}.vex-document-card p{margin:0;color:var(--vex-muted,#9ca3af);}
    .vex-document-ready{color:#86efac;font-weight:700;margin:10px 0!important;}
    .vex-document-pendencies{background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.25);border-radius:16px;padding:12px;margin:12px 0;}
    .vex-document-pendencies ul{margin:8px 0 0 18px;padding:0}.vex-document-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;}
    .vex-document-generate-all{margin:18px 0;padding:16px;border:1px solid rgba(34,197,94,.28);border-radius:18px;background:rgba(34,197,94,.08);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;}
  `;
  document.head.appendChild(style);
}

injectVexDocumentEngineStyles();

function openVexFormalization(saleId) {
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

  const isClientTransfer = sale.transferType === "Pelo cliente";
  const steps = [
    {
      icon: "CL",
      label: "Cliente",
      description: "Completar comprador e endereco.",
      done: getVexClientCompletion(getVexFormalizationClientData(sale)).complete,
      action: "openVexFormalizationClient"
    },
    {
      icon: "VE",
      label: "Veiculo",
      description: "Conferir dados e completar chassi, renavam, combustivel e cambio.",
      done: getVexVehicleCompletion(getVexFormalizationVehicleData(sale)).complete,
      action: "openVexFormalizationVehicle"
    },
    {
      icon: "$",
      label: "Pagamento",
      description: "Registrar formas de pagamento, transferencia cobrada, IPVA e licenciamento.",
      done: getVexPaymentCompletion(getVexFormalizationPaymentData(sale), sale).complete,
      action: "openVexFormalizationPayment"
    },
    {
      icon: "DOC",
      label: "Repasse/Garantia",
      description: "Definir garantia, repasse, abatimento FIPE e condicao da venda.",
      done: getVexRepasseCompletion(getVexFormalizationRepasseData(sale)).complete,
      action: "openVexFormalizationRepasse"
    },
    {
      icon: "MA",
      label: "Gastos / Material",
      description: "Registrar gastos e material em lista reutilizavel.",
      done: getVexRepasseItems(getVexFormalizationRepasseData(sale)).length > 0,
      action: "openVexFormalizationRepasse"
    },
    {
      icon: "TR",
      label: "Transferencia",
      description: "Definir responsabilidade, procuracao e acompanhar prazo de 30 dias.",
      done: getVexTransferCompletion(getVexFormalizationTransferData(sale)).complete,
      action: "openVexFormalizationTransfer"
    },
    {
      icon: "DR",
      label: "Documentos Recebidos",
      description: "Conferir CNH ou RG, comprovante de endereco e comprovantes de pagamento.",
      done: getVexReceivedDocsCompletion(getVexFormalizationReceivedDocsData(sale)).complete,
      action: "openVexFormalizationReceivedDocs"
    },
    {
      icon: "CM",
      label: "Comunicacao",
      description: "Gerar textos dos grupos Preparacao e Vendas.",
      done: true,
      action: "openVexFormalizationCommunication"
    },
    {
      icon: "DC",
      label: "Documentos",
      description: isClientTransfer ? "Contrato e termo." : "Contrato, termo e procuracao.",
      done: getVexDocumentDefinitions(sale).every(function(definition) { return getVexDocumentPendencies(definition.type, buildVexDocumentData(sale)).length === 0; }),
      action: "openVexFormalizationDocuments"
    }
  ];

  const doneCount = steps.filter(function(step) { return step.done; }).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const formalizationStatus = progress >= 100 ? "Formalizacao concluida" : "Formalizacao em andamento";
  const statusIcon = progress >= 100 ? "OK" : "..";

  drawer.innerHTML = `
    <div class="vex-drawer-backdrop" onclick="closeVexVehicleDrawer()"></div>

    <aside class="vex-drawer-panel vex-formalization-panel">
      <button class="vex-drawer-close" onclick="closeVexVehicleDrawer()" type="button">X</button>

      <section class="vex-drawer-hero vex-formalization-hero">
        <div class="vex-vehicle-icon">FO</div>
        <span class="eyebrow">Formalizacao</span>
        <h2>${escapeHTML(sale.vehicleModel || "Veiculo")} ${escapeHTML(sale.vehicleYear || "")}</h2>
        <p>${escapeHTML(sale.clientName || "Cliente nao informado")}  - ${formatDateToBrazil(sale.saleDate)}</p>

        <div class="vex-formalization-status-pill">
          ${statusIcon} ${escapeHTML(formalizationStatus)}
        </div>

        <div class="vex-formalization-progress">
          <div class="vex-formalization-progress-bar" style="width:${progress}%"></div>
        </div>
        <strong>${doneCount} de ${steps.length} etapas concluidas  - ${progress}%</strong>
      </section>

      <section class="vex-formalization-summary">
        ${renderVexFormalizationSummaryItem("Cliente", sale.clientName)}
        ${renderVexFormalizationSummaryItem("Telefone", sale.clientPhone)}
        ${renderVexFormalizationSummaryItem("Veiculo", `${sale.vehicleModel || ""} ${sale.vehicleYear || ""}`.trim())}
        ${renderVexFormalizationSummaryItem("Placa", sale.vehiclePlate)}
        ${renderVexFormalizationSummaryItem("Valor", sale.saleValue ? formatCurrencyToBrazil(sale.saleValue) : "Nao informado")}
        ${renderVexFormalizationSummaryItem("Transferencia", getVexFormalizationTransferData(sale).responsible)}
      </section>

      <div class="vex-formalization-grid vex-formalization-card-grid">
        ${steps.map(function(step) {
          return `
            <button class="vex-formalization-step ${step.done ? "done" : "pending"}" type="button" onclick="${step.action ? step.action + "('" + sale.id + "')" : "alert('Etapa " + escapeHTML(step.label) + " será liberada nas próximas versões.')"}">
              <span>${step.icon}</span>
              <strong>${escapeHTML(step.label)}</strong>
              <small>${escapeHTML(step.description)}</small>
              <em>${escapeHTML(getVexFormalizationStatus(step))}</em>
            </button>
          `;
        }).join("")}
      </div>

      <div class="vex-detail-item full vex-formalization-note">
        <span>RC2.11</span>
        <strong>Comunicacao Inteligente liberada com mensagens para Grupo Preparacao e Grupo Vendas, visualização e cópia automática.</strong>
      </div>

      <div class="vex-drawer-actions vex-drawer-actions-safe">
        <button class="secondary-button" type="button" onclick="openVexVehicleDrawer('${sale.id}')">Voltar aos detalhes</button>
        <button class="primary-button" type="button" onclick="closeVexVehicleDrawer()">Fechar</button>
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
window.openVexFormalization = openVexFormalization;
window.openVexFormalizationClient = openVexFormalizationClient;
window.saveVexFormalizationClient = saveVexFormalizationClient;
window.openVexFormalizationVehicle = openVexFormalizationVehicle;
window.saveVexFormalizationVehicle = saveVexFormalizationVehicle;
window.openVexFormalizationPayment = openVexFormalizationPayment;
window.saveVexFormalizationPayment = saveVexFormalizationPayment;
window.addVexPaymentMethodRow = addVexPaymentMethodRow;
window.removeVexPaymentMethodRow = removeVexPaymentMethodRow;
window.openVexFormalizationRepasse = openVexFormalizationRepasse;
window.saveVexFormalizationRepasse = saveVexFormalizationRepasse;
window.addVexOperationalItemRow = addVexOperationalItemRow;
window.removeVexOperationalItemRow = removeVexOperationalItemRow;
window.openVexFormalizationTransfer = openVexFormalizationTransfer;
window.saveVexFormalizationTransfer = saveVexFormalizationTransfer;
window.openVexFormalizationTransferPreview = openVexFormalizationTransferPreview;
window.openVexFormalizationReceivedDocs = openVexFormalizationReceivedDocs;
window.openVexFormalizationCommunication = openVexFormalizationCommunication;
window.openVexFormalizationDocuments = openVexFormalizationDocuments;
window.previewVexDocument = previewVexDocument;
window.printVexDocument = printVexDocument;
window.printAllVexDocuments = printAllVexDocuments;
window.downloadVexDocumentDocx = downloadVexDocumentDocx;
window.downloadAllVexDocuments = downloadAllVexDocuments;
window.shareVexDocumentWhatsapp = shareVexDocumentWhatsapp;
window.toggleVexCommunicationPreview = toggleVexCommunicationPreview;
window.copyVexCommunicationMessage = copyVexCommunicationMessage;
window.saveVexFormalizationReceivedDocs = saveVexFormalizationReceivedDocs;
window.startEditSale = startEditSale;
window.cancelSaleEditMode = cancelSaleEditMode;
window.closeVexVehicleDrawer = closeVexVehicleDrawer;



/* =========================================================
   VEX HUB PRO v2.0  - Fase 03 BUILD 02
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
      Preco FIPE / tabela
      <input id="vehicleFipeValue" type="text" placeholder="Ex: R$ 41.990,00" />
    </label>

    <label>
      Versao
      <input id="vehicleVersion" type="text" placeholder="Ex: Completo, LX, GLX, XEI" />
    </label>

    <label>
      Cambio
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

      autofillSaleFromInventoryPlate(plate.value);
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
   VEX HUB PRO v1.0 PREMIUM UI  - Sprint 6
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
    if (eyebrow) eyebrow.textContent = "Catalogo VEX";
    if (title) title.textContent = "Veiculos";
    if (description) description.textContent = "Lista compacta para localizar veiculos rapidamente. Clique em qualquer linha para ver os detalhes completos.";
  }

  const saleSection = document.getElementById("newSaleSection");
  if (saleSection) {
    const title = saleSection.querySelector(".section-header h2");
    const description = saleSection.querySelector(".section-header p");
    if (title) title.textContent = "Nova Venda";
    if (description) description.textContent = "Cadastro organizado por cliente, veiculo, financeiro e entrega.";
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
  return parts.filter(Boolean).join(" - ") || "Veiculo nao informado";
}

function getVexVehicleSmallSpecs(sale) {
  const parts = [];
  if (sale.clientName) parts.push(sale.clientName);
  if (sale.clientPhone) parts.push(sale.clientPhone);
  if (sale.transferType) parts.push(sale.transferType);
  if (sale.saleDate) parts.push(formatDateToBrazil(sale.saleDate));
  return parts.filter(Boolean).join(" - ") || "Informacoes complementares nao informadas";
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
        <strong>Nenhum veiculo vendido ainda.</strong>
        <span>Quando uma venda for salva, o veiculo aparecera aqui em formato de lista compacta.</span>
      </div>
    `;
    historyCounter.textContent = "0 veiculos";
    return true;
  }

  if (filteredSales.length === 0) {
    historyList.className = "vex-premium-list-shell";
    historyList.innerHTML = `
      <div class="vex-s6-empty">
        <strong>Nenhum veiculo encontrado.</strong>
        <span>Limpe os filtros ou tente outro cliente, telefone, veiculo, placa ou status.</span>
      </div>
    `;
    historyCounter.textContent = "0 encontrados";
    return true;
  }

  const totalValue = filteredSales.reduce(function(total, sale) {
    return total + parseSaleCurrencyValue(sale.saleValue);
  }, 0);

  historyCounter.textContent = `${filteredSales.length} de ${sales.length} veiculo(s)`;
  historyList.className = "vex-premium-list-shell";

  historyList.innerHTML = `
    <div class="vex-s6-list-toolbar">
      <div>
        <span>Total filtrado</span>
        <strong>${formatCurrencyToBrazil(totalValue)}</strong>
      </div>
      <small>${filteredSales.length} veiculo(s) na lista</small>
    </div>

    <div class="vex-s6-vehicle-list">
      ${filteredSales.map(function (sale) {
        const statusClass = getVexStatusClass(sale.afterSaleStatus);
        const vehicleLine = getVexVehicleOneLine(sale);
        const subLine = getVexVehicleSmallSpecs(sale);
        const value = formatSaleValuePremium(sale.saleValue);

        return `
          <button class="vex-s6-vehicle-row" type="button" onclick="openVexVehicleDrawer('${sale.id}')" title="${escapeHTML(vehicleLine)}">
            <span class="vex-s6-row-icon">VE</span>

            <span class="vex-s6-row-main">
              <strong>${escapeHTML(vehicleLine)}</strong>
              <small>${escapeHTML(subLine)}</small>
            </span>

            <span class="vex-s6-row-value">${escapeHTML(value)}</span>
            <span class="vex-s6-row-status ${statusClass}">${escapeHTML(sale.afterSaleStatus || "Sem status")}</span>
            <span class="vex-s6-row-arrow">&gt;</span>
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
  if (reportTotalCommission) reportTotalCommission.textContent = formatCurrencyToBrazil(totalCommission);
  if (reportFrankCommission) reportFrankCommission.textContent = formatCurrencyToBrazil(frankCommission);
  if (reportLucasCommission) reportLucasCommission.textContent = formatCurrencyToBrazil(lucasCommission);
  if (reportStoreTransfer) reportStoreTransfer.textContent = storeTransfer;
  if (reportClientTransfer) reportClientTransfer.textContent = clientTransfer;
  if (reportPendingAfterSales) reportPendingAfterSales.textContent = pendingAfterSales;
  if (reportFinishedAfterSales) reportFinishedAfterSales.textContent = finishedAfterSales;

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



    .vex-communication-card .vex-message-preview {
      max-height: 360px;
      overflow: auto;
      white-space: pre-wrap;
      user-select: text;
    }

    .vex-formalization-inline-message.warning,
    .vex-formalization-inline-message.success {
      padding: 14px;
      border-radius: 16px;
      margin: 12px 0;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.88);
    }

    .vex-formalization-inline-message.warning ul {
      margin: 8px 0 6px 18px;
      padding: 0;
    }

    .vex-communication-actions {
      margin-top: 12px;
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
   VEX HUB PRO v1.0 PREMIUM UI  - Sprint 7
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
   VEX HUB PRO v1.0 PREMIUM UI  - Sprint 8
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
    pendenciesSection: "Pend.",
    historySection: "Veiculos",
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
   Sprint 9  - Premium Polish
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
   Nao altera Firebase, initializeApplication, Auth ou Firestore.
========================================================= */
function initializeVexSprint10PerformanceUX() {
  injectVexSprint10Styles();
  enhanceVexSprint10ViewTransitions();
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

    @media (max-width: 760px) {
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
  button.textContent = "UP";
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
   Camada incremental de UX: nao altera Firebase, initialize(), Auth, Firestore ou regras de negócio. */
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
        transform: translateX(48px) !important;
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

/* =========================================================
   VEX HUB PRO  - RC2.01
   Mobile seguro: centralização + menu Mais + Sair no celular
   Escopo: CSS/UX mobile. Nao altera Firebase, Auth, Firestore ou cadastro de venda.
========================================================= */
function initializeVexRC201MobileSafe() {
  injectVexRC201MobileStyles();
  createVexRC201MobileMoreMenu();
  syncVexRC201MobileMoreVisibility();
}

function injectVexRC201MobileStyles() {
  if (document.getElementById("vex-rc2-01-mobile-safe-style")) return;

  const style = document.createElement("style");
  style.id = "vex-rc2-01-mobile-safe-style";
  style.textContent = `
    @media (max-width: 760px) {
      .login-layout {
        width: min(100% - 24px, 430px) !important;
        margin: 0 auto !important;
        display: grid !important;
        justify-items: center !important;
        gap: 18px !important;
      }

      .brand-panel,
      .login-card {
        width: 100% !important;
        max-width: 430px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }

      .brand-panel .vex-s7-logo-signature,
      .authenticity-seal {
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .vex-dashboard-shell {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
      }

      .vex-dashboard-hero {
        display: grid !important;
        grid-template-columns: 1fr !important;
        justify-items: stretch !important;
        align-items: stretch !important;
        gap: 16px !important;
        width: 100% !important;
        text-align: center !important;
      }

      .vex-dashboard-hero > div:first-child {
        width: 100% !important;
        max-width: 100% !important;
        justify-self: stretch !important;
        transform: none !important;
        text-align: center !important;
      }

      .vex-dashboard-hero .vex-kicker,
      #vexGreetingTitle,
      #vexCurrentDate {
        text-align: center !important;
      }

      .vex-brand-card {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        min-height: 112px !important;
        justify-self: stretch !important;
        box-sizing: border-box !important;
      }

      .workspace {
        padding-bottom: calc(122px + env(safe-area-inset-bottom)) !important;
      }

      .sidebar {
        height: 76px !important;
        overflow: visible !important;
      }

      .sidebar-nav {
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        overflow: visible !important;
      }

      .sidebar-nav .nav-item[data-section="profileSection"],
      .sidebar-nav .nav-item[data-section="usersSection"] {
        display: none !important;
      }

      .vex-rc2-mobile-more-button {
        display: grid !important;
      }

      .vex-rc2-mobile-more-button::before {
        content: "�? !important;
        display: block !important;
        font-size: 20px !important;
        line-height: 1 !important;
      }

      .vex-rc2-mobile-more-button::after {
        left: 22% !important;
        right: 22% !important;
      }

      .vex-s8-quick-sale {
        display: none !important;
      }

      .vex-rc2-mobile-more-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9980;
        display: none;
        background: rgba(0, 0, 0, 0.42);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .vex-rc2-mobile-more-backdrop.active {
        display: block;
      }

      .vex-rc2-mobile-more-panel {
        position: fixed;
        left: 12px;
        right: 12px;
        bottom: calc(102px + env(safe-area-inset-bottom));
        z-index: 9981;
        display: none;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 26px;
        background: rgba(8, 8, 8, 0.94);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.54);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .vex-rc2-mobile-more-panel.active {
        display: grid;
        gap: 10px;
        animation: vexRC201PanelIn 160ms ease both;
      }

      .vex-rc2-more-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 4px 2px 8px;
      }

      .vex-rc2-more-header strong {
        color: #fff;
        font-size: 14px;
        letter-spacing: -0.02em;
      }

      .vex-rc2-more-header span {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
      }

      .vex-rc2-more-close {
        width: 36px;
        height: 36px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }

      .vex-rc2-more-list {
        display: grid;
        gap: 8px;
      }

      .vex-rc2-more-item {
        width: 100%;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        background: rgba(255, 255, 255, 0.045);
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 650;
        text-align: left;
      }

      .vex-rc2-more-item.danger {
        border-color: rgba(225, 6, 0, 0.28);
        background: rgba(225, 6, 0, 0.12);
        color: #fff;
      }

      .vex-rc2-more-item small {
        color: rgba(255,255,255,0.48);
        font-size: 12px;
        font-weight: 500;
      }

      @keyframes vexRC201PanelIn {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    }

    @media (min-width: 761px) {
      .vex-rc2-mobile-more-button,
      .vex-rc2-mobile-more-backdrop,
      .vex-rc2-mobile-more-panel {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function createVexRC201MobileMoreMenu() {
  const sidebarNav = document.querySelector(".sidebar-nav");
  if (!sidebarNav) return;

  let moreButton = document.getElementById("vexRC201MobileMoreButton");
  if (!moreButton) {
    moreButton = document.createElement("button");
    moreButton.id = "vexRC201MobileMoreButton";
    moreButton.type = "button";
    moreButton.className = "nav-item vex-rc2-mobile-more-button";
    moreButton.dataset.vexS8Label = "Mais";
    moreButton.setAttribute("aria-label", "Abrir menu mais");
    moreButton.innerHTML = "<span class='sr-only'>Mais</span>";
    sidebarNav.appendChild(moreButton);
  }

  if (!document.getElementById("vexRC201MobileMoreBackdrop")) {
    const backdrop = document.createElement("div");
    backdrop.id = "vexRC201MobileMoreBackdrop";
    backdrop.className = "vex-rc2-mobile-more-backdrop";
    backdrop.addEventListener("click", closeVexRC201MobileMoreMenu);
    document.body.appendChild(backdrop);
  }

  if (!document.getElementById("vexRC201MobileMorePanel")) {
    const panel = document.createElement("div");
    panel.id = "vexRC201MobileMorePanel";
    panel.className = "vex-rc2-mobile-more-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Menu mais");
    document.body.appendChild(panel);
  }

  moreButton.onclick = function () {
    openVexRC201MobileMoreMenu();
  };

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeVexRC201MobileMoreMenu();
    }
  });

  document.querySelectorAll(".nav-item").forEach(function (button) {
    if (button.id === "vexRC201MobileMoreButton") return;
    button.addEventListener("click", function () {
      closeVexRC201MobileMoreMenu();
      syncVexRC201MobileMoreVisibility();
    });
  });
}

function openVexRC201MobileMoreMenu() {
  const panel = document.getElementById("vexRC201MobileMorePanel");
  const backdrop = document.getElementById("vexRC201MobileMoreBackdrop");
  const moreButton = document.getElementById("vexRC201MobileMoreButton");

  if (!panel || !backdrop) return;

  const isAdmin = canManageContent();
  panel.innerHTML = `
    <div class="vex-rc2-more-header">
      <div>
        <strong>Mais opções</strong><br>
        <span>Perfil, administração e saída</span>
      </div>
      <button class="vex-rc2-more-close" type="button" onclick="closeVexRC201MobileMoreMenu()" aria-label="Fechar menu">X</button>
    </div>
    <div class="vex-rc2-more-list">
      <button class="vex-rc2-more-item" type="button" onclick="goToSection('profileSection'); closeVexRC201MobileMoreMenu(); syncVexRC201MobileMoreVisibility();">
        <span>CL Perfil</span><small>Dados da conta</small>
      </button>
      ${isAdmin ? `<button class="vex-rc2-more-item" type="button" onclick="goToSection('usersSection'); closeVexRC201MobileMoreMenu(); syncVexRC201MobileMoreVisibility();"><span>👥 Usuários</span><small>ADM</small></button>` : ""}
      <button class="vex-rc2-more-item" type="button" onclick="goToSection('dashboardSection'); closeVexRC201MobileMoreMenu(); syncVexRC201MobileMoreVisibility();">
        <span>AD Configurações</span><small>Em breve</small>
      </button>
      <button class="vex-rc2-more-item danger" type="button" onclick="closeVexRC201MobileMoreMenu(); logoutUser();">
        <span>🚪 Sair</span><small>Encerrar sessão</small>
      </button>
    </div>
  `;

  panel.classList.add("active");
  backdrop.classList.add("active");
  if (moreButton) moreButton.classList.add("active");
}

function closeVexRC201MobileMoreMenu() {
  const panel = document.getElementById("vexRC201MobileMorePanel");
  const backdrop = document.getElementById("vexRC201MobileMoreBackdrop");
  if (panel) panel.classList.remove("active");
  if (backdrop) backdrop.classList.remove("active");
  syncVexRC201MobileMoreVisibility();
}

function syncVexRC201MobileMoreVisibility() {
  const moreButton = document.getElementById("vexRC201MobileMoreButton");
  if (!moreButton) return;

  const profileActive = document.getElementById("profileSection")?.classList.contains("active");
  const usersActive = document.getElementById("usersSection")?.classList.contains("active");
  const panelActive = document.getElementById("vexRC201MobileMorePanel")?.classList.contains("active");

  moreButton.classList.toggle("active", Boolean(profileActive || usersActive || panelActive));
}

window.openVexRC201MobileMoreMenu = openVexRC201MobileMoreMenu;
window.closeVexRC201MobileMoreMenu = closeVexRC201MobileMoreMenu;
window.syncVexRC201MobileMoreVisibility = syncVexRC201MobileMoreVisibility;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeVexRC201MobileSafe);
} else {
  initializeVexRC201MobileSafe();
}
setTimeout(initializeVexRC201MobileSafe, 350);
setTimeout(initializeVexRC201MobileSafe, 1200);


/* RC2.02 - Relatórios com filtro por mês e comissão detalhada */
function getHistoryMonthFilterValue() {
  const reportsField = document.getElementById("reportsMonthFilter");
  if (reportsField && document.getElementById("reportsSection")?.classList.contains("active")) {
    return reportsField.value || "current";
  }

  const field = document.getElementById("historyMonthFilter");
  return field ? field.value || "all" : "all";
}

function getPeriodLabelByValue(value) {
  if (value === "previous") return "mês passado";
  if (value === "all") return "todos os períodos";
  return "mês atual";
}

function saleMatchesPeriod(sale, period) {
  if (period === "all") return true;

  const date = createDateFromSaleDate(sale.saleDate);
  if (!date) return false;

  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), 1);

  if (period === "previous") {
    target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }

  return date.getMonth() === target.getMonth() && date.getFullYear() === target.getFullYear();
}

function getSalesBySelectedPeriod() {
  const period = getHistoryMonthFilterValue();
  return sales.filter(function (sale) {
    return saleMatchesPeriod(sale, period);
  });
}

function getPeriodLabelByValue(value) {
  if (value === "previous") return "mes passado";
  if (value === "all") return "todos os periodos";
  if (/^\d{4}-\d{2}$/.test(String(value || ""))) {
    const parts = String(value).split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  return "mes atual";
}

function saleMatchesPeriod(sale, period) {
  if (period === "all") return true;

  const date = createDateFromSaleDate(sale.saleDate);
  if (!date) return false;

  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), 1);

  if (period === "previous") {
    target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else if (/^\d{4}-\d{2}$/.test(String(period || ""))) {
    const parts = String(period).split("-");
    target = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  }

  return date.getMonth() === target.getMonth() && date.getFullYear() === target.getFullYear();
}

function getVexSalesMonthOptions() {
  const months = new Map();

  (sales || []).forEach(function(sale) {
    const date = createDateFromSaleDate(sale.saleDate);
    if (!date) return;
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    months.set(value, label.charAt(0).toUpperCase() + label.slice(1));
  });

  return Array.from(months.entries())
    .sort(function(a, b) { return b[0].localeCompare(a[0]); })
    .map(function(entry) {
      return { value: entry[0], label: entry[1] };
    });
}

function syncReportsMonthFilterOptions() {
  const field = document.getElementById("reportsMonthFilter");
  if (!field) return;

  const currentValue = field.value || "current";
  const monthOptions = getVexSalesMonthOptions().map(function(option) {
    return `<option value="${escapeHTML(option.value)}">${escapeHTML(option.label)}</option>`;
  }).join("");

  field.innerHTML = `
    <option value="current">Mes atual</option>
    <option value="previous">Mes passado</option>
    ${monthOptions}
    <option value="all">Todos</option>
  `;

  const values = Array.from(field.options).map(function(option) { return option.value; });
  field.value = values.includes(currentValue) ? currentValue : "current";

  if (field.dataset.vexReportsReady !== "true") {
    field.dataset.vexReportsReady = "true";
    field.addEventListener("change", updateReports);
  }
}

function getFilteredSales() {
  const searchValue = historySearch ? historySearch.value.trim().toLowerCase() : "";
  const statusValue = historyStatusFilter ? historyStatusFilter.value : "";
  const transferValue = historyTransferFilter ? historyTransferFilter.value : "";
  const periodValue = getHistoryMonthFilterValue();

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
    const matchesPeriod = saleMatchesPeriod(sale, periodValue);

    return matchesSearch && matchesStatus && matchesTransfer && matchesPeriod;
  });
}

function updateReports() {
  if (!reportTotalSales) return;

  syncReportsMonthFilterOptions();

  const periodSales = getSalesBySelectedPeriod();
  const totalSales = periodSales.length;
  const totalCommission = getTotalCommissionValue(periodSales);
  const frankCommission = getNamedCommissionValue(periodSales, "frankCommission", 125);
  const lucasCommission = getNamedCommissionValue(periodSales, "lucasCommission", 125);
  const storeTransfer = periodSales.filter(function (sale) { return sale.transferType === "Pela loja"; }).length;
  const clientTransfer = periodSales.filter(function (sale) { return sale.transferType === "Pelo cliente"; }).length;
  const pendingAfterSales = periodSales.filter(function (sale) { return sale.afterSaleStatus !== "Finalizado"; }).length;
  const finishedAfterSales = periodSales.filter(function (sale) { return sale.afterSaleStatus === "Finalizado"; }).length;

  reportTotalSales.textContent = totalSales;
  if (reportTotalCommission) reportTotalCommission.textContent = formatCurrencyToBrazil(totalCommission);
  if (reportFrankCommission) reportFrankCommission.textContent = formatCurrencyToBrazil(frankCommission);
  if (reportLucasCommission) reportLucasCommission.textContent = formatCurrencyToBrazil(lucasCommission);
  if (reportStoreTransfer) reportStoreTransfer.textContent = storeTransfer;
  if (reportClientTransfer) reportClientTransfer.textContent = clientTransfer;
  if (reportPendingAfterSales) reportPendingAfterSales.textContent = pendingAfterSales;
  if (reportFinishedAfterSales) reportFinishedAfterSales.textContent = finishedAfterSales;

  const reportsSection = document.getElementById("reportsSection");
  if (reportsSection) {
    const header = reportsSection.querySelector(".section-header p");
    if (header) {
      header.textContent = `Indicadores executivos filtrados por ${getPeriodLabelByValue(getHistoryMonthFilterValue())}.`;
    }
  }
}

function getNamedCommissionValue(list, field, legacyDefault) {
  return list.reduce(function (total, sale) {
    const value = sale[field];
    if (value === undefined || value === null || value === "") {
      return total + legacyDefault;
    }
    return total + Number(value || 0);
  }, 0);
}

function getTotalCommissionValue(list) {
  return list.reduce(function (total, sale) {
    const value = sale.totalCommission;
    if (value === undefined || value === null || value === "") {
      return total + 250;
    }
    return total + Number(value || 0);
  }, 0);
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();

  const totalSales = sales.length;
  const monthlyCommission = getTotalCommissionValue(currentMonthSales);
  const monthlyFrankCommission = getNamedCommissionValue(currentMonthSales, "frankCommission", 125);
  const monthlyLucasCommission = getNamedCommissionValue(currentMonthSales, "lucasCommission", 125);
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const averageTicket = currentMonthSales.length > 0 ? monthlySoldValue / currentMonthSales.length : 0;
  const pendingAfterSales = sales.filter(function (sale) { return sale.afterSaleStatus !== "Finalizado"; }).length;
  const pendingTransfers = sales.filter(function (sale) {
    return sale.afterSaleStatus === "Transferencia em andamento" || sale.afterSaleStatus === "Aguardando Cliente" || sale.transferType === "Pela loja";
  }).length;

  const commissionGoal = 6000;
  const goalPercent = commissionGoal > 0 ? Math.min((monthlyCommission / commissionGoal) * 100, 100) : 0;
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexGreetingTitle", getGreetingText());
  setTextById("vexCurrentDate", getCurrentDateLabel());
  setTextById("vexMonthlySalesCount", `${currentMonthSales.length} veiculo(s) no mês`);
  setTextById("vexMonthlyCommission", formatCurrencyToBrazil(monthlyCommission));
  setTextById("vexGoalLabel", `Meta: ${formatCurrencyToBrazil(commissionGoal)}`);
  setTextById("vexGoalPercent", `${goalPercent.toFixed(0)}%`);
  setTextById("totalSalesCard", totalSales);
  setTextById("vexMonthlySoldValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexAverageTicket", formatCurrencyToBrazil(averageTicket));
  setTextById("pendingAfterSalesCard", pendingAfterSales);

  const breakdown = document.getElementById("vexCommissionBreakdown");
  if (breakdown) {
    breakdown.innerHTML = `
      <span>Lucas: <strong>${formatCurrencyToBrazil(monthlyLucasCommission)}</strong></span>
      <span>Frank: <strong>${formatCurrencyToBrazil(monthlyFrankCommission)}</strong></span>
    `;
  }

  const goalBar = document.getElementById("vexGoalBar");
  if (goalBar) {
    goalBar.style.width = `${goalPercent}%`;
  }

  renderVexSmartAlerts(pendingAfterSales, pendingTransfers, goalPercent, growth);
  renderVexLatestVehicles();
  renderVexActivityTimeline();
}

(function injectVexRc202Styles() {
  if (document.getElementById("vexRc202Styles")) return;
  const style = document.createElement("style");
  style.id = "vexRc202Styles";
  style.textContent = `
    .vex-commission-breakdown {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: -6px 0 16px;
      color: rgba(255,255,255,0.88);
      font-size: 14px;
      font-weight: 700;
    }

    .vex-commission-breakdown span {
      padding: 8px 10px;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
    }

    .vex-commission-breakdown strong {
      color: #ffffff;
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   VEX HUB PRO  - RC2.03
   Detalhes do veiculo: Editar ADM + Formalizacao inicial
   ========================================================= */
function injectVexRC203DetailsStyles() {
  if (document.getElementById("vex-rc203-details-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vex-rc203-details-styles";
  style.textContent = `
    .vex-drawer-actions-safe {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      align-items: center;
    }

    .vex-drawer-actions-safe .primary-button,
    .vex-drawer-actions-safe .secondary-button,
    .vex-drawer-actions-safe .danger-button {
      width: 100%;
      min-height: 44px;
    }

    .danger-button {
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 14px;
      background: rgba(239, 68, 68, 0.08);
      color: #fecaca;
      font-weight: 800;
      cursor: pointer;
    }

    .danger-button:hover {
      background: rgba(239, 68, 68, 0.16);
    }

    .vex-edit-mode-message {
      text-align: center;
      line-height: 1.5;
    }

    .vex-edit-mode-message .secondary-button {
      margin-top: 10px;
      width: auto;
      padding-inline: 18px;
    }

    .vex-formalization-panel .vex-drawer-hero strong {
      display: inline-flex;
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.82);
    }

    .vex-formalization-progress {
      width: 100%;
      max-width: 360px;
      height: 10px;
      margin: 18px auto 0;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.10);
    }

    .vex-formalization-progress-bar {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, rgba(255,255,255,0.45), rgba(255,255,255,0.9));
    }

    .vex-formalization-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 16px 0;
    }

    .vex-formalization-step {
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 16px;
      padding: 14px;
      text-align: left;
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      display: grid;
      gap: 6px;
      cursor: pointer;
    }

    .vex-formalization-step span {
      font-size: 18px;
    }

    .vex-formalization-step strong {
      font-size: 14px;
    }

    .vex-formalization-step small {
      color: rgba(255, 255, 255, 0.58);
      font-size: 12px;
    }

    .vex-formalization-step.done {
      border-color: rgba(34, 197, 94, 0.35);
      background: rgba(34, 197, 94, 0.08);
    }

    .vex-formalization-step.pending {
      border-color: rgba(245, 158, 11, 0.30);
      background: rgba(245, 158, 11, 0.06);
    }

    .vex-formalization-note {
      margin-top: 12px;
    }

    .vex-formalization-status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.10);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.86);
      font-size: 12px;
      font-weight: 800;
    }

    .vex-formalization-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin: 16px 0;
    }

    .vex-formalization-summary-item {
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: grid;
      gap: 4px;
    }

    .vex-formalization-summary-item span {
      color: rgba(255, 255, 255, 0.52);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
    }

    .vex-formalization-summary-item strong {
      color: #fff;
      font-size: 13px;
      line-height: 1.35;
      word-break: break-word;
    }

    .vex-formalization-step em {
      width: fit-content;
      margin-top: 4px;
      padding: 5px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.72);
      font-size: 11px;
      font-style: normal;
      font-weight: 800;
    }

    @media (max-width: 640px) {
      .vex-formalization-grid,
      .vex-formalization-summary,
      .vex-drawer-actions-safe {
        grid-template-columns: 1fr;
      }

      .vex-drawer-actions-safe .danger-button {
        order: 10;
      }

      .vex-message-preview.is-hidden-mobile-preview {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexRC203DetailsStyles();

/* =========================================================
   RC3.0.13 - Dashboard Clean Loja (override final)
   ========================================================= */
function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexGreetingTitle", getGreetingText());
  setTextById("vexCurrentDate", getCurrentDateLabel());
  setTextById("vexCleanMonthSales", currentMonthSales.length);
  setTextById("vexCleanMonthValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexCleanGrowth", growth === null ? "Novo mes" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`);

  renderVexLatestVehicles();
  renderVexMonthlyGrowthChart();
}

/* =========================================================
   RC3.0.27 - Visual Clean Loja (override final real)
   ========================================================= */
function getVexInventoryAvailableCountClean() {
  if (!Array.isArray(vexInventory)) return 0;
  return vexInventory.filter((item) => !isVexInventorySoldStatus(item.status || "Disponivel")).length;
}

function getVexDaysSinceSale(sale) {
  if (!sale || !sale.saleDate) return 0;
  const date = new Date(sale.saleDate + "T00:00:00");
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function isVexSaleTransferFinished(sale) {
  const status = String((sale && sale.afterSaleStatus) || "").toLowerCase();
  const stage = String(getVexTransferStage(sale) || "").toLowerCase();
  return status.includes("transferido") || status.includes("finalizado") || stage.includes("transferido");
}

function getVexNextTransferChecklistItem(sale) {
  const definitions = typeof getVexTransferChecklistDefinitions === "function" ? getVexTransferChecklistDefinitions(sale) : [];
  const state = typeof getVexTransferChecklistState === "function" ? getVexTransferChecklistState(sale) : {};
  return definitions.find(function(item) { return !state[item.key]; }) || null;
}

function getVexDashboardPendingItems() {
  if (!Array.isArray(sales)) return [];

  return sales
    .filter(function(sale) { return !isVexSaleTransferFinished(sale); })
    .map(function(sale) {
      const days = getVexDaysSinceSale(sale);
      const nextItem = getVexNextTransferChecklistItem(sale);
      const stage = getVexTransferStage(sale);
      const transfer = sale.transferType || "Transferencia nao informada";
      let tone = "normal";
      let label = "Acompanhar";
      let detail = nextItem ? nextItem.label : stage;
      let score = 1;

      if (days >= 25) {
        tone = "critical";
        label = "Prazo critico";
        score = 100 + days;
        detail = `${days} dias desde a venda - ${detail}`;
      } else if (String(stage).toLowerCase().includes("cliente")) {
        tone = "client";
        label = "Aguardando cliente";
        score = 70 + days;
      } else if (String(stage).toLowerCase().includes("despachante") || String(stage).toLowerCase().includes("atpv")) {
        tone = "progress";
        label = "Despachante / ATPV";
        score = 55 + days;
      } else if (nextItem) {
        tone = "pending";
        label = "Pendente";
        score = 35 + days;
      }

      return {
        id: sale.id,
        label: label,
        tone: tone,
        score: score,
        title: `${sale.vehicleModel || "Veiculo"} ${sale.vehicleYear || ""}`.trim(),
        subtitle: `${sale.clientName || "Cliente nao informado"} - ${transfer}`,
        detail: detail,
        date: sale.saleDate ? formatDateToBrazil(sale.saleDate) : "Sem data"
      };
    })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 8);
}

function renderVexPendingBoard() {
  const board = document.getElementById("vexPendingBoard");
  const counter = document.getElementById("vexPendingBoardCount");
  if (!board) return;

  const items = getVexDashboardPendingItems();
  if (counter) counter.textContent = `${items.length} prioridade(s)`;

  if (!items.length) {
    board.innerHTML = `
      <div class="vex-pending-empty">
        <strong>Nenhuma pendencia critica agora.</strong>
        <span>As transferencias em aberto aparecerao aqui automaticamente.</span>
      </div>
    `;
    return;
  }

  board.innerHTML = items.map(function(item) {
    return `
      <button class="vex-pending-item is-${escapeHTML(item.tone)}" type="button" onclick="openVexVehicleDrawer('${escapeHTML(item.id)}')">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.subtitle)}</small>
        <em>${escapeHTML(item.detail)} - ${escapeHTML(item.date)}</em>
      </button>
    `;
  }).join("");
}
function prepareVexDashboardLayout() {
  const dashboardSection = document.getElementById("dashboardSection");
  if (!dashboardSection) return;
  if (dashboardSection.getAttribute("data-vex-dashboard-ready") === "rc3-0-49-premium") return;

  dashboardSection.setAttribute("data-vex-dashboard-ready", "rc3-0-49-premium");
  dashboardSection.innerHTML = `
    <div class="vex-dashboard-minimal vex-dashboard-premium">
      <section class="vex-executive-head" aria-label="Resumo executivo">
        <div>
          <span>VEX HUB PRO</span>
          <h2>Visao executiva da loja</h2>
          <p>Resumo limpo para acompanhar vendas, estoque e evolucao mensal.</p>
        </div>
        <button class="primary-button vex-clean-action" type="button" data-section-target="newSaleSection">Nova venda</button>
      </section>

      <section class="vex-clean-kpis" aria-label="Resumo da loja">
        <article class="vex-clean-kpi">
          <span>Vendidos no mes</span>
          <strong id="vexCleanMonthSales">0</strong>
          <small>veiculos</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Valor vendido</span>
          <strong id="vexCleanMonthValue">R$ 0,00</strong>
          <small>mes atual</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Estoque</span>
          <strong id="vexCleanInventoryCount">0</strong>
          <small>disponiveis</small>
        </article>
        <article class="vex-clean-kpi">
          <span>Crescimento</span>
          <strong id="vexCleanGrowth">0%</strong>
          <small>vs. mes anterior</small>
        </article>
      </section>
<section class="vex-clean-grid">
        <article class="vex-clean-panel vex-clean-panel-main">
          <div class="vex-clean-panel-head">
            <div>
              <span>Ultimas vendas</span>
              <h2>Carros vendidos recentemente</h2>
            </div>
            <button class="ghost-button vex-clean-action" type="button" data-section-target="historySection">Ver todos</button>
          </div>
          <div id="vexLatestVehicles" class="vex-clean-latest-list"></div>
        </article>

        <article class="vex-clean-panel">
          <div class="vex-clean-panel-head">
            <div>
              <span>Evolucao</span>
              <h2>Vendas por mes</h2>
            </div>
            <button class="ghost-button vex-clean-action" type="button" data-section-target="inventorySection">Estoque</button>
          </div>
          <div id="vexMonthlyGrowthChart" class="vex-clean-chart"></div>
        </article>
      </section>
    </div>
  `;

  dashboardSection.querySelectorAll("[data-section-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-section-target");
      if (target) navigateToSection(target);
    });
  });
}

function updateVexDashboardExecutive() {
  prepareVexDashboardLayout();

  const currentMonthSales = getCurrentMonthSales();
  const previousMonthSales = getPreviousMonthSales();
  const monthlySoldValue = getTotalSoldValue(currentMonthSales);
  const previousMonthSoldValue = getTotalSoldValue(previousMonthSales);
  const growth = calculateVexGrowth(monthlySoldValue, previousMonthSoldValue);

  setTextById("vexCleanMonthSales", currentMonthSales.length);
  setTextById("vexCleanMonthValue", formatCurrencyToBrazil(monthlySoldValue));
  setTextById("vexCleanInventoryCount", getVexInventoryAvailableCountClean());
  setTextById("vexCleanGrowth", growth === null ? "Novo mes" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`);

  renderVexLatestVehicles();
  renderVexMonthlyGrowthChart();
}

/* =========================================================
   RC3.0.49 - Acabamento premium visual
   Estoque, dashboard executivo e menu lateral.
   ========================================================= */
function injectVexRC49PremiumStyles() {
  if (document.getElementById("vex-rc49-premium-styles")) return;

  const style = document.createElement("style");
  style.id = "vex-rc49-premium-styles";
  style.textContent = `
    html body #dashboardScreen.screen.active .workspace {
      background: #eef2f7 !important;
    }

    html body #dashboardScreen.screen.active .content-section {
      max-width: 1240px !important;
      margin: 0 auto !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-dashboard-premium {
      display: grid !important;
      gap: 18px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-executive-head {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 18px !important;
      padding: 24px 28px !important;
      border-radius: 2px !important;
      background:
        linear-gradient(90deg, #0a0d12 0%, #17202b 76%, #240202 100%) !important;
      border: 1px solid rgba(217, 4, 4, 0.24) !important;
      box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14) !important;
      color: #ffffff !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-executive-head span {
      display: block !important;
      margin-bottom: 8px !important;
      color: #ef4444 !important;
      font-size: 11px !important;
      font-weight: 950 !important;
      letter-spacing: 0.16em !important;
      text-transform: uppercase !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-executive-head h2 {
      margin: 0 !important;
      color: #ffffff !important;
      font-size: clamp(28px, 3vw, 44px) !important;
      line-height: 0.98 !important;
      font-weight: 950 !important;
      letter-spacing: -0.02em !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-executive-head p {
      max-width: 620px !important;
      margin: 10px 0 0 !important;
      color: #cbd5e1 !important;
      font-size: 14px !important;
      font-weight: 750 !important;
      line-height: 1.45 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpis {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 12px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpi,
    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-panel {
      border-radius: 2px !important;
      background: #ffffff !important;
      border: 1px solid #dbe3ee !important;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08) !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpi {
      min-height: 126px !important;
      padding: 20px 22px !important;
      align-content: space-between !important;
      border-top: 4px solid #d90404 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpi span,
    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-panel-head span {
      color: #667085 !important;
      font-size: 11px !important;
      font-weight: 950 !important;
      letter-spacing: 0.12em !important;
      text-transform: uppercase !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpi strong {
      margin-top: 10px !important;
      color: #0f172a !important;
      font-size: clamp(25px, 2.4vw, 38px) !important;
      line-height: 1 !important;
      font-weight: 950 !important;
      letter-spacing: -0.02em !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpi small {
      color: #475467 !important;
      font-weight: 800 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr) !important;
      gap: 14px !important;
      align-items: stretch !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-panel {
      padding: 22px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-panel-head {
      display: flex !important;
      align-items: flex-start !important;
      justify-content: space-between !important;
      gap: 14px !important;
      margin-bottom: 18px !important;
      padding-bottom: 14px !important;
      border-bottom: 1px solid #e5e7eb !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-panel-head h2 {
      margin: 5px 0 0 !important;
      color: #0f172a !important;
      font-size: 24px !important;
      line-height: 1.05 !important;
      font-weight: 950 !important;
      letter-spacing: -0.01em !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-latest-item {
      display: grid !important;
      grid-template-columns: 52px minmax(0, 1fr) auto !important;
      align-items: center !important;
      gap: 14px !important;
      min-height: 76px !important;
      padding: 12px 14px !important;
      border-radius: 2px !important;
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: none !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-latest-item:hover {
      background: #ffffff !important;
      border-color: rgba(217, 4, 4, 0.34) !important;
      transform: translateY(-1px) !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-car-mark {
      width: 52px !important;
      height: 52px !important;
      border-radius: 2px !important;
      background: #111820 !important;
      color: #ef4444 !important;
      font-size: 16px !important;
      font-weight: 950 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-latest-item strong {
      color: #0f172a !important;
      font-size: 16px !important;
      line-height: 1.15 !important;
      font-weight: 950 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-latest-item small {
      margin-top: 4px !important;
      color: #475467 !important;
      font-size: 12px !important;
      font-weight: 800 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-latest-item em {
      color: #d90404 !important;
      font-size: 15px !important;
      font-style: normal !important;
      font-weight: 950 !important;
      white-space: nowrap !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart {
      min-height: 270px !important;
      align-items: end !important;
      gap: 10px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart-item {
      min-height: 248px !important;
      padding: 10px 8px !important;
      border-radius: 2px !important;
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart-bar-wrap {
      height: 166px !important;
      background: #e5e7eb !important;
      border-radius: 2px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart-bar {
      background: linear-gradient(180deg, #ef4444, #990000) !important;
      border-radius: 2px !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart-item strong {
      margin-top: 10px !important;
      color: #0f172a !important;
      font-size: 18px !important;
      font-weight: 950 !important;
    }

    html body #dashboardScreen.screen.active #dashboardSection .vex-clean-chart-item small {
      color: #475467 !important;
      font-weight: 900 !important;
      text-transform: uppercase !important;
    }

    @media (min-width: 761px) {
      html body #dashboardScreen.screen.active .sidebar {
        width: 292px !important;
        padding: 24px 18px !important;
      }

      html body #dashboardScreen.screen.active .sidebar-brand {
        grid-template-columns: 86px minmax(0, 1fr) !important;
        min-height: 108px !important;
        padding: 18px 12px 20px !important;
      }

      html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small {
        position: relative !important;
        width: 86px !important;
        height: 54px !important;
        display: grid !important;
        place-items: center !important;
        color: transparent !important;
      }

      html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small::before {
        content: "vex" !important;
        color: #ff170f !important;
        font-size: 36px !important;
        line-height: 1 !important;
        font-weight: 950 !important;
        letter-spacing: -0.12em !important;
        text-transform: lowercase !important;
        filter: drop-shadow(0 8px 16px rgba(217, 4, 4, 0.24)) !important;
      }

      html body #dashboardScreen.screen.active .nav-item {
        min-height: 50px !important;
        padding-left: 54px !important;
        font-size: 14px !important;
      }

      html body #dashboardScreen.screen.active .nav-item::before {
        left: 15px !important;
        width: 28px !important;
        height: 28px !important;
        border-radius: 2px !important;
        background: rgba(255, 255, 255, 0.07) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #cbd5e1 !important;
        font-size: 10px !important;
      }

    }

    @media (max-width: 980px) {
      html body #dashboardScreen.screen.active #dashboardSection .vex-clean-kpis,
      html body #dashboardScreen.screen.active #dashboardSection .vex-clean-grid {
        grid-template-columns: 1fr !important;
      }

      html body #dashboardScreen.screen.active #dashboardSection .vex-executive-head {
        align-items: stretch !important;
        flex-direction: column !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexRC49PremiumStyles();

/* =========================================================
   RC3.0.51 - Header do menu sem logo duplicada
   ========================================================= */
function applyVexSidebarSingleBrand() {
  const title = document.querySelector(".sidebar-brand strong");
  const subtitle = document.querySelector(".sidebar-brand span");

  if (title) {
    title.textContent = "HUB PRO";
  }

  if (subtitle) {
    subtitle.textContent = "Sistema interno";
  }
}
applyVexSidebarSingleBrand();
setTimeout(applyVexSidebarSingleBrand, 300);

/* =========================================================
   RC3.0.55 - Correcao de contraste da Formalizacao
   ========================================================= */
function injectVexFormalizationContrastFix() {
  if (document.getElementById("vex-formalization-contrast-fix")) return;

  const style = document.createElement("style");
  style.id = "vex-formalization-contrast-fix";
  style.textContent = `
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero,
    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-hero.vex-formalization-hero {
      background: linear-gradient(135deg, #090b10 0%, #151e28 72%, #280202 100%) !important;
      border: 1px solid rgba(217, 4, 4, 0.28) !important;
      color: #ffffff !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h1,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h2,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h3,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero strong {
      color: #ffffff !important;
      opacity: 1 !important;
      text-shadow: none !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero p {
      color: #d7dee8 !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .eyebrow {
      background: rgba(255, 255, 255, 0.10) !important;
      border-color: rgba(255, 255, 255, 0.18) !important;
      color: #ffffff !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .vex-vehicle-icon {
      background: rgba(217, 4, 4, 0.20) !important;
      border-color: rgba(217, 4, 4, 0.42) !important;
      color: #ffffff !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress {
      background: rgba(255, 255, 255, 0.18) !important;
      border-color: rgba(255, 255, 255, 0.16) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress-bar {
      background: linear-gradient(90deg, #ef4444, #d90404) !important;
    }
  `;

  document.head.appendChild(style);
}

injectVexFormalizationContrastFix();

/* =========================================================
   RC3.0.56 - Cards premium da Formalizacao
   ========================================================= */
function injectVexFormalizationPremiumCards() {
  if (document.getElementById("vex-formalization-premium-cards")) return;

  const style = document.createElement("style");
  style.id = "vex-formalization-premium-cards";
  style.textContent = `
    html body .vex-drawer-root .vex-formalization-panel {
      background:
        linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%) !important;
      color: #0f172a !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero {
      min-height: 224px !important;
      padding: 24px !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      position: relative !important;
      background:
        radial-gradient(circle at 90% 12%, rgba(217, 4, 4, 0.26), transparent 28%),
        linear-gradient(135deg, #07090d 0%, #151d28 62%, #330403 100%) !important;
      box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero::after {
      content: "" !important;
      position: absolute !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      height: 4px !important;
      background: linear-gradient(90deg, #ef4444, #d90404, #7f0000) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero > * {
      position: relative !important;
      z-index: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h2 {
      color: #ffffff !important;
      font-size: clamp(28px, 4.6vw, 42px) !important;
      line-height: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero p,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero > strong {
      color: #dbe4ef !important;
      font-size: 14px !important;
      font-weight: 850 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary {
      gap: 12px !important;
      margin: 16px 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item {
      min-height: 92px !important;
      padding: 16px !important;
      border-radius: 8px !important;
      background:
        linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
      border: 1px solid #dbe3ee !important;
      border-top: 3px solid #d90404 !important;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.09) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item span {
      color: #64748b !important;
      font-size: 10.5px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item strong {
      color: #06101f !important;
      font-size: 15px !important;
      line-height: 1.25 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
      gap: 12px !important;
      margin: 16px 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
      min-height: 166px !important;
      padding: 16px !important;
      border-radius: 8px !important;
      background:
        linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
      border: 1px solid #dbe3ee !important;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.09) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.done {
      background:
        linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%) !important;
      border-color: #86efac !important;
      border-top: 3px solid #22c55e !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.pending {
      background:
        linear-gradient(180deg, #fffbeb 0%, #ffffff 100%) !important;
      border-color: #facc15 !important;
      border-top: 3px solid #f59e0b !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step span {
      width: 38px !important;
      height: 38px !important;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #111820, #263241) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.16) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step strong {
      color: #06101f !important;
      font-size: 16px !important;
      line-height: 1.12 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step small {
      color: #334155 !important;
      font-size: 12.5px !important;
      line-height: 1.35 !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step em {
      border-radius: 999px !important;
      padding: 7px 10px !important;
      font-size: 10px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note {
      border-radius: 8px !important;
      border-left: 4px solid #d90404 !important;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08) !important;
    }

    @media (max-width: 760px) {
      html body .vex-drawer-root .vex-formalization-panel {
        padding: 16px !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero {
        min-height: auto !important;
        padding: 20px !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary,
      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
        grid-template-columns: 1fr !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
        min-height: auto !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexFormalizationPremiumCards();

/* =========================================================
   RC3.0.57 - Formalizacao alinhada ao padrao premium do app
   ========================================================= */
function injectVexFormalizationAppStandard() {
  if (document.getElementById("vex-formalization-app-standard")) return;

  const style = document.createElement("style");
  style.id = "vex-formalization-app-standard";
  style.textContent = `
    html body .vex-drawer-root .vex-formalization-panel {
      width: min(620px, 100vw) !important;
      padding: 10px !important;
      background: #f3f6fa !important;
      color: #06101f !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero,
    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-hero.vex-formalization-hero {
      min-height: auto !important;
      padding: 18px !important;
      border-radius: 8px !important;
      background: #ffffff !important;
      border: 1px solid #d5deea !important;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.10) !important;
      color: #06101f !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero::after {
      content: none !important;
      display: none !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .vex-vehicle-icon {
      width: 48px !important;
      height: 48px !important;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #240405, #111820) !important;
      border: 1px solid rgba(217, 4, 4, 0.28) !important;
      color: #ffffff !important;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.14) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .eyebrow {
      width: fit-content !important;
      min-height: 24px !important;
      padding: 5px 9px !important;
      border-radius: 999px !important;
      background: #f8fafc !important;
      border: 1px solid #cbd5e1 !important;
      color: #334155 !important;
      font-size: 10px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h2 {
      margin: 8px 0 0 !important;
      color: #06101f !important;
      font-size: clamp(22px, 5vw, 32px) !important;
      line-height: 1.04 !important;
      font-weight: 950 !important;
      letter-spacing: -0.02em !important;
      text-transform: uppercase !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero p {
      color: #334155 !important;
      font-size: 12px !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-status-pill {
      margin-top: 8px !important;
      border-radius: 8px !important;
      background: #fff7ed !important;
      border: 1px solid #fdba74 !important;
      color: #7c2d12 !important;
      font-size: 12px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress {
      height: 8px !important;
      margin-top: 10px !important;
      background: #e5e7eb !important;
      border: 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress-bar {
      background: linear-gradient(90deg, #d90404, #970000) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero > strong {
      color: #64748b !important;
      font-size: 12px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
      margin: 10px 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-form-card,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note {
      border-radius: 8px !important;
      background: #ffffff !important;
      border: 1px solid #d5deea !important;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
      color: #06101f !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item {
      min-height: 70px !important;
      padding: 12px !important;
      border-top: 2px solid #d90404 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item span,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-field span {
      color: #475569 !important;
      font-size: 10px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item strong {
      color: #06101f !important;
      font-size: 13px !important;
      line-height: 1.22 !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px !important;
      margin: 10px 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
      min-height: 142px !important;
      padding: 12px !important;
      align-content: start !important;
      border-top: 2px solid #d90404 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.done {
      background: #ffffff !important;
      border-color: #d5deea !important;
      border-top-color: #22c55e !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.pending {
      background: #ffffff !important;
      border-color: #d5deea !important;
      border-top-color: #f59e0b !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step span {
      width: 34px !important;
      height: 34px !important;
      border-radius: 7px !important;
      background: linear-gradient(135deg, #111820, #273241) !important;
      color: #ffffff !important;
      font-size: 15px !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step strong {
      color: #06101f !important;
      font-size: 13px !important;
      line-height: 1.16 !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step small {
      color: #334155 !important;
      font-size: 11.5px !important;
      line-height: 1.25 !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step em {
      margin-top: auto !important;
      border-radius: 999px !important;
      padding: 6px 9px !important;
      background: #dcfce7 !important;
      color: #166534 !important;
      font-size: 9px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.pending em {
      background: #fef3c7 !important;
      color: #854d0e !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note {
      padding: 12px !important;
      border-left: 4px solid #d90404 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note span {
      color: #475569 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note strong {
      color: #06101f !important;
      font-size: 12px !important;
      line-height: 1.25 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
      padding: 10px 0 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe button {
      min-height: 42px !important;
      border-radius: 8px !important;
    }

    @media (max-width: 420px) {
      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary,
      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
        min-height: 136px !important;
        padding: 10px !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step small {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexFormalizationAppStandard();

/* =========================================================
   RC3.0.58 - Formalizacao no padrao premium dark
   ========================================================= */
function injectVexFormalizationDarkPremium() {
  if (document.getElementById("vex-formalization-dark-premium")) return;

  const style = document.createElement("style");
  style.id = "vex-formalization-dark-premium";
  style.textContent = `
    html body .vex-drawer-root .vex-formalization-panel {
      width: min(720px, 100vw) !important;
      padding: 18px !important;
      background:
        radial-gradient(circle at 82% 7%, rgba(217, 4, 4, 0.18), transparent 30%),
        linear-gradient(180deg, #05090f 0%, #071019 100%) !important;
      color: #ffffff !important;
      border-left: 1px solid rgba(255, 255, 255, 0.10) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-close {
      width: 54px !important;
      height: 54px !important;
      border-radius: 999px !important;
      background: #111820 !important;
      color: #ffffff !important;
      border: 1px solid rgba(217, 4, 4, 0.45) !important;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero,
    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-hero.vex-formalization-hero {
      min-height: 300px !important;
      padding: 28px !important;
      display: grid !important;
      align-content: start !important;
      gap: 14px !important;
      position: relative !important;
      overflow: hidden !important;
      border-radius: 18px !important;
      background:
        radial-gradient(circle at 78% 35%, rgba(239, 68, 68, 0.24), transparent 24%),
        radial-gradient(circle at 18% 0%, rgba(217, 4, 4, 0.20), transparent 28%),
        linear-gradient(135deg, #05080d 0%, #111923 62%, #1f0304 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34) !important;
      color: #ffffff !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero::before {
      content: "" !important;
      position: absolute !important;
      right: -32px !important;
      bottom: -24px !important;
      width: 290px !important;
      height: 170px !important;
      opacity: 0.12 !important;
      background:
        linear-gradient(135deg, transparent 12%, rgba(255,255,255,.18) 13%, transparent 14%),
        radial-gradient(ellipse at center, #ffffff 0%, transparent 62%) !important;
      transform: skewX(-12deg) !important;
      pointer-events: none !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero::after {
      content: "" !important;
      position: absolute !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      height: 1px !important;
      background: rgba(255, 255, 255, 0.16) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero > * {
      position: relative !important;
      z-index: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .vex-vehicle-icon {
      width: 86px !important;
      height: 86px !important;
      border-radius: 22px !important;
      background:
        radial-gradient(circle at 25% 12%, rgba(239, 68, 68, 0.46), transparent 34%),
        linear-gradient(135deg, #1a0608, #121923) !important;
      border: 1px solid rgba(217, 4, 4, 0.42) !important;
      color: #ffffff !important;
      box-shadow: 0 18px 34px rgba(0, 0, 0, 0.30) !important;
      font-size: 30px !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero .eyebrow {
      width: fit-content !important;
      min-height: 36px !important;
      padding: 8px 16px !important;
      border-radius: 999px !important;
      background: rgba(217, 4, 4, 0.12) !important;
      border: 1px solid rgba(239, 68, 68, 0.48) !important;
      color: #ffffff !important;
      font-size: 12px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero h2 {
      max-width: 520px !important;
      margin: 4px 0 0 !important;
      color: #ffffff !important;
      font-size: clamp(32px, 7vw, 48px) !important;
      line-height: 0.98 !important;
      font-weight: 950 !important;
      letter-spacing: -0.03em !important;
      text-transform: uppercase !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero p {
      margin: 0 !important;
      color: #aeb8c7 !important;
      font-size: 16px !important;
      line-height: 1.35 !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-status-pill {
      width: fit-content !important;
      min-height: 42px !important;
      margin-top: 6px !important;
      padding: 10px 16px !important;
      border-radius: 10px !important;
      background: linear-gradient(135deg, #d90404, #8f0000) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 16px 28px rgba(217, 4, 4, 0.20) !important;
      font-size: 13px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress {
      height: 8px !important;
      margin-top: 6px !important;
      border-radius: 999px !important;
      background: rgba(255, 255, 255, 0.15) !important;
      border: 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-progress-bar {
      background: linear-gradient(90deg, #ff3b35, #d90404) !important;
      box-shadow: 0 0 20px rgba(217, 4, 4, 0.34) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero > strong {
      color: #dbe4ef !important;
      font-size: 13px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
      margin: 14px 0 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-form-card,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note {
      border-radius: 14px !important;
      background:
        linear-gradient(145deg, rgba(18, 27, 38, 0.96), rgba(8, 15, 24, 0.98)) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 34px rgba(0, 0, 0, 0.22) !important;
      color: #ffffff !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item {
      min-height: 92px !important;
      padding: 16px !important;
      border-left: 2px solid rgba(239, 68, 68, 0.70) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item span,
    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-field span {
      color: #9ca8b8 !important;
      font-size: 11px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary-item strong {
      color: #ffffff !important;
      font-size: 16px !important;
      line-height: 1.25 !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
      min-height: 178px !important;
      padding: 16px !important;
      align-content: start !important;
      gap: 8px !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.done {
      border-color: rgba(34, 197, 94, 0.42) !important;
      background:
        linear-gradient(145deg, rgba(12, 36, 29, 0.96), rgba(8, 16, 24, 0.98)) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.pending {
      border-color: rgba(245, 158, 11, 0.42) !important;
      background:
        linear-gradient(145deg, rgba(42, 27, 8, 0.96), rgba(8, 16, 24, 0.98)) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step span {
      width: 40px !important;
      height: 40px !important;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #171f2b, #080d14) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      font-size: 17px !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step strong {
      color: #ffffff !important;
      font-size: 16px !important;
      line-height: 1.14 !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step small {
      color: #c6cfda !important;
      font-size: 12.5px !important;
      line-height: 1.35 !important;
      font-weight: 800 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step em {
      width: fit-content !important;
      margin-top: auto !important;
      padding: 7px 10px !important;
      border-radius: 999px !important;
      background: rgba(34, 197, 94, 0.16) !important;
      color: #bbf7d0 !important;
      border: 1px solid rgba(34, 197, 94, 0.26) !important;
      font-size: 10px !important;
      font-style: normal !important;
      font-weight: 950 !important;
      letter-spacing: 0.04em !important;
      text-transform: uppercase !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step.pending em {
      background: rgba(245, 158, 11, 0.16) !important;
      color: #fde68a !important;
      border-color: rgba(245, 158, 11, 0.28) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note {
      padding: 16px !important;
      border-left: 3px solid #d90404 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note span {
      color: #9ca8b8 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-formalization-note strong {
      color: #ffffff !important;
      font-size: 13px !important;
      line-height: 1.35 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
      padding: 14px 0 0 !important;
      background: linear-gradient(180deg, rgba(5, 9, 15, 0), #05090f 30%) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe button {
      min-height: 52px !important;
      border-radius: 10px !important;
      font-size: 14px !important;
      font-weight: 950 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe .primary-button {
      background: linear-gradient(135deg, #ff0707, #990000) !important;
      color: #ffffff !important;
      box-shadow: 0 16px 30px rgba(217, 4, 4, 0.20) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel .vex-drawer-actions-safe .secondary-button {
      background: rgba(18, 27, 38, 0.96) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel select,
    html body .vex-drawer-root .vex-formalization-panel .formalPaymentMethodType,
    html body .vex-drawer-root .vex-formalization-panel .formalPaymentMethodValue {
      background-color: #08111b !important;
      background-image: linear-gradient(135deg, #08111b, #0c1724) !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border-color: rgba(255, 255, 255, 0.16) !important;
      text-shadow: 0 0 0 #ffffff !important;
      opacity: 1 !important;
    }

    html body .vex-drawer-root .vex-formalization-panel select option {
      background: #08111b !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
    }

    @media (max-width: 520px) {
      html body .vex-drawer-root .vex-formalization-panel {
        width: 100vw !important;
        padding: 12px !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-hero {
        min-height: auto !important;
        padding: 20px !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-summary,
      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-grid {
        grid-template-columns: 1fr !important;
      }

      html body .vex-drawer-root .vex-formalization-panel .vex-formalization-step {
        min-height: 138px !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexFormalizationDarkPremium();

/* =========================================================
   RC3.0.58 - Detalhes da venda no estilo premium dark
   ========================================================= */
function injectVexVehicleDrawerDarkPremium() {
  if (document.getElementById("vex-vehicle-drawer-dark-premium")) return;

  const style = document.createElement("style");
  style.id = "vex-vehicle-drawer-dark-premium";
  style.textContent = `
    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) {
      width: min(720px, 100vw) !important;
      max-width: 720px !important;
      padding: 18px !important;
      background:
        radial-gradient(circle at 85% 10%, rgba(217, 4, 4, 0.18), transparent 30%),
        linear-gradient(180deg, #05090f 0%, #071019 100%) !important;
      color: #ffffff !important;
      border-left: 1px solid rgba(255, 255, 255, 0.10) !important;
      box-shadow: -32px 0 72px rgba(0, 0, 0, 0.46) !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-close {
      width: 56px !important;
      height: 56px !important;
      border-radius: 999px !important;
      background: #111820 !important;
      color: #ffffff !important;
      border: 1px solid rgba(217, 4, 4, 0.48) !important;
      font-size: 28px !important;
      line-height: 1 !important;
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.32) !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero {
      min-height: 410px !important;
      padding: 28px !important;
      display: grid !important;
      align-content: start !important;
      gap: 14px !important;
      position: relative !important;
      overflow: hidden !important;
      border-radius: 20px !important;
      background:
        radial-gradient(circle at 76% 42%, rgba(239, 68, 68, 0.38), transparent 24%),
        radial-gradient(circle at 17% 0%, rgba(217, 4, 4, 0.20), transparent 28%),
        linear-gradient(90deg, rgba(5, 8, 13, 0.98) 0%, rgba(7, 12, 19, 0.92) 45%, rgba(15, 20, 27, 0.72) 100%),
        linear-gradient(135deg, #05080d 0%, #101821 62%, #210304 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.13) !important;
      box-shadow: 0 24px 58px rgba(0, 0, 0, 0.34) !important;
      color: #ffffff !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero::before {
      content: "" !important;
      position: absolute !important;
      right: -56px !important;
      bottom: 34px !important;
      width: 430px !important;
      height: 220px !important;
      opacity: 0.44 !important;
      background:
        radial-gradient(circle at 20% 82%, rgba(0,0,0,.98) 0 9%, transparent 10%),
        radial-gradient(circle at 78% 82%, rgba(0,0,0,.98) 0 10%, transparent 11%),
        radial-gradient(ellipse at 78% 64%, rgba(255,255,255,.88) 0 5%, transparent 6%),
        radial-gradient(ellipse at 34% 61%, rgba(255,255,255,.34) 0 6%, transparent 7%),
        linear-gradient(167deg, transparent 0 16%, rgba(255,255,255,.70) 17% 18%, transparent 19%),
        linear-gradient(8deg, transparent 0 28%, rgba(255,255,255,.76) 29% 31%, transparent 32%),
        radial-gradient(ellipse at 52% 60%, rgba(8, 10, 13, .98) 0 56%, transparent 57%) !important;
      filter: drop-shadow(0 18px 22px rgba(0,0,0,.72)) !important;
      transform: skewX(-8deg) !important;
      pointer-events: none !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero::after {
      content: "" !important;
      position: absolute !important;
      inset: auto 0 0 0 !important;
      height: 46% !important;
      background:
        linear-gradient(180deg, transparent 0%, rgba(255,255,255,.055) 44%, transparent 45%),
        repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 78px),
        linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, .38) 100%) !important;
      opacity: .55 !important;
      pointer-events: none !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero > * {
      position: relative !important;
      z-index: 2 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-vehicle-icon {
      width: 98px !important;
      height: 98px !important;
      border-radius: 24px !important;
      display: grid !important;
      place-items: center !important;
      background:
        radial-gradient(circle at 25% 12%, rgba(239, 68, 68, 0.48), transparent 34%),
        linear-gradient(135deg, #210609, #101923) !important;
      border: 1px solid rgba(217, 4, 4, 0.44) !important;
      color: #ffffff !important;
      box-shadow: 0 18px 36px rgba(0, 0, 0, 0.34) !important;
      font-size: 34px !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .eyebrow {
      width: fit-content !important;
      min-height: 38px !important;
      padding: 9px 17px !important;
      border-radius: 999px !important;
      background: rgba(217, 4, 4, 0.13) !important;
      border: 1px solid rgba(239, 68, 68, 0.55) !important;
      color: #ffffff !important;
      font-size: 12px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero h2 {
      max-width: 560px !important;
      margin: 8px 0 0 !important;
      color: #ffffff !important;
      font-size: clamp(34px, 7vw, 52px) !important;
      line-height: 0.98 !important;
      font-weight: 950 !important;
      letter-spacing: -0.035em !important;
      text-transform: uppercase !important;
      overflow-wrap: anywhere !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero p {
      margin: 0 !important;
      color: #aeb8c7 !important;
      font-size: 16px !important;
      line-height: 1.35 !important;
      font-weight: 800 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-price {
      width: min(380px, 100%) !important;
      min-height: 86px !important;
      margin-top: 12px !important;
      padding: 18px 22px !important;
      display: grid !important;
      align-content: center !important;
      border-radius: 14px !important;
      background:
        radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.10), transparent 30%),
        linear-gradient(135deg, #d90404, #7c0000) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      box-shadow: 0 20px 34px rgba(217, 4, 4, 0.24) !important;
      font-size: 31px !important;
      line-height: 1 !important;
      font-weight: 950 !important;
      letter-spacing: -0.02em !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-price::before {
      content: "PRECO DE VENDA" !important;
      margin-bottom: 8px !important;
      color: rgba(255, 255, 255, 0.72) !important;
      font-size: 11px !important;
      font-weight: 950 !important;
      letter-spacing: 0.10em !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
      margin: 16px 0 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-item {
      min-height: 84px !important;
      padding: 17px 18px !important;
      display: grid !important;
      align-content: center !important;
      gap: 8px !important;
      border-radius: 14px !important;
      background:
        linear-gradient(145deg, rgba(18, 27, 38, 0.96), rgba(8, 15, 24, 0.98)) !important;
      border: 1px solid rgba(255, 255, 255, 0.13) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 34px rgba(0, 0, 0, 0.20) !important;
      color: #ffffff !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-item.full {
      grid-column: 1 / -1 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-item span {
      color: #9ca8b8 !important;
      font-size: 11px !important;
      font-weight: 950 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-item strong {
      color: #ffffff !important;
      font-size: 17px !important;
      line-height: 1.22 !important;
      font-weight: 950 !important;
      overflow-wrap: anywhere !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .history-inline-select {
      min-height: 48px !important;
      width: 100% !important;
      border-radius: 12px !important;
      background-color: #08111b !important;
      background-image: linear-gradient(135deg, #08111b, #0c1724) !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      padding: 0 14px !important;
      font-size: 15px !important;
      font-weight: 850 !important;
      text-shadow: 0 0 0 #ffffff !important;
      opacity: 1 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .history-inline-select option {
      background: #08111b !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      font-weight: 850 !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px !important;
      padding: 14px 0 0 !important;
      background: linear-gradient(180deg, rgba(5, 9, 15, 0), #05090f 30%) !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe button {
      min-height: 54px !important;
      border-radius: 11px !important;
      font-size: 15px !important;
      font-weight: 950 !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe .primary-button {
      background: linear-gradient(135deg, #ff0707, #990000) !important;
      color: #ffffff !important;
      box-shadow: 0 16px 30px rgba(217, 4, 4, 0.20) !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe .secondary-button {
      background: rgba(18, 27, 38, 0.96) !important;
      color: #ffffff !important;
    }

    html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe .danger-button {
      background: rgba(217, 4, 4, 0.10) !important;
      color: #ff4a4a !important;
      border-color: rgba(239, 68, 68, 0.50) !important;
    }

    @media (max-width: 520px) {
      html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) {
        padding: 12px !important;
      }

      html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-hero {
        min-height: auto !important;
        padding: 20px !important;
      }

      html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-detail-grid,
      html body #vexVehicleDrawerRoot .vex-drawer-panel:not(.vex-formalization-panel):not(.vex-inventory-details-panel) .vex-drawer-actions-safe {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  document.head.appendChild(style);
}

injectVexVehicleDrawerDarkPremium();

/* =========================================================
   RC3.0.61 - Campos da formalizacao sempre legiveis/editaveis
   ========================================================= */
function injectVexFormalizationEditableFieldsFix() {
  if (document.getElementById("vex-formalization-editable-fields-fix")) return;

  const style = document.createElement("style");
  style.id = "vex-formalization-editable-fields-fix";
  style.textContent = `
    html body .vex-drawer-root .vex-formalization-panel input,
    html body .vex-drawer-root .vex-formalization-panel textarea,
    html body .vex-drawer-root .vex-formalization-panel select {
      pointer-events: auto !important;
      opacity: 1 !important;
      background-color: #08111b !important;
      background-image: linear-gradient(135deg, #08111b, #0c1724) !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel input::placeholder,
    html body .vex-drawer-root .vex-formalization-panel textarea::placeholder {
      color: rgba(255, 255, 255, 0.48) !important;
      -webkit-text-fill-color: rgba(255, 255, 255, 0.48) !important;
    }

    html body .vex-drawer-root .vex-formalization-panel select option {
      background: #08111b !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
    }

    html body .vex-drawer-root .vex-formalization-panel input,
    html body .vex-drawer-root .vex-formalization-panel textarea {
      cursor: text !important;
    }

    html body .vex-drawer-root .vex-formalization-panel select {
      cursor: pointer !important;
    }
  `;

  document.head.appendChild(style);
}

injectVexFormalizationEditableFieldsFix();

setTimeout(() => {
  const dashboardSection = document.getElementById("dashboardSection");
  if (dashboardSection) dashboardSection.removeAttribute("data-vex-dashboard-ready");
  if (typeof updateVexDashboardExecutive === "function") updateVexDashboardExecutive();
}, 0);




























/* =========================================================
   RC3.0.81 - Nitidez tipografica final
   Camada final para desktop/PWA sem trocar cores ou fundos.
   ========================================================= */

/* =========================================================
   RC3.0.82 - Visual VEX premium leve
   Reduz peso excessivo das fontes sem alterar regras ou fluxos.
   ========================================================= */
function injectVexRC82PremiumLightTypography() {
  if (document.getElementById("vex-rc82-premium-light-typography")) return;
  const style = document.createElement("style");
  style.id = "vex-rc82-premium-light-typography";
  style.textContent = `
    html body #dashboardScreen.screen.active,
    html body #dashboardScreen.screen.active *:not(img):not(svg),
    html body .vex-drawer-root,
    html body .vex-drawer-root *:not(img):not(svg) {
      font-family: Aptos, "Segoe UI Variable Text", "Segoe UI", Arial, Helvetica, sans-serif !important;
      font-synthesis: none !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-shadow: none !important;
    }

    html body #dashboardScreen.screen.active p,
    html body #dashboardScreen.screen.active small,
    html body #dashboardScreen.screen.active span,
    html body #dashboardScreen.screen.active label,
    html body #dashboardScreen.screen.active input,
    html body #dashboardScreen.screen.active select,
    html body #dashboardScreen.screen.active textarea,
    html body #dashboardScreen.screen.active .inventory-info,
    html body #dashboardScreen.screen.active .history-item,
    html body #dashboardScreen.screen.active .dashboard-card,
    html body #dashboardScreen.screen.active .metric-card,
    html body .vex-drawer-root p,
    html body .vex-drawer-root small,
    html body .vex-drawer-root span,
    html body .vex-drawer-root label,
    html body .vex-drawer-root input,
    html body .vex-drawer-root select,
    html body .vex-drawer-root textarea {
      font-weight: 450 !important;
      letter-spacing: 0 !important;
    }

    html body #dashboardScreen.screen.active h1,
    html body #dashboardScreen.screen.active h2,
    html body #dashboardScreen.screen.active h3,
    html body #dashboardScreen.screen.active h4,
    html body #dashboardScreen.screen.active .section-header h2,
    html body #dashboardScreen.screen.active .vex-executive-head h2,
    html body .vex-drawer-root .vex-drawer-hero h2 {
      font-weight: 760 !important;
      letter-spacing: -0.018em !important;
      line-height: 1.05 !important;
    }

    html body #dashboardScreen.screen.active strong,
    html body #dashboardScreen.screen.active b,
    html body #dashboardScreen.screen.active .inventory-info strong,
    html body #dashboardScreen.screen.active .history-item-title,
    html body #dashboardScreen.screen.active .vex-clean-latest-item strong,
    html body .vex-drawer-root strong,
    html body .vex-drawer-root b,
    html body .vex-drawer-root .vex-detail-item strong {
      font-weight: 700 !important;
      letter-spacing: -0.006em !important;
    }

    html body #dashboardScreen.screen.active .nav-item,
    html body #dashboardScreen.screen.active button,
    html body #dashboardScreen.screen.active .primary-button,
    html body #dashboardScreen.screen.active .secondary-button,
    html body #dashboardScreen.screen.active .ghost-button,
    html body #dashboardScreen.screen.active .danger-button,
    html body .vex-drawer-root button {
      font-weight: 650 !important;
      letter-spacing: 0 !important;
    }

    html body #dashboardScreen.screen.active .eyebrow,
    html body #dashboardScreen.screen.active .counter-pill,
    html body #dashboardScreen.screen.active .inventory-status-pill,
    html body #dashboardScreen.screen.active .vex-transfer-stage-chip,
    html body #dashboardScreen.screen.active .vex-status-pill,
    html body .vex-drawer-root .eyebrow,
    html body .vex-drawer-root .vex-status-pill {
      font-size: 12px !important;
      font-weight: 700 !important;
      letter-spacing: 0.08em !important;
    }

    html body #dashboardScreen.screen.active input,
    html body #dashboardScreen.screen.active select,
    html body #dashboardScreen.screen.active textarea,
    html body .vex-drawer-root input,
    html body .vex-drawer-root select,
    html body .vex-drawer-root textarea {
      font-size: 15px !important;
      font-weight: 450 !important;
    }

    html body #dashboardScreen.screen.active #inventorySection .inventory-info strong {
      font-size: clamp(22px, 1.7vw, 30px) !important;
      line-height: 1.08 !important;
    }

    html body #dashboardScreen.screen.active #historySection .history-item-title,
    html body #dashboardScreen.screen.active #pendenciesSection .vex-pending-item-title {
      font-size: clamp(18px, 1.25vw, 22px) !important;
      line-height: 1.14 !important;
    }
  `;
  document.head.appendChild(style);
}

injectVexRC82PremiumLightTypography();

/* =========================================================
   RC3.0.83 - Menu lateral no padrao VEX oficial
   ========================================================= */
function injectVexRC83OfficialSidebar() {
  if (document.getElementById("vex-rc83-official-sidebar")) return;
  const style = document.createElement("style");
  style.id = "vex-rc83-official-sidebar";
  style.textContent = `
    html body #dashboardScreen.screen.active .sidebar {
      width: 292px !important;
      padding: 28px 18px 20px !important;
      background: radial-gradient(circle at 28% 8%, rgba(217, 4, 4, 0.20), transparent 26%), linear-gradient(180deg, #111820 0%, #071019 58%, #070b12 100%) !important;
      border-right: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 18px 0 44px rgba(15,23,42,0.20) !important;
    }
    html body #dashboardScreen.screen.active .sidebar-brand {
      display: grid !important;
      grid-template-columns: 122px minmax(0, 1fr) !important;
      align-items: center !important;
      gap: 18px !important;
      min-height: 76px !important;
      padding: 6px 14px 30px !important;
      margin: 0 0 24px !important;
      border-bottom: 1px solid rgba(255,255,255,0.10) !important;
      background: transparent !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small {
      width: 118px !important;
      height: 58px !important;
      display: block !important;
      color: transparent !important;
      background: url("assets/logo/vex-logo.png") center / contain no-repeat !important;
      border: 0 !important;
      box-shadow: none !important;
      filter: drop-shadow(0 10px 18px rgba(239,68,68,0.18)) !important;
      overflow: visible !important;
    }
    html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small::before,
    html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small::after,
    html body #dashboardScreen.screen.active .sidebar-brand .brand-badge.small img {
      content: none !important;
      display: none !important;
    }
    html body #dashboardScreen.screen.active .sidebar-brand strong {
      color: #fff !important;
      font-size: 22px !important;
      line-height: 1 !important;
      font-weight: 760 !important;
      letter-spacing: 0.02em !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
    }
    html body #dashboardScreen.screen.active .sidebar-brand span {
      display: block !important;
      margin-top: 10px !important;
      color: #aeb8c7 !important;
      font-size: 13px !important;
      line-height: 1 !important;
      font-weight: 620 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav {
      display: grid !important;
      gap: 10px !important;
      padding: 0 2px !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav::before {
      content: "MENU DO APP" !important;
      display: block !important;
      margin: 0 0 14px 18px !important;
      color: rgba(255,255,255,0.58) !important;
      font-size: 12px !important;
      line-height: 1 !important;
      font-weight: 700 !important;
      letter-spacing: 0.12em !important;
      text-transform: uppercase !important;
    }
    html body #dashboardScreen.screen.active .nav-item {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      min-height: 54px !important;
      width: 100% !important;
      padding: 0 56px 0 68px !important;
      border: 1px solid transparent !important;
      border-radius: 6px !important;
      background: transparent !important;
      color: #f7fafc !important;
      font-size: 16px !important;
      line-height: 1 !important;
      font-weight: 650 !important;
      text-align: left !important;
      box-shadow: none !important;
    }
    html body #dashboardScreen.screen.active .nav-item::before {
      content: "" !important;
      position: absolute !important;
      left: 16px !important;
      top: 50% !important;
      width: 38px !important;
      height: 38px !important;
      transform: translateY(-50%) !important;
      display: block !important;
      border-radius: 6px !important;
      background-color: rgba(255,255,255,0.07) !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      background-size: 22px 22px !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04) !important;
      opacity: 1 !important;
    }
    html body #dashboardScreen.screen.active .nav-item::after {
      position: absolute !important;
      right: 18px !important;
      top: 50% !important;
      min-width: 22px !important;
      height: 22px !important;
      transform: translateY(-50%) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 999px !important;
      background: rgba(255,255,255,0.07) !important;
      color: rgba(255,255,255,0.72) !important;
      font-size: 12px !important;
      font-weight: 650 !important;
      letter-spacing: 0 !important;
    }
    html body #dashboardScreen.screen.active .nav-item[data-section="inventorySection"]::after,
    html body #dashboardScreen.screen.active .nav-item[data-section="pendenciesSection"]::after,
    html body #dashboardScreen.screen.active .nav-item[data-section="usersSection"]::after,
    html body #dashboardScreen.screen.active .nav-item.vex-rc2-mobile-more-button::after { content: "" !important; display: none !important; }
    html body #dashboardScreen.screen.active .nav-item:hover { background: rgba(255,255,255,0.055) !important; color: #fff !important; }
    html body #dashboardScreen.screen.active .nav-item:hover::before { background-color: rgba(255,255,255,0.10) !important; }
    html body #dashboardScreen.screen.active .nav-item.active {
      background: linear-gradient(135deg, #ff1515 0%, #d90404 54%, #a40000 100%) !important;
      color: #fff !important;
      border-color: rgba(255,255,255,0.06) !important;
      box-shadow: 0 16px 32px rgba(217,4,4,0.28) !important;
    }
    html body #dashboardScreen.screen.active .nav-item.active::before { background-color: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.12) !important; }
    html body #dashboardScreen.screen.active .nav-item.active::after { background: rgba(255,255,255,0.12) !important; color: rgba(255,255,255,0.92) !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="dashboardSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m3 11 9-8 9 8"/%3E%3Cpath d="M5 10v10h14V10"/%3E%3Cpath d="M9 20v-6h6v6"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="newSaleSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2.2" stroke-linecap="round"%3E%3Cpath d="M12 5v14M5 12h14"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="inventorySection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M5 17h14l-1.4-5.2A3 3 0 0 0 14.7 10H9.3a3 3 0 0 0-2.9 1.8L5 17Z"/%3E%3Cpath d="M7 17v2M17 17v2M8 14h8"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="pendenciesSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="7" y="3" width="10" height="18" rx="2"/%3E%3Cpath d="M9 7h6M9 11h6M9 15h4"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="historySection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M4 15h16l-1.5-5.5A3 3 0 0 0 15.6 7H8.4a3 3 0 0 0-2.9 2.5L4 15Z"/%3E%3Ccircle cx="7" cy="17" r="2"/%3E%3Ccircle cx="17" cy="17" r="2"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="reportsSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M4 20V10"/%3E%3Cpath d="M10 20V4"/%3E%3Cpath d="M16 20v-7"/%3E%3Cpath d="M22 20H2"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="profileSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="8" r="4"/%3E%3Cpath d="M4 21a8 8 0 0 1 16 0"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item[data-section="usersSection"]::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/%3E%3Ccircle cx="9" cy="7" r="4"/%3E%3Cpath d="M22 21v-2a4 4 0 0 0-3-3.87"/%3E%3Cpath d="M16 3.13a4 4 0 0 1 0 7.75"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .nav-item.vex-rc2-mobile-more-button::before { background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round"%3E%3Ccircle cx="5" cy="12" r="1"/%3E%3Ccircle cx="12" cy="12" r="1"/%3E%3Ccircle cx="19" cy="12" r="1"/%3E%3C/svg%3E') !important; }
    html body #dashboardScreen.screen.active .sidebar-footer { margin-top: auto !important; padding: 16px 10px 0 !important; border-top: 1px solid rgba(255,255,255,0.10) !important; }
    @media (max-width: 760px) {
      html body #dashboardScreen.screen.active .sidebar { width: 100% !important; padding: 8px 8px 10px !important; border-right: 0 !important; }
      html body #dashboardScreen.screen.active .sidebar-brand,
      html body #dashboardScreen.screen.active .sidebar-footer,
      html body #dashboardScreen.screen.active .sidebar-nav::before { display: none !important; }
      html body #dashboardScreen.screen.active .sidebar-nav { display: flex !important; gap: 8px !important; overflow-x: auto !important; padding: 0 !important; }
      html body #dashboardScreen.screen.active .nav-item { min-width: 74px !important; min-height: 58px !important; justify-content: center !important; padding: 34px 8px 7px !important; font-size: 11px !important; text-align: center !important; }
      html body #dashboardScreen.screen.active .nav-item::before { left: 50% !important; top: 7px !important; width: 26px !important; height: 26px !important; background-size: 16px 16px !important; transform: translateX(-50%) !important; }
      html body #dashboardScreen.screen.active .nav-item::after { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

injectVexRC83OfficialSidebar();
setTimeout(injectVexRC83OfficialSidebar, 400);


function cleanupVexRC84SidebarArtifacts() {
  document.querySelectorAll('.nav-item > span, .nav-item [class*="shortcut"], .nav-item [class*="hint"]').forEach(function (node) {
    node.remove();
  });
}

function injectVexRC87SidebarFix() {
  if (document.getElementById('vex-rc87-sidebar-fix')) return;
  const style = document.createElement('style');
  style.id = 'vex-rc87-sidebar-fix';
  style.textContent = `
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item,
    html body #dashboardScreen.screen.active .sidebar .nav-item {
      position: relative !important;
      overflow: hidden !important;
      isolation: isolate !important;
      padding: 0 18px 0 68px !important;
      min-height: 54px !important;
      background-image: none !important;
      color: #f8fafc !important;
      font-size: 16px !important;
      font-weight: 650 !important;
      line-height: 1.05 !important;
      text-shadow: none !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item::before,
    html body #dashboardScreen.screen.active .sidebar .nav-item::before,
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item[data-section]::before,
    html body #dashboardScreen.screen.active .sidebar .nav-item[data-section]::before,
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item[data-section="pendenciesSection"]::before,
    html body #dashboardScreen.screen.active .sidebar .nav-item[data-section="pendenciesSection"]::before {
      content: "" !important;
      color: transparent !important;
      font-size: 0 !important;
      line-height: 0 !important;
      text-indent: -9999px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      z-index: 1 !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item::after,
    html body #dashboardScreen.screen.active .sidebar .nav-item::after,
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item.active::after,
    html body #dashboardScreen.screen.active .sidebar .nav-item.active::after,
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item[data-section]::after,
    html body #dashboardScreen.screen.active .sidebar .nav-item[data-section]::after {
      content: "" !important;
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      transform: none !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item > span,
    html body #dashboardScreen.screen.active .sidebar .nav-item > span,
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item [class*="shortcut"],
    html body #dashboardScreen.screen.active .sidebar .nav-item [class*="shortcut"],
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item [class*="hint"],
    html body #dashboardScreen.screen.active .sidebar .nav-item [class*="hint"] {
      display: none !important;
    }
    html body #dashboardScreen.screen.active .sidebar-nav .nav-item.active {
      background: linear-gradient(135deg, #ff1515 0%, #d90404 54%, #a40000 100%) !important;
      box-shadow: 0 16px 32px rgba(217, 4, 4, 0.28) !important;
    }
    @media (max-width: 760px) {
      html body #dashboardScreen.screen.active .sidebar-nav .nav-item,
      html body #dashboardScreen.screen.active .sidebar .nav-item { padding: 34px 8px 7px !important; }
    }
  `;
  document.head.appendChild(style);
}
/* =========================================================
   RC3.0.84 - Limpeza final do menu lateral
   Remove siglas e atalhos visuais antigos sem alterar navegacao.
   ========================================================= */
injectVexRC87SidebarFix();
cleanupVexRC84SidebarArtifacts();
setTimeout(cleanupVexRC84SidebarArtifacts, 300);
setTimeout(cleanupVexRC84SidebarArtifacts, 1200);






