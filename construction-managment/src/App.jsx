import React, { useState, useEffect } from "react";

export default function App() {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_users");
      let parsedUsers = saved ? JSON.parse(saved) : [];
      parsedUsers = parsedUsers.filter(u => u.phone && u.phone.trim() !== "");
      
      const defaultUsers = [
        { id: 1, fullName: "Shashi", password: "123", designation: "CEO", email: "shashi@gmail.com", phone: "03269790028", profilePic: "" },
        { id: 2, fullName: "Akbar Ali", password: "123", designation: "CEO", email: "akbar@gmail.com", phone: "03131882299", profilePic: "" }
      ];

      defaultUsers.forEach(def => {
        const found = parsedUsers.find(u => u.fullName.toLowerCase() === def.fullName.toLowerCase());
        if (!found) {
          parsedUsers.push(def);
        } else {
          found.phone = def.phone;
        }
      });

      return parsedUsers;
    } catch (e) {
      return [
        { id: 1, fullName: "Shashi", password: "123", designation: "CEO", email: "shashi@gmail.com", phone: "03269790028", profilePic: "" },
        { id: 2, fullName: "Akbar Ali", password: "123", designation: "CEO", email: "akbar@gmail.com", phone: "03131882299", profilePic: "" }
      ];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [isSignup, setIsSignup] = useState(false);
  const [signupData, setSignupData] = useState({ fullName: "", password: "", confirmPassword: "", designation: "", email: "", phone: "", profilePic: "" });
  const [loginData, setLoginData] = useState({ fullName: "", password: "" });

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProjectForLedger, setSelectedProjectForLedger] = useState(null);

  const [passData, setPassData] = useState({ oldPass: "", newPass: "", confirmNewPass: "" });
  const [deletePass, setDeletePass] = useState("");
  const [profileEdit, setProfileEdit] = useState({ fullName: "", designation: "", email: "", phone: "", profilePic: "" });
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [showQuickPanel, setShowQuickPanel] = useState(false);

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_audit_logs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [banks, setBanks] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_banks");
      return saved ? JSON.parse(saved) : [
        { id: 1, name: "Meezan Bank - Main", accountNumber: "PK36MEZN0001234567890", type: "Bank Account", balance: 1250000 },
        { id: 2, name: "Office Cash Drawer", accountNumber: "CASH-01", type: "Cash", balance: 150000 },
      ];
    } catch (e) { return []; }
  });
  const [newBank, setNewBank] = useState({ name: "", accountNumber: "", type: "Bank Account", balance: "" });
  const [editingBankId, setEditingBankId] = useState(null);

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_projects");
      return saved ? JSON.parse(saved) : [
        { id: 1, name: "Road work G SVCS Mangla" },
        { id: 2, name: "DHA site" },
        { id: 3, name: "Tank factory HIT" },
        { id: 4, name: "Madina Plaza Renovation" },
        { id: 5, name: "Rooftop Cafe Setup" },
      ];
    } catch (e) { return []; }
  });
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("construction_transactions");
      return saved ? JSON.parse(saved) : [
        { id: 1, user: "Akbar Ali", type: "Fund In", project: "Road work G SVCS Mangla", bank: "Meezan Bank - Main", amount: 1000000, date: "2026-09-01", desc: "Initial Advance" },
        { id: 2, user: "Akbar Ali", type: "Expense", project: "Tank factory HIT", bank: "Office Cash Drawer", amount: 13600, date: "2026-09-02", desc: "Tiles and wall panel samples" },
      ];
    } catch (e) { return []; }
  });

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPerformingUndoRedo, setIsPerformingUndoRedo] = useState(false);

  const [quickEntryMode, setQuickEntryMode] = useState("single");
  const [quickEntry, setQuickEntry] = useState({ type: "Fund In", project: "", bank: "", amount: "", date: new Date().toISOString().split('T')[0], desc: "" });
  const [bulkExcelInput, setBulkExcelInput] = useState({ project: "", type: "Expense", bank: "", rawText: "" });

  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [selectedBankIds, setSelectedBankIds] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedAuditIds, setSelectedAuditIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (history.length === 0) {
      const initialState = { transactions, banks, projects, auditLogs, users };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, []);

  const recordHistory = (newTransactions, newBanks, newProjects, newAuditLogs, newUsers) => {
    if (isPerformingUndoRedo) return;
    const newState = { 
      transactions: newTransactions, 
      banks: newBanks, 
      projects: newProjects, 
      auditLogs: newAuditLogs, 
      users: newUsers 
    };
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newState);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setIsPerformingUndoRedo(true);
      const targetState = history[historyIndex - 1];
      setTransactions(targetState.transactions);
      setBanks(targetState.banks);
      setProjects(targetState.projects);
      setAuditLogs(targetState.auditLogs);
      setUsers(targetState.users);
      setHistoryIndex(historyIndex - 1);
      setMessage("↩️ Undo performed successfully.");
      setTimeout(() => setIsPerformingUndoRedo(false), 50);
    } else {
      setMessage("Nothing to undo!");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setIsPerformingUndoRedo(true);
      const targetState = history[historyIndex + 1];
      setTransactions(targetState.transactions);
      setBanks(targetState.banks);
      setProjects(targetState.projects);
      setAuditLogs(targetState.auditLogs);
      setUsers(targetState.users);
      setHistoryIndex(historyIndex + 1);
      setMessage("🔁 Redo performed successfully.");
      setTimeout(() => setIsPerformingUndoRedo(false), 50);
    } else {
      setMessage("Nothing to redo!");
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("construction_users", JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem("construction_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("construction_current_user");
      }
      localStorage.setItem("construction_audit_logs", JSON.stringify(auditLogs));
      localStorage.setItem("construction_banks", JSON.stringify(banks));
      localStorage.setItem("construction_projects", JSON.stringify(projects));
      localStorage.setItem("construction_transactions", JSON.stringify(transactions));
    } catch (err) {
      console.error("Storage limit exceeded or error:", err);
    }
  }, [users, currentUser, auditLogs, banks, projects, transactions]);

  useEffect(() => {
    if (currentUser) {
      setProfileEdit({ 
        fullName: currentUser.fullName || "", 
        designation: currentUser.designation || "", 
        email: currentUser.email || "", 
        phone: currentUser.phone || "", 
        profilePic: currentUser.profilePic || "" 
      });
    }
  }, [currentUser]);

  const handleImageUpload = (e, targetType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        if (targetType === "signup") {
          setSignupData(prev => ({ ...prev, profilePic: dataUrl }));
        } else if (targetType === "profile") {
          setProfileEdit(prev => ({ ...prev, profilePic: dataUrl }));
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const logAction = (action, updatedTxs = transactions, updatedBanks = banks, updatedProjects = projects, updatedAudits = auditLogs, updatedUsers = users) => {
    const newLog = { id: Date.now(), user: currentUser ? currentUser.fullName : "System", action, time: new Date().toLocaleString() };
    const newAudits = [newLog, ...updatedAudits];
    setAuditLogs(newAudits);
    recordHistory(updatedTxs, updatedBanks, updatedProjects, newAudits, updatedUsers);
  };

  // Multi-sheet XML Spreadsheet Export
  const exportAllToMultiSheetExcel = () => {
    const escapeXml = (str) => {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const createWorksheetXML = (sheetName, dataArray) => {
      if (!dataArray || dataArray.length === 0) {
        return `<Worksheet ss:Name="${escapeXml(sheetName)}"><Table><Row><Cell><Data ss:Type="String">No Data</Data></Cell></Row></Table></Worksheet>`;
      }
      const keys = Object.keys(dataArray[0]);
      let xml = `<Worksheet ss:Name="${escapeXml(sheetName)}"><Table>`;
      
      // Header Row
      xml += `<Row>`;
      keys.forEach(key => {
        xml += `<Cell><Data ss:Type="String">${escapeXml(key.toUpperCase())}</Data></Cell>`;
      });
      xml += `</Row>`;

      // Data Rows
      dataArray.forEach(item => {
        xml += `<Row>`;
        keys.forEach(key => {
          let val = item[key];
          let type = "String";
          if (typeof val === "number") {
            type = "Number";
          } else {
            val = val !== undefined && val !== null ? String(val) : "";
          }
          xml += `<Cell><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>`;
        });
        xml += `</Row>`;
      });

      xml += `</Table></Worksheet>`;
      return xml;
    };

    const dashboardData = [
      { Metric: "Total Fund In", Value: totalFundIn },
      { Metric: "Total Expenses", Value: totalExpense },
      { Metric: "Net Balance", Value: netBalance }
    ];

    const sheets = [
      { name: "Dashboard", data: dashboardData },
      { name: "Banks_Cash", data: banks },
      { name: "Projects", data: projects },
      { name: "Transactions", data: userTransactions },
      { name: "Audit_Logs", data: auditLogs }
    ];

    let workbookXML = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`;
    sheets.forEach(s => {
      workbookXML += createWorksheetXML(s.name, s.data);
    });
    workbookXML += `</Workbook>`;

    const blob = new Blob([workbookXML], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Akbar_Ali_Co_Complete_Ledger.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage("Multi-sheet Excel workbook exported successfully!");
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const tx = { id: Date.now(), user: currentUser.fullName, ...quickEntry, amount: Number(quickEntry.amount) };
    const updatedTxs = [tx, ...transactions];
    setTransactions(updatedTxs);

    let updatedBanks = [...banks];
    if (tx.bank) {
      updatedBanks = updatedBanks.map(b => {
        if (b.name === tx.bank) {
          // Fund In adds to balance, Expense deducts automatically
          return { ...b, balance: tx.type === "Fund In" ? b.balance + tx.amount : b.balance - tx.amount };
        }
        return b;
      });
      setBanks(updatedBanks);
    }

    setQuickEntry({ type: "Fund In", project: "", bank: "", amount: "", date: new Date().toISOString().split('T')[0], desc: "" });
    setShowQuickPanel(false);
    setMessage("Transaction recorded and bank balance updated automatically!");
    logAction(`Added ${tx.type} of Rs. ${tx.amount} for project ${tx.project}`, updatedTxs, updatedBanks);
  };

  const handleBulkExcelPaste = (e) => {
    e.preventDefault();
    if (!bulkExcelInput.project) {
      setMessage("Please select a project for the pasted entries!");
      return;
    }
    if (!bulkExcelInput.rawText.trim()) {
      setMessage("Please paste data from Excel into the text area!");
      return;
    }

    const lines = bulkExcelInput.rawText.split(/\r\n|\n/).filter(l => l.trim() !== "");
    let newTxs = [];
    let totalAddedAmount = 0;

    lines.forEach(line => {
      const cols = line.split(/\t|,/).map(c => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length >= 3) {
        let dateVal = cols[0];
        let descVal = cols[1];
        let amountValStr = cols[2];

        let cleanAmount = Number(String(amountValStr).replace(/[^0-9.-]+/g, "")) || 0;
        
        if (cleanAmount === 0 && cols.length >= 3) {
          cleanAmount = Number(String(cols[cols.length - 1]).replace(/[^0-9.-]+/g, "")) || 0;
        }

        if (cleanAmount > 0) {
          newTxs.push({
            id: Date.now() + Math.random(),
            user: currentUser.fullName,
            type: bulkExcelInput.type,
            project: bulkExcelInput.project,
            bank: bulkExcelInput.bank,
            amount: cleanAmount,
            date: dateVal || new Date().toISOString().split('T')[0],
            desc: descVal || "Excel Bulk Entry"
          });
          totalAddedAmount += cleanAmount;
        }
      }
    });

    if (newTxs.length === 0) {
      setMessage("Could not parse rows properly. Ensure rows have Date, Description, and Amount separated by tabs (from Excel).");
      return;
    }

    const updatedTxs = [...newTxs, ...transactions];
    setTransactions(updatedTxs);

    let updatedBanks = [...banks];
    if (bulkExcelInput.bank && totalAddedAmount > 0) {
      updatedBanks = updatedBanks.map(b => {
        if (b.name === bulkExcelInput.bank) {
          return { 
            ...b, 
            balance: bulkExcelInput.type === "Fund In" ? b.balance + totalAddedAmount : b.balance - totalAddedAmount 
          };
        }
        return b;
      });
      setBanks(updatedBanks);
    }

    setBulkExcelInput({ project: "", type: "Expense", bank: "", rawText: "" });
    setShowQuickPanel(false);
    setMessage(`Successfully added ${newTxs.length} entries and updated bank balance!`);
    logAction(`Bulk pasted ${newTxs.length} entries for project ${bulkExcelInput.project}`, updatedTxs, updatedBanks);
  };

  const handleDeleteTransaction = (id) => {
    const targetTx = transactions.find(t => t.id === id);
    if (!targetTx) return;

    if (window.confirm("Are you sure you want to delete this entry? Bank balances will adjust back accordingly.")) {
      let updatedBanks = [...banks];
      if (targetTx.bank) {
        updatedBanks = updatedBanks.map(b => {
          if (b.name === targetTx.bank) {
            const revertedBalance = targetTx.type === "Fund In" ? b.balance - targetTx.amount : b.balance + targetTx.amount;
            return { ...b, balance: revertedBalance };
          }
          return b;
        });
        setBanks(updatedBanks);
      }

      const updatedTxs = transactions.filter(t => t.id !== id);
      setTransactions(updatedTxs);
      setSelectedTxIds(selectedTxIds.filter(i => i !== id));
      setMessage("Entry successfully deleted and bank balance reverted.");
      logAction(`Deleted entry of Rs. ${targetTx.amount} for project ${targetTx.project}`, updatedTxs, updatedBanks);
    }
  };

  const handleBulkDeleteTransactions = () => {
    if (selectedTxIds.length === 0) {
      setMessage("No entries selected for deletion!");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTxIds.length} selected entries? Bank balances will adjust accordingly.`)) {
      let updatedBanks = [...banks];
      
      selectedTxIds.forEach(id => {
        const targetTx = transactions.find(t => t.id === id);
        if (targetTx && targetTx.bank) {
          updatedBanks = updatedBanks.map(b => {
            if (b.name === targetTx.bank) {
              const revertedBalance = targetTx.type === "Fund In" ? b.balance - targetTx.amount : b.balance + targetTx.amount;
              return { ...b, balance: revertedBalance };
            }
            return b;
          });
        }
      });

      setBanks(updatedBanks);
      const updatedTxs = transactions.filter(t => !selectedTxIds.includes(t.id));
      setTransactions(updatedTxs);
      logAction(`Deleted ${selectedTxIds.length} selected entries in bulk`, updatedTxs, updatedBanks);
      setSelectedTxIds([]);
      setMessage(`Successfully deleted ${selectedTxIds.length} selected entries.`);
    }
  };

  const handleBulkDeleteBanks = () => {
    if (selectedBankIds.length === 0) {
      setMessage("No bank accounts selected!");
      return;
    }
    if (window.confirm(`Delete ${selectedBankIds.length} selected bank accounts?`)) {
      const updatedBanks = banks.filter(b => !selectedBankIds.includes(b.id));
      setBanks(updatedBanks);
      logAction(`Deleted ${selectedBankIds.length} bank accounts in bulk`, transactions, updatedBanks);
      setSelectedBankIds([]);
      setMessage("Selected bank accounts deleted.");
    }
  };

  const handleBulkDeleteProjects = () => {
    if (selectedProjectIds.length === 0) {
      setMessage("No projects selected!");
      return;
    }
    if (window.confirm(`Delete ${selectedProjectIds.length} selected projects?`)) {
      const updatedProjects = projects.filter(p => !selectedProjectIds.includes(p.id));
      setProjects(updatedProjects);
      logAction(`Deleted ${selectedProjectIds.length} projects in bulk`, transactions, banks, updatedProjects);
      setSelectedProjectIds([]);
      setMessage("Selected projects deleted.");
    }
  };

  const handleBulkDeleteAudits = () => {
    if (selectedAuditIds.length === 0) {
      setMessage("No audit logs selected!");
      return;
    }
    if (window.confirm(`Delete ${selectedAuditIds.length} selected audit logs?`)) {
      const updatedAudits = auditLogs.filter(l => !selectedAuditIds.includes(l.id));
      setAuditLogs(updatedAudits);
      logAction(`Deleted ${selectedAuditIds.length} audit logs`, transactions, banks, projects, updatedAudits);
      setSelectedAuditIds([]);
      setMessage("Selected audit logs deleted.");
    }
  };

  const handleBulkDeleteUsers = () => {
    if (selectedUserIds.length === 0) {
      setMessage("No employees selected!");
      return;
    }
    if (window.confirm(`Delete ${selectedUserIds.length} selected employee accounts?`)) {
      const updatedUsers = users.filter(u => !selectedUserIds.includes(u.id) && u.id !== currentUser.id);
      setUsers(updatedUsers);
      logAction(`Deleted ${selectedUserIds.length} employee accounts`, transactions, banks, projects, auditLogs, updatedUsers);
      setSelectedUserIds([]);
      setMessage("Selected employees deleted.");
    }
  };

  const toggleSelectAll = (currentList, selectedList, setSelectedList) => {
    const currentIds = currentList.map(item => item.id);
    const allSelected = currentIds.every(id => selectedList.includes(id));
    if (allSelected) {
      setSelectedList(selectedList.filter(id => !currentIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedList, ...currentIds]));
      setSelectedList(combined);
    }
  };

  const toggleSelectOne = (id, selectedList, setSelectedList) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter(i => i !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) { setMessage("Passwords do not match!"); return; }
    if (!signupData.phone || signupData.phone.trim() === "") { setMessage("Mobile number is mandatory for signup!"); return; }
    
    const nameExists = users.find((u) => u.fullName.toLowerCase() === signupData.fullName.toLowerCase());
    if (nameExists) { setMessage("Account with this name already exists!"); return; }

    const phoneExists = users.find((u) => u.phone === signupData.phone.trim());
    if (phoneExists) { setMessage("This phone number is already registered with another account!"); return; }

    const newUser = {
      id: Date.now(),
      fullName: signupData.fullName,
      password: signupData.password,
      designation: signupData.designation || "Employee",
      email: signupData.email,
      phone: signupData.phone.trim(),
      profilePic: signupData.profilePic
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setActiveTab("overview");
    setMessage("Account created successfully!");
    logAction("Registered new account", transactions, banks, projects, auditLogs, updatedUsers);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.fullName.toLowerCase() === loginData.fullName.toLowerCase() && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setActiveTab("overview");
      setMessage("");
      logAction("Logged into the system");
    } else {
      setMessage("Invalid Name or Password!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("construction_current_user");
    setCurrentUser(null);
    setLoginData({ fullName: "", password: "" });
    setMessage("");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passData.oldPass !== currentUser.password) { setMessage("Incorrect old password!"); return; }
    if (passData.newPass !== passData.confirmNewPass) { setMessage("New passwords do not match!"); return; }
    const updatedUsers = users.map((u) => u.id === currentUser.id ? { ...u, password: passData.newPass } : u);
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: passData.newPass });
    setPassData({ oldPass: "", newPass: "", confirmNewPass: "" });
    setMessage("Password updated successfully!");
    logAction("Changed password", transactions, banks, projects, auditLogs, updatedUsers);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!profileEdit.phone || profileEdit.phone.trim() === "") { setMessage("Mobile number cannot be empty!"); return; }

    const phoneConflict = users.find((u) => u.phone === profileEdit.phone.trim() && u.id !== currentUser.id);
    if (phoneConflict) { setMessage("This phone number is already used by another account!"); return; }

    const updatedUser = { 
      ...currentUser, 
      fullName: profileEdit.fullName,
      designation: profileEdit.designation,
      email: profileEdit.email,
      phone: profileEdit.phone.trim(),
      profilePic: profileEdit.profilePic 
    };

    const updatedUsers = users.map((u) => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    setMessage("Profile fully updated successfully!");
    logAction("Updated profile details", transactions, banks, projects, auditLogs, updatedUsers);
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deletePass !== currentUser.password) {
      setMessage("Incorrect password! Account deletion failed.");
      return;
    }

    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      const updatedUsers = users.filter(u => u.id !== currentUser.id);
      setUsers(updatedUsers);
      logAction(`Deleted account for ${currentUser.fullName}`, transactions, banks, projects, auditLogs, updatedUsers);
      handleLogout();
    }
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    let updatedBanks = [...banks];
    if (editingBankId) {
      // Manual balance override / edit support
      updatedBanks = updatedBanks.map(b => b.id === editingBankId ? { ...b, ...newBank, balance: Number(newBank.balance) } : b);
      logAction(`Manually adjusted / updated bank: ${newBank.name} (Balance: ${newBank.balance})`, transactions, updatedBanks);
      setEditingBankId(null);
    } else {
      const b = { id: Date.now(), ...newBank, balance: Number(newBank.balance) || 0 };
      updatedBanks = [...banks, b];
      logAction(`Added new bank/cash account: ${b.name} (${b.accountNumber})`, transactions, updatedBanks);
    }
    setBanks(updatedBanks);
    setNewBank({ name: "", accountNumber: "", type: "Bank Account", balance: "" });
    setMessage("Bank account and balance saved successfully!");
  };

  const handleDeleteBank = (id) => {
    const updatedBanks = banks.filter(b => b.id !== id);
    setBanks(updatedBanks);
    logAction("Deleted a bank account", transactions, updatedBanks);
    setMessage("Bank account deleted.");
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    let updatedProjects = [...projects];
    if (editingProjectId) {
      updatedProjects = updatedProjects.map(p => p.id === editingProjectId ? { ...p, name: newProjectName } : p);
      logAction(`Updated project name: ${newProjectName}`, transactions, banks, updatedProjects);
      setEditingProjectId(null);
    } else {
      const p = { id: Date.now(), name: newProjectName };
      updatedProjects = [...projects, p];
      logAction(`Added new project: ${p.name}`, transactions, banks, updatedProjects);
    }
    setProjects(updatedProjects);
    setNewProjectName("");
    setMessage("Project saved successfully!");
  };

  const handleDeleteProject = (id) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    logAction("Deleted a project", transactions, banks, updatedProjects);
    setMessage("Project deleted.");
  };

  const isCEO = currentUser && currentUser.designation && currentUser.designation.toLowerCase().includes("ceo");
  const userTransactions = isCEO ? transactions : transactions.filter(t => t.user === currentUser?.fullName);

  const totalFundIn = userTransactions.filter(t => t.type === "Fund In").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = userTransactions.filter(t => t.type === "Expense").reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalFundIn - totalExpense;

  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
            <h2 style={{ margin: 0, color: "#14532d" }}>Akbar Ali & Co</h2>
            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: isOnline ? "#dcfce7" : "#fee2e2", color: isOnline ? "#15803d" : "#dc2626", fontWeight: "bold" }}>
              {isOnline ? "🟢 Online" : "🔴 Offline Mode"}
            </span>
          </div>
          <p style={{ color: "#166534", marginBottom: "15px", fontSize: "12px" }}>Account & Project Finance System</p>
          {message && <p style={styles.errorMessage}>{message}</p>}

          {isSignup ? (
            <form onSubmit={handleSignup} style={styles.form}>
              <input type="text" placeholder="Full Name (Required)*" value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} required style={styles.input} />
              <input type="password" placeholder="Password (Required)*" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required style={styles.input} />
              <input type="password" placeholder="Confirm Password (Required)*" value={signupData.confirmPassword} onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })} required style={styles.input} />
              <input type="text" placeholder="Designation (e.g. CEO, Accountant)" value={signupData.designation} onChange={(e) => setSignupData({ ...signupData, designation: e.target.value })} style={styles.input} />
              <input type="email" placeholder="Email (Optional)" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} style={styles.input} />
              <input type="text" placeholder="Mobile Number (Required)*" value={signupData.phone} onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} required style={styles.input} />
              
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#14532d", marginTop: "4px" }}>Upload Profile Picture:</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "signup")} style={styles.input} />
              {signupData.profilePic && <p style={{ fontSize: "11px", color: "green", margin: 0 }}>✓ Image loaded successfully</p>}

              <button type="submit" style={styles.primaryButton}>Sign Up</button>
              <p style={styles.switchText}>Already registered? <span style={styles.link} onClick={() => { setIsSignup(false); setMessage(""); }}>Login</span></p>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={styles.form}>
              <input type="text" placeholder="Full Name (e.g. Shashi or Akbar Ali)" value={loginData.fullName} onChange={(e) => setLoginData({ ...loginData, fullName: e.target.value })} required style={styles.input} />
              <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required style={styles.input} />
              <button type="submit" style={styles.primaryButton}>Login</button>
              <p style={styles.switchText}>Don't have an account? <span style={styles.link} onClick={() => { setIsSignup(true); setMessage(""); }}>Sign Up</span></p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarProfile}>
          <img 
            src={currentUser.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} 
            alt="Profile" 
            style={styles.avatarImg} 
          />
          <div>
            <h3 style={{ color: "#f0fdf4", fontSize: "15px", margin: 0 }}>{currentUser.fullName}</h3>
            <p style={{ fontSize: "11px", color: "#86efac", margin: "2px 0 0 0" }}>{currentUser.designation || "Employee"}</p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {isCEO && <span style={styles.ceoBadge}>CEO Mode</span>}
          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: isOnline ? "#15803d" : "#b91c1c", color: "#fff", fontWeight: "bold" }}>
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </span>
        </div>

        <hr style={{ borderColor: "#166534", margin: "10px 0" }} />
        
        <button style={activeTab === "overview" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("overview"); setSelectedProjectForLedger(null); }}>Dashboard</button>
        <button style={activeTab === "banks" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("banks"); setSelectedProjectForLedger(null); }}>Bank Accounts & Cash</button>
        <button style={activeTab === "projects" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("projects"); setSelectedProjectForLedger(null); }}>Projects & Categories</button>
        <button style={activeTab === "transactions" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("transactions"); setSelectedProjectForLedger(null); }}>Fund In / Transactions</button>
        <button style={activeTab === "reports" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("reports"); setSelectedProjectForLedger(null); }}>Reports</button>
        <button style={activeTab === "audit" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("audit"); setSelectedProjectForLedger(null); }}>Audit Log</button>
        
        {isCEO && (
          <button style={activeTab === "employees" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("employees"); setSelectedProjectForLedger(null); }}>Employees Directory</button>
        )}

        <button style={activeTab === "profile" ? styles.activeNavBtn : styles.navBtn} onClick={() => { setActiveTab("profile"); setSelectedProjectForLedger(null); }}>My Profile</button>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topHeaderBar}>
          <div>
            <h2 style={{ margin: 0, color: "#14532d", fontSize: "20px" }}>{currentUser.fullName} — {currentUser.designation || "Employee"}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#166534" }}>{isCEO ? "Akbar Ali & Co (CEO Full Access)" : `Personal Entries (${currentUser.fullName})`}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={exportAllToMultiSheetExcel} style={styles.excelBtn}>📥 Export All to Excel (Multi-Sheet)</button>
            <button onClick={() => setShowQuickPanel(!showQuickPanel)} style={styles.topAddBtn}>
              {showQuickPanel ? "✕ Close Panel" : "+ Add Entry"}
            </button>
          </div>
        </div>

        {showQuickPanel && (
          <div style={styles.quickPanel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, color: "#14532d" }}>Add New Entry (Auto-deducts from Selected Bank)</h4>
              <div style={{ display: "flex", gap: "5px" }}>
                <button 
                  type="button" 
                  onClick={() => setQuickEntryMode("single")} 
                  style={{ padding: "5px 10px", fontSize: "12px", background: quickEntryMode === "single" ? "#15803d" : "#e5e7eb", color: quickEntryMode === "single" ? "#fff" : "#374151", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Single Entry
                </button>
                <button 
                  type="button" 
                  onClick={() => setQuickEntryMode("excel")} 
                  style={{ padding: "5px 10px", fontSize: "12px", background: quickEntryMode === "excel" ? "#1e40af" : "#e5e7eb", color: quickEntryMode === "excel" ? "#fff" : "#374151", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  📋 Paste from Excel
                </button>
              </div>
            </div>

            {quickEntryMode === "single" ? (
              <form onSubmit={handleAddTransaction} style={styles.quickForm}>
                <select value={quickEntry.type} onChange={(e) => setQuickEntry({ ...quickEntry, type: e.target.value })} style={styles.quickInput}>
                  <option value="Fund In">Fund In (+)</option>
                  <option value="Expense">Expense (-)</option>
                </select>
                <select value={quickEntry.project} onChange={(e) => setQuickEntry({ ...quickEntry, project: e.target.value })} required style={styles.quickInput}>
                  <option value="">Select Project*</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <select value={quickEntry.bank} onChange={(e) => setQuickEntry({ ...quickEntry, bank: e.target.value })} required style={styles.quickInput}>
                  <option value="">Select Bank / Cash Account*</option>
                  {banks.map(b => <option key={b.id} value={b.name}>{b.name} (Bal: {b.balance.toLocaleString()})</option>)}
                </select>
                <input type="number" placeholder="Amount (PKR)*" value={quickEntry.amount} onChange={(e) => setQuickEntry({ ...quickEntry, amount: e.target.value })} required style={styles.quickInput} />
                <input type="date" value={quickEntry.date} onChange={(e) => setQuickEntry({ ...quickEntry, date: e.target.value })} required style={styles.quickInput} />
                <input type="text" placeholder="Description / Remarks" value={quickEntry.desc} onChange={(e) => setQuickEntry({ ...quickEntry, desc: e.target.value })} style={styles.quickInput} />
                <button type="submit" style={styles.quickSubmitBtn}>Save Entry</button>
              </form>
            ) : (
              <form onSubmit={handleBulkExcelPaste} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "12px", color: "#166534", margin: 0 }}>
                  Select Project, Type and Bank below, then copy multiple rows from Excel (containing <strong>Date, Description, Amount</strong>) and paste them:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <select value={bulkExcelInput.project} onChange={(e) => setBulkExcelInput({ ...bulkExcelInput, project: e.target.value })} required style={styles.input}>
                    <option value="">Select Project*</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                  <select value={bulkExcelInput.type} onChange={(e) => setBulkExcelInput({ ...bulkExcelInput, type: e.target.value })} style={styles.input}>
                    <option value="Expense">Expense (-)</option>
                    <option value="Fund In">Fund In (+)</option>
                  </select>
                  <select value={bulkExcelInput.bank} onChange={(e) => setBulkExcelInput({ ...bulkExcelInput, bank: e.target.value })} required style={styles.input}>
                    <option value="">Select Bank Account*</option>
                    {banks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <textarea 
                  rows="5" 
                  placeholder="Paste cells copied from Excel here..." 
                  value={bulkExcelInput.rawText} 
                  onChange={(e) => setBulkExcelInput({ ...bulkExcelInput, rawText: e.target.value })} 
                  required 
                  style={{ ...styles.input, fontFamily: "monospace" }}
                />
                <button type="submit" style={{ ...styles.primaryButton, backgroundColor: "#1e40af" }}>Import Pasted Excel Rows</button>
              </form>
            )}
          </div>
        )}

        {message && <div style={styles.alertBox}>{message}</div>}

        {activeTab === "overview" && (
          <div>
            <h2>Dashboard Overview</h2>
            <div style={styles.cardGrid}>
              <div style={styles.statCard}>
                <h3>Total Fund In</h3>
                <p style={{ ...styles.statNumber, color: "#16a34a" }}>Rs. {totalFundIn.toLocaleString()}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Total Expenses</h3>
                <p style={{ ...styles.statNumber, color: "#dc2626" }}>Rs. {totalExpense.toLocaleString()}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Net Balance</h3>
                <p style={{ ...styles.statNumber, color: netBalance >= 0 ? "#15803d" : "red" }}>Rs. {netBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "banks" && (
          <div>
            <h2>Bank Accounts & Cash Management (With Account # & Manual Adjust)</h2>
            <form onSubmit={handleSaveBank} style={styles.addForm}>
              <h4>{editingBankId ? "Edit / Manually Adjust Bank or Cash Balance" : "Add New Bank Account / Cash Drawer"}</h4>
              <div style={styles.formRow}>
                <input type="text" placeholder="Account Name (e.g. Meezan Bank)" value={newBank.name} onChange={(e) => setNewBank({ ...newBank, name: e.target.value })} required style={styles.input} />
                <input type="text" placeholder="Account Number (e.g. PK36... or CASH-01)" value={newBank.accountNumber} onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })} required style={styles.input} />
                <select value={newBank.type} onChange={(e) => setNewBank({ ...newBank, type: e.target.value })} style={styles.input}>
                  <option value="Bank Account">Bank Account</option>
                  <option value="Cash">Cash Drawer</option>
                </select>
                <input type="number" placeholder="Current Balance (Manually Adjustable)" value={newBank.balance} onChange={(e) => setNewBank({ ...newBank, balance: e.target.value })} required style={styles.input} />
              </div>
              <button type="submit" style={styles.primaryButton}>{editingBankId ? "Update / Override Balance" : "Add Bank Account"}</button>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0 5px 0" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#14532d" }}>Registered Accounts List</h3>
              {selectedBankIds.length > 0 && (
                <button onClick={handleBulkDeleteBanks} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                  🗑️ Delete Selected Banks ({selectedBankIds.length})
                </button>
              )}
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, width: "30px" }}>
                    <input 
                      type="checkbox" 
                      checked={banks.length > 0 && banks.every(b => selectedBankIds.includes(b.id))} 
                      onChange={() => toggleSelectAll(banks, selectedBankIds, setSelectedBankIds)} 
                    />
                  </th>
                  <th style={styles.th}>Bank / Drawer Name</th>
                  <th style={styles.th}>Account Number</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Current Balance</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks.map(b => (
                  <tr key={b.id} style={{ background: selectedBankIds.includes(b.id) ? "#f0fdf4" : "transparent" }}>
                    <td style={styles.td}>
                      <input 
                        type="checkbox" 
                        checked={selectedBankIds.includes(b.id)} 
                        onChange={() => toggleSelectOne(b.id, selectedBankIds, setSelectedBankIds)} 
                      />
                    </td>
                    <td style={styles.td}><strong>{b.name}</strong></td>
                    <td style={styles.td}><code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>{b.accountNumber || "N/A"}</code></td>
                    <td style={styles.td}>{b.type}</td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: "#166534" }}>Rs. {b.balance.toLocaleString()}</td>
                    <td style={styles.td}>
                      <button onClick={() => { setNewBank(b); setEditingBankId(b.id); }} style={styles.editBtn}>Manual Adjust</button>
                      <button onClick={() => handleDeleteBank(b.id)} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "projects" && !selectedProjectForLedger && (
          <div>
            <h2>Projects Management</h2>
            <p style={{ fontSize: "12px", color: "#166534", margin: "4px 0 10px 0" }}>💡 Double-click any project row below to open its ledger.</p>
            
            <div style={{ display: "flex", gap: "10px", margin: "10px 0", justifyContent: "space-between", alignItems: "center" }}>
              {selectedProjectIds.length > 0 && (
                <button onClick={handleBulkDeleteProjects} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                  🗑️ Delete Selected Projects ({selectedProjectIds.length})
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProject} style={styles.addForm}>
              <h4>{editingProjectId ? "Edit Project Name" : "Add New Project"}</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" placeholder="Project Name (e.g. hobsss)" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required style={{ ...styles.input, flex: 1 }} />
                <button type="submit" style={styles.primaryButton}>{editingProjectId ? "Update Project" : "Add Project"}</button>
              </div>
            </form>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, width: "30px" }}>
                    <input 
                      type="checkbox" 
                      checked={projects.length > 0 && projects.every(p => selectedProjectIds.includes(p.id))} 
                      onChange={() => toggleSelectAll(projects, selectedProjectIds, setSelectedProjectIds)} 
                    />
                  </th>
                  <th style={styles.th}>Project Name</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr 
                    key={p.id} 
                    onDoubleClick={() => setSelectedProjectForLedger(p.name)}
                    style={{ background: selectedProjectIds.includes(p.id) ? "#f0fdf4" : "transparent", cursor: "pointer" }}
                    title="Double-click to view ledger"
                  >
                    <td style={styles.td}>
                      <input 
                        type="checkbox" 
                        checked={selectedProjectIds.includes(p.id)} 
                        onChange={() => toggleSelectOne(p.id, selectedProjectIds, setSelectedProjectIds)} 
                      />
                    </td>
                    <td style={{ ...styles.td, fontSize: "14px" }}><strong>{p.name}</strong></td>
                    <td style={styles.td}>
                      <button onClick={(e) => { e.stopPropagation(); setNewProjectName(p.name); setEditingProjectId(p.id); }} style={styles.editBtn}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "projects" && selectedProjectForLedger && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2>Project Ledger: <span style={{ color: "#15803d" }}>{selectedProjectForLedger}</span></h2>
              <button onClick={() => setSelectedProjectForLedger(null)} style={styles.backBtn}>← Back to Projects List</button>
            </div>

            {(() => {
              const projTxs = userTransactions.filter(t => t.project === selectedProjectForLedger);
              const pIn = projTxs.filter(t => t.type === "Fund In").reduce((acc, c) => acc + c.amount, 0);
              const pExp = projTxs.filter(t => t.type === "Expense").reduce((acc, c) => acc + c.amount, 0);
              const pNet = pIn - pExp;

              return (
                <div>
                  <div style={styles.cardGrid}>
                    <div style={styles.statCard}>
                      <h3>Total Project Income</h3>
                      <p style={{ ...styles.statNumber, color: "#16a34a" }}>Rs. {pIn.toLocaleString()}</p>
                    </div>
                    <div style={styles.statCard}>
                      <h3>Project Expenses</h3>
                      <p style={{ ...styles.statNumber, color: "#dc2626" }}>Rs. {pExp.toLocaleString()}</p>
                    </div>
                    <div style={styles.statCard}>
                      <h3>Project Net Balance</h3>
                      <p style={{ ...styles.statNumber, color: pNet >= 0 ? "#15803d" : "red" }}>Rs. {pNet.toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", margin: "15px 0 10px 0", alignItems: "center", justifyContent: "flex-end" }}>
                    {selectedTxIds.length > 0 && (
                      <button onClick={handleBulkDeleteTransactions} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                        🗑️ Delete Selected ({selectedTxIds.length}) Entries
                      </button>
                    )}
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tr}>
                        <th style={{ ...styles.th, width: "30px" }}>
                          <input 
                            type="checkbox" 
                            checked={projTxs.length > 0 && projTxs.every(t => selectedTxIds.includes(t.id))} 
                            onChange={() => toggleSelectAll(projTxs, selectedTxIds, setSelectedTxIds)} 
                          />
                        </th>
                        <th style={styles.th}>Entered By</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Bank Account</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projTxs.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#666" }}>No transactions found for this project.</td>
                        </tr>
                      ) : (
                        projTxs.map(t => (
                          <tr key={t.id} style={{ background: selectedTxIds.includes(t.id) ? "#f0fdf4" : "transparent" }}>
                            <td style={styles.td}>
                              <input 
                                type="checkbox" 
                                checked={selectedTxIds.includes(t.id)} 
                                onChange={() => toggleSelectOne(t.id, selectedTxIds, setSelectedTxIds)} 
                              />
                            </td>
                            <td style={styles.td}>{t.user}</td>
                            <td style={{ ...styles.td, color: t.type === "Fund In" ? "green" : "red", fontWeight: "bold" }}>{t.type}</td>
                            <td style={styles.td}>{t.bank || <span style={{ color: "#999", fontStyle: "italic" }}>—</span>}</td>
                            <td style={styles.td}>Rs. {t.amount.toLocaleString()}</td>
                            <td style={styles.td}>{t.date}</td>
                            <td style={styles.td}>{t.desc}</td>
                            <td style={styles.td}>
                              <button onClick={() => handleDeleteTransaction(t.id)} style={styles.deleteBtn}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2>Fund In & Expense Transactions Ledger</h2>
            <p style={{ color: "#166534", fontSize: "13px" }}>{isCEO ? "Showing all employee transactions:" : "Showing only your recorded transactions:"}</p>
            
            <div style={{ display: "flex", gap: "10px", margin: "10px 0", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
              {selectedTxIds.length > 0 && (
                <button onClick={handleBulkDeleteTransactions} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                  🗑️ Delete Selected ({selectedTxIds.length}) Entries
                </button>
              )}
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, width: "30px" }}>
                    <input 
                      type="checkbox" 
                      checked={userTransactions.length > 0 && userTransactions.every(t => selectedTxIds.includes(t.id))} 
                      onChange={() => toggleSelectAll(userTransactions, selectedTxIds, setSelectedTxIds)} 
                    />
                  </th>
                  <th style={styles.th}>Entered By</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Bank Account</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#666" }}>No transactions found.</td>
                  </tr>
                ) : (
                  userTransactions.map(t => (
                    <tr key={t.id} style={{ background: selectedTxIds.includes(t.id) ? "#f0fdf4" : "transparent" }}>
                      <td style={styles.td}>
                        <input 
                          type="checkbox" 
                          checked={selectedTxIds.includes(t.id)} 
                          onChange={() => toggleSelectOne(t.id, selectedTxIds, setSelectedTxIds)} 
                        />
                      </td>
                      <td style={styles.td}>{t.user}</td>
                      <td style={{ ...styles.td, color: t.type === "Fund In" ? "green" : "red", fontWeight: "bold" }}>{t.type}</td>
                      <td style={styles.td}>{t.project}</td>
                      <td style={styles.td}>{t.bank || <span style={{ color: "#999", fontStyle: "italic" }}>—</span>}</td>
                      <td style={styles.td}>Rs. {t.amount.toLocaleString()}</td>
                      <td style={styles.td}>{t.date}</td>
                      <td style={styles.td}>{t.desc}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteTransaction(t.id)} style={styles.deleteBtn}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h2>Financial Reports & Project Summaries</h2>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={styles.th}>Project Name</th>
                  <th style={styles.th}>Total Fund In</th>
                  <th style={styles.th}>Total Expenses</th>
                  <th style={styles.th}>Net Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const pIn = userTransactions.filter(t => t.project === p.name && t.type === "Fund In").reduce((acc, c) => acc + c.amount, 0);
                  const pExp = userTransactions.filter(t => t.project === p.name && t.type === "Expense").reduce((acc, c) => acc + c.amount, 0);
                  const net = pIn - pExp;
                  return (
                    <tr key={p.id}>
                      <td style={styles.td}><strong>{p.name}</strong></td>
                      <td style={{ ...styles.td, color: "green" }}>Rs. {pIn.toLocaleString()}</td>
                      <td style={{ ...styles.td, color: "red" }}>Rs. {pExp.toLocaleString()}</td>
                      <td style={{ ...styles.td, color: net >= 0 ? "green" : "red", fontWeight: "bold" }}>Rs. {net.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>System Audit Log</h2>
              {selectedAuditIds.length > 0 && (
                <button onClick={handleBulkDeleteAudits} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                  🗑️ Delete Selected Logs ({selectedAuditIds.length})
                </button>
              )}
            </div>

            <div style={{ marginTop: "10px" }}>
              {auditLogs.map(l => (
                <div key={l.id} style={{ ...styles.auditItem, display: "flex", alignItems: "center", gap: "10px", background: selectedAuditIds.includes(l.id) ? "#f0fdf4" : "#ffffff" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedAuditIds.includes(l.id)} 
                    onChange={() => toggleSelectOne(l.id, selectedAuditIds, setSelectedAuditIds)} 
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{l.user}</strong> — {l.action} <span style={{ float: "right", color: "#166534", fontSize: "12px" }}>{l.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "employees" && isCEO && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Employees Directory (CEO Control)</h2>
              {selectedUserIds.length > 0 && (
                <button onClick={handleBulkDeleteUsers} style={{ ...styles.deleteBtn, backgroundColor: "#b91c1c", fontWeight: "bold" }}>
                  🗑️ Delete Selected Employees ({selectedUserIds.length})
                </button>
              )}
            </div>

            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, width: "30px" }}>
                    <input 
                      type="checkbox" 
                      checked={users.length > 0 && users.every(u => selectedUserIds.includes(u.id))} 
                      onChange={() => toggleSelectAll(users, selectedUserIds, setSelectedUserIds)} 
                    />
                  </th>
                  <th style={styles.th}>Avatar</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Designation</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Mobile Number</th>
                  <th style={styles.th}>Password</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ background: selectedUserIds.includes(u.id) ? "#f0fdf4" : "transparent" }}>
                    <td style={styles.td}>
                      <input 
                        type="checkbox" 
                        disabled={u.id === currentUser.id}
                        checked={selectedUserIds.includes(u.id)} 
                        onChange={() => toggleSelectOne(u.id, selectedUserIds, setSelectedUserIds)} 
                      />
                    </td>
                    <td style={styles.td}>
                      <img src={u.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} alt="avatar" style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
                    </td>
                    <td style={styles.td}><strong>{u.fullName}</strong></td>
                    <td style={styles.td}>{u.designation || "N/A"}</td>
                    <td style={styles.td}>{u.email || "N/A"}</td>
                    <td style={styles.td}><strong>{u.phone}</strong></td>
                    <td style={styles.td}><code style={{ background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>{u.password}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ maxWidth: "600px" }}>
            <h2>My Profile & Fully Editable Details</h2>
            <div style={styles.profileCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                <img src={currentUser.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} alt="Profile" style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2px solid #16a34a" }} />
                <div>
                  <h3 style={{ margin: 0, color: "#14532d" }}>{currentUser.fullName}</h3>
                  <p style={{ margin: "2px 0", color: "#166534" }}>{currentUser.designation || "Employee"}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Full Name:</label>
                <input type="text" value={profileEdit.fullName} onChange={(e) => setProfileEdit({ ...profileEdit, fullName: e.target.value })} required style={styles.input} />
                
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Designation:</label>
                <input type="text" value={profileEdit.designation} onChange={(e) => setProfileEdit({ ...profileEdit, designation: e.target.value })} style={styles.input} />

                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Email Address:</label>
                <input type="email" value={profileEdit.email} onChange={(e) => setProfileEdit({ ...profileEdit, email: e.target.value })} style={styles.input} />
                
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Mobile Number (Unique):</label>
                <input type="text" value={profileEdit.phone} onChange={(e) => setProfileEdit({ ...profileEdit, phone: e.target.value })} required style={styles.input} />
                
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Upload New Profile Picture:</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} style={styles.input} />
                {profileEdit.profilePic && <p style={{ fontSize: "11px", color: "green", margin: 0 }}>✓ New picture selected</p>}

                <button type="submit" style={styles.primaryButton}>Save Full Profile Changes</button>
              </form>
            </div>

            <h3 style={{ marginTop: "20px" }}>Change Password</h3>
            <form onSubmit={handleChangePassword} style={styles.passForm}>
              <input type="password" placeholder="Current Password" value={passData.oldPass} onChange={(e) => setPassData({ ...passData, oldPass: e.target.value })} required style={styles.input} />
              <input type="password" placeholder="New Password" value={passData.newPass} onChange={(e) => setPassData({ ...passData, newPass: e.target.value })} required style={styles.input} />
              <input type="password" placeholder="Confirm New Password" value={passData.confirmNewPass} onChange={(e) => setPassData({ ...passData, confirmNewPass: e.target.value })} required style={styles.input} />
              <button type="submit" style={styles.primaryButton}>Update Password</button>
            </form>

            <h3 style={{ marginTop: "20px", color: "#b91c1c" }}>Delete Account</h3>
            <form onSubmit={handleDeleteAccount} style={{ ...styles.passForm, borderColor: "#fca5a5", backgroundColor: "#fff5f5" }}>
              <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>To delete your account permanently, please enter your current password below:</p>
              <input type="password" placeholder="Enter Current Password to Delete" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} required style={styles.input} />
              <button type="submit" style={styles.deleteAccountBtn}>Permanently Delete Account</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  authContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0fdf4" },
  authCard: { background: "#ffffff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(22, 101, 52, 0.1)", width: "400px", border: "1px solid #dcfce7" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #86efac", fontSize: "14px", outline: "none" },
  primaryButton: { padding: "10px", backgroundColor: "#15803d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  switchText: { textAlign: "center", fontSize: "13px", marginTop: "10px" },
  link: { color: "#15803d", cursor: "pointer", textDecoration: "underline" },
  errorMessage: { color: "red", fontSize: "13px", textAlign: "center", marginBottom: "10px" },
  dashboardContainer: { display: "flex", height: "100vh", fontFamily: "sans-serif", backgroundColor: "#f7fee7" },
  sidebar: { width: "260px", backgroundColor: "#14532d", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", gap: "6px" },
  sidebarProfile: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" },
  avatarImg: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #86efac" },
  ceoBadge: { background: "#facc15", color: "#000", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", width: "fit-content" },
  navBtn: { background: "transparent", color: "#bbf7d0", border: "none", textAlign: "left", padding: "10px", cursor: "pointer", borderRadius: "4px" },
  activeNavBtn: { background: "#16a34a", color: "#fff", border: "none", textAlign: "left", padding: "10px", cursor: "pointer", borderRadius: "4px", fontWeight: "bold" },
  logoutBtn: { marginTop: "auto", background: "#b91c1c", color: "#fff", border: "none", padding: "10px", cursor: "pointer", borderRadius: "4px" },
  mainContent: { flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f6fef9" },
  topHeaderBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", background: "#dcfce7", padding: "12px 20px", borderRadius: "8px", border: "1px solid #bbf7d0" },
  topAddBtn: { padding: "8px 16px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
  quickPanel: { background: "#ffffff", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(22, 101, 52, 0.08)", marginBottom: "20px", border: "1px solid #86efac" },
  quickForm: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr auto", gap: "10px" },
  quickInput: { padding: "8px", borderRadius: "4px", border: "1px solid #86efac", fontSize: "13px" },
  quickSubmitBtn: { padding: "8px 15px", backgroundColor: "#15803d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  alertBox: { padding: "10px", backgroundColor: "#dcfce7", color: "#14532d", marginBottom: "15px", borderRadius: "4px", border: "1px solid #86efac" },
  cardGrid: { display: "flex", gap: "20px" },
  statCard: { background: "#ffffff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(22, 101, 52, 0.05)", flex: 1, borderLeft: "4px solid #16a34a", border: "1px solid #dcfce7" },
  statNumber: { fontSize: "22px", fontWeight: "bold", marginTop: "5px" },
  addForm: { background: "#ffffff", padding: "15px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(22, 101, 52, 0.05)", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid #dcfce7" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "15px", background: "#ffffff", borderRadius: "6px", overflow: "hidden", boxShadow: "0 2px 4px rgba(22, 101, 52, 0.05)", border: "1px solid #dcfce7" },
  th: { background: "#ecfdf5", padding: "12px", textAlign: "left", borderBottom: "1px solid #bbf7d0", fontSize: "13px", color: "#14532d" },
  td: { padding: "12px", borderBottom: "1px solid #dcfce7", fontSize: "13px" },
  editBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontSize: "12px" },
  deleteBtn: { background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" },
  backBtn: { background: "#475569", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" },
  deleteAccountBtn: { padding: "10px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  excelBtn: { padding: "8px 14px", backgroundColor: "#1e40af", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" },
  auditItem: { background: "#ffffff", padding: "10px 12px", marginBottom: "8px", borderRadius: "4px", boxShadow: "0 1px 3px rgba(22, 101, 52, 0.05)", fontSize: "13px", border: "1px solid #dcfce7" },
  profileCard: { background: "#ffffff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(22, 101, 52, 0.05)", border: "1px solid #dcfce7" },
  passForm: { display: "flex", flexDirection: "column", gap: "12px", background: "#ffffff", padding: "20px", borderRadius: "6px", boxShadow: "0 2px 4px rgba(22, 101, 52, 0.05)", border: "1px solid #dcfce7", marginTop: "10px" }
};